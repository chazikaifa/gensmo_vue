<template>
  <el-container style="width:100%;height: 100%" v-loading="pageLoading" element-loading-background="#222933">
    <el-main style="height: 100%">
      <el-button icon="el-icon-search" @click="show_search = true" type="primary" circle></el-button>
      <el-button :icon="isLoading?'el-icon-loading':'el-icon-refresh'" :disabled="isLoading" @click="refresh" type="primary" circle></el-button>
      <el-button icon="el-icon-plus" @click="newOrder" type="primary" circle></el-button>
      <el-dialog title="搜索" :visible.sync="show_search" width="80%">
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
          <el-col :span="20">
            <div class="label">电路编号</div>
          </el-col>
          <el-col :span="2"></el-col>
        </el-row>
        <el-row>
          <el-col :span="2"></el-col>
          <el-col :span="20">
            <div class="content"><el-input v-model="number"></el-input></div>
          </el-col>
          <el-col :span="2"></el-col>
        </el-row>
        <el-row>
          <el-col :span="24"></el-col>
        </el-row>
        <el-row>
          <el-col :span="2"></el-col>
          <el-col :span="20">
            <div class="content"><el-button type="primary" @click="submit" style="width:100%">搜索</el-button></div>
          </el-col>
          <el-col :span="2"></el-col>
        </el-row>
      </el-dialog>

      <el-table 
        v-loading="isLoading"
        :data="rawData"
        border
        stripe
        size="small"
        :header-cell-style="{background:'#409EFF',color:'white',textAlign:'center'}"
        :cell-style="cellStyle"
        max-height="730px"
        style="width:100%;height: fit-content;margin-top: 24px">
        <el-table-column
          type="index"
          label="序号">
        </el-table-column>
        <el-table-column
          prop="id"
          label="故障单编号"
          width="130px">
        </el-table-column>
        <el-table-column
          prop="name"
          label="客户名称">
        </el-table-column>
        <el-table-column
          prop="circuit_number"
          label="电路编号">
        </el-table-column>
        <el-table-column
          prop="remark"
          label="备注">
        </el-table-column>
        <el-table-column
          prop="start_time"
          label="故障发生时间"
          width="170px">
        </el-table-column>
        <el-table-column
          prop="net_duration"
          label="净历时"
          width="80px">
        </el-table-column>
        <el-table-column
          prop="time_limit"
          label="时限"
          width="50px">
        </el-table-column>
        <el-table-column
          prop="step"
          label="工单状态"
          width="80px">
        </el-table-column>
        <el-table-column
          label="操作"
          width="170px"
          :resizable="false">
          <template slot-scope="scope">
            <el-button size="small" v-if="canDo.order_view" icon="el-icon-view" @click="order_view(scope.$index)" circle></el-button>
            <el-button size="small" v-if="canDo.order_edit" icon="el-icon-edit" @click="order_edit(scope.$index)" circle></el-button>
            <el-button size="small" v-if="step.toString()==['已撤销'].toString()?canDo.order_delete:canDo.order_update" @click="order_delete(scope.$index)" :icon="step.toString()==['已撤销'].toString()?'el-icon-delete':'el-icon-close'" circle></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-main>
    <el-footer>
      <el-pagination
        style="width: 100%"
        @size-change="sizeChange"
        @current-change="pageChange"
        :current-page.sync="index"
        :page-size.sync="limit"
        :page-sizes="[10,20,50,100]"
        :total="sum"
        layout="sizes,->,prev,pager,next">
      </el-pagination>
    </el-footer>
  </el-container>
</template>

<script>

export default {
  name: 'OrderList',
  props: ['params'],
  watch: {
    params:{
      immediate:true,
      handler(newVal,oldVal){
        this.step = this.params.step;
        this.orderID = '';
        this.name = '';
        this.start_time = '';
        this.end_time = '';
        this.number = '';
        this.index = 1;
        if(!this.first_run){
          this.getData();
        }
      }
    }
  },
  data() {
    return {
      token:'',
      user_name:'Unknown',
      first_run:true,
      orderID:'',
      name:'',
      start_time:'',
      end_time:'',
      number:'',
      step:[],
      index:1,
      limit:20,
      sum:0,
      rawData:[],
      show_search:false,
      isLoading:false,
      pageLoading:true,
      canDo:{},
      doList:['order_view','order_edit','order_delete','order_update'],
      timer:undefined
    }
  },
  created: function() {
    this.pageLoading = true;
    this.token = this.$cookies.get('user_token');
    this.user_name = this.$cookies.get('user_name');
    let self = this;
    this.assess_query(this.doList).then(function(){
      self.pageLoading = false;
      if(self.first_run){
        self.getData();
      }
      self.first_run = false;
    })
  },
  methods: {
    getData: function() {
      let self = this;
      this.isLoading = true;
      clearTimeout(this.timer);
      this.timer = undefined;
      this.getList(function(){
        self.isLoading = false;
        self.timer = setTimeout(self.getData,60000)
      })
    },
    getList:function(cb = null){
      if(!cb){
        cb = function(){};
      }
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
      data.append('index',(this.index-1)*this.limit);
      data.append('limit',this.limit);
      this.axios
        .post('http://' + self.$global_msg.HOST + 'scripts/order/getListWithTime.php', data)
        .then(function(res) {
          if(res.data.status == 'success'){
            self.rawData = res.data.result;
            self.sum = Number(res.data.sum);
            cb();
          }else{
            self.$message.error("错误:"+res.data.errMsg);
            cb();
          }
        }).catch(function(e){
          self.$message.error("错误:"+e);
          cb();
        });
    },
    submit:function(){
      let self = this;
      this.isLoading = true;
      this.show_search = false;
      this.getList(function(){
        self.isLoading = false;
      })
    },
    refresh:function(){
      this.isLoading = true;
      let self = this;
      this.getList(function(){
        self.isLoading = false;
      })
    },
    newOrder:function(){
      let rd = this.$router.resolve({
        name: 'orderEdit',
        query: {}
      });
      window.open(rd.href,'_blank');
    },
    order_view:function(index){
      let id = this.rawData[index].id;
      let rd = this.$router.resolve({
        name: 'orderEdit',
        query: {
          id:id,
          edit:'false'
        }
      });
      window.open(rd.href,'_blank');
    },
    order_edit:function(index){
      let id = this.rawData[index].id;
      let rd = this.$router.resolve({
        name: 'orderEdit',
        query: {
          id:id,
          edit:'true'
        }
      });
      window.open(rd.href,'_blank');
    },
    order_delete:function(index){
      let self = this;
      let id = this.rawData[index].id;
      if(this.step.toString()==['已撤销'].toString()){
        this.$confirm('此操作将永久删除工单数据，是否继续？','警告',{
          type:'warning'
        }).then(function(){
          let data = new FormData();
          data.append('token', self.token);
          data.append('id', id);
          self.axios
          .post('http://' + self.$global_msg.HOST + 'scripts/order/delete.php', data)
          .then(function(res) {
            if(res.data.status == 'success'){
              self.$message.success('删除成功');
              self.getData();
            }else{
              self.$message.error('删除失败:'+res.data.errMsg)
            }
          }).catch(function(e){
            self.$message.error('删除失败:'+e)
          })
        })
      }else{
        this.$confirm('撤销的工单将无法恢复，是否继续？','警告',{
          type:'warning'
        }).then(function(){
          let data = new FormData();
          data.append('token', self.token);
          data.append('id', id);
          data.append('step', '已撤销');
          self.axios
          .post('http://' + self.$global_msg.HOST + 'scripts/order/update.php', data)
          .then(function(res) {
            if(res.data.status == 'success'){
              self.$message.success('撤单成功');
              self.getData();
            }else{
              self.$message.error('撤单失败:'+res.data.errMsg)
            }
          }).catch(function(e){
            self.$message.error('撤单失败:'+e)
          })
        })
      }
    },
    cellStyle:function({row,rowIndex,columnIndex}){
      if(columnIndex == 6){
        let style = {textAlign:'center'};
        if(Number(row.net_duration) > Number(row.time_limit)){
          style.color = '#FF00FF';
        }else{
          let r = (Number(row.net_duration) / Number(row.time_limit) * 255).toFixed(0);
          let g = 255 - r;
          style.color = 'rgb('+r+','+g+',0)';
        }
        return style;
      }else{
        return {textAlign:'center'}
      }
    },
    sizeChange:function(val){
      // if(this.limit == val){
      //   return;
      // }
      this.limit = val;
      this.isLoading = true;
      let self = this;
      this.getList(function(){
        self.isLoading = false;
      })
    },
    pageChange:function(val){
      // if(this.index == val){
      //   return;
      // }
      let self = this;
      this.index = val;
      this.isLoading = true;
      this.getList(function(){
        self.isLoading = false;
      })
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
.el-col{
  min-height: 36px;
  position: relative;
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
</style>
