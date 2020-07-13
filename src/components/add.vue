<template>
  <div id="bg">
    <div id="show_box">
      <div class="item">
        <div class="title">
          统一客户名称*
        </div>
        <el-input v-model="unify_name" class="content_input"></el-input>
      </div>
      <div class="item">
        <div class="title">
          客户名称
        </div>
        <el-input v-model="name" class="content_input"></el-input>
      </div>
      <div class="item half">
        <div class="title">
          等级
        </div>
        <el-select v-model="level" class="content_input" placeholder="">
          <el-option
            v-for="item in level_options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </div>
      <div class="item half">
        <div class="title">
          标记
        </div>
        <el-input v-model="mark" class="content_input"></el-input>
      </div>
      <div class="item half">
        <div class="title">
          网络经理
        </div>
        <el-input v-model="N_manager" class="content_input"></el-input>
      </div>
      <div class="item half">
        <div class="title">
          网络经理电话
        </div>
        <el-input v-model="NM_phone" class="content_input"></el-input>
      </div>
      <div class="item half">
        <div class="title">
          客户经理
        </div>
        <el-input v-model="C_manager" class="content_input"></el-input>
      </div>
      <div class="item half">
        <div class="title">
          客户经理电话
        </div>
        <el-input v-model="CM_phone" class="content_input"></el-input>
      </div>
      <div class="item">
        <div class="title">
          来源
        </div>
        <el-input v-model="origin" class="content_input"></el-input>
      </div>
      <div class="item">
        <div class="title">
          备注
        </div>
        <el-input v-model="remark" class="content_input"></el-input>
      </div>
      <div class="item half">
        <el-button type="info" @click="back" style="width: 100%">取消</el-button>
      </div>
      <div class="item half">
        <el-button type="primary" :disabled="leaving" :loading="loading" @click="confirm" style="width: 100%">确认</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Add',
  props: {
  },
  data:function(){
    return {
      token:'',
      unify_name:'',
      name:'',
      level:'',
      mark:'',
      N_manager:'',
      NM_phone:'',
      C_manager:'',
      CM_phone:'',
      origin:'',
      remark:'',
      post:null,
      search:null,
      level_options:[
        {label:'一级',value:'一级'},
        {label:'二级',value:'二级'},
        {label:'三级',value:'三级'},
        {label:'四级',value:'四级'},
        {label:'五级',value:'五级'},
        {label:'六级',value:'六级'}
      ],
      leaving:false,
      loading:false,
    }
  },
  created:function(){
    this.token = this.$cookies.get('user_token');
    this.fetchData();
  },
  activated:function(){
    this.$setgoindex();
  },
  watch:{
    '$route':'fetchData'
  },
  methods:{
    confirm:function(){
      let self = this;
      this.loading = true;
      if(this.post != null && this.post.id != null){
        this.update_customer();
      }else{
        this.new_customer();
      }
    },
    new_customer:function(){
      let self = this;
      if(this.unify_name == undefined || this.unify_name == ''){
        this.$message.error("统一客户名称不能为空!")
        return;
      }
      let data = new FormData();
      data.append('token',this.token);

      data.append('unify_name',this.unify_name==undefined?'':this.unify_name);
      data.append("name",this.name==undefined?'':this.name);
      data.append("level",this.level==undefined?'':this.level);
      data.append("mark",this.mark==undefined?'':this.mark);
      data.append("N_manager",this.N_manager==undefined?'':this.N_manager);
      data.append("NM_phone",this.NM_phone==undefined?'':this.NM_phone);
      data.append("C_manager",this.C_manager==undefined?'':this.C_manager);
      data.append("CM_phone",this.CM_phone==undefined?'':this.CM_phone);
      data.append("origin",this.origin==undefined?'':this.origin);
      data.append("remark",this.remark==undefined?'':this.remark);
      this.axios
        .post('http://'+this.$global_msg.HOST+'scripts/customer/add_customer.php',data)
        .then(function(res){
          self.loading = false;
          if(res.data.status == 'success'){
            self.$message.success("添加成功,即将关闭窗口")
            self.leaving = true;
            setTimeout(self.back,1000);
          }else{
            self.$message.error(res.data.errMsg)
          } 
        })
        .catch(function(err){
          self.loading = false;
          self.$message.error(err);
        })
    },
    update_customer:function(){
      let self = this;
      if(this.unify_name == ''){
        self.$message.error("统一客户名称不能为空!")
        return;
      }
      let data = new FormData();
      data.append('token',this.token);

      data.append('id',this.post.id);
      data.append('unify_name',this.unify_name==undefined?'':this.unify_name);
      data.append("name",this.name==undefined?'':this.name);
      data.append("level",this.level==undefined?'':this.level);
      data.append("mark",this.mark==undefined?'':this.mark);
      data.append("N_manager",this.N_manager==undefined?'':this.N_manager);
      data.append("NM_phone",this.NM_phone==undefined?'':this.NM_phone);
      data.append("C_manager",this.C_manager==undefined?'':this.C_manager);
      data.append("CM_phone",this.CM_phone==undefined?'':this.CM_phone);
      data.append("origin",this.origin==undefined?'':this.origin);
      data.append("remark",this.remark==undefined?'':this.remark);
      this.axios
        .post('http://'+this.$global_msg.HOST+'scripts/customer/update_customer.php',data)
        .then(function(res){
          self.loading = false;
          if(res.data.status == 'success'){
            self.$message.success("修改成功,即将关闭窗口")
            self.leaving = true;
            setTimeout(self.back,1000);
          }else{
            self.$message.error(res.data.errMsg)
          }
        })
        .catch(function(err){
          self.loading = false;
          self.$message.error(err);
        })
    },
    fetchData:function(){
      if(this.$route.params.post != null){
        this.post = this.$route.params.post;
        this.unify_name = this.post.unify_name;
        this.name = this.post.name;
        this.level = this.post.level;
        this.N_manager = this.post.N_manager;
        this.NM_phone = this.post.NM_phone;
        this.C_manager = this.post.C_manager;
        this.CM_phone = this.post.CM_phone;
        this.origin = this.post.origin;
        this.remark = this.post.remark;
      }
      if(this.$route.params.search != null){
        this.search = this.$route.params.search;
      }
    },
    back:function(){
      window.opener = null;
      window.open(' ','_self');
      window.close();
    }
  },
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#show_box{
  height: fit-content;
  width:70vw;
  background: #2c3e50;
  border-radius: 2vh;
  margin-left: 15vw;
  margin-right: 15vw;
  margin-bottom: 3vh;
  margin-top: 3vh;
  padding: 2vw;
  box-shadow: -1px 1px 5px 0px #555555;
}
.item{
 /* height: fit-content;*/
  width:67.4vw;
  margin-left: 1.3vw;
  margin-right: 1.3vw;
  margin-top: 12px;
}
.item.half{
  width:32.4vw;
  margin-left: 1.3vw;
  margin-right: 1.3vw;
  display: inline-block;
}
.item .title{
  height:14px;
  font-size:12px;
  color:#409EFF;
}
.item .content_input{
  height:fit-content;
  min-height: 30px;
  margin-top: 14px;
  width: -webkit-fill-available;
  font-size:20px;
  display:flex;
  border-radius: 4px; 
  align-items: center;
  word-break: break-all;
}

.item input.content_input{
  padding: 2px 0 4px 10px;
}
.item .btn{
  width:-webkit-fill-available;
  margin-top: 14px;
  border-radius:4px;
  height: 30px;
  font-size:15px;
  display:flex;
  justify-content:center;
  align-items:center;
  background:#CDCDCD;
  color:#000000;
  user-select:none;
}
.item .btn:hover{
  background:#BCBCBC;
}

.item .btn:active{
  background:#AAAAAA;
  color:#FFFFFF;
}
.item .btn.primary{
  background: #409EFF;
  color: #FFFFFF;
}
.item .btn.primary:hover{
  background:#409EFF;
}
.item .btn.primary:active{
  background:#409EFF;
  color:#000000;
}
</style>