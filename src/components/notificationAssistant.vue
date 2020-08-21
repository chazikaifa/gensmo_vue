<template>
  <div>
    <popButton
      type="primary"
      icon="el-icon-share"
      @click.native="showShare"
      style="position: absolute;right: 36px;bottom: 36px;z-index: 100"
      text='通报助手'>
    </popButton>
    <el-dialog
      title="通报助手"
      :visible.sync="show"
      width="80%"
      center>

      <el-row>
        <el-col :span="1"></el-col>
        <el-col :span="11"><div class="label">通报类型</div></el-col>
        <el-col :span="11"><div class="label">电路编号</div></el-col>
        <el-col :span="1"></el-col>
      </el-row>
      <el-row>
        <el-col :span="1"></el-col>
        <el-col :span="11">
          <div class="content">
            <el-select v-model="share_type">
              <el-option key="0" label="首次" value="首次"></el-option>
              <el-option key="1" label="进展" value="进展"></el-option>
              <el-option key="2" label="恢复" value="恢复"></el-option>
            </el-select>
          </div>
        </el-col>
        <el-col :span="11">
          <div class="content">
            <el-input v-model="order.circuit_number" disabled></el-input>
          </div>
        </el-col>
        <el-col :span="1"></el-col>
      </el-row>

      <el-row>
        <el-col :span="1"></el-col>
        <el-col :span="11"><div class="label">故障描述</div></el-col>
        <el-col :span="11"><div class="label">故障开始时间</div></el-col>
        <el-col :span="1"></el-col>
      </el-row>
      <el-row>
        <el-col :span="1"></el-col>
        <el-col :span="11">
          <div class="content">
            <el-input v-model="order.trouble_symptom" disabled></el-input>
          </div>
        </el-col>
        <el-col :span="11">
          <div class="content">
            <el-input v-model="order.start_time" disabled></el-input>
          </div>
        </el-col>
        <el-col :span="1"></el-col>
      </el-row>

      <el-row>
        <el-col :span="1"></el-col>
        <el-col :span="11"><div class="label">处理时限</div></el-col>
        <el-col :span="11"><div class="label">发展区域</div></el-col>
        <el-col :span="1"></el-col>
      </el-row>
      <el-row>
        <el-col :span="1"></el-col>
        <el-col :span="11">
          <div class="content">
            <el-input v-model="order.time_limit" disabled></el-input>
          </div>
        </el-col>
        <el-col :span="11">
          <div class="content">
            <el-input v-model="start_department"></el-input>
          </div>
        </el-col>
        <el-col :span="1"></el-col>
      </el-row>

      <el-row>
        <el-col :span="1"></el-col>
        <el-col :span="11"><div class="label">客户经理</div></el-col>
        <el-col :span="11"><div class="label">网络经理</div></el-col>
        <el-col :span="1"></el-col>
      </el-row>
      <el-row>
        <el-col :span="1"></el-col>
        <el-col :span="11">
          <div class="content">
            <el-input v-model="C_manager"></el-input>
          </div>
        </el-col>
        <el-col :span="11">
          <div class="content">
            <el-input v-model="N_manager"></el-input>
          </div>
        </el-col>
        <el-col :span="1"></el-col>
      </el-row>

      <el-row>
        <el-col :span="1"></el-col>
        <el-col :span="11"><div class="label">客户联系人</div></el-col>
        <el-col :span="11"><div class="label">客户联系电话</div></el-col>
        <el-col :span="1"></el-col>
      </el-row>
      <el-row>
        <el-col :span="1"></el-col>
        <el-col :span="11">
          <div class="content">
            <el-input v-model="order.contact_name" disabled></el-input>
          </div>
        </el-col>
        <el-col :span="11">
          <div class="content">
            <el-input v-model="order.contact_number" disabled></el-input>
          </div>
        </el-col>
        <el-col :span="1"></el-col>
      </el-row>

      <el-row>
        <el-col :span="1"></el-col>
        <el-col :span="11"><div class="label">通报人</div></el-col>
        <el-col :span="11"><div class="label">通报人电话</div></el-col>
        <el-col :span="1"></el-col>
      </el-row>
      <el-row>
        <el-col :span="1"></el-col>
        <el-col :span="11">
          <div class="content">
            <el-input v-model="reporter"></el-input>
          </div>
        </el-col>
        <el-col :span="11">
          <div class="content">
            <el-input v-model="reporter_number"></el-input>
          </div>
        </el-col>
        <el-col :span="1"></el-col>
      </el-row>

      <el-row>
        <el-col :span="1"></el-col>
        <el-col :span="22"><div class="label">通报输出(双击复制)</div></el-col>
        <el-col :span="1"></el-col>
      </el-row>
      <el-row>
        <el-col :span="1"></el-col>
        <el-col :span="22">
          <div class="content textarea" @click = "shareClick">
            <el-input 
              type="textarea" 
              :value = "reportResult" 
              autosize
              disabled
            >
            </el-input>
          </div>
        </el-col>
        <el-col :span="1"></el-col>
      </el-row>

    </el-dialog>
  </div>
</template>

<script>

import popButton from './popButton.vue'

export default {
  name: 'notificationAssistant',
  props: ['token','order','processList'],
  components:{
    popButton:popButton
  },
  data() {
    return {
      show:false,
      share_type:'首次',
      N_manager:'',
      C_manager:'',
      start_department:'',
      reporter:'',
      reporter_number:'',
      clickTimer:undefined,
    }
  },
  created: function() {
    
  },
  computed:{
    reportResult:function(){
      let result = "【广州客户(" + this.order.name + ")故障" + this.share_type+"通报】\r\n" +
      "电路编号：" + this.order.circuit_number + "\r\n" +
      "故障描述：" + this.order.trouble_symptom + "\r\n" +
      "发生时间：" + this.order.start_time+"\r\n" +
      "故障要求处理时限：" + this.order.time_limit + "\r\n" +
      "故障处理过程:\r\n";
      for(let i in this.processList){
        result = result + this.processList[i].time + ' ' + this.processList[i].description + '\r\n';
      }
      result = result +
      "发展区域：" + this.start_department + '\r\n' +
      "网络经理：" + this.N_manager + '\r\n' +
      "客户联系方式：" + this.order.contact_name + ' ' + this.order.contact_number + '\r\n' +
      "集响监控室发送人：" + this.reporter + ' ' + this.reporter_number + '\r\n' +
      "集响监控联系电话：020-22993341\r\n" +
      "本地";
      if(this.order.mark){
        result = result + ' ' + this.order.mark;
      }
      result = result + '/ ';
      if(this.N_manager){
        result = result + '@' + this.N_manager + ' ';
      }
      if(this.C_manager){
        result = result + '@' + this.C_manager;
      } 
      return result;
    }
  },
  methods: {
    showShare:function(){
      let self = this;
      this.getCustomerList(function(res){
        if(res.data.result.length > 0){
          let data = res.data.result[0];
          self.N_manager = data.N_manager;
          self.C_manager = data.C_manager;
          self.start_department = data.start_department;
        }
      })
      this.show = true;
    },
    getCustomerList:function(callback){
      let self = this;
      let data = new FormData();
      data.append('token', this.token);
      data.append('name',this.order.name);
      this.axios
        .post('http://' + this.$global_msg.HOST + 'scripts/customer/get_customer_list.php', data)
        .then(function(res){
          if(res.data.status == 'success'){
            callback(res)
          }else{
            self.$message.error("[getCustomerList]error:"+res.data.errMsg);
          }
        })
        .catch(function(e){
          console.log("[getCustomerList]"+e);
          self.$message.error("[getCustomerList]Network Error:"+e);
        })
    },
    shareClick:function(){
      let self = this;
      if(this.clickTimer){
        this.$copyText(this.reportResult).then(res => {
            self.$message.success('已复制到剪切板！');
          },
          err => {
            self.$message.error('复制失败，请手动复制！');
            console.log(err);
          }
        );
        clearTimeout(this.clickTimer)
        this.clickTimer = undefined
      }else{
        this.clickTimer = setTimeout(function(){
          self.clickTimer = undefined;
        },500)
      }
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.el-col{
  min-height: 36px;
  position: relative;
}
.el-row{
  transition: all .5s
}
.label{
  height:12px;
  font-size:12px;
  color:#409EFF;
  position: absolute;
  bottom: 10px;
}
.content{
  padding-right: 24px;
  height: 36px;
  display: flex;
  align-items: center;
}
.content.textarea{
  height: fit-content;
}
.content .el-select{
  width:100%;
}
</style>
