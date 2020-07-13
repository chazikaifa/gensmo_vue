<template>
  <div class="container">
    <ve-line v-if="sumDataArray.flag > 1" v-loading="loading" element-loading-background="#222933" :data="showData" :extend="extend" :settings="settings"></ve-line>
    <ve-histogram v-else v-loading="loading" element-loading-background="#222933" :data="showData" :extend="extend" :settings="settings"></ve-histogram>
  </div>
</template>

<script>

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
export default {
  name: 'sumLine',
  data(){
    return{
      token:'',
      canDo:{},
      doList:['getAssessOrder','getList'],
      extend:{
        title:{
          show:true,
          text:'19总体故障量'
        },
        series:{
          markPoint:{
            symbol:'circle',
            symbolSize:1,
            data:[]
          },
        },
        legend:{
          bottom:'5%'
        },
        yAxis:function(item){
          item[1].splitLine = {
            show:false
          }
          return item;
        },
        toolbox:{
          show:true,
          feature:{
            myPause:{
              show:true,
              title:'暂停轮播',
              icon:'path://M341.333333 113.777778a28.444444 28.444444 0 0 1 28.444445 28.444444v739.555556a28.444444 28.444444 0 0 1-56.888889 0V142.222222a28.444444 28.444444 0 0 1 28.444444-28.444444z m341.333334 0a28.444444 28.444444 0 0 1 28.444444 28.444444v739.555556a28.444444 28.444444 0 0 1-56.888889 0V142.222222a28.444444 28.444444 0 0 1 28.444445-28.444444z',
              onclick:this.play
            },
            myPlay:{
              show:false,
              title:'继续轮播',
              icon:'path://M221.790362 1014.94374c-36.775578 0-68.472488-13.843286-91.662653-40.033785-23.130813-26.121937-35.868929-63.466474-35.868928-105.155968V154.424068c0-41.691541 12.739139-79.041194 35.869952-105.169271 23.193235-26.197662 54.889121-40.044018 91.662652-40.044018 27.752064 0 56.166207 8.159844 84.451414 24.25338l570.119699 358.735338 0.153496 0.088004c50.086745 28.728298 78.901001 72.395844 79.053474 119.806643 0 48.284703-28.559453 91.193978-80.418564 120.835066l-0.163729 0.093121L308.632219 989.273081C278.266631 1006.546489 249.860674 1014.94374 221.790362 1014.94374zM221.790362 63.144132c-44.709271 0-73.598228 35.82902-73.598228 91.279936v715.330942c0 55.43659 28.888957 91.2564 73.598228 91.2564 18.275225 0 38.137599-6.03239 59.034535-17.929348l0.165775-0.095167 566.30993-356.24154c35.544541-20.447704 54.333466-46.232974 54.333466-74.56423-0.105401-37.916565-32.837896-62.23953-52.339042-73.362868l-1.198292-0.713244L278.571576 79.725786l-0.169868-0.096191C259.408121 68.843948 239.833297 63.144132 221.790362 63.144132z',
              onclick:this.play
            },
            myChange:{
              show:true,
              title:'切换维度',
              icon:'path://M480 32a32 32 0 0 0 32 32c119.664 0 232.16 46.608 316.768 131.232C913.392 279.84 960 392.336 960 512c0 118.096-45.472 229.168-128 313.392V736a32 32 0 0 0-64 0v192h192a32 32 0 0 0 0-64h-76.416C974.16 768.512 1024 644.112 1024 512c0-136.752-53.264-265.328-149.984-362.032C777.328 53.264 648.752 0 512 0a32 32 0 0 0-32 32zM149.984 874.032C246.672 970.736 375.248 1024 512 1024a32 32 0 0 0 0-64c-119.664 0-232.16-46.608-316.768-131.232C110.608 744.16 64 631.664 64 512c0-118.096 45.472-229.168 128-313.392V288a32 32 0 0 0 64 0V96H64a32 32 0 0 0 0 64h76.416C49.84 255.488 0 379.888 0 512c0 136.752 53.264 265.328 149.984 362.032z',
              onclick:this.change
            },
            saveAsImage:{
              show:true
            }
          }
        }
      },
      sumDataArray:{
        length:4,
        flag:0,
        title:['19总体故障量','19责任故障量','本地故障量','总体故障量'],
        columns:[['日期','去年故障量','故障量','同比'],['日期','去年故障量','故障量','同比'],['日期','故障量','责任故障量'],['日期','19责任故障','19非责任故障','本地责任故障','本地非责任故障']],
        rows:[],
        area:[false,false,false,true],
        markPointData:[[],[],[],[]]
      },
      showData:{
        columns:['日期','故障量','去年故障量','同比'],
        rows:[],
      },
      settings:{
        stack:{
          '总故障量':['19责任故障','19非责任故障','本地责任故障','本地非责任故障'],
        },
        showLine:['同比'],
        yAxisType:['value','percent'],
        axisSite:{right:['同比']}
      },
      ready:0,
      rawData:[],
      rawLocalData:[],
      rawDataLast:[],
      rawLocalDataLast:[],
      timer:undefined,
      playing:true,
      loading:true
    }
  },
  created:function(){
    let self = this;
    this.token = this.$cookies.get('user_token');
    this.assess_query(this.doList).then(function(){
      if(self.canDo.getAssessOrder && self.canDo.getList){
        self.init();
      }else{
        self.$message.error('[sumLine]:没有接口权限！')
      }
    })
  },
  methods:{
    init:function(){
      this.getData();
    },
    getData:function(){
      let self = this;
      let end = new Date();
      end.setDate(end.getDate()-1);
      end.setHours(23);
      end.setMinutes(59);
      end.setSeconds(59);

      let start = new Date(end);
      start.setDate(1);
      start.setHours(0);
      start.setMinutes(0);
      start.setSeconds(0);

      let lastEnd = new Date(end);
      lastEnd.setFullYear(end.getFullYear()-1);
      let lastStart = new Date(start);
      lastStart.setFullYear(end.getFullYear()-1);

      this.getOrder(start.Format('yyyy-MM-dd hh:mm:ss'),end.Format('yyyy-MM-dd hh:mm:ss'),function(res){
        if(res.data.status == 'success'){
          self.rawData = res.data.result;
          self.ready++;
          // self.getSum();
          if(self.ready >= 4){
            self.get_union();
          }
        }else{
          self.$message.error("[sumLine]rawDataLast Error:"+res.data.errMsg);
        }
      })

      this.getOrder(lastStart.Format('yyyy-MM-dd hh:mm:ss'),lastEnd.Format('yyyy-MM-dd hh:mm:ss'),function(res){
        if(res.data.status == 'success'){
          self.rawDataLast = res.data.result;
          self.ready++;
          if(self.ready >= 4){
            self.get_union();
          }
        }else{
          self.$message.error("[sumLine]rawData Error:"+res.data.errMsg);
        }
      }) 

      this.getLocalOrder(start.Format('yyyy-MM-dd hh:mm:ss'),end.Format('yyyy-MM-dd hh:mm:ss'),function(res){
        if(res.data.status == 'success'){
          self.rawLocalData = res.data.result;
          self.ready++;
          self.getLocalSum();
          if(self.ready >= 4){
            self.get_union();
          }
        }else{
          self.$message.error("[sumLine]rawLocalData Error:"+res.data.errMsg);
        }
      })

      this.getLocalOrder(lastStart.Format('yyyy-MM-dd hh:mm:ss'),lastEnd.Format('yyyy-MM-dd hh:mm:ss'),function(res){
        if(res.data.status == 'success'){
          self.rawLocalDataLast = res.data.result;
          self.ready++;
          if(self.ready >= 4){
            self.get_union();
          }
        }else{
          self.$message.error("[sumLine]rawLocalDataLast Error:"+res.data.errMsg);
        }
      })
    },
    getOrder:function(start,end,cb){
      let self = this;
      let data = new FormData();
      data.append('START',start);
      data.append('END',end);
      data.append('province','广东省广州市');
      data.append('token',self.token);
      this.axios
        .post('http://'+this.$global_msg.HOST+'scripts/assess_order/get_gz_order_by_datetime.php',data)
        .then(function(res){
          cb(res);
        })
        .catch(function(err){
          self.$message.error("[sumLine]getOrder Error:"+err);
          console.log(err)
        });
    },
    getLocalOrder:function(start,end,cb){
      let self = this;
      let localData = new FormData();
      localData.append('step','');
      localData.append('end_time_start',start);
      localData.append('end_time_end',end);
      localData.append('token',this.token);
      this.axios
        .post('http://'+this.$global_msg.HOST+'scripts/order/getList.php',localData)
        .then(function(res){
          cb(res);
        })
        .catch(function(err){
          self.$message.error("[sumLine]getLocalOrder Error:"+err);
        })
    },
    getSum(){
      let dateArr = [];
      let row = [];
      let now = new Date();
      now.setDate(now.getDate()-1);
      now.setHours(0);
      now.setMinutes(0);
      now.setSeconds(0);
      let dayNow = now.getDate();
      let monthNow = now.getMonth()+1;
      for(let i=0;i<dayNow+1;i++){
        dateArr.push(new Date(now.setDate(i+1)));
        row.push({'日期':monthNow+'月'+(i+1)+'日','故障量':0,'责任故障量':0})
      }
      row.pop();

      for(let x in this.rawData){
        let data = this.rawData[x];
        if(this.rawData[x].province != '广东省广州市' || this.rawData[x].responsible_province != '广州' && this.rawData[x].responsible_province != '用户'){
          continue;
        }
        let time = new Date(data.end_time);
        for(let i=0;i<dayNow;i++){
          if(time > dateArr[i] && time < dateArr[i+1]){
            row[i]['故障量'] = row[i]['故障量'] + 1;
            if(data.is_assess == '1'){
              row[i]['责任故障量'] = row[i]['责任故障量'] + 1;
            }
            break;
          }
        }
        if(time > dateArr[dayNow]){
          row[dayNow]['故障量'] = row[dayNow]['故障量'] + 1;
          if(data.is_assess == '1'){
            row[dayNow]['责任故障量'] = row[dayNow]['责任故障量'] + 1;
          }
        }
      }
      this.sumDataArray.rows[0] = row;
    },
    getLocalSum(){
      let dateArr = [];
      let row = [];
      let now = new Date();
      now.setDate(now.getDate()-1);
      now.setHours(0);
      now.setMinutes(0);
      now.setSeconds(0);
      let dayNow = now.getDate();
      let monthNow = now.getMonth()+1;
      for(let i=0;i<dayNow+1;i++){
        dateArr.push(new Date(now.setDate(i+1)));
        row.push({'日期':monthNow+'月'+(i+1)+'日','故障量':0,'责任故障量':0});
      }
      row.pop();

      for(let x in this.rawLocalData){
        let data = this.rawLocalData[x];
        let time = new Date(data.end_time);
        for(let i=0;i<dayNow;i++){
          if(time > dateArr[i] && time < dateArr[i+1]){
            row[i]['故障量'] = row[i]['故障量'] + 1;
            if(data.is_trouble == '1'){
              row[i]['责任故障量'] = row[i]['责任故障量'] + 1;
            }
            break;
          }
        }
        if(time > dateArr[dayNow]){
          row[dayNow]['故障量'] = row[dayNow]['故障量'] + 1;
          if(data.is_trouble == '1'){
            row[dayNow]['责任故障量'] = row[dayNow]['责任故障量'] + 1;
          }
        }
      }
      this.sumDataArray.rows[2] = row;
    },
    get_union:function(){
      let dateArr = [];
      let now = new Date();
      now.setDate(now.getDate()-1);
      now.setHours(0);
      now.setMinutes(0);
      now.setSeconds(0);
      let dayNow = now.getDate();
      let monthNow = now.getMonth()+1;

      let union_row1 = [];
      let union_row2 = [];
      let union_row3 = [];

      for(let i=0;i<dayNow;i++){
        dateArr.push(new Date(now.setDate(i+1)));
        union_row1.push({'日期':monthNow+'月'+(i+1)+'日','19责任故障':0,'19非责任故障':0,'本地责任故障':0,'本地非责任故障':0,'合计':0});
        union_row2.push({'日期':monthNow+'月'+(i+1)+'日','故障量':0,'去年故障量':0,'同比':0});
        union_row3.push({'日期':monthNow+'月'+(i+1)+'日','故障量':0,'去年故障量':0,'同比':0});
      }
      dateArr.push(new Date(now.setDate(dayNow+1)));

      for(let x in this.rawData){
        let data = this.rawData[x];
        if(data.province != '广东省广州市' || data.responsible_province != '广州' && data.responsible_province != '用户'){
          continue;
        }
        let time = new Date(data.end_time);
        for(let i=0;i<dayNow;i++){
          if(time > dateArr[i] && time < dateArr[i+1]){
            if(data.is_assess == '1' && data.responsible_province == '广州'){
              union_row1[i]['19责任故障'] = union_row1[i]['19责任故障'] + 1;
              union_row3[i]['故障量'] = union_row3[i]['故障量'] + 1;
            }else{
              union_row1[i]['19非责任故障'] = union_row1[i]['19非责任故障'] + 1;
              union_row2[i]['故障量'] = union_row2[i]['故障量'] + 1;
            }
            union_row1[i]['合计'] = union_row1[i]['合计'] + 1;
            break;
          }
        }
      }

      for(let x in this.rawDataLast){
        let data = this.rawDataLast[x];
        if(data.province != '广东省广州市' || data.responsible_province != '广州' && data.responsible_province != '用户'){
          continue;
        }
        let time = new Date(data.end_time);
        time.setFullYear(time.getFullYear()+1);
        for(let i=0;i<dayNow;i++){
          if(time > dateArr[i] && time < dateArr[i+1]){
            if(data.is_assess == '1' && data.responsible_province == '广州'){
              union_row3[i]['去年故障量'] = union_row3[i]['去年故障量'] + 1;
            }else{
              union_row2[i]['去年故障量'] = union_row2[i]['去年故障量'] + 1;
            }
            break;
          }
        }
      }

      for(let x in this.rawLocalData){
        let data = this.rawLocalData[x];
        let time = new Date(data.end_time);
        for(let i=0;i<dayNow;i++){
          if(time > dateArr[i] && time < dateArr[i+1]){
            if(data.is_trouble == '1'){
              union_row1[i]['本地责任故障'] = union_row1[i]['本地责任故障'] + 1;
            }else{
              union_row1[i]['本地非责任故障'] = union_row1[i]['本地非责任故障'] + 1;
            }
            union_row1[i]['合计'] = union_row1[i]['合计'] + 1;
            break;
          }
        }
      }
      for(let i in union_row1){
        this.sumDataArray.markPointData[3].push({
          value:union_row1[i]['合计'],
          coord:[Number(i),Number(union_row1[i]['合计'])],
          label:{
            show:true,
            position:'top',
            color:'#AAAAAA'
          }
        })
      }
      for(let i in union_row2){
        union_row2[i]['同比'] = ((union_row2[i]['故障量']-union_row2[i]['去年故障量'])/union_row2[i]['去年故障量']).toFixed(4);
      }
      for(let i in union_row3){
        union_row3[i]['同比'] = ((union_row3[i]['故障量']-union_row3[i]['去年故障量'])/union_row3[i]['去年故障量']).toFixed(4);
      }
      this.sumDataArray.rows[0] = union_row2;
      this.sumDataArray.rows[1] = union_row3;
      this.sumDataArray.rows[3] = union_row1;
      this.loading = false;
      let data = {
        columns:this.sumDataArray.columns[0],
        rows:this.sumDataArray.rows[0]
      }
      this.showData = data;
      this.extend.title = {
        show:true,
        text:this.sumDataArray.title[0]
      }
      this.settings.area = this.sumDataArray.area[0];
      this.timer = setTimeout(this.change,5000);
    },
    change:function(){
      if(this.timer != undefined){
        clearTimeout(this.timer)
      }
      if(this.playing){
        this.timer = setTimeout(this.change,5000);
      }
      if(this.loading){
        return;
      }
      if(this.sumDataArray.flag+1 >= this.sumDataArray.length){
        this.sumDataArray.flag = 0;
      }else{
        this.sumDataArray.flag++;
      }
      let i = this.sumDataArray.flag;
      let data = {
        columns:this.sumDataArray.columns[i],
        rows:this.sumDataArray.rows[i]
      }
      this.showData = data;
      this.extend.title = {
        show:true,
        text:this.sumDataArray.title[i]
      }
      this.extend.series.markPoint.data = this.sumDataArray.markPointData[i];
      console.log(this.extend.series.markPoint);
      this.settings.area = this.sumDataArray.area[i];
    },
    play:function(){
      if(this.timer != undefined){
        clearTimeout(this.timer)
        this.timer = undefined;
        this.playing = false;
        this.extend.toolbox.feature.myPlay.show = true;
        this.extend.toolbox.feature.myPause.show = false;
      }else{
        this.playing = true;
        this.change();
        this.extend.toolbox.feature.myPlay.show = false;
        this.extend.toolbox.feature.myPause.show = true;
      }
    },
    assess_query:async function(list){
      let self = this;
      for(let i in list){
        await this.canDoQuery(list[i]).then(function(res){
          self.canDo[list[i]] = res;
        })
      }
    },
    canDoQuery:async function(op){
      let data = new FormData();
      data.append('token', this.token);
      data.append('operation',op);
      let canDo = false;
      await this.axios
        .post('http://' + this.$global_msg.HOST + 'scripts/system/canDoQuery.php', data)
        .then(function(res) {
          if(res.data.status == 'success'){
            canDo = true;
          }else{
            console.log("can NOT do "+op+":"+res.data.errMsg);
          }
        })
        .catch(function(e){
          console.log("query error:"+e)
        })
      return canDo;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
