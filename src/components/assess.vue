<template>
  <div class="container">
    <div class='quter'>
     <sumLine :wywData="rawData" :localData="rawLocalData"></sumLine>
    </div>
    <div class='quter'>
      <customerHis :wywData="rawData" :localData="rawLocalData"></customerHis>
    </div>
    <timeout :wywData="rawData" :edit="edit" class="half"></timeout>
    <!-- <div id="import"><a href="javascript:void(0)" @click="import19">{{import_text}}</a><input ref="filElem" type="file" @change="get_file" /></div> -->
  </div>
</template>

<script>
import sumLine from './sumLine';
import customerHis from './customerHis';
import timeout from './timeout';

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
  name: 'assess',
  components:{
    sumLine:sumLine,
    customerHis:customerHis,
    timeout:timeout
  },
  data(){
    return{
      rawData:[],
      rawLocalData:[],
      importFlag:false,
      import_text:'导入19数据（请选择“沃运维”系统导出的故障单列表）',
      timer:undefined,
      edit:false
    }
  },
  created:function(){
    this.init();
  },
  methods:{
    init:function(){
      if(this.$route.query.edit == 1){
        this.edit = true;
      }
      let end = new Date("2020-06-01 12:00:00");
      end.setDate(end.getDate()-1);
      end.setHours(23);
      end.setMinutes(59);
      end.setSeconds(59);
      let start = new Date(end);
      start.setDate(1);
      start.setHours(0);
      start.setMinutes(0);
      start.setSeconds(0);
      this.getData(start.Format('yyyy-MM-dd hh:mm:ss'),end.Format('yyyy-MM-dd hh:mm:ss'))
    },
    getData:function(start,end){
      let self = this;
      if(self.timer != undefined){
        clearTimeout(self.timer);
        self.timer = undefined;
      }
      self.dataReady = false;
      self.dataLocalReady = false;
      let data = new FormData();
      data.append('START',start);
      data.append('END',end);
      this.axios
        .post('http://'+self.$global_msg.HOST+'scripts/assess_order/get_order_by_datetime.php',data)
        .then(function(res){
          if(res.data.status == 'success'){
            self.rawData = res.data.result;
            self.sum = res.data.sum;
            self.dataReady = true;
            if(self.dataReady && self.dataLocalReady){
              self.setTimer();
            }
          }else{
            alert(res.data.errMsg);
          }
        })
        .catch(function(err){
          alert(err);
        });

      let localData = new FormData();
      localData.append('id','');
      localData.append('name','');
      localData.append('start_time_start','');
      localData.append('start_time_end','');
      localData.append('end_time_start',start);
      localData.append('end_time_end',end);
      localData.append('number','');
      localData.append('index','');
      localData.append('limit','');
      localData.append('step','');
      this.axios
        .post('http://'+self.$global_msg.HOST+'scripts/getList.php',localData)
        .then(function(res){
          if(res.data.status == 'success'){
            self.rawLocalData = res.data.result;

            self.dataLocalReady = true;
            if(self.dataReady && self.dataLocalReady){
              self.setTimer();
            }
          }else{
            alert(res.data.errMsg);
          }
        })
        .catch(function(err){
          alert(err);
        })
    },
    setTimer:function(){
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
      if(this.timer != undefined){
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(function(){
        self.getData(start.Format('yyyy-MM-dd hh:mm:ss'),end.Format('yyyy-MM-dd hh:mm:ss'));
      },600000);
    },
    import19:function(){
      this.$refs.filElem.dispatchEvent(new MouseEvent('click'));
    },
    get_file:function(){
      let self = this;
      if(self.importFlag){
        return;
      }
      self.importFlag = true;
      self.import_text = '导入中，请稍后...'
      if(this.$refs.filElem.value == ""){
        self.importFlag = false;
        return;
      }
      let inputFile = this.$refs.filElem.files[0];
      let data = new FormData();
      data.append("file",inputFile);
      this.axios
        .post('http://'+self.$global_msg.HOST+'scripts/assess_order/import_from_19.php',data)
        .then(function(res){
          self.importFlag = false;
          self.import_text = '导入19数据（请选择“沃运维”系统导出的故障单列表）'
          if(res.data.status == "success"){
            alert("成功导入"+res.data.sum+"条记录!");
            let self = this;
            let start = new Date();
            let end = new Date();
            start.setDate(1);
            start.setHours(0);
            start.setMinutes(0);
            start.setSeconds(0);
            self.getData(start.Format('yyyy-MM-dd hh:mm:ss'),end.Format('yyyy-MM-dd hh:mm:ss'));
          }else{
            console.log(res);
            alert("错误:"+res.data.errMsg);
          }
          self.$refs.filElem.value = "";
        })
        .catch(function(err){
          console.log(err)
          self.importFlag = false;
          self.import_text = '导入19数据（请选择“沃运维”系统导出的故障单列表）'
          self.$refs.filElem.value = "";
        });
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.container{
  /*position: relative;*/
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  box-sizing:border-box;
  overflow: hidden;
}
.quter{
  display: inline-block;
  width: 47%;
  height: 44%;
  margin: 0;
  padding: 0 1.5% 0 1.5%;
}
.half{
  display: inline-block;
  width: 100%;
  height: 54%;
  margin: 0;
  padding: 0;
}
#import{
  /*position: absolute;
  bottom: 2vh;*/
  display: flex;
  height: 24px;
  width: 100%;
  align-content: center;
  justify-content: center;
  /*text-decoration: underline;*/
  user-select: none;
/*  color: #EA7777;*/
}
#import a{
  color: #EA7777;
}
input[type=file]{
  display: none;
}
</style>
