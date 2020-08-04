<template>
  <div class="container">

    <el-row type="flex" justify="center">
      <el-col :span="4">
        <el-date-picker
          v-model="dateShow"
          :editable="false"
          format="yyyy年MM月dd日"
          type="date">
        </el-date-picker>
      </el-col>
    </el-row>

    <el-row type="flex" justify="center" style="margin: 5px 0 20px 0">
      <el-col :span="11">
        <sumLine :now="dateShow" class="pic"></sumLine>
      </el-col>
      <el-col :span="1">
      </el-col>
      <el-col class="pic" :span="11">
        <orderCompare :now="dateShow" class="pic"></orderCompare>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="24">
        <timeout :now="dateShow" style="height: 43vh"></timeout>
      </el-col>
    </el-row>
    <!-- <div id="import"><a href="javascript:void(0)" @click="import19">{{import_text}}</a><input ref="filElem" type="file" @change="get_file" /></div> -->
  </div>
</template>

<script>
import sumLine from './sumLine';
import orderCompare from './orderCompare';
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
    orderCompare:orderCompare,
    timeout:timeout
  },
  data(){
    return{
      rawData:[],
      rawLocalData:[],
      importFlag:false,
      import_text:'导入19数据（请选择“沃运维”系统导出的故障单列表）',
      timer:undefined,
      edit:false,
      dateShow:null
    }
  },
  created:function(){
    this.dateShow = new Date();
  },
  methods:{
    init:function(){
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
.pic{
  background: #FFFFFF;
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
