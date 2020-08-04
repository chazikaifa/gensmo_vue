<template>
  <div class="bg">
    <el-row>
      <el-col :span="24"></el-col>
    </el-row>
    <el-row>
      <el-col :span="2"></el-col>
      <el-col :span="10">
        <div class="label">故障单编号</div>
      </el-col>
      <el-col :span="10">
        <div class="label">客户名称</div>
      </el-col>
      <el-col :span="2"></el-col>
    </el-row>
    <el-row>
      <el-col :span="2"></el-col>
      <el-col :span="10">
        <div class="content"><el-input v-model="orderID"></el-input></div>
      </el-col>
      <el-col :span="10">
        <div class="content"><el-input v-model="name"></el-input></div>
      </el-col>
      <el-col :span="2"></el-col>
    </el-row>

    <el-row>
      <el-col :span="2"></el-col>
      <el-col :span="10">
        <div class="label">故障发生时间</div>
      </el-col>
      <el-col :span="10">
        <div class="label">故障恢复时间</div>
      </el-col>
      <el-col :span="2"></el-col>
    </el-row>
    <el-row>
      <el-col :span="2"></el-col>
      <el-col :span="10">
        <div class="content">
          <el-date-picker 
            type="datetimerange" 
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width:100%;"
            v-model="start_time">
          </el-date-picker>
        </div>
      </el-col>
      <el-col :span="10">
        <div class="content">
          <el-date-picker 
            type="datetimerange" 
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width:100%;"
            v-model="end_time">
          </el-date-picker>
        </div>
      </el-col>
      <el-col :span="2"></el-col>
    </el-row>

    <el-row>
      <el-col :span="2"></el-col>
      <el-col :span="10">
        <div class="label">电路编号</div>
      </el-col>
      <el-col :span="10">
        <div class="label">工单状态</div>
      </el-col>
      <el-col :span="2"></el-col>
    </el-row>
    <el-row>
      <el-col :span="2"></el-col>
      <el-col :span="10">
        <div class="content"><el-input v-model="number"></el-input></div>
      </el-col>
      <el-col :span="10">
        <div class="content">
          <el-checkbox-group v-model="step">
            <el-checkbox label="结单"></el-checkbox>
            <el-checkbox label="未结单"></el-checkbox>
            <el-checkbox label="挂起"></el-checkbox>
            <el-checkbox label="已撤销"></el-checkbox>
          </el-checkbox-group>
        </div>
      </el-col>
      <el-col :span="2"></el-col>
    </el-row>

    <el-row>
      <el-col :span="24"></el-col>
    </el-row>
    <el-row>
      <el-col :span="2"></el-col>
      <el-col :span="20">
        <div class="content"><el-button type="primary" :loading="loading" @click="submit" style="width:100%">{{btn_text}}</el-button></div>
      </el-col>
      <el-col :span="2"></el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'order-export',
  data:function(){
    return {
      orderID:'',
      name:'',
      start_time:'',
      end_time:'',
      number:'',
      step:[],
      loading:false,
      btn_text:'导出',
      token:'',
    }
  },
  created:function(){
    this.token = this.$cookies.get('user_token');
  },
  methods:{
    submit:function(){
      let self = this;
      if(this.start_time == '' && this.end_time == ''){
        this.$message.warning('请至少选择一个时间！')
        return;
      }else{
        this.loading = true;
        this.btn_text = '查询中...';
        this.getList(function(){
          self.loading = false;
          self.btn_text = "导出";
        });
      }
    },
    getList:function(cb){
      let self = this;
      let data = new FormData();
      data.append('token', this.token);
      if(this.orderID != ''){
        data.append('id',this.orderID);
      }
      if(this.name != ''){
        data.append('name',this.name);
      }
      if(this.number != ''){
        data.append('number',this.number);
      }
      if(this.start_time != '' && this.start_time.length > 1){
        data.append('start_time_start',this.start_time[0].Format("yyyy-MM-dd hh:mm:ss"));
        data.append('start_time_end',this.start_time[1].Format("yyyy-MM-dd hh:mm:ss"));
      }
      if(this.end_time != '' && this.end_time.length > 1){
        data.append('end_time_start',this.end_time[0].Format("yyyy-MM-dd hh:mm:ss"));
        data.append('end_time_end',this.end_time[1].Format("yyyy-MM-dd hh:mm:ss"));
      }
      let step = '';
      for(let i in this.step){
        step = step + this.step[i] + '|';
      }
      if(step){
        step.slice(0,-1);
      }
      data.append('step',step);
      this.axios
        .post('http://' + self.$global_msg.HOST + 'scripts/order/getList.php', data)
        .then(function(res) {
          if(res.data.status == 'success'){
            if(res.data.status.sum == 0){
              self.$message.warning("查无记录，请重新选择条件！");
              cb();
            }else{
              self.$confirm('成功查询到'+res.data.sum+'条记录,是否确认导出？','提示',{
                confirmButtonText:'确定',
                cancelButtonText:'取消',
                type:'info'
              }).then(function(){
                self.btn_text = '导出中,请稍后...';
                self.axios
                  .post('http://' + self.$global_msg.HOST + 'scripts/order/export.php', data)
                  .then(function(res) {
                    console.log(res);
                    if(res.data.status == 'success'){
                      window.open('http://' + self.$global_msg.HOST + 'files/' + res.data.fileName);
                    }else{
                      self.$message.error("错误："+res.data.errMsg);
                    }
                    cb();
                  }).catch(function(e){
                    self.$message.error("错误:"+e);
                    cb();
                  });
              }).catch(cb);
            }
          }else{
            self.$message.error("错误："+res.data.errMsg);
            cb();
          }
        }).catch(function(e){
          self.$message.error("错误:"+e);
          cb();
        });
    },
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.bg{
  width: 100%;
  height: 100%;
}
.el-col{
  min-height: 36px;
  position: relative;
}
.sub_title{
  height: 16px;
  font-size:16px;
  color: #909399;
  bottom: 0;
  position: absolute;
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
  /*justify-content: center;*/
  align-items: center;
}
</style>