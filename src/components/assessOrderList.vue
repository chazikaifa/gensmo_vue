<template>
  <div class="orderList_container" v-loading="loading">
    <!-- <vxe-button type="text" icon="vxe-icon--d-arrow-left" id="btn_back" @click="back">返回</vxe-button> -->
    <vxe-table 
      class="table"
      border 
      ref="xTable" 
      align="center" 
      :data="assessData"
      :cell-class-name="cellClassName"
      size="mini"
      max-height="93%"
      resizable
      :tooltip-config="{enterable:true}"
      :edit-config="{trigger: 'click', mode: 'cell', activeMethod: editMethod}"
      @edit-closed="sendEdit"
      @edit-actived="beforeEdit"
      auto-resize>
      <vxe-table-column field="orderId" width="220px" title="故障单编号" fixed="left" :filters="[{data:''}]" :filter-method="filterMethod">
        <template v-slot:filter="{ $panel, column }">
          <input type="type" v-for="(option, index) in column.filters" :key="index" v-model="option.data" @input="$panel.changeOption($event, !!option.data, option)">
        </template>
      </vxe-table-column>
      <vxe-table-column field="name" width="200px" title="客户名称" fixed="left" :filters="[{data:''}]" :filter-method="filterMethod">
        <template v-slot:filter="{ $panel, column }">
          <input type="type" v-for="(option, index) in column.filters" :key="index" v-model="option.data" @input="$panel.changeOption($event, !!option.data, option)">
        </template>
      </vxe-table-column>
      <vxe-table-column field="major" width="80px" title="责任专业" :filters="majorList" :filter-method="filterMethodStrict" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
      <vxe-table-column field="time_out" width="55px" title="是否超时" :formatter="toBoolean" :filters="booleanList" :filter-multiple="false" :filter-method="filterMethodStrict"></vxe-table-column>
      <vxe-table-column field="level" width="50px" title="客户等级" :filters="levelList" :filter-method="filterMethod"></vxe-table-column>
      <vxe-table-column field="TOP33" width="50px" :formatter="toBoolean" title="TOP33" :filters="booleanList" :filter-multiple="false" :filter-method="filterMethodStrict"></vxe-table-column>
      <vxe-table-column field="TOP210" width="50px" :formatter="toBoolean" title="TOP210" :filters="booleanList" :filter-multiple="false" :filter-method="filterMethodStrict"></vxe-table-column>
      <vxe-table-column field="assess_TOPN" width="50px" :formatter="toBoolean" title="TOP800" :filters="booleanList" :filter-multiple="false" :filter-method="filterMethodStrict"></vxe-table-column>
      <vxe-table-column field="trouble_type" width="90px" title="业务类型" :filters="bussinessList" :filter-method="filterMethodStrict"></vxe-table-column>
      <vxe-table-column field="circuit_number" width="100px" title="电路编号" show-overflow enterable></vxe-table-column>
      <vxe-table-column field="start_time" width="150px" title="故障开始时间"></vxe-table-column>
      <vxe-table-column field="end_time" width="150px" title="故障结束时间"></vxe-table-column>
      <vxe-table-column field="time" width="55px" title="故障历时"></vxe-table-column>
      <vxe-table-column field="net_duration" width="60px" title="故障净历时"></vxe-table-column>
      <vxe-table-column field="reduce_time" width="55px" title="澄清历时"></vxe-table-column>
      <vxe-table-column field="assessment_time" width="55px" title="考核历时"></vxe-table-column>
      <vxe-table-column field="time_limit" width="55px" title="考核时限" :filters="timeLimitList" :filter-multiple="false" :filter-method="filterMethodStrict"></vxe-table-column>
      
      <vxe-table-column field="reason" width="220px" title="故障原因" show-overflow enterable :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
      
      <vxe-table-column field="is_trouble" width="80px" :formatter="toBoolean" title="真实故障" :filters="extraBooleanList" :filter-multiple="false" :filter-method="filterMethodStrict" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
      <vxe-table-column field="trouble_class" width="80px" title="故障大类" :filters="troubleClassList" :filter-method="filterMethodStrict" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
      <vxe-table-column field="trouble_reason" width="80px" title="故障原因细分" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
      <vxe-table-column field="remark" width="100px" :formatter="hideMark" title="备注" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
    </vxe-table>
    <div id="tips">故障单编号标<font color="red">红色</font>为超时工单，标<font color="#5ab1ef">蓝色</font>预计可澄清非广州责任，标<font color="#19d4ae">绿色</font>预计澄清历时后不超时，标<font color="#c4b4e4">紫色</font>表示澄清存在争议，待沟通解决。</div>
  </div>
</template>

<script>

export default {
  name: 'AssessOrderList',
  components: {},
  activated:function(){
    this.$setgoindex();
  },
  data() {
    return {
      token:'',
      canDo:{},
      dateNow:new Date(),
      doList:['getAssessOrder','updateAssessOrder'],
      days: [],
      dailyData: [],
      rawData: [],
      assessData: [],
      levelList: [{
        label: '一级',
        value: '一级'
      }, {
        label: '二级',
        value: '二级'
      }, {
        label: '三级',
        value: '三级'
      }, {
        label: '四级',
        value: '四级'
      }, {
        label: '五级',
        value: '五级'
      }, {
        label: '六级',
        value: '六级'
      }],
      booleanList: [{
        label: '是',
        value: '1'
      }, {
        label: '',
        value: '0'
      }],
      extraBooleanList: [{
        label: '是',
        value: '1'
      }, {
        label: '否',
        value: '0'
      }, {
        label: '(null)',
        value: null
      }],
      bussinessList: [{
        label: '语音业务',
        value: '语音业务'
      }, {
        label: '互联网业务',
        value: '互联网业务'
      }, {
        label: '专线业务',
        value: '专线业务'
      }],
      majorList: [{
        label: '传输',
        value: '传输'
      }, {
        label: '数据',
        value: '数据'
      }, {
        label: '交换',
        value: '交换'
      }, {
        label: '政企云',
        value: '政企云'
      }, {
        label: '其他',
        value: '其他'
      }],
      troubleClassList: [{
        label: '光缆故障',
        value: '光缆故障'
      }, {
        label: '设备故障',
        value: '设备故障'
      }, {
        label: '动力配套',
        value: '动力配套'
      }, {
        label: '电缆故障',
        value: '电缆故障'
      }, {
        label: '(null)',
        value: null
      }],
      timeLimitList: [{
        label: '120',
        value: '120'
      }, {
        label: '240',
        value: '240'
      }, {
        label: '480',
        value: '480'
      }],
      before_edit: '',
      loading:true
    }
  },
  created: function() {
    let self = this;
    this.token = this.$cookies.get('user_token');
    if(this.$route.query.now){
      this.dateNow = new Date(this.$route.query.now)
    }
    this.assess_query(this.doList).then(function(){
      if(self.canDo.getAssessOrder){
        self.init();
      }else{
        self.$message.error('[sumLine]:没有接口权限！')
      }
    })
  },
  updated: function() {},
  methods: {
    init: function() {
      let end = new Date(this.dateNow);
      end.setDate(end.getDate()-1);
      end.setHours(23);
      end.setMinutes(59);
      end.setSeconds(59);
      let start = new Date(end);
      start.setDate(1);
      start.setHours(0);
      start.setMinutes(0);
      start.setSeconds(0);
      this.getData(start.Format('yyyy-MM-dd hh:mm:ss'), end.Format('yyyy-MM-dd hh:mm:ss'));
    },
    refresh: function() {
      //动态生成的列需要手动刷新
      let xTable = this.$refs.xTable;
      xTable.updateData();
    },
    editMethod() {
      return this.canDo.updateAssessOrder;
    },
    beforeEdit: function({
      row,
      column
    }) {
      this.before_edit = row[column.property];
    },
    sendEdit: function({
      row,
      column
    }) {
      // let self = this;
      let value = row[column.property]
      if (this.before_edit != value) {
        let id = row.orderId;
        let title = column.property
        let data = new FormData();
        data.append('id', id);
        data.append('title', title);
        data.append('value', value);
        data.append('token',this.token);
        this.axios
          .post('http://' + this.$global_msg.HOST + 'scripts/assess_order/update_single.php', data)
          .then(function(res) {
            if (res.data.status == 'success') {
              //self.refresh();
            } else {
              alert(res.data.errMsg);
              console.log(res);
            }
          })
          .catch(function(err) {
            alert(err);
          });
      }
    },
    getData: function(start, end) {
      let self = this;
      let data = new FormData();
      self.assessData = [];
      data.append('START', start);
      data.append('END', end);
      data.append('token',this.token);
      data.append('province','广州');
      this.axios
        .post('http://' + this.$global_msg.HOST + 'scripts/assess_order/get_gz_order_by_datetime.php', data)
        .then(function(res) {
          if (res.data.status == 'success') {
            self.rawData = res.data.result;
            let ad = [];
            for (let i in self.rawData) {
              let data = self.rawData[i];
              if (data.correct_province == '广州' && (data.is_assess == 1 || (self.canDo.updateAssessOrder == true && data.is_trouble == null))) {
                ad.push(data);
              }
            }
            self.assessData = ad;
            setTimeout(function(){
              self.loading = false;
            },1000)
          } else {
            self.$message.error('[assessOrderList]ERROR:'+res.data.errMsg)
          }
        })
        .catch(function(err) {
          self.$message.error('[assessOrderList]NETWORK ERROR:'+err)
        });
    },
    cellClassName: function({
      row,
      // rowIndex,
      column,
      // columnIndex
    }) {
      let className = '';
      switch (column.property) {
        case 'orderId':
          if (row.time_out == '1') {
            if (row.remark.indexOf('[澄清历时]') >= 0) {
              className = className + 'cell_pass ';
            } else if (row.remark.indexOf('[澄清责任]') >= 0) {
              className = className + 'cell_not_responsible ';
            } else if (row.remark.indexOf('[澄清有争议]') >= 0) {
              className = className + 'cell_argue ';
            } else {
              className = className + 'cell_timeout ';
            }
          }
          if (row.is_trouble == null) {
            className = className + 'cell_unformed ';
          }
        case 'name':
        case 'circuit_number':
          className = className + 'canSelect ';
          break;
      }
      return className;
    },
    filterMethod: function({
      row,
      column,
      option
    }) {
      return row[column.property].match(option.data) != null
    },
    filterMethodStrict: function({
      row,
      column,
      option
    }) {
      return row[column.property] == option.value
    },
    toBoolean: function({
      cellValue
    }) {
      if (cellValue == '1') {
        return '是'
      } else {
        return ''
      }
    },
    hideMark: function({
      cellValue
    }) {
      return cellValue.replace(/\[.*\]/, "");
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
<style>
.orderList_container{
  display: flex;
  position: relative;
  background: #FFFFFF;
  height: 100vh;
}

#tips{
  position: absolute;
  font-size: 10px;
  bottom: 2vh;
  left: 2vw;
  color:#777777;
}

.my-select {
  width: 100px;
  height: 32px;
}

.orderList_container #btn_back{
  position: absolute;
  left:30px;
  top:10px;
}
.orderList_container .table{
  margin: 2vh 2vw 0 2vw;
  width: 96vw;
  max-height: 91vh;
  user-select: none;
  transition: none;
}

.orderList_container .cell_timeout{
  color: white;
  background: red;
}

.orderList_container .cell_pass{
  color: white;
  background: #19d4ae;
}

.orderList_container .cell_not_responsible{
  color: white;
  background: #5ab1ef;
}

.orderList_container .cell_argue{
  color: white;
  background: #c4b4e4;
}

.orderList_container .cell_unformed{
  color: white;
  background: #7ba3a8;
}

.orderList_container .table .vxe-body--column{
  line-height: 18px;
}

.orderList_container .table .canSelect{
  user-select: all;
}
</style>
