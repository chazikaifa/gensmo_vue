<template>
  <el-container class="main_container"
    v-loading="!loginStatus"
    element-loading-text="加载中，请稍后...">
    <el-header>
      <div class="title">政企网络服务中台本地故障单管理系统</div>
      <div class="loginLabel" v-if="loginStatus">
        {{user_name}}&nbsp;你好！
        <el-button type="text" @click="logout">退出登陆</el-button>
      </div>
    </el-header>
    <el-container direction="horizontal" style="height: 100%;">
      <el-aside :width="isCollapse?'fit-content':'200px'">
        <el-menu
          id="nav_bar"
          :collapse="isCollapse"
          :collapse-transition="false"
          :default-openeds="['1','2']"
          :default-active="default_index"
          @select="select_nav">
          <el-menu-item index="0">
            <!-- <i :class="isCollapse?'el-icon-arrow-right':'el-icon-arrow-left'"></i> -->
            <el-button type="text" :icon="isCollapse?'el-icon-arrow-right':'el-icon-arrow-left'">收起</el-button>
          </el-menu-item>
          <el-submenu index="1" v-if="canDo.getList">
            <template slot="title">
              <i class="el-icon-s-operation"></i>
              <span slot="titile">工单状态</span>
            </template>
            <el-menu-item index="1-1" id="m1-1">
              在途工单
            </el-menu-item>
            <el-menu-item index="1-2" id="m1-2">
              所有工单
            </el-menu-item>
            <el-menu-item index="1-3" id="m1-3">
              已结单
            </el-menu-item>
            <el-menu-item index="1-4" id="m1-4">
              未结单
            </el-menu-item>
            <el-menu-item index="1-5" id="m1-5">
              挂起工单
            </el-menu-item>
            <el-menu-item index="1-6" id="m1-6">
              已撤销
            </el-menu-item>
          </el-submenu>
          <el-submenu index="2">
            <template slot="title">
              <i class="el-icon-s-cooperation"></i>
              <span slot="titile">工具箱</span>
            </template>
            <el-menu-item index="2-1" id="m2-1" v-if="canDo.getList&&canDo.export">
                工单导出
            </el-menu-item>
            <el-menu-item index="2-2" id="m2-2" v-if="canDo.getCustomerList">
                客户台账
            </el-menu-item>
            <el-menu-item index="2-3" id="m2-3" v-if="canDo.assessOrder">
                统计图表
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-container style="width: 100%;height: 100%">
        <components :is="comName" :params="params"></components>
      </el-container>
    </el-container>
  </el-container>
</template>

<script>
import assess from '@/components/assess.vue'
import search from '@/components/search.vue'
import orderExport from '@/components/orderExport.vue'
import orderList from '@/components/orderList.vue'

export default {
  name: 'Index',
  components:{
    assess:assess,
    search:search,
    orderExport:orderExport,
    orderList:orderList
  },
  data() {
    return {
      token:'',
      user_name:'',
      default_index:'',
      loginStatus:false,
      isCollapse:false,
      comName:'',
      last_index:'1-1',
      params:{},
      canDo:{},
      doList:['getList','export','getCustomerList','assessOrder']
    }
  },
  created:function(){
    this.login();
  },
  activated:function(){
    this.$setgoindex();
  },
  methods:{
    login:function(){
      let self = this;
      if(this.$cookies.isKey('user_token')){
        this.token = this.$cookies.get('user_token');
        this.isLogin(this.token).then(function(res){
          if(!res){
            self.$message.warning('您尚未登陆，即将跳转到登陆界面')
            setTimeout(self.toLogin,1000);
          }else{
            self.assess_query(self.doList).then(function(){
              self.init();
            })
          }
        });
      }else{
        this.$message.warning('您尚未登陆，即将跳转到登陆界面')
        setTimeout(this.toLogin,1000);
      }
    },
    isLogin:async function(token){
      let self = this;
      let data = new FormData();
      data.append('token', token);
      let flag = false;
      await this.axios
        .post('http://' + self.$global_msg.HOST + 'scripts/system/isLogin.php', data)
        .then(function(res) {
          if(res.data.status == 'success'&& res.data.login == '1'){
            self.$cookies.set('user_name',res.data.name);
            self.user_name = res.data.name;
            flag = true;
          }
        })
      return flag;
    },
    toLogin:function(){
      this.$router.push({
        name: 'login',
        params: {}
      });
    },
    logout:function(){
      this.$cookies.remove('user_token');
      this.$cookies.remove('user_name');
      this.toLogin();
    },
    init:function(){
      if(!this.canDo.getList){
        if(!this.canDo.getCustomerList){
          if(!this.canDo.assessOrder){
            this.default_index = '0'
            this.$confirm('你暂时没有任何模块的权限,请联系系统管理员','提示',{
              type:'warning',
              showCancelButton:false
            })
            this.comName = '';
          }else{
            this.default_index = '2-3'
            this.comName = 'assess';
          }
        }else{
          this.default_index = '2-2'
          this.comName = 'search';
        }
      }else{
        this.default_index = '1-1'
        this.comName = 'orderList';
      }
      this.params = {step:['挂起中','未结单']};
      this.loginStatus = true;
    },
    select_nav:function(index,path){
      switch(index){
        case '0':
          this.isCollapse = !this.isCollapse;
          if(!this.isCollapse){
            this.$nextTick(function(){
              document.getElementById("m"+this.last_index).setAttribute('class','el-menu-item is-active');
            })
          }
          break;
        case '1-1':
          this.comName = 'order-list';
          this.params = {step:['挂起中','未结单']};
          break;
        case '1-2':
          this.comName = 'order-list';
          this.params = {step:['挂起中','未结单',"结单"]};
          break;
        case '1-3':
          this.comName = 'order-list';
          this.params = {step:['结单']};
          break;
        case '1-4':
          this.comName = 'order-list';
          this.params = {step:['未结单']};
          break;
        case '1-5':
          this.comName = 'order-list';
          this.params = {step:['挂起中']};
          break;
        case '1-6':
          this.comName = 'order-list';
          this.params = {step:['已撤销']};
          break;
        case '2-1':
          this.comName = 'order-export';
          break;
        case '2-2':
          this.comName = 'search';
          break;
        case '2-3':
          this.comName = 'assess';
          break;
      }
      if(index != '0'){
        if(index != this.last_index){
          this.$nextTick(function(){
            document.getElementById("m"+this.last_index).setAttribute('class','el-menu-item');
            this.last_index = index;
          })
        }else{
          this.last_index = index;
        }
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
.main_container{
  margin: 0;
  height: 100%;
  width: 100%;
}
.title{
  display: flex;
  justify-content: center;
  align-items: center;
  color: #409EFF;
  height: 100%;
  font-size: 26px;
}
.loginLabel{
  position: absolute;
  right: 24px;
  top:0;
}
#loading_box{
  width: 100%;
  height: 100%;
  display:flex;
  justify-content: center;
  align-items: center;
}
.loading_hint{
  font-size: 16px;
}
#nav_bar{
  height: 100%;
}
</style>
