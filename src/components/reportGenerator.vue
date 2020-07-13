<template>
  <div>
    <div id="title">周报/月报自动生成工具</div>
    <div class="input_box">
      <div class="data_item" v-for="(item,i) in inputSettings" :key="i">
        <div class="data_title">{{item.text}}:</div>
        <el-input class="data_value" placeholder="请输入数据" v-model="item.data" @input="change($event)" v-if="item.type=='text'" />
        <el-select class="data_value" v-model="item.data" placeholder="请选择" v-if="item.type=='select'">
          <el-option
            v-for="option in item.selectOption"
            :key="option.name"
            :label="option.text"
            :value="option.name">
          </el-option>
        </el-select>
        <el-date-picker class="data_value" v-model="item.data" type="datetime" placeholder="选择日期时间" v-if="item.type=='datetime'" :editable="false">
        </el-date-picker>
      </div>
      <el-button id="btn_submit" type="primary" :loading="loading" :disabled="loading" @click="onSubmit">{{submit_text}}</el-button>
    </div>
    <div class="input_box" v-if="img_list.length > 0">
      <div class="img" v-for="(item,i) in img_list" :key="i">
        <div class="img_zone" :id="item.name"></div>
        <div class="img_title">图{{(i+1)}}  {{item.text}}</div>
      </div>
    </div>
    <div class="input_box" v-if="result.length > 0">
      <div class="data_item" v-for="(item,i) in result" :key="i" v-if="(item.type == 'text'||item.type == 'img')&& item.value != ''">
        <div class="result_title">{{item.text}}:</div>
        <el-input class="result_value" v-model="item.type=='text'?item.value:item.value.path" type="textarea" autosize readonly/></el-input>
      </div>
      <el-button id="btn_create" type="primary" :loading="create_loading" :disabled="create_loading" @click="onConfirm">{{confirm_text}}</el-button>
    </div>
  </div>
</template>
<script>
var echarts = require('echarts');

// const DEFAULT_COLORS = [
//   '#19d4ae', '#5ab1ef', '#fa6e86',
//   '#ffb980', '#0067a6', '#c4b4e4',
//   '#d87a80', '#9cbbff', '#d9d0c7',
//   '#87a997', '#d49ea2', '#5b4947',
//   '#7ba3a8'
// ]
const DEFAULT_COLORS = [
  '#5B9BE7', '#ED7D31', '#A5A5A5',
  '#FFC000', '#4472C4', '#70AD47',
  '#255E91', '#9E480E', '#636363',
  '#997300', '#264478', '#43682B',
  '#7CAFDD'
];
var HOST = "10.117.195.193/gensmo/";
var TOP33_sum = 13;
var TOP33_time_sum = 1300.88;
var TOP33_NUMBER_SUM = 3731;
Date.prototype.Format = function(fmt)   
{ //author: meizz   
  var o = {   
    "M+" : this.getMonth()+1,                 //月份   
    "d+" : this.getDate(),                    //日   
    "h+" : this.getHours(),                   //小时   
    "m+" : this.getMinutes(),                 //分   
    "s+" : this.getSeconds(),                 //秒   
    "q+" : Math.floor((this.getMonth()+3)/3), //季度   
    "S"  : this.getMilliseconds()             //毫秒   
  };   
  if(/(y+)/.test(fmt))   
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
  for(var k in o)   
    if(new RegExp("("+ k +")").test(fmt))   
  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
  return fmt;
}

class reportItem{
  constructor(name,type,text,calculator,callback=undefined){
    this.name = name;
    this.type = type;
    this.text = text;
    this.calculator = calculator;
    this.callback = callback;
  }
  cal(obj){
    let result = this.calculator(obj);
    if(this.callback != undefined){
      this.callback(result)
    }
    return result;
  }
}

var class_line = ['市政施工','河涌整治','三线整治','恶意剪线','车辆挂断','老鼠咬断','自然灾害','光缆劣化','尾纤松动','客户内线'];
var class_devices = ['传输设备','数据设备','交换设备','接入设备','客户端联通设备','客户设备'];
var class_power = ['机房停电','机房电池','机房空调','基站停电','基站电池','基站空调','室分停电','室分电池','室分空调','客户动力'];
var class_e_line = ['市政施工','河涌整治','三线整治','恶意剪线','车辆挂断','老鼠咬断','自然灾害','电缆劣化','电缆松动','客户内线'];
class DataObject{
  constructor(){

  }
  add(name,type,data=undefined){
    if(data == undefined){
      switch(type){
        case 'number':
          data = 0;
          break;
        case 'string':
        case 'input':
          data = '';
          break;
        case 'array':
          data = [];
          break;
        case 'object':
          data = {};
          break;
        default:
          data = '';
          break;
      }
    }
    this[name] = {data:data,type:type};
  }
}

export default {
  name: 'Daily',
  components:{
  },
  data(){
    return{
      rawData:[],
      assess_data:[],
      assess_data_all:[],
      rawLocalData:[],
      local_data:[],
      local_data_all:[],
      number_list:[],
      img_list:[],
      chart_list:[],
      url_OK:0,
      dataReady:false,
      dataLocalReady:false,
      submit_text:'开始计算',
      loading:false,
      confirm_text:'确认',
      create_loading:false,
      itemList:[],
      result:[],
      dataObject:new DataObject(),
      inputSettings:[
        {name:'start',text:'起始时间*',type:'datetime',data:'',dataType:'string'},
        {name:'end',text:'终止时间*',type:'datetime',data:'',dataType:'string'},
        {name:'type',text:'生成类型*',type:'select',data:'',dataType:'string',selectOption:[{name:'week',text:'周报'},{name:'month',text:'月报'}]},
        {name:'last3_text',text:'上三期时间',type:'text',data:'',dataType:'string'},
        {name:'assess_data_last3',text:'上三期19工单数',type:'text',data:'',dataType:'number'},
        {name:'local_data_last3',text:'上三期本地工单数',type:'text',data:'',dataType:'number'},
        {name:'last2_text',text:'上两期时间',type:'text',data:'',dataType:'string'},
        {name:'assess_data_last2',text:'上两期19工单数',type:'text',data:'',dataType:'number'},
        {name:'local_data_last2',text:'上两期本地工单数',type:'text',data:'',dataType:'number'},
        {name:'last_text',text:'上期时间',type:'text',data:'',dataType:'string'},
        {name:'assess_data_last',text:'上期19工单数',type:'text',data:'',dataType:'number'},
        {name:'local_data_last',text:'上期本地工单数',type:'text',data:'',dataType:'number'}
      ]
    }
  },
  created:function(){
    this.init();
  },
  updated:function(){
  },
  methods:{
    init:function(){
      this.getDefault();
      this.loadSettings();
    },
    getDefault:function(){
      let self = this;
      this.axios
        .get('http://'+HOST+'scripts/assess_order/reportData.php')
        .then(function(res){
          //console.log(res);
          for(let i in res.data){
            self.dataObject.add(res.data[i].name,res.data[i].dataType,res.data[i].data);
            for(let j in self.inputSettings){
              if(self.inputSettings[j].name == res.data[i].name){
                self.inputSettings[j].data = res.data[i].data;
                break;
              }
            }
          }
        });
    },
    onSubmit:function(){
      let self = this;
      let inputItem = this.inputSettings;
      for(let i in inputItem){
        let item = inputItem[i]
        this.dataObject.add(item.name,item.dataType,item.data);
      }
      
      if(this.dataObject.start.data == ''){
        alert('请输入起始时间！')
        return;
      }
      let start = new Date(this.dataObject.start.data);

      if(this.dataObject.end.data== ''){
        alert('请输入终止时间！')
        return;
      }
      let end = new Date(this.dataObject.end.data);

      let all_start = new Date(start);
      all_start.setDate(1);
      all_start.setHours(0);
      all_start.setMinutes(0);
      all_start.setSeconds(0);

      this.dataObject.add('year','number',start.getFullYear());
      this.itemList.push(new reportItem('year','text','年份',function(obj){
        return start.getFullYear();
      }))

      this.dataObject.add('month','number',start.getMonth()+1);
      this.itemList.push(new reportItem('month','text','月',function(obj){
        return (start.getMonth()+1);
      }))

      this.itemList.push(new reportItem('date_start','text','起始日期',function(obj){
        return start.Format("MM月dd日");
      }))

      this.itemList.push(new reportItem('date_end','text','终止日期',function(obj){
        return end.Format("MM月dd日");
      }))

      this.getData(start,end,all_start);
      this.submit_text = '计算中...'
      this.loading = true;
    },
    getData:function(start,end,all_start){
      let self = this;
      self.dataReady = false;
      let data = new FormData();
      data.append('START',all_start.Format('yyyy-MM-dd hh:mm:ss'));
      data.append('END',end.Format('yyyy-MM-dd hh:mm:ss'));
      this.axios
        .post('http://'+HOST+'scripts/assess_order/get_order_by_datetime.php',data)
        .then(function(res){
          if(res.data.status == 'success'){
            self.rawData = res.data.result;
            self.assess_data_all = [];
            self.assess_data = [];
            for(let i in self.rawData){
              let data = self.rawData[i];
              if(data.responsible_province == '广州' || data.province == '广东省广州市' && data.responsible_province == '用户'){
                self.assess_data_all.push(data);
                if(new Date(data.end_time) > start){
                  self.assess_data.push(data);
                }
              }
            }
            self.dataReady = true;
            if(self.dataReady && self.dataLocalReady && self.dataNumberReady){
              self.loadData();
              self.calculate();
            }
          }else{
            alert(res.data.errMsg);
          }
        })
        .catch(function(err){
          alert(err);
          console.log(err);
        });

      let localData = new FormData();
      localData.append('end_time_start',all_start.Format('yyyy-MM-dd hh:mm:ss'));
      localData.append('end_time_end',end.Format('yyyy-MM-dd hh:mm:ss'));
      localData.append('step','');
      this.axios
        .post('http://'+HOST+'scripts/get_list_with_mark.php',localData)
        .then(function(res){
          if(res.data.status == 'success'){
            self.rawLocalData = res.data.result;
            self.local_data = [];
            for(let i in self.rawLocalData){
              if(new Date(self.rawLocalData[i].end_time) > start){
                self.local_data.push(self.rawLocalData[i]);
              }
            }
            self.dataLocalReady = true;
            if(self.dataReady && self.dataLocalReady && self.dataNumberReady){
              self.loadData();
              self.calculate();
            }
          }else{
            alert(res.data.errMsg);
          } 
        })
        .catch(function(err){
          alert(err);
        })

      let numberData = new FormData();
      numberData.append('mark','');
      this.axios
        .post('http://'+HOST+'scripts/assess_order/circuit_number_sum.php',numberData)
        .then(function(res){
          if(res.data.status == 'success'){
            self.number_list = res.data.result;
            self.dataNumberReady = true;
            if(self.dataReady && self.dataLocalReady && self.dataNumberReady){
              self.loadData();
              self.calculate();
            }
          }else{
            alert(res.data.errMsg);
          }
        })
        .catch(function(err){
          alert(err);
          console.log(err);
        });
    },
    getNumberRate:function(name,sum){
      for(let i in this.number_list){
        if(name == this.number_list[i].name){
          return (sum/this.number_list[i].sum*100).toFixed(2);
        }
      }
      return '10.00';
    },
    calculate:function(){
      this.img_list = [];
      let json_arr = [];
      let self = this;
      for(let i in this.itemList){
        //图片需异步获取
        if(this.itemList[i].type == 'img'){
          let v = this.itemList[i].cal(this.dataObject);
          v.then(function(res){
            let json = {
              name:self.itemList[i].name,
              text:self.itemList[i].text,
              type:self.itemList[i].type,
            }
            //若返回空字符串，则表示该图片不显示
            if(res == ''){
              json.value = '';
              json.type = 'text';
              self.result.push(json);
            }else{
              self.chart_list.push({json:json,chart:res})
            }
          })
        }else if(this.itemList[i].type == 'text'){
          let json = {
            name:this.itemList[i].name,
            text:this.itemList[i].text,
            type:this.itemList[i].type,
            value:this.itemList[i].cal(this.dataObject)+""
          }
          json_arr.push(json);
        }else if(this.itemList[i].type == 'array'){
          let v = this.itemList[i].cal(this.dataObject);
          let json = {
            name:this.itemList[i].name,
            text:this.itemList[i].text,
            type:this.itemList[i].type,
            value:this.itemList[i].cal(this.dataObject)
          }
          json_arr.push(json);
        }
      }
      this.result = json_arr;
      this.submit_text = '重新计算';
      this.loading = false;
      //console.log(this.chart_list);
    },
    savePic:async function(url){
      let result = ''
      let data = new FormData();
      data.append('baseimg',url);
      await this.axios.post('http://'+HOST+'scripts/assess_order/savePic.php?action=save',data)
        .then(function(res){
          result = res.data;
        })
      return result;
    },
    onConfirm:function(){
      let self = this;
      this.confirm_text = '生成中...';
      this.create_loading = true;
      this.url_OK = 0;
      for(let i in this.chart_list){
        let chart = this.chart_list[i].chart;
        let ctx = chart.getDom().firstChild.firstChild.getContext('2d');
        ctx.strokeStyle = "#636363";
        ctx.strokeRect(0,0,chart.getWidth(),chart.getHeight());
        this.savePic(chart.getDataURL()).then(function(res){
          let json =  self.chart_list[i].json;
          let option = {path:res,width:'147mm',height:'87mm',ratio:false}
          json.value = option;
          self.result.push(json);
          self.url_OK++;
          if(self.url_OK == self.chart_list.length){
            self.sendJSON();
          }
        })
      }
    },
    sendJSON:function(){
      let self = this;
      let data = new FormData();
      let json = JSON.stringify(this.result);
      //需转义，否则将出错
      //word内部使用xml进行数据存储，特殊字符会破坏xml结构
      json = json.replace(/&/gm,'&amp;');
      json = json.replace(/</gm,'&lt;');
      json = json.replace(/>/gm,'&gt;');
      data.append('DATA',json);
      data.append('type',this.dataObject.type.data);
      this.axios
        .post('http://'+HOST+'scripts/assess_order/read_word.php',data)
        .then(function(res){
          //console.log(res);
          self.create_loading = false;
          self.confirm_text = '确认';
          //将生成的图片地址再pop出去
          for(let i=0;i<self.url_OK;i++){
            self.result.pop();
          }
          if(res.data.status == 'success'){
            window.open('http://'+HOST+'files/'+res.data.name);
          }else{
            alert(res.data.errMsg);
          }
        })
        .catch(function(err){
          self.create_loading = false;
          self.confirm_text = '确认'
          //将生成的图片地址再pop出去
          for(let i=0;i<self.url_OK;i++){
            self.result.pop();
          }
          alert(err);
        })
    },
    change(e){
      this.$forceUpdate()
    },
    loadData:function(){
      this.dataObject.add('assess_data','array',this.assess_data);
      this.dataObject.add('local_data','array',this.local_data);
      this.dataObject.add('assess_data_all','array',this.assess_data_all);
      this.dataObject.add('local_data_all','array',this.rawLocalData);
    },
    getImg:function(name,option){
      let myChart = echarts.init(document.getElementById(name));
      myChart.setOption(option);
      window.addEventListener("resize",function(){
        myChart.resize();
      })
      // return myChart.getDataURL();
      return myChart;
    },
    getOption:function(type,series,xAxis=[],legend=[]){
      let option;
      let grid = {}
      if(legend.length == 0){
        grid = {
          x:10,
          y:25,
          x2:10,
          y2:25
        }
      }else{
        grid = {
          x:10,
          y:25,
          x2:10,
          y2:45
        }
      }
      switch(type){
        case 'pie':
          series.label = {
            show:true,
            position:'inside',
            formatter:'{b}，{c}，{d}%'
          };
          series.type = 'pie';
          option = {
            title: {
              show: false
            },
            grid:grid,
            animation:false,
            tooltip: {},
            series: [series],
            color:DEFAULT_COLORS
          };
        break;
        case 'bar':
          option = {
            title: {
              show: false
            },
            grid:grid,
            animation:false,
            tooltip: {},
            legend:legend,
            xAxis: {
              data: xAxis,
              splitLine:{
                show:false,
              },
              axisLabel:{
                interval:0,
                fontSize:10,
                formatter:function(value){
                  let txt = '';
                  if(value.length > 10){
                    txt = value.substring(0,10)+'...';
                  }else{
                    txt = value;
                  }
                  return txt;
                }
              }
            },
            yAxis: {
              show:false,
              splitLine:{
                show:false,
              },
            },
            series: series,
            color:DEFAULT_COLORS
          };
        break;
      }
      return option;
    },
    loadSettings:function(){
      let self = this;

      this.dataObject.add('assess_data_last','input');
      this.dataObject.add('local_data_last','input');
      this.dataObject.add('start','input');
      this.dataObject.add('end','input');

      this.itemList.push(new reportItem('order_sum','text','故障总量',function(obj){
        return obj.assess_data.data.length+obj.local_data.data.length;
      },function(result){
        self.dataObject.add('order_sum','number',result);
      }));

      this.itemList.push(new reportItem('order_assess_sum','text','19故障总量',function(obj){
        return obj.assess_data.data.length;
      }));

      this.itemList.push(new reportItem('order_assess_percent','text','19工单占比',function(obj){
        return (obj.assess_data.data.length / obj.order_sum.data * 100).toFixed(2);
      }));

      this.itemList.push(new reportItem('order_assess_compare','text','19工单环比',function(obj){
        let delta = obj.assess_data.data.length - Number(obj.assess_data_last.data);
        if(delta > 0){
          return '增加'+delta;
        }else if(delta < 0){
          return '减少'+(-delta);
        }else{
          return '持平';
        }
      }));

      this.itemList.push(new reportItem('order_local_sum','text','本地故障总量',function(obj){
        return obj.local_data.data.length;
      }));

      this.itemList.push(new reportItem('order_local_percent','text','本地工单占比',function(obj){
        return (obj.local_data.data.length/ obj.order_sum.data * 100).toFixed(2);
      }));

      this.itemList.push(new reportItem('order_local_compare','text','本地工单环比',function(obj){
        let delta = obj.local_data.data.length - Number(obj.local_data_last.data);
        if(delta > 0){
          return '增加'+delta;
        }else if(delta < 0){
          return '减少'+(-delta);
        }else{
          return '持平';
        }
      }));

      this.itemList.push(new reportItem('sum_picture','img','近4期政企用户故障量情况',async function(obj){
        self.img_list.push({name:this.name,text:this.text})
        let name = this.name;
        let result = '';
        let chart = '';
        let now;
        switch(obj.type.data){
          case 'month':
            now = obj.month.data+'月';
            break;
          case 'week':
          default:
            now = obj.start.data.Format('MM月dd日') + '-' +obj.end.data.Format('dd日');
        }
        let xAxis = [
          obj.last3_text.data,
          obj.last2_text.data,
          obj.last_text.data,
          now
        ];
        let legend = {show:true,bottom:5};
        let series = [{
          name: '19系统',
          type: 'bar',
          stack: '故障量',
          data: [
            obj.assess_data_last3.data,
            obj.assess_data_last2.data,
            obj.assess_data_last.data,
            obj.assess_data.data.length
          ],
          label:{
            show:true
          },
          barMaxWidth:60
        },{
          name: '本地',
          type: 'bar',
          stack: '故障量',
          data: [
            obj.local_data_last3.data,
            obj.local_data_last2.data,
            obj.local_data_last.data,
            obj.local_data.data.length
          ],
          label:{
            show:true
          }
        }];
        let option = self.getOption('bar',series,xAxis,legend);
        await self.$nextTick(function(){
          chart = self.getImg(name,option)
        })

        return chart;
      }));

      this.itemList.push(new reportItem('order_real','text','真实工单',function(obj){
        let ad = obj.assess_data.data;
        let ld = obj.local_data.data;
        let real = 0;
        for(let i in ad){
          if(ad[i].is_trouble == '1'){
            real++;
          }
        }
        for(let i in ld){
          if(ld[i].is_trouble == '1'){
            real++;
          }
        }
        return real;
      },function(result){
        self.dataObject.add('order_real','number',result);
      }));

      this.itemList.push(new reportItem('order_real_percent','text','真实工单比例',function(obj){
        return (obj.order_real.data / obj.order_sum.data * 100).toFixed(2);
      }));

      this.itemList.push(new reportItem('order_fake','text','非真实工单',function(obj){
        let ad = obj.assess_data.data;
        let ld = obj.local_data.data;
        let fake = 0;
        for(let i in ad){
          if(ad[i].is_trouble == '0'){
            fake++;
          }
        }
        for(let i in ld){
          if(ld[i].is_trouble == '0'){
            fake++;
          }
        }
        return fake;
      },function(result){
        self.dataObject.add('order_fake','number',result);
      }));

      this.itemList.push(new reportItem('order_fake_percent','text','非真实工单比例',function(obj){
        return (obj.order_fake.data / obj.order_sum.data * 100).toFixed(2);
      }));

      this.itemList.push(new reportItem('order_assess_real','text','19真实工单',function(obj){
        let ad = obj.assess_data.data;
        let real = 0;
        for(let i in ad){
          if(ad[i].is_trouble == '1'){
            real++;
          }
        }
        return real;
      },function(result){
        self.dataObject.add('order_assess_real','number',result);
      }));

      this.itemList.push(new reportItem('order_assess_real_percent','text','19真实工单比例',function(obj){
        return (obj.order_assess_real.data / obj.assess_data.data.length * 100).toFixed(2);
      }));

      this.itemList.push(new reportItem('order_assess_fake','text','19非真实工单',function(obj){
        let ad = obj.assess_data.data;
        let fake = 0;
        for(let i in ad){
          if(ad[i].is_trouble == '0'){
            fake++;
          }
        }
        return fake;
      },function(result){
        self.dataObject.add('order_assess_fake','number',result);
      }));

      this.itemList.push(new reportItem('order_assess_fake_percent','text','19非真实工单比例',function(obj){
        return (obj.order_assess_fake.data / obj.assess_data.data.length * 100).toFixed(2);
      }));

      this.itemList.push(new reportItem('order_assess_duty_sum','text','19责任故障总量',function(obj){
        let list = obj.assess_data.data;
        let arr = [];
        for(let i in list){
          if(list[i].responsible_province == '广州' && list[i].is_assess == '1'){
            arr.push(list[i]);
          }
        }
        self.dataObject.add('order_assess_duty','array',arr);
        return arr.length;
      },function(result){
        self.dataObject.add('order_assess_duty_sum','number',result);
      }));

      this.itemList.push(new reportItem('order_assess_duty_compare_month','text','19责任故障环比',function(obj){
        let last = obj.assess_duty_list.data[obj.month.data-2];
        let delta = obj.order_assess_duty.data.length - last;
        if(delta > 0){
          return '增加'+(delta/last*100).toFixed(2)+'%';
        }
        if(delta < 0){
          return '减少'+(-delta/last*100).toFixed(2)+'%';
        }
        return '持平';
      }));

      this.itemList.push(new reportItem('order_assess_duty_compare_year','text','19责任故障同比',function(obj){
        let last = obj.assess_duty_list_last.data[obj.month.data-1];
        let delta = obj.order_assess_duty.data.length - last;
        if(delta > 0){
          return '增加'+(delta/last*100).toFixed(2)+'%';
        }
        if(delta < 0){
          return '减少'+(-delta/last*100).toFixed(2)+'%';
        }
        return '持平';
      }));

      this.itemList.push(new reportItem('order_assess_duty_last_year','text','去年责任累计故障量',function(obj){
        let list = obj.assess_duty_list_last.data;
        let sum = 0;
        for(let i=0;i<obj.month.data;i++){
          sum = sum + list[i]
        }
        return sum;
      },function(result){
        self.dataObject.add('order_assess_duty_last_year','number',result);
      }));

      this.itemList.push(new reportItem('order_assess_duty_this_year','text','今年责任累计故障量',function(obj){
        let list = obj.assess_duty_list.data;
        let sum = 0;
        for(let i=0;i<obj.month.data-1;i++){
          sum = sum + list[i]
        }
        sum = sum + obj.order_assess_duty_sum.data;
        return sum;
      },function(result){
        self.dataObject.add('order_assess_duty_this_year','number',result);
      }));

      this.itemList.push(new reportItem('order_assess_duty_sum_compare','text','责任故障量同比',function(obj){
        let last = obj.order_assess_duty_last_year.data;
        let delta = obj.order_assess_duty_this_year.data - last;
        if(delta > 0){
          return '增加'+(delta/last*100).toFixed(2)+'%';
        }
        if(delta < 0){
          return '减少'+(-delta/last*100).toFixed(2)+'%';
        }
        return '持平';
      }));

      this.itemList.push(new reportItem('order_assess_line','text','19专线业务故障',function(obj){
        let ad = obj.assess_data.data;
        let line = 0;
        for(let i in ad){
          if(ad[i].trouble_type == '专线业务'){
            line++;
          }
        }
        return line;
      },function(result){
        self.dataObject.add('order_assess_line','number',result);
      }));

      this.itemList.push(new reportItem('order_assess_network','text','19互联网业务故障',function(obj){
        let ad = obj.assess_data.data;
        let network = 0;
        for(let i in ad){
          if(ad[i].trouble_type == '互联网业务'){
            network++;
          }
        }
        return network;
      },function(result){
        self.dataObject.add('order_assess_network','number',result);
      }));

      this.itemList.push(new reportItem('order_assess_phone','text','19语音业务故障',function(obj){
        let ad = obj.assess_data.data;
        let phone = 0;
        for(let i in ad){
          if(ad[i].trouble_type == '语音业务'){
            phone++;
          }
        }
        return phone;
      },function(result){
        self.dataObject.add('order_assess_phone','number',result);
      }));

      this.itemList.push(new reportItem('order_assess_other','text','19其他业务故障',function(obj){
        let ad = obj.assess_data.data;
        return ad.length - obj.order_assess_line.data - obj.order_assess_network.data - obj.order_assess_phone.data;
      },function(result){
        self.dataObject.add('order_assess_other','number',result);
      }));

      this.itemList.push(new reportItem('order_assess_trouble_type','text','19业务故障情况',function(obj){
        let arr = [];
        arr.push({
          name:'line',
          sum:obj.order_assess_line.data,
          text:'专线业务'
        });
        arr.push({
          name:'network',
          sum:obj.order_assess_network.data,
          text:'互联网业务'
        });
        arr.push({
          name:'phone',
          sum:obj.order_assess_phone.data,
          text:'语音业务'
        });
        arr.push({
          name:'other',
          sum:obj.order_assess_other.data,
          text:'其他业务'
        });
        arr.sort(function(v1,v2){
          return v2.sum-v1.sum;
        })
        let result = "";
        for(let i in arr){
          if(arr[i].sum > 0){
            result = result + arr[i].text + "故障" + arr[i].sum + "宗，占比" + (arr[i].sum / obj.assess_data.data.length * 100).toFixed(2) + "%；"
          }
        }
        result = result.substr(0,result.length-1) + "。";
        return result;
      }));

      this.itemList.push(new reportItem('order_assess_sum_picture','img','故障业务分类（19系统）',async function(obj){
        self.img_list.push({name:this.name,text:this.text})
        let name = this.name;
        let result = '';
        let chart = '';
        let series_data = [];
        let data_arr = [
          {name:'专线业务',value:self.dataObject.order_assess_line.data},
          {name:'互联网业务',value:self.dataObject.order_assess_network.data},
          {name:'语音业务',value:self.dataObject.order_assess_phone.data},
          {name:'其他业务',value:self.dataObject.order_assess_other.data},
        ]
        data_arr.sort(function(v1,v2){
          return v2.value-v1.value;
        });
        for(let i in data_arr){
          if(data_arr[i].value > 0){
            series_data.push(data_arr[i])
          }else{
            break;
          }
        }
        let series = {
          name: '故障量',
          data: series_data,
        }
        let option = self.getOption('pie',series)
        await self.$nextTick(function(){
          chart = self.getImg(name,option)
        })

        return chart;
      }));

      this.itemList.push(new reportItem('order_assess_customer_devices','text','19客户设备',function(obj){
        let ad = obj.assess_data.data;
        let sum = 0;
        for(let i in ad){
          if(ad[i].trouble_class == '客户设备'){
            sum++;
          }
        }
        return sum;
      },function(result){
        self.dataObject.add('order_assess_customer_devices','number',result);
      }));

      this.itemList.push(new reportItem('order_assess_customer_line','text','19客户线路',function(obj){
        let ad = obj.assess_data.data;
        let sum = 0;
        for(let i in ad){
          if(ad[i].trouble_class == '客户线路'){
            sum++;
          }
        }
        return sum;
      },function(result){
        self.dataObject.add('order_assess_customer_line','number',result);
      }));

      this.itemList.push(new reportItem('order_assess_customer_power','text','19客户动力',function(obj){
        let ad = obj.assess_data.data;
        let sum = 0;
        for(let i in ad){
          if(ad[i].trouble_class == '客户动力'){
            sum++;
          }
        }
        return sum;
      },function(result){
        self.dataObject.add('order_assess_customer_power','number',result);
      }));

      this.itemList.push(new reportItem('order_assess_customer','text','19客户侧故障量',function(obj){   
        return obj.order_assess_customer_line.data + obj.order_assess_customer_power.data + obj.order_assess_customer_devices.data;
      },function(result){
        self.dataObject.add('order_assess_customer','number',result);
      }));

      this.itemList.push(new reportItem('order_assess_customer_devices_percent','text','19客户设备占比',function(obj){
        return (obj.order_assess_customer_devices.data / obj.order_assess_customer.data * 100).toFixed(2);
      },function(result){
        self.dataObject.add('order_assess_customer_devices_percent','number',result);
      })); 

      this.itemList.push(new reportItem('order_assess_customer_line_percent','text','19客户线路占比',function(obj){
        return (obj.order_assess_customer_line.data / obj.order_assess_customer.data * 100).toFixed(2);
      },function(result){
        self.dataObject.add('order_assess_customer_line_percent','number',result);
      }));
      this.itemList.push(new reportItem('order_assess_customer_power_percent','text','19客户动力占比',function(obj){
        return (obj.order_assess_customer_power.data / obj.order_assess_customer.data * 100).toFixed(2);
      },function(result){
        self.dataObject.add('order_assess_customer_power_percent','number',result);
      })); 

      this.itemList.push(new reportItem('assessCustomerItems','array','19客户侧情况表格',function(obj){
        let line = {assessCustomerItems:'客户线路',assessCustomerItemsSum:obj.order_assess_customer_line.data,assessCustomerItemsPercent:obj.order_assess_customer_line_percent.data};
        let devices = {assessCustomerItems:'客户设备',assessCustomerItemsSum:obj.order_assess_customer_devices.data,assessCustomerItemsPercent:obj.order_assess_customer_devices_percent.data};
        let power = {assessCustomerItems:'客户动力',assessCustomerItemsSum:obj.order_assess_customer_power.data,assessCustomerItemsPercent:obj.order_assess_customer_power_percent.data};
        let arr = [devices,power,line];
        arr.sort(function(v1,v2){
          return v2.assessCustomerItemsSum-v1.assessCustomerItemsSum;
        })
        return arr;
      }));

      this.itemList.push(new reportItem('order_assess_customer_detail','text','19客户侧情况',function(obj){
        let arr = [];
        arr.push({
          name:'line',
          sum:obj.order_assess_customer_line.data,
          text:'客户线路'
        });
        arr.push({
          name:'devices',
          sum:obj.order_assess_customer_devices.data,
          text:'客户设备'
        });
        arr.push({
          name:'power',
          sum:obj.order_assess_customer_power.data,
          text:'客户动力'
        });
        arr.sort(function(v1,v2){
          return v2.sum-v1.sum;
        })
        let result = "";
        for(let i in arr){
          if(arr[i].sum > 0){
            result = result + arr[i].text + arr[i].sum + "宗，占比" + (arr[i].sum / obj.order_assess_customer.data * 100).toFixed(2) + "%；"
          }
        }
        result = result.substr(0,result.length-1) + "。";
        return result;
      }));

      this.itemList.push(new reportItem('order_assess_customer_picture','img','政企客户故障原因（用户侧）',async function(obj){
        self.img_list.push({name:this.name,text:this.text})
        let name = this.name;
        let result = '';
        let chart = '';
        let series_data = [];
        let data_arr = [
          {name:'客户设备',value:self.dataObject.order_assess_customer_devices.data},
          {name:'客户线路',value:self.dataObject.order_assess_customer_line.data},
          {name:'客户动力',value:self.dataObject.order_assess_customer_power.data},
        ]
        data_arr.sort(function(v1,v2){
          return v2.value-v1.value;
        });
        for(let i in data_arr){
          if(data_arr[i].value > 0){
            series_data.push(data_arr[i])
          }else{
            break;
          }
        }
        let series = {
          name: '故障量',
          data: series_data,
        }
        let option = self.getOption('pie',series)
        await self.$nextTick(function(){
          chart = self.getImg(name,option)
        })

        return chart;
      }));

      this.itemList.push(new reportItem('order_assess_unicom_line','text','19光缆故障数量',function(obj){
        let ad = obj.assess_data.data;
        let sum = 0;
        for(let i in ad){
          if(ad[i].trouble_class == '光缆故障'){
            sum++;
          }
        }
        return sum;
      },function(result){
        self.dataObject.add('order_assess_unicom_line','number',result);
      }));

      this.itemList.push(new reportItem('order_assess_unicom_devices','text','19设备故障数量',function(obj){
        let ad = obj.assess_data.data;
        let sum = 0;
        for(let i in ad){
          if(ad[i].trouble_class == '设备故障'){
            sum++;
          }
        }
        return sum;
      },function(result){
        self.dataObject.add('order_assess_unicom_devices','number',result);
      }));

      this.itemList.push(new reportItem('order_assess_unicom_power','text','19动力配套数量',function(obj){
        let ad = obj.assess_data.data;
        let sum = 0;
        for(let i in ad){
          if(ad[i].trouble_class == '动力配套'){
            sum++;
          }
        }
        return sum;
      },function(result){
        self.dataObject.add('order_assess_unicom_power','number',result);
      }));

      this.itemList.push(new reportItem('order_assess_unicom_e_line','text','19电缆故障数量',function(obj){
        let ad = obj.assess_data.data;
        let sum = 0;
        for(let i in ad){
          if(ad[i].trouble_class == '电缆故障'){
            sum++;
          }
        }
        return sum;
      },function(result){
        self.dataObject.add('order_assess_unicom_e_line','number',result);
      }));

      this.itemList.push(new reportItem('order_assess_unicom','text','19网络侧故障量',function(obj){
        let sum = obj.order_assess_unicom_line.data + obj.order_assess_unicom_power.data + obj.order_assess_unicom_devices.data + obj.order_assess_unicom_e_line.data;
        return sum;
      },function(result){
        self.dataObject.add('order_assess_unicom','number',result);
      }));

      this.itemList.push(new reportItem('order_assess_unicom_line_percent','text','19光缆故障占比',function(obj){
        return (obj.order_assess_unicom_line.data / obj.order_assess_unicom.data * 100).toFixed(2);
      },function(result){
        self.dataObject.add('order_assess_unicom_line_percent','number',result);
      }));
      this.itemList.push(new reportItem('order_assess_unicom_devices_percent','text','19设备故障占比',function(obj){
        return (obj.order_assess_unicom_devices.data / obj.order_assess_unicom.data * 100).toFixed(2);
      },function(result){
        self.dataObject.add('order_assess_unicom_devices_percent','number',result);
      }));
      this.itemList.push(new reportItem('order_assess_unicom_power_percent','text','19动力配套占比',function(obj){
        return (obj.order_assess_unicom_power.data / obj.order_assess_unicom.data * 100).toFixed(2);
      },function(result){
        self.dataObject.add('order_assess_unicom_power_percent','number',result);
      }));
      this.itemList.push(new reportItem('order_assess_unicom_e_line_percent','text','19电缆故障占比',function(obj){
        return (obj.order_assess_unicom_e_line.data / obj.order_assess_unicom.data * 100).toFixed(2);
      },function(result){
        self.dataObject.add('order_assess_unicom_e_line_percent','number',result);
      }));

      this.itemList.push(new reportItem('assessUnicomItems','array','19网络侧情况表格',function(obj){
        let line = {assessUnicomItems:'光缆故障',assessUnicomItemsSum:obj.order_assess_unicom_line.data,assessUnicomItemsPercent:obj.order_assess_unicom_line_percent.data};
        let devices = {assessUnicomItems:'设备故障',assessUnicomItemsSum:obj.order_assess_unicom_devices.data,assessUnicomItemsPercent:obj.order_assess_unicom_devices_percent.data};
        let power = {assessUnicomItems:'动力配套',assessUnicomItemsSum:obj.order_assess_unicom_power.data,assessUnicomItemsPercent:obj.order_assess_unicom_power_percent.data};
        let e_line = {assessUnicomItems:'电缆故障',assessUnicomItemsSum:obj.order_assess_unicom_e_line.data,assessUnicomItemsPercent:obj.order_assess_unicom_e_line_percent.data};
        let arr = [devices,power,line,e_line];
        arr.sort(function(v1,v2){
          return v2.assessUnicomItemsSum-v1.assessUnicomItemsSum;
        })
        return arr;
      }));

      this.itemList.push(new reportItem('order_assess_unicom_detail','text','19网络侧情况',function(obj){
        let arr = [];
        arr.push({
          name:'line',
          sum:obj.order_assess_unicom_line.data,
          text:'光缆故障'
        });
        arr.push({
          name:'devices',
          sum:obj.order_assess_unicom_devices.data,
          text:'设备故障'
        });
        arr.push({
          name:'power',
          sum:obj.order_assess_unicom_power.data,
          text:'动力配套'
        });
        arr.push({
          name:'e_line',
          sum:obj.order_assess_unicom_e_line.data,
          text:'电缆故障'
        });

        arr.sort(function(v1,v2){
          return v2.sum-v1.sum;
        })
        let result = "";
        for(let i in arr){
          if(arr[i].sum > 0){
            result = result + arr[i].text + arr[i].sum + "宗，占比" + (arr[i].sum / obj.order_assess_customer.data * 100).toFixed(2) + "%；"
          }
        }
        return result;
      }));

      this.itemList.push(new reportItem('order_assess_unicom_picture','img','故障原因分类（网络侧）',async function(obj){
        self.img_list.push({name:this.name,text:this.text})
        let name = this.name;
        let result = '';
        let chart = '';
        let series_data = [];
        let data_arr = [
          {name:'光缆故障',value:self.dataObject.order_assess_unicom_line.data},
          {name:'设备故障',value:self.dataObject.order_assess_unicom_devices.data},
          {name:'动力配套',value:self.dataObject.order_assess_unicom_power.data},
          {name:'电缆故障',value:self.dataObject.order_assess_unicom_e_line.data},
        ]
        data_arr.sort(function(v1,v2){
          return v2.value-v1.value;
        });
        for(let i in data_arr){
          if(data_arr[i].value > 0){
            series_data.push(data_arr[i])
          }else{
            break;
          }
        }
        let series = {
          name: '故障量',
          data: series_data,
        }
        let option = self.getOption('pie',series)
        await self.$nextTick(function(){
          chart = self.getImg(name,option)
        })

        return chart;
      }));

      this.itemList.push(new reportItem('order_assess_unicom_line_detail','text','19光缆故障详情',function(obj){
        let ad = obj.assess_data.data;
        let arr = [];
        for(let i in class_line){
          arr.push({
            name:class_line[i],
            sum:0
          });
        }
        for(let i in ad){
          if(ad[i].trouble_class != '光缆故障'){
            continue;
          }else{
            for(let j in arr){
              if(ad[i].trouble_reason == arr[j].name){
                arr[j].sum++;
                break;
              }
            }
          }
        }
        arr.sort(function(v1,v2){
          return v2.sum - v1.sum;
        })
        for(let i=0;i<arr.length;i++){
          if(arr[i].sum == 0){
            arr.splice(i);
          }
        }
        self.dataObject.add('order_assess_unicom_line_list','array',arr);
        let sum = obj.order_assess_unicom_line.data;
        let result = '';
        let flag = true;
        let show = 0;
        let start = -1;
        for(let i=0;i<arr.length && flag;i++){
          if(i < arr.length - 1 && arr[i].sum == arr[i+1].sum){
            if(start < 0){
              start = i;
            }
            continue;
          }else{
            if(start < 0){
              result = result + arr[i].name + arr[i].sum + '宗，占比' + (arr[i].sum / sum * 100).toFixed(2) + "%；";
              show++;
            }else{
              for(let j = start;j <= i; j++){
                result = result + arr[j].name + '、';
              }
              result = result.substr(0,result.length-1);
              result = result + "各" + arr[start].sum + "宗，各占比" + (arr[start].sum / sum * 100).toFixed(2) + "%；"
              show = show + i - start + 1;
              start = -1;

            }
            if(show >= 3){
              flag = false;
            }
          }
        }
        return result;
      }));

      this.itemList.push(new reportItem('order_assess_unicom_devices_detail','text','19设备故障详情',function(obj){
        let ad = obj.assess_data.data;
        let arr = [];
        for(let i in class_devices){
          arr.push({
            name:class_devices[i],
            sum:0
          });
        }
        for(let i in ad){
          if(ad[i].trouble_class != '设备故障'){
            continue;
          }else{
            for(let j in arr){
              if(ad[i].trouble_reason == arr[j].name){
                arr[j].sum++;
                break;
              }
            }
          }
        }
        arr.sort(function(v1,v2){
          return v2.sum - v1.sum;
        })
        for(let i=0;i<arr.length;i++){
          if(arr[i].sum == 0){
            arr.splice(i);
          }
        }
        self.dataObject.add('order_assess_unicom_devices_list','array',arr);
        let sum = obj.order_assess_unicom_devices.data;
        let result = '';
        let flag = true;
        let show = 0;
        let start = -1;
        for(let i=0;i<arr.length && flag;i++){
          if(i < arr.length - 1 && arr[i].sum == arr[i+1].sum){
            if(start < 0){
              start = i;
            }
            continue;
          }else{
            if(start < 0){
              result = result + arr[i].name + arr[i].sum + '宗，占比' + (arr[i].sum / sum * 100).toFixed(2) + "%；";
              show++;
            }else{
              for(let j = start;j <= i; j++){
                result = result + arr[j].name + '、';
              }
              result = result.substr(0,result.length-1);
              result = result + "各" + arr[start].sum + "宗，各占比" + (arr[start].sum / sum * 100).toFixed(2) + "%；"
              show = show + i - start + 1;
              start = -1;

            }
            if(show >= 3){
              flag = false;
            }
          }
        }
        return result;
      }));

      this.itemList.push(new reportItem('order_assess_unicom_power_detail','text','19动力配套详情',function(obj){
        let ad = obj.assess_data.data;
        let arr = [];
        for(let i in class_power){
          arr.push({
            name:class_power[i],
            sum:0
          });
        }
        for(let i in ad){
          if(ad[i].trouble_class != '动力配套'){
            continue;
          }else{
            for(let j in arr){
              if(ad[i].trouble_reason == arr[j].name){
                arr[j].sum++;
                break;
              }
            }
          }
        }
        arr.sort(function(v1,v2){
          return v2.sum - v1.sum;
        })
        for(let i=0;i<arr.length;i++){
          if(arr[i].sum == 0){
            arr.splice(i);
          }
        }
        self.dataObject.add('order_assess_unicom_power_list','array',arr);
        let sum = obj.order_assess_unicom_power.data;
        let result = '';
        let flag = true;
        let show = 0;
        let start = -1;
        for(let i=0;i<arr.length && flag;i++){
          if(i < arr.length - 1 && arr[i].sum == arr[i+1].sum){
            if(start < 0){
              start = i;
            }
            continue;
          }else{
            if(start < 0){
              result = result + arr[i].name + arr[i].sum + '宗，占比' + (arr[i].sum / sum * 100).toFixed(2) + "%；";
              show++;
            }else{
              for(let j = start;j <= i; j++){
                result = result + arr[j].name + '、';
              }
              result = result.substr(0,result.length-1);
              result = result + "各" + arr[start].sum + "宗，各占比" + (arr[start].sum / sum * 100).toFixed(2) + "%；"
              show = show + i - start + 1;
              start = -1;

            }
            if(show >= 3){
              flag = false;
            }
          }
        }
        return result;
      }));

      this.itemList.push(new reportItem('order_assess_unicom_e_line_detail','text','19电缆故障详情',function(obj){
        let ad = obj.assess_data.data;
        let arr = [];
        for(let i in class_e_line){
          arr.push({
            name:class_e_line[i],
            sum:0
          });
        }
        for(let i in ad){
          if(ad[i].trouble_class != '电缆故障'){
            continue;
          }else{
            for(let j in arr){
              if(ad[i].trouble_reason == arr[j].name){
                arr[j].sum++;
                break;
              }
            }
          }
        }
        arr.sort(function(v1,v2){
          return v2.sum - v1.sum;
        })
        for(let i=0;i<arr.length;i++){
          if(arr[i].sum == 0){
            arr.splice(i);
          }
        }
        self.dataObject.add('order_assess_unicom_e_line_list','array',arr);
        let sum = obj.order_assess_unicom_e_line.data;
        let result = '';
        let flag = true;
        let show = 0;
        let start = -1;
        for(let i=0;i<arr.length && flag;i++){
          if(i < arr.length - 1 && arr[i].sum == arr[i+1].sum){
            if(start < 0){
              start = i;
            }
            continue;
          }else{
            if(start < 0){
              result = result + arr[i].name + arr[i].sum + '宗，占比' + (arr[i].sum / sum * 100).toFixed(2) + "%；";
              show++;
            }else{
              for(let j = start;j <= i; j++){
                result = result + arr[j].name + '、';
              }
              result = result.substr(0,result.length-1);
              result = result + "各" + arr[start].sum + "宗，各占比" + (arr[start].sum / sum * 100).toFixed(2) + "%；"
              show = show + i - start + 1;
              start = -1;
            }
            if(show >= 3){
              flag = false;
            }
          }
        }
        return result;
      }));

      this.itemList.push(new reportItem('assessUnicomLineItem1','text','19光缆故障首项',function(obj){
        let list = obj.order_assess_unicom_line_list.data;
        if(list && list.length > 0){
          return list[0].name;
        }else{
          return '';
        }
      }));

      this.itemList.push(new reportItem('assessUnicomLineItemSum1','text','19光缆故障首项数量',function(obj){
        let list = obj.order_assess_unicom_line_list.data;
        if(list && list.length > 0){
          return list[0].sum;
        }else{
          return '';
        }
      }));

      this.itemList.push(new reportItem('assessUnicomLineItemPercent1','text','19光缆故障首项占比',function(obj){
        let list = obj.order_assess_unicom_line_list.data;
        if(list && list.length > 0){
          return (list[0].sum/obj.order_assess_unicom_line.data*100).toFixed(2);
        }else{
          return '';
        }
      }));

      this.itemList.push(new reportItem('assessUnicomDevicesItem1','text','19设备故障首项',function(obj){
        let list = obj.order_assess_unicom_devices_list.data;
        if(list && list.length > 0){
          return list[0].name;
        }else{
          return '';
        }
      }));

      this.itemList.push(new reportItem('assessUnicomDevicesItemSum1','text','19设备故障首项数量',function(obj){
        let list = obj.order_assess_unicom_devices_list.data;
        if(list && list.length > 0){
          return list[0].sum;
        }else{
          return '';
        }
      }));

      this.itemList.push(new reportItem('assessUnicomDevicesItemPercent1','text','19设备故障首项占比',function(obj){
        let list = obj.order_assess_unicom_devices_list.data;
        if(list && list.length > 0){
          return (list[0].sum/obj.order_assess_unicom_devices.data*100).toFixed(2);
        }else{
          return '';
        }
      }));

      this.itemList.push(new reportItem('assessUnicomPowerItem1','text','19动力配套首项',function(obj){
        let list = obj.order_assess_unicom_power_list.data;
        if(list && list.length > 0){
          return list[0].name;
        }else{
          return '';
        }
      }));

      this.itemList.push(new reportItem('assessUnicomPowerItemSum1','text','19动力配套首项数量',function(obj){
        let list = obj.order_assess_unicom_power_list.data;
        if(list && list.length > 0){
          return list[0].sum;
        }else{
          return '';
        }
      }));

      this.itemList.push(new reportItem('assessUnicomPowerItemPercent1','text','19动力配套首项占比',function(obj){
        let list = obj.order_assess_unicom_power_list.data;
        if(list && list.length > 0){
          return (list[0].sum/obj.order_assess_unicom_power.data*100).toFixed(2);
        }else{
          return '';
        }
      }));

      this.itemList.push(new reportItem('assessUnicomELineItem1','text','19电缆故障首项',function(obj){
        let list = obj.order_assess_unicom_e_line_list.data;
        if(list && list.length > 0){
          return list[0].name;
        }else{
          return '';
        }
      }));

      this.itemList.push(new reportItem('assessUnicomELineItemSum1','text','19电缆故障首项数量',function(obj){
        let list = obj.order_assess_unicom_e_line_list.data;
        if(list && list.length > 0){
          return list[0].sum;
        }else{
          return '';
        }
      }));

      this.itemList.push(new reportItem('assessUnicomELineItemPercent1','text','19电缆故障首项占比',function(obj){
        let list = obj.order_assess_unicom_e_line_list.data;
        if(list && list.length > 0){
          return (list[0].sum/obj.order_assess_unicom_e_line.data*100).toFixed(2);
        }else{
          return '';
        }
      }));

      this.itemList.push(new reportItem('assessUnicomLineItem','array','19光缆故障表格',function(obj){
        let list = obj.order_assess_unicom_line_list.data;
        let arr = [];
        for(let i=1;i<list.length;i++){
          arr.push({
            assessUnicomLineItem:list[i].name,
            assessUnicomLineItemSum:list[i].sum,
            assessUnicomLineItemPercent:(list[i].sum/obj.order_assess_unicom_line.data*100).toFixed(2)
          })
        }
        return arr;
      }));

      this.itemList.push(new reportItem('assessUnicomDevicesItem','array','19设备故障表格',function(obj){
        let list = obj.order_assess_unicom_devices_list.data;
        let arr = [];
        for(let i=1;i<list.length;i++){
          arr.push({
            assessUnicomDevicesItem:list[i].name,
            assessUnicomDevicesItemSum:list[i].sum,
            assessUnicomDevicesItemPercent:(list[i].sum/obj.order_assess_unicom_devices.data*100).toFixed(2)
          })
        }
        return arr;
      }));

      this.itemList.push(new reportItem('assessUnicomPowerItem','array','19动力配套表格',function(obj){
        let list = obj.order_assess_unicom_power_list.data;
        let arr = [];
        for(let i=1;i<list.length;i++){
          arr.push({
            assessUnicomPowerItem:list[i].name,
            assessUnicomPowerItemSum:list[i].sum,
            assessUnicomPowerItemPercent:(list[i].sum/obj.order_assess_unicom_power.data*100).toFixed(2)
          })
        }
        return arr;
      }));

      this.itemList.push(new reportItem('assessUnicomELineItem','array','19电缆故障表格',function(obj){
        let list = obj.order_assess_unicom_e_line_list.data;
        let arr = [];
        for(let i=1;i<list.length;i++){
          arr.push({
            assessUnicomELineItem:list[i].name,
            assessUnicomELineItemSum:list[i].sum,
            assessUnicomELineItemPercent:(list[i].sum/obj.order_assess_unicom_e_line.data*100).toFixed(2)
          })
        }
        return arr;
      }));

      this.itemList.push(new reportItem('order_assess_business_type_detail','text','19客户行业详情',function(obj){
        let ad = obj.assess_data.data;
        let arr = [];
        for(let i in ad){
          switch(ad[i].trouble_class){
            case '光缆故障':
            case '设备故障':
            case '动力配套':
            case '电缆故障':
              break;
            default:
              continue;
          }
          let bt = ad[i].business_type;
          if(bt == '12'){
            bt = '其他行业';
          }
          let flag = true;
          for(let j in arr){
            if(arr[j].name == bt){
              arr[j].sum++;
              flag = false;
            }
          }
          if(flag){
            arr.push({
              name:bt,
              sum:1
            });
          }
        }
        for(let i in arr){
          if(arr[i].name == '其他行业'){
            arr[i].name = '中小企业';
          }
        }
        arr.sort(function(v1,v2){
          return v2.sum-v1.sum;
        });
        self.dataObject.add('order_assess_business_type_list','array',arr);
        let result = '';
        if(arr.length > 1){
          result = "占比最大的是" + arr[0].name + "，" + arr[0].sum + "宗，占比" + (arr[0].sum / ad.length * 100).toFixed(2) + "%；其次是" + arr[1].name + "，" + arr[1].sum + "宗，占比" + (arr[1].sum / obj.order_assess_unicom.data * 100).toFixed(2) + "%。";
        }else{
          result = "占比最大的是" + arr[0].name + "，" + arr[0].sum + "宗，占比" + (arr[0].sum / ad.length * 100).toFixed(2) + "%";
        }
        return result;
      }));

      this.itemList.push(new reportItem('assessBusinessTypeItem','array','19客户行业表格',function(obj){
        let list = obj.order_assess_business_type_list.data;
        let arr = [];
        for(let i in list){
          arr.push({
            assessBusinessTypeItem:list[i].name,
            assessBusinessTypeItemSum:list[i].sum,
            assessBusinessTypeItemPercent:(list[i].sum/obj.order_assess_unicom.data*100).toFixed(2)
          })
        }
        return arr;
      }));

      this.itemList.push(new reportItem('order_assess_customer_sum_detail','text','19客户故障量分析',function(obj){
        let ad = obj.assess_data.data;
        let arr = [];
        for(let i in ad){
          let name = ad[i].name;
          let reason = '';
          switch(ad[i].trouble_class){
            case '光缆故障':
            case '设备故障':
            case '动力配套':
            case '电缆故障':
              reason = ad[i].trouble_reason;
              break;
            default:
              continue;
          }
          let flag = true;
          for(let j in arr){
            if(arr[j].name == name){
              arr[j].sum++;
              if(arr[j].reason[reason] == undefined){
                arr[j].reason[reason] = 1;
              }else{
                arr[j].reason[reason] = arr[j].reason[reason] + 1;
              }
              flag = false;
            }
          }
          if(flag){
            let r = [];
            r[reason] = 1;
            arr.push({
              name:name,
              sum:1,
              reason:r
            });
          }
        }
        arr.sort(function(v1,v2){
          return v2.sum-v1.sum;
        });
        for(let i=0;i<arr.length;i++){
          if(arr[i].sum <= 1){
            arr.splice(i);
          }else if(arr[i].name == ''||arr[i].name == '-'||arr[i].name == ' '){
            arr.splice(i);
          }
        }
        let len = arr.length > 5 ? 5 : arr.length;
        arr.splice(len);
        self.dataObject.add('order_assess_customer_list','array',arr);
        if(arr.length == 0){
          return '所有客户均报障1宗';
        }
        let result = '';
        for(let i in arr){
          for(let j in arr[i].reason){
            result = result + arr[i].reason[j] + '次' + j + '、';
          }
          result = result.substr(0,result.length-1);
          result = result + '造成' + arr[i].name + '报障' + arr[i].sum + '宗，占比' + (arr[i].sum / obj.order_assess_unicom.data * 100).toFixed(2) + '%；'
        }
        result = result + '其余客户均报障1宗。'
        return result;
      }));

      this.itemList.push(new reportItem('order_assess_customer_sum_picture','img','19客户故障量情况（网络侧）',async function(obj){
        self.img_list.push({name:this.name,text:this.text})
        let name = this.name;
        let result = '';
        let chart = '';
        let data_list = self.dataObject.order_assess_customer_list.data;
        if(data_list.length < 2){
          self.img_list.pop();
          return '';
        }
        let xAxis = [];
        let series = [{
          name: '故障量',
          type: 'bar',
          data: [],
          label:{
            show:true
          },
          barMaxWidth:60
        }];        
        for(let i in data_list){
          xAxis.push(data_list[i].name);
          series[0].data.push(data_list[i].sum);
        }
        let option = self.getOption('bar',series,xAxis);
        await self.$nextTick(function(){
          chart = self.getImg(name,option)
        })

        return chart;
      }));

      this.itemList.push(new reportItem('order_local_real','text','本地真实工单',function(obj){
        let ld = obj.local_data.data;
        let real = 0;
        for(let i in ld){
          if(ld[i].is_trouble == '1'){
            real++;
          }
        }
        return real;
      },function(result){
        self.dataObject.add('order_local_real','number',result);
      }));

      this.itemList.push(new reportItem('order_local_real_percent','text','本地真实工单比例',function(obj){
        return (obj.order_local_real.data / obj.local_data.data.length * 100).toFixed(2);
      }));

      this.itemList.push(new reportItem('order_local_fake','text','本地非真实工单',function(obj){
        let ld = obj.local_data.data;
        let fake = 0;
        for(let i in ld){
          if(ld[i].is_trouble == '0'){
            fake++;
          }
        }
        return fake;
      },function(result){
        self.dataObject.add('order_local_fake','number',result);
      }));

      this.itemList.push(new reportItem('order_local_fake_percent','text','本地非真实工单比例',function(obj){
        return (obj.order_local_fake.data / obj.local_data.data.length * 100).toFixed(2);
      }));

      this.itemList.push(new reportItem('order_local_unicom_line','text','本地光缆故障数量',function(obj){
        let ld = obj.local_data.data;
        let sum = 0;
        for(let i in ld){
          if(ld[i].trouble_class == '光缆故障'){
            sum++;
          }
        }
        return sum;
      },function(result){
        self.dataObject.add('order_local_unicom_line','number',result);
      }));

      this.itemList.push(new reportItem('order_local_unicom_line_percent','text','本地光缆故障占比',function(obj){
        return (obj.order_local_unicom_line.data / obj.order_local_real.data*100).toFixed(2);
      },function(result){
        self.dataObject.add('order_local_unicom_line_percent','number',result);
      }));

      this.itemList.push(new reportItem('order_local_unicom_devices','text','本地设备故障数量',function(obj){
        let ld = obj.local_data.data;
        let sum = 0;
        for(let i in ld){
          if(ld[i].trouble_class == '设备故障'){
            sum++;
          }
        }
        return sum;
      },function(result){
        self.dataObject.add('order_local_unicom_devices','number',result);
      }));

      this.itemList.push(new reportItem('order_local_unicom_devices_percent','text','本地设备故障占比',function(obj){
        return (obj.order_local_unicom_devices.data / obj.order_local_real.data*100).toFixed(2);
      },function(result){
        self.dataObject.add('order_local_unicom_devices_percent','number',result);
      }));

      this.itemList.push(new reportItem('order_local_unicom_power','text','本地动力配套数量',function(obj){
        let ld = obj.local_data.data;
        let sum = 0;
        for(let i in ld){
          if(ld[i].trouble_class == '动力配套'){
            sum++;
          }
        }
        return sum;
      },function(result){
        self.dataObject.add('order_local_unicom_power','number',result);
      }));

      this.itemList.push(new reportItem('order_local_unicom_power_percent','text','本地动力配套占比',function(obj){
        return (obj.order_local_unicom_power.data / obj.order_local_real.data*100).toFixed(2);
      },function(result){
        self.dataObject.add('order_local_unicom_power_percent','number',result);
      }));

      this.itemList.push(new reportItem('order_local_unicom_e_line','text','本地电缆故障数量',function(obj){
        let ld = obj.local_data.data;
        let sum = 0;
        for(let i in ld){
          if(ld[i].trouble_class == '电缆故障'){
            sum++;
          }
        }
        return sum;
      },function(result){
        self.dataObject.add('order_local_unicom_e_line','number',result);
      }));

      this.itemList.push(new reportItem('order_local_unicom_e_line_percent','text','本地电缆故障占比',function(obj){
        return (obj.order_local_unicom_e_line.data / obj.order_local_real.data*100).toFixed(2);
      },function(result){
        self.dataObject.add('order_local_unicom_e_line_percent','number',result);
      }));

      this.itemList.push(new reportItem('localUnicomItem','array','本地网络侧情况表格',function(obj){
        let line = {localUnicomItem:'光缆故障',localUnicomItemSum:obj.order_local_unicom_line.data,localUnicomItemPercent:obj.order_local_unicom_line_percent.data};
        let devices = {localUnicomItem:'设备故障',localUnicomItemSum:obj.order_local_unicom_devices.data,localUnicomItemPercent:obj.order_local_unicom_devices_percent.data};
        let power = {localUnicomItem:'动力配套',localUnicomItemSum:obj.order_local_unicom_power.data,localUnicomItemPercent:obj.order_local_unicom_power_percent.data};
        let e_line = {localUnicomItem:'电缆故障',localUnicomItemSum:obj.order_local_unicom_e_line.data,localUnicomItemPercent:obj.order_local_unicom_e_line_percent.data};
        let arr = [devices,power,line,e_line];
        arr.sort(function(v1,v2){
          return v2.localUnicomItemSum-v1.localUnicomItemSum;
        })
        return arr;
      }));

      this.itemList.push(new reportItem('order_local_unicom_detail','text','本地网络侧情况',function(obj){
        let arr = [];
        arr.push({
          name:'line',
          sum:obj.order_local_unicom_line.data,
          text:'光缆故障'
        });
        arr.push({
          name:'devices',
          sum:obj.order_local_unicom_devices.data,
          text:'设备故障'
        });
        arr.push({
          name:'power',
          sum:obj.order_local_unicom_power.data,
          text:'动力配套'
        });
        arr.push({
          name:'e_line',
          sum:obj.order_local_unicom_e_line.data,
          text:'电缆故障'
        });

        arr.sort(function(v1,v2){
          return v2.sum-v1.sum;
        })
        let result = "";
        for(let i in arr){
          if(arr[i].sum > 0){
            result = result + arr[i].text + arr[i].sum + "宗，占比" + (arr[i].sum / obj.local_data.data.length * 100).toFixed(2) + "%；"
          }
        }
        return result;
      }));

      this.itemList.push(new reportItem('order_local_sum_detail','img','本地政企客户故障原因占比',async function(obj){
        self.img_list.push({name:this.name,text:this.text})
        let name = this.name;
        let result = '';
        let chart = '';
        let series_data = [];
        let data_arr = [
          {name:'光缆故障',value:self.dataObject.order_local_unicom_line.data},
          {name:'设备故障',value:self.dataObject.order_local_unicom_devices.data},
          {name:'动力配套',value:self.dataObject.order_local_unicom_power.data},
          {name:'电缆故障',value:self.dataObject.order_local_unicom_e_line.data},
        ]
        data_arr.sort(function(v1,v2){
          return v2.value-v1.value;
        });
        for(let i in data_arr){
          if(data_arr[i].value > 0){
            series_data.push(data_arr[i])
          }else{
            break;
          }
        }
        let series = {
          name: '故障量',
          data: series_data,
        }
        let option = self.getOption('pie',series)
        await self.$nextTick(function(){
          chart = self.getImg(name,option)
        })

        return chart;
      }));

      this.itemList.push(new reportItem('order_local_unicom_line_detail','text','本地光缆故障详情',function(obj){
        let ad = obj.local_data.data;
        let arr = [];
        for(let i in class_line){
          arr.push({
            name:class_line[i],
            sum:0
          });
        }
        for(let i in ad){
          if(ad[i].trouble_class != '光缆故障'){
            continue;
          }else{
            for(let j in arr){
              if(ad[i].trouble_reason == arr[j].name){
                arr[j].sum++;
                break;
              }
            }
          }
        }
        arr.sort(function(v1,v2){
          return v2.sum - v1.sum;
        })
        for(let i=0;i<arr.length;i++){
          if(arr[i].sum == 0){
            arr.splice(i);
          }
        }
        self.dataObject.add('order_local_unicom_line_list','array',arr);
        let sum = obj.order_local_unicom_line.data;
        let result = '';
        let flag = true;
        let show = 0;
        let start = -1;
        for(let i=0;i<arr.length && flag;i++){
          if(i < arr.length - 1 && arr[i].sum == arr[i+1].sum){
            if(start < 0){
              start = i;
            }
            continue;
          }else{
            if(start < 0){
              result = result + arr[i].name + arr[i].sum + '宗，占比' + (arr[i].sum / sum * 100).toFixed(2) + "%；";
              show++;
            }else{
              for(let j = start;j <= i; j++){
                result = result + arr[j].name + '、';
              }
              result = result.substr(0,result.length-1);
              result = result + "各" + arr[start].sum + "宗，各占比" + (arr[start].sum / sum * 100).toFixed(2) + "%；"
              show = show + i - start + 1;
              start = -1;

            }
            if(show >= 3){
              flag = false;
            }
          }
        }
        return result;
      }));

      this.itemList.push(new reportItem('order_local_unicom_devices_detail','text','本地设备故障详情',function(obj){
        let ad = obj.local_data.data;
        let arr = [];
        for(let i in class_devices){
          arr.push({
            name:class_devices[i],
            sum:0
          });
        }
        for(let i in ad){
          if(ad[i].trouble_class != '设备故障'){
            continue;
          }else{
            for(let j in arr){
              if(ad[i].trouble_reason == arr[j].name){
                arr[j].sum++;
                break;
              }
            }
          }
        }
        arr.sort(function(v1,v2){
          return v2.sum - v1.sum;
        })
        for(let i=0;i<arr.length;i++){
          if(arr[i].sum == 0){
            arr.splice(i);
          }
        }
        self.dataObject.add('order_local_unicom_devices_list','array',arr);
        let sum = obj.order_local_unicom_devices.data;
        let result = '';
        let flag = true;
        let show = 0;
        let start = -1;
        for(let i=0;i<arr.length && flag;i++){
          if(i < arr.length - 1 && arr[i].sum == arr[i+1].sum){
            if(start < 0){
              start = i;
            }
            continue;
          }else{
            if(start < 0){
              result = result + arr[i].name + arr[i].sum + '宗，占比' + (arr[i].sum / sum * 100).toFixed(2) + "%；";
              show++;
            }else{
              for(let j = start;j <= i; j++){
                result = result + arr[j].name + '、';
              }
              result = result.substr(0,result.length-1);
              result = result + "各" + arr[start].sum + "宗，各占比" + (arr[start].sum / sum * 100).toFixed(2) + "%；"
              show = show + i - start + 1;
              start = -1;

            }
            if(show >= 3){
              flag = false;
            }
          }
        }
        return result;
      }));

      this.itemList.push(new reportItem('order_local_unicom_power_detail','text','本地动力配套详情',function(obj){
        let ad = obj.local_data.data;
        let arr = [];
        for(let i in class_power){
          arr.push({
            name:class_power[i],
            sum:0
          });
        }
        for(let i in ad){
          if(ad[i].trouble_class != '动力配套'){
            continue;
          }else{
            for(let j in arr){
              if(ad[i].trouble_reason == arr[j].name){
                arr[j].sum++;
                break;
              }
            }
          }
        }
        arr.sort(function(v1,v2){
          return v2.sum - v1.sum;
        })
        for(let i=0;i<arr.length;i++){
          if(arr[i].sum == 0){
            arr.splice(i);
          }
        }
        self.dataObject.add('order_local_unicom_power_list','array',arr);
        let sum = obj.order_local_unicom_power.data;
        let result = '';
        let flag = true;
        let show = 0;
        let start = -1;
        for(let i=0;i<arr.length && flag;i++){
          if(i < arr.length - 1 && arr[i].sum == arr[i+1].sum){
            if(start < 0){
              start = i;
            }
            continue;
          }else{
            if(start < 0){
              result = result + arr[i].name + arr[i].sum + '宗，占比' + (arr[i].sum / sum * 100).toFixed(2) + "%；";
              show++;
            }else{
              for(let j = start;j <= i; j++){
                result = result + arr[j].name + '、';
              }
              result = result.substr(0,result.length-1);
              result = result + "各" + arr[start].sum + "宗，各占比" + (arr[start].sum / sum * 100).toFixed(2) + "%；"
              show = show + i - start + 1;
              start = -1;

            }
            if(show >= 3){
              flag = false;
            }
          }
        }
        return result;
      }));

      this.itemList.push(new reportItem('order_local_unicom_e_line_detail','text','本地电缆故障详情',function(obj){
        let ad = obj.local_data.data;
        let arr = [];
        for(let i in class_e_line){
          arr.push({
            name:class_e_line[i],
            sum:0
          });
        }
        for(let i in ad){
          if(ad[i].trouble_class != '电缆故障'){
            continue;
          }else{
            for(let j in arr){
              if(ad[i].trouble_reason == arr[j].name){
                arr[j].sum++;
                break;
              }
            }
          }
        }
        arr.sort(function(v1,v2){
          return v2.sum - v1.sum;
        })
        for(let i=0;i<arr.length;i++){
          if(arr[i].sum == 0){
            arr.splice(i);
          }
        }
        self.dataObject.add('order_local_unicom_e_line_list','array',arr);
        let sum = obj.order_local_unicom_e_line.data;
        let result = '';
        let flag = true;
        let show = 0;
        let start = -1;
        for(let i=0;i<arr.length && flag;i++){
          if(i < arr.length - 1 && arr[i].sum == arr[i+1].sum){
            if(start < 0){
              start = i;
            }
            continue;
          }else{
            if(start < 0){
              result = result + arr[i].name + arr[i].sum + '宗，占比' + (arr[i].sum / sum * 100).toFixed(2) + "%；";
              show++;
            }else{
              for(let j = start;j <= i; j++){
                result = result + arr[j].name + '、';
              }
              result = result.substr(0,result.length-1);
              result = result + "各" + arr[start].sum + "宗，各占比" + (arr[start].sum / sum * 100).toFixed(2) + "%；"
              show = show + i - start + 1;
              start = -1;

            }
            if(show >= 3){
              flag = false;
            }
          }
        }
        return result;
      }));

      this.itemList.push(new reportItem('localUnicomLineItem1','text','本地光缆故障首项',function(obj){
        let list = obj.order_local_unicom_line_list.data;
        if(list && list.length > 0){
          return list[0].name;
        }else{
          return '';
        }
      }));

      this.itemList.push(new reportItem('localUnicomLineItemSum1','text','本地光缆故障首项数量',function(obj){
        let list = obj.order_local_unicom_line_list.data;
        if(list && list.length > 0){
          return list[0].sum;
        }else{
          return '';
        }
      }));

      this.itemList.push(new reportItem('localUnicomLineItemPercent1','text','本地光缆故障首项占比',function(obj){
        let list = obj.order_local_unicom_line_list.data;
        if(list && list.length > 0){
          return (list[0].sum/obj.order_local_unicom_line.data*100).toFixed(2);
        }else{
          return '';
        }
      }));

      this.itemList.push(new reportItem('localUnicomDevicesItem1','text','本地设备故障首项',function(obj){
        let list = obj.order_local_unicom_devices_list.data;
        if(list && list.length > 0){
          return list[0].name;
        }else{
          return '';
        }
      }));

      this.itemList.push(new reportItem('localUnicomDevicesItemSum1','text','本地设备故障首项数量',function(obj){
        let list = obj.order_local_unicom_devices_list.data;
        if(list && list.length > 0){
          return list[0].sum;
        }else{
          return '';
        }
      }));

      this.itemList.push(new reportItem('localUnicomDevicesItemPercent1','text','本地设备故障首项占比',function(obj){
        let list = obj.order_local_unicom_devices_list.data;
        if(list && list.length > 0){
          return (list[0].sum/obj.order_local_unicom_devices.data*100).toFixed(2);
        }else{
          return '';
        }
      }));

      this.itemList.push(new reportItem('localUnicomPowerItem1','text','本地动力配套首项',function(obj){
        let list = obj.order_local_unicom_power_list.data;
        if(list && list.length > 0){
          return list[0].name;
        }else{
          return '';
        }
      }));

      this.itemList.push(new reportItem('localUnicomPowerItemSum1','text','本地动力配套首项数量',function(obj){
        let list = obj.order_local_unicom_power_list.data;
        if(list && list.length > 0){
          return list[0].sum;
        }else{
          return '';
        }
      }));

      this.itemList.push(new reportItem('localUnicomPowerItemPercent1','text','本地动力配套首项占比',function(obj){
        let list = obj.order_local_unicom_power_list.data;
        if(list && list.length > 0){
          return (list[0].sum/obj.order_local_unicom_power.data*100).toFixed(2);
        }else{
          return '';
        }
      }));

      this.itemList.push(new reportItem('localUnicomELineItem1','text','本地电缆故障首项',function(obj){
        let list = obj.order_local_unicom_e_line_list.data;
        if(list && list.length > 0){
          return list[0].name;
        }else{
          return '';
        }
      }));

      this.itemList.push(new reportItem('localUnicomELineItemSum1','text','本地电缆故障首项数量',function(obj){
        let list = obj.order_local_unicom_e_line_list.data;
        if(list && list.length > 0){
          return list[0].sum;
        }else{
          return '';
        }
      }));

      this.itemList.push(new reportItem('localUnicomELineItemPercent1','text','本地电缆故障首项占比',function(obj){
        let list = obj.order_local_unicom_e_line_list.data;
        if(list && list.length > 0){
          return (list[0].sum/obj.order_local_unicom_e_line.data*100).toFixed(2);
        }else{
          return '';
        }
      }));

      this.itemList.push(new reportItem('localUnicomLineItem','array','本地光缆故障表格',function(obj){
        let list = obj.order_local_unicom_line_list.data;
        let arr = [];
        for(let i=1;i<list.length;i++){
          arr.push({
            localUnicomLineItem:list[i].name,
            localUnicomLineItemSum:list[i].sum,
            localUnicomLineItemPercent:(list[i].sum/obj.order_local_unicom_line.data*100).toFixed(2)
          })
        }
        return arr;
      }));

      this.itemList.push(new reportItem('localUnicomDevicesItem','array','本地设备故障表格',function(obj){
        let list = obj.order_local_unicom_devices_list.data;
        let arr = [];
        for(let i=1;i<list.length;i++){
          arr.push({
            localUnicomDevicesItem:list[i].name,
            localUnicomDevicesItemSum:list[i].sum,
            localUnicomDevicesItemPercent:(list[i].sum/obj.order_local_unicom_devices.data*100).toFixed(2)
          })
        }
        return arr;
      }));

      this.itemList.push(new reportItem('localUnicomPowerItem','array','本地动力配套表格',function(obj){
        let list = obj.order_local_unicom_power_list.data;
        let arr = [];
        for(let i=1;i<list.length;i++){
          arr.push({
            localUnicomPowerItem:list[i].name,
            localUnicomPowerItemSum:list[i].sum,
            localUnicomPowerItemPercent:(list[i].sum/obj.order_local_unicom_power.data*100).toFixed(2)
          })
        }
        return arr;
      }));

      this.itemList.push(new reportItem('localUnicomELineItem','array','本地电缆故障表格',function(obj){
        let list = obj.order_local_unicom_e_line_list.data;
        let arr = [];
        for(let i=1;i<list.length;i++){
          arr.push({
            localUnicomELineItem:list[i].name,
            localUnicomELineItemSum:list[i].sum,
            localUnicomELineItemPercent:(list[i].sum/obj.order_local_unicom_e_line.data*100).toFixed(2)
          })
        }
        return arr;
      }));

      this.itemList.push(new reportItem('order_local_business_type_detail','text','本地客户行业详情',function(obj){
        let ld = obj.local_data.data;
        let arr = [];
        for(let i in ld){
          if(ld[i].is_trouble == '0'){
            continue;
          }
          let bt = ld[i].business_type;
          let flag = true;
          for(let j in arr){
            if(arr[j].name == bt){
              arr[j].sum++;
              flag = false;
            }
          }
          if(flag){
            arr.push({
              name:bt,
              sum:1
            });
          }
        }
        for(let i in arr){
          if(arr[i].name == '其他行业'){
            arr[i].name = '中小企业';
          }
        }
        arr.sort(function(v1,v2){
          return v2.sum-v1.sum;
        });
        self.dataObject.add('order_local_business_type_list','array',arr);
        let result = '';
        if(arr.length > 1){
          result = "占比最大的是" + arr[0].name + "，" + arr[0].sum + "宗，占比" + (arr[0].sum / obj.order_local_real.data * 100).toFixed(2) + "%；其次是" + arr[1].name + "，" + arr[1].sum + "宗，占比" + (arr[1].sum / obj.order_local_real.data * 100).toFixed(2) + "%。";
        }else{
          result = "占比最大的是" + arr[0].name + "，" + arr[0].sum + "宗，占比" + (arr[0].sum / obj.order_local_real.data * 100).toFixed(2) + "%";
        }
        return result;
      }));

      this.itemList.push(new reportItem('localBusinessTypeItem','array','本地客户行业表格',function(obj){
        let list = obj.order_local_business_type_list.data;
        let arr = [];
        for(let i in list){
          arr.push({
            localBusinessTypeItem:list[i].name,
            localBusinessTypeItemSum:list[i].sum,
            localBusinessTypeItemPercent:(list[i].sum/obj.order_local_real.data*100).toFixed(2)
          })
        }
        return arr;
      }));

      this.itemList.push(new reportItem('order_local_customer_detail','text','本地客户故障量分析',function(obj){
        let ld = obj.local_data.data;
        let arr = [];
        for(let i in ld){
          if(ld[i].is_trouble == '0'){
            continue;
          }
          let name = ld[i].name;
          let reason = ld[i].trouble_reason;
          let flag = true;
          for(let j in arr){
            if(arr[j].name == name){
              arr[j].sum++;
              if(arr[j].reason[reason] == undefined){
                arr[j].reason[reason] = 1;
              }else{
                arr[j].reason[reason] = arr[j].reason[reason] + 1;
              }
              flag = false;
            }
          }
          if(flag){
            let r = [];
            r[reason] = 1;
            arr.push({
              name:name,
              sum:1,
              reason:r
            });
          }
        }
        arr.sort(function(v1,v2){
          return v2.sum-v1.sum;
        });
        for(let i=0;i<arr.length;i++){
          if(arr[i].sum <= 1){
            arr.splice(i);
          }else if(arr[i].name == ''||arr[i].name == '-'||arr[i].name == ' '){
            arr.splice(i);
          }
        }
        let len = arr.length > 5 ? 5 : arr.length;
        arr.splice(len);
        self.dataObject.add('order_local_customer_list','array',arr);
        if(arr.length == 0){
          return '所有客户均报障1宗';
        }
        let result = '';
        for(let i in arr){
          for(let j in arr[i].reason){
            result = result + arr[i].reason[j] + '次' + j + '、';
          }
          result = result.substr(0,result.length-1);
          result = result + '造成' + arr[i].name + '报障' + arr[i].sum + '宗，占比' + (arr[i].sum / obj.order_local_real.data * 100).toFixed(2) + '%；'
        }
        result = result + '其余客户均报障1宗。'
        return result;
      }));

      this.itemList.push(new reportItem('order_local_customer_sum_picture','img','本地政企客户故障量',async function(obj){
        self.img_list.push({name:this.name,text:this.text})
        let name = this.name;
        let result = '';
        let chart = '';
        let data_list = self.dataObject.order_local_customer_list.data;
        if(data_list.length < 2){
          self.img_list.pop();
          return '';
        }
        let xAxis = [];
        let series = [{
          name: '故障量',
          type: 'bar',
          data: [],
          label:{
            show:true
          },
          barMaxWidth:60
        }];        
        for(let i in data_list){
          xAxis.push(data_list[i].name);
          series[0].data.push(data_list[i].sum);
        }
        let option = self.getOption('bar',series,xAxis);
        await self.$nextTick(function(){
          chart = self.getImg(name,option)
        })

        return chart;
      }));

      this.itemList.push(new reportItem('TOP33_sum','text','TOP33故障数',function(obj){
        let ad = obj.assess_data.data;
        let ld = obj.local_data.data;
        let arr = [];
        for(let i in ad){
          if(ad[i].TOP33 == '1'){
            arr.push({
              orderID:ad[i].orderId,
              name:ad[i].name,
              circuit_number:ad[i].circuit_number,
              trouble_class:ad[i].trouble_class,
              trouble_reason:ad[i].trouble_reason,
              time:ad[i].time,
              is_trouble:ad[i].is_trouble,
              is_assess:ad[i].is_assess,
              timeout:ad[i].time_out
            })
          }
        }
        for(let i in ld){
          if(ld[i].mark == 'TOP33'){
            arr.push({
              orderID:ld[i].id,
              name:ld[i].name,
              circuit_number:ld[i].circuit_number,
              trouble_class:ld[i].trouble_class,
              trouble_reason:ld[i].trouble_reason,
              time:ld[i].time,
              is_trouble:ld[i].is_trouble,
              is_assess:'0',
              timeout:'0'
            })
          }
        }
        self.dataObject.add('TOP33_list','array',arr);
        //console.log(arr);
        return arr.length;
      },function(result){
        self.dataObject.add('TOP33_sum','number',result);
      }));

      this.itemList.push(new reportItem('TOP33_fake','text','TOP33非真实故障',function(obj){
        let list = obj.TOP33_list.data;
        let sum = 0;
        for(let i in list){
          if(list[i].is_trouble == '0'){
            sum++;
          }
        }
        return sum;
      },function(result){
        self.dataObject.add('TOP33_fake','number',result)
      }));

      this.itemList.push(new reportItem('TOP33_fake_percent','text','TOP33非真实故障比例',function(obj){
        return (obj.TOP33_fake.data / obj.TOP33_sum.data * 100).toFixed(2);
      },function(result){
        self.dataObject.add('TOP33_fake_percent','number',result)
      }));

      this.itemList.push(new reportItem('TOP33_real','text','TOP33真实故障',function(obj){
        let list = obj.TOP33_list.data;
        let sum = 0;
        for(let i in list){
          if(list[i].is_trouble == '1'){
            sum++;
          }
        }
        return sum;
      },function(result){
        self.dataObject.add('TOP33_real','number',result)
      }));

      this.itemList.push(new reportItem('TOP33_real_number_rate','text','TOP33故障率',function(obj){
        return (obj.TOP33_real.data/TOP33_NUMBER_SUM*100).toFixed(2);
      },function(result){
        self.dataObject.add('TOP33_real_number_rate','number',result)
      }));

      this.itemList.push(new reportItem('TOP33_real_percent','text','TOP33真实故障比例',function(obj){
        return (obj.TOP33_real.data / obj.TOP33_sum.data * 100).toFixed(2);
      },function(result){
        self.dataObject.add('TOP33_real_percent','number',result)
      }));

      this.itemList.push(new reportItem('TOP33_real_detail','text','TOP33真实故障情况',function(obj){
        let list = obj.TOP33_list.data;
        let arr = [];
        for(let i in list){
          if(list[i].is_trouble == '1'){
            arr.push(list[i]);
          }
        }
        arr.sort(function(v1,v2){
          return v1.name.localeCompare(v2.name,'zh-CN');
        })
        let count = 1;
        for(let i=arr.length-1;i>=0;i--){
          if(i>0 && arr[i].name == arr[i-1].name){
            arr[i].count = '';
            arr[i].rate = '';
            count++;
          }else{
            arr[i].count = count;
            arr[i].rate = self.getNumberRate(arr[i].name,count) + '%';
            count = 1;
          }
        }
        self.dataObject.add('TOP33_real_list','array',arr);
        let rl = [];
        for(let i in arr){
          let flag = true;
          for(let j in rl){
            if(arr[i].trouble_class == rl[j].reason){
              rl[j].sum++;
              flag = false;
            }
          }
          if(flag){
            rl.push({
              reason:arr[i].trouble_class,
              sum:1
            })
          }
        }
        rl.sort(function(v1,v2){
          return v2.sum - v1.sum;
        });
        let result = '';
        for(let i in rl){
          result = result + rl[i].reason + rl[i].sum + '宗，占比' + (rl[i].sum / arr.length * 100).toFixed(2) + '%；';
        }
        return result;
      }));

      this.itemList.push(new reportItem('TOP33RealItem','array','TOP33客户真实故障表格',function(obj){
        let list = obj.TOP33_real_list.data;
        let arr = [];
        for(let i in list){
          arr.push({
            TOP33RealItem:list[i].orderID,
            TOP33RealItemName:list[i].name,
            TOP33RealItemNumber:list[i].circuit_number,
            TOP33RealItemReason:list[i].trouble_class+(list[i].trouble_reason==undefined?'':'-'+list[i].trouble_reason)
          })
        }
        return arr;
      }));

      this.itemList.push(new reportItem('TOP33NumberItem1','text','TOP33故障率首项ID',function(obj){
        if(obj.TOP33_real_list.data != undefined && obj.TOP33_real_list.data.length > 0){
          return obj.TOP33_real_list.data[0].orderID;
        }
        return '';
      }));

      this.itemList.push(new reportItem('TOP33NumberItem1Name','text','TOP33故障率首项客户名称',function(obj){
        if(obj.TOP33_real_list.data != undefined && obj.TOP33_real_list.data.length > 0){
          return obj.TOP33_real_list.data[0].name;
        }
        return '';
      }));

      this.itemList.push(new reportItem('TOP33NumberItem1Number','text','TOP33故障率首项电路编号',function(obj){
        if(obj.TOP33_real_list.data != undefined && obj.TOP33_real_list.data.length > 0){
          return obj.TOP33_real_list.data[0].circuit_number;
        }
        return '';
      }));

      this.itemList.push(new reportItem('TOP33NumberItem1Sum','text','TOP33故障率首项数量',function(obj){
        if(obj.TOP33_real_list.data != undefined && obj.TOP33_real_list.data.length > 0){
          return obj.TOP33_real_list.data[0].count;
        }
        return '';
      }));

      this.itemList.push(new reportItem('TOP33NumberItem1Rate','text','TOP33故障率首项故障率（本客户）',function(obj){
        if(obj.TOP33_real_list.data != undefined && obj.TOP33_real_list.data.length > 0){
          return obj.TOP33_real_list.data[0].rate;
        }
        return '';
      }));

      this.itemList.push(new reportItem('TOP33NumberItem','array','TOP33故障率表格',function(obj){
        let list = obj.TOP33_real_list.data;
        let arr = [];
        for(let i=1;i<list.length;i++){
          arr.push({
            TOP33NumberItem:list[i].orderID,
            TOP33NumberItemName:list[i].name,
            TOP33NumberItemNumber:list[i].circuit_number,
            TOP33NumberItemSum:list[i].count,
            TOP33NumberItemRate:list[i].rate
          })
        }
        return arr;
      }));

      this.itemList.push(new reportItem('TOP33_timeout','text','TOP33超时数',function(obj){
        let list = obj.TOP33_list.data;
        let sum = 0;
        let arr = [];
        for(let i in list){
          if(list[i].timeout == '1' && list[i].is_assess == '1'){
            sum++;
            arr.push(list[i]);
          }
        }
        self.dataObject.add('TOP33_timeout_list','array',arr);
        return sum;
      },function(result){
        self.dataObject.add('TOP33_timeout','number',result);
      }));

      this.itemList.push(new reportItem('TOP33TimeoutItem','array','TOP33超时故障表格',function(obj){
        let list = obj.TOP33_timeout_list.data;
        let arr = [];
        for(let i in list){
          arr.push({
            TOP33TimeoutItem:list[i].orderID,
            TOP33TimeoutItemName:list[i].name,
            TOP33TimeoutItemNumber:list[i].circuit_number,
            TOP33TimeoutItemTime:list[i].time,
            TOP33TimeoutItemReason:list[i].reason
          })
        }
        return arr;
      }));

      this.itemList.push(new reportItem('TOP33_timeout_rate','text','TOP33及时率',function(obj){
        return ((1 - obj.TOP33_timeout.data / obj.TOP33_sum.data) * 100).toFixed(2);
      }));

      this.itemList.push(new reportItem('TOP33_assess_sum','text','TOP33责任故障',function(obj){
        let ad = obj.assess_data.data;
        let sum = 0;
        let arr = [];
        for(let i in ad){
          if(ad[i].TOP33 == '1' && ad[i].is_assess == '1'){
            sum++;
            arr.push(ad[i]);
          }
        }
        self.dataObject.add('TOP33_assess_list','array',arr);
        return sum;
      }));

      this.itemList.push(new reportItem('TOP33_assess_repeat','text','TOP33责任故障重复',function(obj){
        let list = obj.TOP33_assess_list.data;
        let cl = [];
        let arr = [];
        for(let i in list){
          let flag = true;
          for(let j in cl){
            if(list[i].circuit_number == cl[j].number){
              cl[j].sum++;
              cl[j].orderID.push(list[i].orderID);
              cl[j].time.push(list[i].time);
              cl[j].reason.push(list[i].reason);
              flag = false;
            }
          }
          if(flag){
            cl.push({
              name:list[i].name,
              orderID:[list[i].orderID],
              time:[list[i].time],
              reason:[list[i].reason],
              number:list[i].circuit_number,
              sum:1
            })
          }
        }
        let sum = 0;
        for(let i in cl){
          if(cl[i] > 1){
            sum = sum + cl[i].sum - 1;
            for(let j in cl[i].orderID){
              arr.push({
                NumberRepeatItem:cl[i].orderID[j],
                NumberRepeatItemName:cl[i].name,
                NumberRepeatItemNumber:cl[i].number,
                NumberRepeatItemTime:cl[i].time[j],
                NumberRepeatItemReason:cl[i].reason[j]
              })
            }
          }
        }
        self.dataObject.add('number_repeat_list','array',arr);
        return sum;
      }));

      this.itemList.push(new reportItem('TOP800_assess_sum','text','TOP800责任故障',function(obj){
        let ad = obj.assess_data_all.data;
        let sum = 0;
        let arr = [];
        for(let i in ad){
          if(ad[i].assess_TOPN == '1' && ad[i].is_assess == '1'){
            sum++;
            arr.push(ad[i]);
          }
        }
        self.dataObject.add('TOP800_assess_list','array',arr);
        return sum;
      }));

      this.itemList.push(new reportItem('TOP800_assess_repeat','text','TOP800责任故障重复',function(obj){
        let list = obj.TOP800_assess_list.data;
        let cl = [];
        for(let i in list){
          let flag = true;
          for(let j in cl){
            if(list[i].circuit_number == cl[j].number){
              cl[j].sum++;
              cl[j].orderID.push(list[i].orderId);
              cl[j].time.push(list[i].time);
              cl[j].reason.push(list[i].trouble_class+'-'+list[i].trouble_reason);
              flag = false;
            }
          }
          if(flag){
            if(list[i].circuit_number != ''&&list[i].circuit_number != '客户无法提供'&&list[i].circuit_number != '无'){
              cl.push({
                number:list[i].circuit_number,
                sum:1,
                name:list[i].name,
                orderID:[list[i].orderId],
                time:[list[i].time],
                reason:[list[i].trouble_class+'-'+list[i].trouble_reason],
              })
            }
          }
        }
        let sum = 0;
        let arr = obj.number_repeat_list.data;
        for(let i in cl){
          if(cl[i].sum > 1){
            sum = sum + cl[i].sum - 1;  
            for(let j in cl[i].orderID){
              arr.push({
                NumberRepeatItem:cl[i].orderID[j],
                NumberRepeatItemName:cl[i].name,
                NumberRepeatItemNumber:cl[i].number,
                NumberRepeatItemTime:cl[i].time[j],
                NumberRepeatItemReason:cl[i].reason[j]
              })
            }
          }
        }
        self.dataObject.add('TOP800_assess_list','array',arr);
        return sum;
      }));

      this.itemList.push(new reportItem('NON_TOP800_assess_sum','text','非TOP800责任故障',function(obj){
        let ad = obj.assess_data_all.data;
        let sum = 0;
        let arr = [];
        for(let i in ad){
          if(ad[i].assess_TOPN == '0' && ad[i].is_assess == '1'){
            sum++;
            arr.push(ad[i]);
          }
        }
        self.dataObject.add('NON_TOP800_assess_list','array',arr);
        return sum;
      }));

      this.itemList.push(new reportItem('NON_TOP800_assess_repeat','text','非TOP800责任故障重复',function(obj){
        let list = obj.NON_TOP800_assess_list.data;
        let cl = [];
        for(let i in list){
          let flag = true;
          for(let j in cl){
            if(list[i].circuit_number == cl[j].number){
              cl[j].sum++;
              cl[j].orderID.push(list[i].orderId);
              cl[j].time.push(list[i].time);
              cl[j].reason.push(list[i].trouble_class+'-'+list[i].trouble_reason);
              flag = false;
            }
          }
          if(flag){
            if(list[i].circuit_number != ''&&list[i].circuit_number != '客户无法提供'&&list[i].circuit_number != '无'){
              cl.push({
                number:list[i].circuit_number,
                sum:1,
                name:list[i].name,
                orderID:[list[i].orderId],
                time:[list[i].time],
                reason:[list[i].trouble_class+'-'+list[i].trouble_reason],
              })
            }
          }
        }
        let sum = 0;
        let arr = obj.number_repeat_list.data;
        for(let i in cl){
          if(cl[i].sum > 2){
            sum = sum + cl[i].sum - 2;  
            for(let j in cl[i].orderID){
              arr.push({
                NumberRepeatItem:cl[i].orderID[j],
                NumberRepeatItemName:cl[i].name,
                NumberRepeatItemNumber:cl[i].number,
                NumberRepeatItemTime:cl[i].time[j],
                NumberRepeatItemReason:cl[i].reason[j]
              })
            }
          }
        }
        self.dataObject.add('TOP800_assess_list','array',arr);
        return sum;
      }));

      this.itemList.push(new reportItem('NumberRepeatItem','array','重复电路列表',function(obj){
        return obj.number_repeat_list.data;
      }));

      this.itemList.push(new reportItem('TOP210_assess_sum','text','TOP210责任故障',function(obj){
        let ad = obj.assess_data.data;
        let sum = 0;
        let arr = [];
        for(let i in ad){
          if(ad[i].TOP210 == '1' && ad[i].is_assess == '1'){
            sum++;
            arr.push(ad[i]);
          }
        }
        self.dataObject.add('TOP210_assess_list','array',arr);
        return sum;
      },function(result){
        self.dataObject.add('TOP210_assess_sum','number',result);
      }));

      this.itemList.push(new reportItem('TOP210_assess_timeout','text','TOP210责任超时故障',function(obj){
        let list = obj.TOP210_assess_list.data;
        let arr = [];
        let sum = 0;
        for(let i in list){
          if(list[i].net_duration > 120){
            sum++;
            arr.push({
              TOP210TimeoutItem:list[i].orderId,
              TOP210TimeoutItemName:list[i].name,
              TOP210TimeoutItemNumber:list[i].circuit_number,
              TOP210TimeoutItemTime:list[i].net_duration,
              TOP210TimeoutItemReason:list[i].remark.replace(/\[.*\]/,'')
            })
          }
        }
        self.dataObject.add('TOP210_timeout_list','array',arr);
        return sum;
      },function(result){
        self.dataObject.add('TOP210_assess_timeout','number',result);
      }));

      this.itemList.push(new reportItem('TOP210TimeoutItem','array','TOP210超时故障表格',function(obj){
        return obj.TOP210_timeout_list.data;
      }));

      this.itemList.push(new reportItem('TOP210_assess_timeout_detail','text','TOP210责任及时率情况',function(obj){
        let percent = ((1 - obj.TOP210_assess_timeout.data / obj.TOP210_assess_sum.data) * 100).toFixed(2);
        return percent + '%' + (percent > 90 ? "(>90%)，达标" : "(<90%)，不达标");
      }));

      this.itemList.push(new reportItem('TOP210_assess_all_sum','text','TOP210累计责任故障',function(obj){
        let ad = obj.assess_data_all.data;
        let sum = 0;
        let arr = [];
        for(let i in ad){
          if(ad[i].TOP210 == '1' && ad[i].is_assess == '1'){
            sum++;
            arr.push(ad[i]);
          }
        }
        self.dataObject.add('TOP210_assess_all_list','array',arr);
        return sum;
      },function(result){
        self.dataObject.add('TOP210_assess_all_sum','number',result);
      }));

      this.itemList.push(new reportItem('TOP210_assess_all_timeout','text','TOP210累计责任超时故障',function(obj){
        let list = obj.TOP210_assess_all_list.data;
        let sum = 0;
        for(let i in list){
          if(list[i].net_duration > 120){
            sum++;
          }
        }
        return sum;
      },function(result){
        self.dataObject.add('TOP210_assess_all_timeout','number',result);
      }));

      this.itemList.push(new reportItem('TOP210_assess_all_timeout_detail','text','TOP210累计责任及时率情况',function(obj){
        let percent = ((1 - obj.TOP210_assess_all_timeout.data / obj.TOP210_assess_all_sum.data) * 100).toFixed(2);
        return percent + '%' + (percent > 90 ? "(>90%)，达标" : "(<90%)，不达标");
      }));

      this.itemList.push(new reportItem('TOP800_1_2_assess_sum','text','TOP800家1-2级责任故障',function(obj){
        let ad = obj.assess_data.data;
        let sum = 0;
        let arr = [];
        for(let i in ad){
          if(ad[i].assess_TOPN == '1' && ad[i].is_assess == '1' && (ad[i].level == '一级' || ad[i].level == '二级')){
            sum++;
            arr.push(ad[i]);
          }
        }
        self.dataObject.add('TOP800_1_2_assess_list','array',arr);
        return sum;
      },function(result){
        self.dataObject.add('TOP800_1_2_assess_sum','number',result);
      }));

      this.itemList.push(new reportItem('TOP800_1_2_assess_timeout','text','TOP800家1-2级责任超时故障',function(obj){
        let list = obj.TOP800_1_2_assess_list.data;
        let sum = 0;
        let arr = [];
        for(let i in list){
          if(list[i].time_out == '1'){
            sum++;
            arr.push({
              TOP800OneTwoTimeoutItem:list[i].orderId,
              TOP800OneTwoTimeoutItemName:list[i].name,
              TOP800OneTwoTimeoutItemNumber:list[i].circuit_number,
              TOP800OneTwoTimeoutItemTime:list[i].time,
              TOP800OneTwoTimeoutItemReason:list[i].remark.replace(/\[.*\]/,'')
            })
          }
        }
        self.dataObject.add('TOP800_1_2_timeout_list','array',arr);
        return sum;
      },function(result){
        self.dataObject.add('TOP800_1_2_assess_timeout','number',result);
      }));

      this.itemList.push(new reportItem('TOP800OneTwoTimeoutItem','array','TOP800家1-2级超时故障表格',function(obj){
        return obj.TOP800_1_2_timeout_list.data;
      }));

      this.itemList.push(new reportItem('TOP800_1_2_assess_timeout_detail','text','TOP800家1-2级责任及时率情况',function(obj){
        let percent = ((1 - obj.TOP800_1_2_assess_timeout.data / obj.TOP800_1_2_assess_sum.data) * 100).toFixed(2);
        return percent + '%' + (percent > 90 ? "(>90%)，达标" : "(<90%)，不达标");
      }));

      this.itemList.push(new reportItem('TOP800_1_2_assess_all_sum','text','TOP800家累计1-2级责任故障',function(obj){
        let ad = obj.assess_data_all.data;
        let sum = 0;
        let arr = [];
        for(let i in ad){
          if(ad[i].assess_TOPN == '1' && ad[i].is_assess == '1' && (ad[i].level == '一级' || ad[i].level == '二级')){
            sum++;
            arr.push(ad[i]);
          }
        }
        self.dataObject.add('TOP800_1_2_assess_all_list','array',arr);
        return sum;
      },function(result){
        self.dataObject.add('TOP800_1_2_assess_all_sum','number',result);
      }));

      this.itemList.push(new reportItem('TOP800_1_2_assess_all_timeout','text','TOP800家累计1-2级责任超时故障',function(obj){
        let list = obj.TOP800_1_2_assess_all_list.data;
        let sum = 0;
        for(let i in list){
          if(list[i].time_out == '1'){
            sum++;
          }
        }
        return sum;
      },function(result){
        self.dataObject.add('TOP800_1_2_assess_all_timeout','number',result);
      }));

      this.itemList.push(new reportItem('TOP800_1_2_assess_all_timeout_detail','text','TOP800家累计1-2级责任及时率情况',function(obj){
        let percent = ((1 - obj.TOP800_1_2_assess_all_timeout.data / obj.TOP800_1_2_assess_all_sum.data) * 100).toFixed(2);
        return percent + '%' + (percent > 90 ? "(>90%)，达标" : "(<90%)，不达标");
      }));

      this.itemList.push(new reportItem('TOP800_3_6_assess_sum','text','TOP800家3-6级责任故障',function(obj){
        let ad = obj.assess_data.data;
        let sum = 0;
        let arr = [];
        for(let i in ad){
          if(ad[i].assess_TOPN == '1' && ad[i].is_assess == '1' && (ad[i].level == '三级' || ad[i].level == '四级' || ad[i].level == '五级' || ad[i].level == '六级')){
            sum++;
            arr.push(ad[i]);
          }
        }
        self.dataObject.add('TOP800_3_6_assess_list','array',arr);
        return sum;
      },function(result){
        self.dataObject.add('TOP800_3_6_assess_sum','number',result);
      }));

      this.itemList.push(new reportItem('TOP800_3_6_assess_timeout','text','TOP800家3-6级责任超时故障',function(obj){
        let list = obj.TOP800_3_6_assess_list.data;
        let sum = 0;
        let arr = [];
        for(let i in list){
          if(list[i].time_out == '1'){
            sum++;
            arr.push({
              TOP800ThreeSixTimeoutItem:list[i].orderId,
              TOP800ThreeSixTimeoutItemName:list[i].name,
              TOP800ThreeSixTimeoutItemNumber:list[i].circuit_number,
              TOP800ThreeSixTimeoutItemTime:list[i].time,
              TOP800ThreeSixTimeoutItemReason:list[i].remark.replace(/\[.*\]/,'')
            })
          }
        }
        self.dataObject.add('TOP800_3_6_timeout_list','array',arr);
        return sum;
      },function(result){
        self.dataObject.add('TOP800_3_6_assess_timeout','number',result);
      }));

      this.itemList.push(new reportItem('TOP800ThreeSixTimeoutItem','array','TOP800家3-6级超时故障表格',function(obj){
        return obj.TOP800_3_6_timeout_list.data;
      }));

      this.itemList.push(new reportItem('TOP800_3_6_assess_timeout_detail','text','TOP800家3-6级责任及时率情况',function(obj){
        let percent = ((1 - obj.TOP800_3_6_assess_timeout.data / obj.TOP800_3_6_assess_sum.data) * 100).toFixed(2);
        return percent + '%' + (percent > 95 ? "(>95%)，达标" : "(<95%)，不达标");
      }));

      this.itemList.push(new reportItem('TOP800_3_6_assess_all_sum','text','TOP800家累计3-6级责任故障',function(obj){
        let ad = obj.assess_data_all.data;
        let sum = 0;
        let arr = [];
        for(let i in ad){
          if(ad[i].assess_TOPN == '1' && ad[i].is_assess == '1' && (ad[i].level == '三级' || ad[i].level == '四级' || ad[i].level == '五级' || ad[i].level == '六级')){
            sum++;
            arr.push(ad[i]);
          }
        }
        self.dataObject.add('TOP800_3_6_assess_all_list','array',arr);
        return sum;
      },function(result){
        self.dataObject.add('TOP800_3_6_assess_all_sum','number',result);
      }));

      this.itemList.push(new reportItem('TOP800_3_6_assess_all_timeout','text','TOP800家累计3-6级责任超时故障',function(obj){
        let list = obj.TOP800_3_6_assess_all_list.data;
        let sum = 0;
        for(let i in list){
          if(list[i].time_out == '1'){
            sum++;
          }
        }
        return sum;
      },function(result){
        self.dataObject.add('TOP800_3_6_assess_all_timeout','number',result);
      }));

      this.itemList.push(new reportItem('TOP800_3_6_assess_all_timeout_detail','text','TOP800家累计3-6级责任及时率情况',function(obj){
        let percent = ((1 - obj.TOP800_3_6_assess_all_timeout.data / obj.TOP800_3_6_assess_all_sum.data) * 100).toFixed(2);
        return percent + '%' + (percent > 95 ? "(>95%)，达标" : "(<95%)，不达标");
      }));

      this.itemList.push(new reportItem('all_assess_sum','text','所有客户责任故障',function(obj){
        let ad = obj.assess_data.data;
        let sum = 0;
        let arr = [];
        for(let i in ad){
          if(ad[i].is_assess == '1'){
            sum++;
            arr.push(ad[i]);
          }
        }
        self.dataObject.add('all_assess_list','array',arr);
        return sum;
      },function(result){
        self.dataObject.add('all_assess_sum','number',result);
      }));

      this.itemList.push(new reportItem('all_assess_timeout','text','所有客户责任超时故障',function(obj){
        let list = obj.all_assess_list.data;
        let sum = 0;
        let arr = [];
        for(let i in list){
          if(list[i].time_out == '1'){
            sum++;
            arr.push({
              TimeoutItem:list[i].orderId,
              TimeoutItemName:list[i].name,
              TimeoutItemNumber:list[i].circuit_number,
              TimeoutItemTime:list[i].time,
              TimeoutItemReason:list[i].remark.replace(/\[.*\]/,'')
            })
          }
        }
        self.dataObject.add('timeout_list','array',arr);
        return sum;
      },function(result){
        self.dataObject.add('all_assess_timeout','number',result);
      }));

      this.itemList.push(new reportItem('TimeoutItem','array','所有客户超时故障表格',function(obj){
        return obj.timeout_list.data;
      }));

      this.itemList.push(new reportItem('all_assess_timeout_detail','text','所有客户责任及时率情况',function(obj){
        let percent = ((1 - obj.all_assess_timeout.data / obj.all_assess_sum.data) * 100).toFixed(2);
        return percent + '%' + (percent > 95 ? "(>95%)，达标" : "(<95%)，不达标");
      }));

      this.itemList.push(new reportItem('all_assess_all_sum','text','所有客户累计责任故障',function(obj){
        let ad = obj.assess_data_all.data;
        let sum = 0;
        let arr = [];
        for(let i in ad){
          if(ad[i].is_assess == '1'){
            sum++;
            arr.push(ad[i]);
          }
        }
        self.dataObject.add('all_assess_all_list','array',arr);
        return sum;
      },function(result){
        self.dataObject.add('all_assess_all_sum','number',result);
      }));

      this.itemList.push(new reportItem('all_assess_all_timeout','text','所有客户累计责任超时故障',function(obj){
        let list = obj.all_assess_all_list.data;
        let sum = 0;
        for(let i in list){
          if(list[i].time_out == '1'){
            sum++;
          }
        }
        return sum;
      },function(result){
        self.dataObject.add('all_assess_all_timeout','number',result);
      }));

      this.itemList.push(new reportItem('all_assess_all_timeout_detail','text','所有客户累计责任及时率情况',function(obj){
        let percent = ((1 - obj.all_assess_all_timeout.data / obj.all_assess_all_sum.data) * 100).toFixed(2);
        return percent + '%' + (percent > 95 ? "(>95%)，达标" : "(<95%)，不达标");
      }));
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#title{
  width:100vw;
  font-size: 26px;
  text-align: center;
  margin-top: 5px;
}
.input_box{
  width:90vw;
  margin:1vh 5vw 3vh 5vw;
  border-radius: 2vh;
  box-shadow: -1px 1px 5px 0 #aaa;
}
.data_item{
  display: inline-flex;
  width: 40vw;
  margin: 1vh 2.5vw 1vh 2.5vw;
  align-items: center;
  overflow: visible;
}
.img{
  display: inline-flex;
  width: 40vw;
  margin: 1vh 2.5vw 1vh 2.5vw;
  height: 26.78vw;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  flex-wrap: wrap;
  overflow: visible;
}
.img_zone{
  height: 23.78vw;
  width: 40vw;
  margin: 0;
  overflow: visible;
}
.img_title{
  display: flex;
  justify-content: center;
  align-items: center;
  height: 3vw;
  width: 40vw;
  margin: 0;
}
.data_item .data_title{
  display: inline-block;
  width:30%;
  text-align: right;
  margin-right: 1vw;
}

.data_item .data_value{
  display: inline-block;
  width:70%;
}

.data_item .result_title{
  display: inline-block;
  width:30%;
  text-align: right;
  margin-right: 1vw;
}

.data_item .result_value{
  display: inline-block;
  width:70%;
}

#btn_submit{
  margin: 1vh 2.5vh 1vh 2.5vh;
  width: 85vw;
}

#btn_create{
  margin: 1vh 2.5vh 1vh 2.5vh;
  width: 85vw;
}
</style>
