<template>
  <div class="bg">
    <!-- <vxe-button type="text" icon="vxe-icon--d-arrow-left" id="btn_back" @click="back">返回</vxe-button> -->
    <div class="search">
      <el-input v-model="name_input" class="search_input" @input="search" :disabled="input_disable" :placeholder="placeholder"/>
    </div>
    <div id="hint" :class="hint_class">{{hint}}</div>
    <div :id="index" :class="show_class" v-for="(item,index) in customer_list" v-bind:key="item.unify_name">
      <el-row>
        <el-col :span="24" class="item">
          <div class="title">统一客户名称</div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24" class="item">
          <div id="unify_name" class="content">{{item.unify_name}}</div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24" class="item">
          <div class="title">别名</div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24" class="item">
          <div id="name" class="content">{{item.name}}</div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12" class="item">
          <div class="title">等级</div>
        </el-col>
        <el-col :span="12" class="item">
          <div class="title">标记</div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12" class="item">
          <div id="level" class="content">{{item.level}}</div>
        </el-col>
        <el-col :span="12" class="item">
          <div id="mark" class="content">{{item.mark}}</div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12" class="item">
          <div class="title">网络经理</div>
        </el-col>
        <el-col :span="12" class="item">
          <div class="title">网络经理电话</div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12" class="item">
          <div id="N_manager" class="content">{{item.N_manager}}</div>
        </el-col>
        <el-col :span="12" class="item">
          <div id="NM_phone" class="content">{{item.NM_phone}}</div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12" class="item">
          <div class="title">客户经理</div>
        </el-col>
        <el-col :span="12" class="item">
          <div class="title">客户经理电话</div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12" class="item">
          <div id="C_manager" class="content">{{item.C_manager}}</div>
        </el-col>
        <el-col :span="12" class="item">
          <div id="CM_phone" class="content">{{item.CM_phone}}</div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24" class="item">
          <el-button type="primary" style="width: 100%;" @click="edit_customer">编辑</el-button>
        </el-col>
      </el-row>
    </div>
      <div id="button_group" :class="btn_class">
        <el-button icon="el-icon-plus" type="primary" circle @click="new_customer"></el-button>
        <el-button icon="el-icon-upload2" type="primary" circle @click="import_customer"></el-button>
        <input ref="filElem" type="file" @change="get_file" />
      </div>
    <div id="download_template" :class="btn_class">
      <el-link :href="'http://'+this.$global_msg.HOST+'files/导入模板(请勿修改标题行).xlsx'" target="view_window">下载导入模板</el-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Search',
  props: {
  },
  data:function(){
    return {
      show_class:'show_box hidden',
      hint_class:'',
      hint:'暂无相关记录',
      name_input:'',
      unify_name:'',
      name:'',
      level:'',
      mark:'',
      N_manager:'',
      NM_phone:'',
      C_manager:'',
      CM_phone:'',
      customer_list:[],
      record_list:[],
      counter:null,
      btn_class:'',
      input_disable:false,
      placeholder:'请输入客户名称（支持模糊搜索，用\'_\'匹配任意单个字符，用\'%\'匹配任意字符串)'
    }
  },
  created:function(){
    this.get_data();
  },
  methods:{
    count_start:function(e){
      let self = this;
      if(self.counter != null){
        clearTimeout(self.counter)
      }
      self.counter = setTimeout(function(){
        self.onLongClick(e);
      },1500);
    },
    count_end:function(e){
      let self = this;
      if(self.counter != null){
        clearTimeout(self.counter)
        self.counter = null;
      }
      self.onClick(e);
    },
    onLongClick:function(e){
      let self = this;
      if(confirm("确认要删除这一条记录?")){
        let data = new FormData();
        
        let id = (self.record[e.target.id]).id;
        data.append('customer_id',id);
        this.axios
          .post('http://'+self.$global_msg.HOST+'scripts/delete_customer_by_id.php',data)
          .then(function(res){
            if(res.data.status == 'success'){
              alert("删除成功")
              self.search();
            }else{
              alert(res.data.errMsg);
            }
          })
          .catch(function(err){
            alert(err);
          })
      }
    },
    onClick:function(e){
      //不建议直接修改单条记录,该功能暂时封印
      // let self = this;
      // self.counter = null;
      // self.$router.push({
      //   name:'add',
      //   params:{
      //     post:self.recoed_list[e.target.id],
      //     search:self.name_input
      //   }
      // });
    },
    new_customer:function(){
      this.$router.push({
        name:'add',
        params:{}
      });
    },
    edit_customer:function(e){
      let self = this;
      let index = parseInt(e.path[3].id);
      let post = {};
      post.unify_name = self.customer_list[index].unify_name;
      post.name = self.name_input;
      post.level = self.customer_list[index].level;
      post.N_manager = self.customer_list[index].N_manager;
      post.NM_phone = self.customer_list[index].NM_phone;
      post.C_manager = self.customer_list[index].C_manager;
      post.CM_phone = self.customer_list[index].CM_phone;
      self.$router.push({
        name:'add',
        params:{
          post:post,
          search:self.name_input
        }
      });
    },
    import_customer:function(){
      this.$refs.filElem.dispatchEvent(new MouseEvent('click'));
    },
    search:function(){
      let self = this;
      if(this.name_input == ''){
        self.show_class = 'show_box hidden';
        self.hint_class = '';
        self.hint = '暂无相关记录';
        self.btn_class = '';
        return;
      }
      self.hint = '加载中...';
      self.btn_class = 'hidden';

      let data = new FormData();
      data.append('name',this.name_input);
      this.axios
        .post('http://'+self.$global_msg.HOST+'scripts/get_customer_list.php',data)
        .then(function(res){
          if(res.data.status == 'success'){
            let list =  res.data.result;
            if(list.length == 0){
              self.show_class = 'show_box hidden';
              self.hint_class = '';
              self.hint = '暂无相关记录';
              self.btn_class = '';
              return;
            }
            self.record_list = list;
            self.show_class = "show_box";
            self.btn_class = 'hidden';
            self.hint_class = 'hidden';
            let mark_list={};
            self.unify_name = '';
            self.level = '';
            self.N_manager = '';
            self.NM_phone = '';
            self.C_manager = '';
            self.CM_phone = '';
            self.customer_list = [];
            let index = 0;
            for(let x in list){
              let record = list[x];
              if(self.customer_list[record.unify_name] == undefined){
                record.mark_list = [];
                if(record.mark.split(" ").length > 1){
                  if(record.mark.split(" ")[0] == "SET" || record.mark.split(" ")[0] == "set"){
                    record.mark_list[record.mark.split(" ")[1]] = 1;
                  }
                  if(record.mark.split(" ")[0] == "UNSET" || record.mark.split(" ")[0] == "unset"){
                    record.mark_list[record.mark.split(" ")[1]] = -1;
                  }
                }
                record.mark = '';
                for(let mark in record.mark_list){
                  if(record.mark_list[mark] > 0){
                    record.mark = record.mark + mark + ' ';
                  }
                }
                record.name_list = [];
                record.name_list[record.name] = record.name;
                record.index = index;
                self.customer_list[record.unify_name] = record;
                // record.unify_name = record.unify_name.replace(new RegExp(self.name_input,'g'),'<font color="#409EFF">'+self.name_input+'</font>');
                self.customer_list[index] = record;
                index++;
              }else{
                let re_s = self.customer_list[record.unify_name];
                if(re_s.level == "" && record.level != ""){
                  self.level = record.level;
                }
                if(re_s.N_manager == "" && record.N_manager != ""){
                  self.N_manager = record.N_manager;
                }
                if(re_s.NM_phone == "" && record.NM_phone != ""){
                  self.NM_phone = record.NM_phone;
                }
                if(re_s.C_manager == "" && record.C_manager != ""){
                  self.C_manager = record.C_manager;
                }
                if(re_s.CM_phone == "" && record.CM_phone != ""){
                  self.CM_phone = record.CM_phone;
                }
                re_s.name_list[record.name] = record.name;
                let name = '';
                for(let n in re_s.name_list){
                  if(re_s.name_list[n] != '' || re_s.name_list[n] != undefined){
                    name = name + re_s.name_list[n] + '、';
                  }
                }
                name = name.substr(0,name.length-1);
                re_s.name = name;
                if(record.mark.split(" ").length > 1){
                  if(record.mark.split(" ")[0] == "SET" || record.mark.split(" ")[0] == "set"){
                    if(re_s.mark_list[record.mark.split(" ")[1]] == undefined){
                      re_s.mark_list[record.mark.split(" ")[1]] = 1;
                    }else{
                      re_s.mark_list[record.mark.split(" ")[1]] = re_s.mark_list[record.mark.split(" ")[1]] + 1;
                    }
                  }
                  if(record.mark.split(" ")[0] == "UNSET" || record.mark.split(" ")[0] == "unset"){
                    if(re_s.mark_list[record.mark.split(" ")[1]] == undefined){
                      re_s.mark_list[record.mark.split(" ")[1]] = -1;
                    }else{
                      re_s.mark_list[record.mark.split(" ")[1]] = re_s.mark_list[record.mark.split(" ")[1]] - 1;
                    }
                  }
                }
                re_s.mark = '';
                for(let mark in re_s.mark_list){
                  if(re_s.mark_list[mark] > 0){
                    re_s.mark = re_s.mark + mark + ' ';
                  }
                }
                self.customer_list[record.unify_name] = re_s;
                self.customer_list[re_s.index] = re_s;
              }
            }
          }else{
            alert(res.data.errMsg);
          }
        })
        .catch(function(err){
          alert(err)
        })
    },
    get_data:function(){
      if(this.$route.params.search != null){
        this.name_input = this.$route.params.search;
        this.search();
      }
    },
    get_file:function(){
      let self = this;
      self.input_disable = "disabled";
      self.placeholder = '导入中,请稍后...';
      if(this.$refs.filElem.value == ""){
        return;
      }
      let inputFile = this.$refs.filElem.files[0];
      let data = new FormData();
      data.append("file",inputFile);
      this.axios
        .post('http://'+self.$global_msg.HOST+'scripts/upload.php',data)
        .then(function(res){
          self.input_disable = false;
          self.placeholder = '请输入客户名称（支持模糊搜索，用\'%\'匹配任意字符)';
          if(res.data.status == "success"){
            alert("成功导入"+res.data.sum+"条记录!");
          }else{
            console.log(res);
            alert("错误:"+res.data.errMsg);
          }
          self.$refs.filElem.value = "";
        })
        .catch(function(err){
          console.log(err)
          self.input_disable = false;
          self.placeholder = '请输入客户名称（支持模糊搜索，用\'%\'匹配任意字符)';
          self.$refs.filElem.value = "";
        });
    },
    back:function(){
      if (this.$route.query.goindex === 'true') {
        this.$router.replace({
          name: 'index',
          params: {}
        });
      } else {
        this.$router.back(-1)
      }
    }
  }
}


</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.bg{
  width: 100%;
  height: 100%;
}
#btn_back{
  position: absolute;
  left:30px;
  top:20px;
}
.search{
  margin-left: 5%;
  margin-right: 5%;
  width:90%;
  padding-top: 7vh;
  display: flex;
  justify-content: center;
  align-content: center;
}
/*.search_input{
  width: 80%;
  height: 26px;
  line-height: 26px;
  font-size: 20px;
  padding-left: 1%;
  padding-right: 1%; 
  background: #FFFFFF;
  border-radius: 2%;
  -webkit-appearance:button-bevel;
  transition: box-shadow 0.5s;
  box-shadow: -1px 1px 5px 0px #AAAAAA;
  -webkit-border-top-left-radius:2vw;
  -webkit-border-bottom-left-radius:2vw;
  outline: none;
}
.search_input:focus{
  box-shadow: -5px 5px 10px 0px #AAAAAA;
}
.search_input[disabled]{
  box-shadow: inset -5px 5px 10px 0px #AAAAAA;
}*/
#hint{
  width: -webkit-fill-available;
  margin-top: 14px;
  margin-bottom: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5vh;
  color: #AAAAAA;
}
#hint.hidden{
  display: none;
}
.show_box{
  height: fit-content;
  width:70%;
  background: #FFFFFF;
  border-radius: 2vh;
  margin-left: 15%;
  margin-right: 15%;
  margin-bottom: 3vh;
  margin-top: 3vh;
  padding: 2%;
  transition: box-shadow 0.5s;
  box-shadow: -1px 1px 5px 0px #AAAAAA;
}
.show_box:hover{
  box-shadow: -5px 5px 10px 0px #AAAAAA;
}
.item{
 
}
.item.half{
  
}
.item .title{
  height:14px;
  font-size:12px;
  color:#409EFF;
}
.item .content{
  height:fit-content;
  min-height: 48px;
  font-size:20px;
  display:flex;
  align-items: center;
  word-break: break-all;
}
#record_list{
  list-style: none;
  margin: 0 0 2vh 0;
  padding: 0;
}
.hidden{
  display: none;
}
.list_item{
  display: flex;
  align-items: center;
  height: fit-content;
  width: 96vw;
  margin-left: 2vw;
  margin-right: 2vw;
  padding-top: 1vh;
  padding-bottom: 1vh;
  margin-bottom: 2px;
  background: #FFFFFF;
  transition-property: background,color;
  transition-duration: 1.5s;
}
.list_item:hover{
  box-shadow:0 0 20px 0 #409EFF;
  position:relative;
}
.list_item:active{
  background: #409EFF;
  color: #FFFFFF;
}
.list_item.title_bar{
  background: #409EFF;
}
.list_item.title_bar:hover{
  box-shadow:none;
}
.list_item .title{
  display: inline-flex;
  height: 5vh;
  width: 8.25vw; 
  justify-content: center;
  align-items: center;
  font-size: 1.6vh;
  color: #FFFFFF;
  padding-left: 7px;
  padding-right: 7px; 
}
.list_item .title.long{
  width: 15vw;
}
.list_item .content{
  display: inline-flex;
  height: fit-content;
  width: 8.25vw;
  justify-content: center;
  align-items: center;
  word-break: break-all;
  font-size: 1.4vh;
  padding-left: 7px;
  padding-right: 7px; 
}
.list_item .content.long{
  width: 15vw;
}
#button_group{
  width: -webkit-fill-available;
  display: flex;
  justify-content: center;
  align-items: center;
}
#button_group.hidden{
  display: none;
}
#button_group .btn{
  width: 3vh;
  height: 3vh;
  display: inline-block;
  border-radius: 3vh;
  padding: 0.5vh;
  margin: 0.5vh;
  background: #409EFF;
  transition: all 0.2s
}
#button_group .btn:hover{
  background: #D96666;
}
#button_group .btn:active{
  background: #C85555;
}
input[type=file]{
  display: none;
}
#download_template{
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 5px;
  padding: 0;
}
/*#download_template a{
  font-size: 12px;
  color: #515151;
  text-decoration: underline;
  user-select: none;
}*/
#download_template.hidden{
  display: none;
}
</style>