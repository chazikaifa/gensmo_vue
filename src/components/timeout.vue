<template>
  <div v-loading="loading" element-loading-background="#222933">
    <div class="timeout_container">
      <div class="timecount">
        <div class=title>
        考核指标
          <vxe-button status="primary" icon="vxe-icon--d-arrow-right" id="btn_daily" @click="toDaily">每日通报</vxe-button>
        </div>
        <vxe-table align="center" :data="timeCount" max-height='90%' auto-resize>
          <vxe-table-column width="26%" field="item" title="考核项目"></vxe-table-column>
          <vxe-table-column width="17%" field="sum" title="总工单数"></vxe-table-column>
          <vxe-table-column width="17%" field="timeout" title="超时数"></vxe-table-column>
          <vxe-table-column width="20%" field="time" title="平均历时(分钟)"></vxe-table-column>
          <vxe-table-column width="20%" field="rate" title="及时率"></vxe-table-column>
        </vxe-table>
      </div>

      <div class="timeout">
        <div class=title>
        重要客户故障与超时工单
          <vxe-button type="text" id="btn_switch" @click="timeoutMode = 1 - timeoutMode">{{timeoutMode==1?"显示所有":"仅显示超时"}}</vxe-button>
          <vxe-button status="primary" icon="vxe-icon--d-arrow-right" id="btn_list" @click="toList">考核工单详情</vxe-button>
          <!-- <vxe-button id="btn_add" status="primary" icon="vxe-icon--plus" @click="isAdd = !isAdd">添加澄清</vxe-button> -->
          <!-- <vxe-modal v-model="isAdd" :lock-scroll="false" show-footer width="50%" @confirm="parseInt(reduce[0].time) > parseInt(reduce[0].maxTime)?:addReduce"> -->
          <vxe-modal title="添加澄清" v-model="isAdd" :lock-scroll="false" show-footer width="70%" @confirm="addReduce">
          <vxe-table
          show-overflow
          height="fit-content"
          align="center"
          :sync-resize="isAdd"
          border
          :data="reduce"
          :edit-config="{trigger: 'click', mode: 'cell', activeMethod: not_edit_id}">
            <vxe-table-column field="id" title="故障单编号" width="40%" :edit-render="{name: 'input'}"></vxe-table-column>
            <vxe-table-column field="province" title="澄清归属" width="10%" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
            <vxe-table-column field="time" title="澄清历时" width="10%" :edit-render="{name: '$input', props: {type: 'number'}}"></vxe-table-column>
            <vxe-table-column field="timeLimit" title="更改时限" width="10%" :edit-render="{name: '$input', props: {type: 'number'}}"></vxe-table-column>
            <vxe-table-column field="mark" title="更改标记" width="30%" :edit-render="{name: '$input', props: {type: 'text'}}"></vxe-table-column>
          </vxe-table>
          </vxe-modal>
        </div>
        <vxe-table 
        align="center" 
        border 
        highlight-hover-row 
        max-height='90%' 
        auto-resize
        resizable
        :cell-class-name="cell_class" 
        :data="timeoutMode==1?timeoutList:showList" 
        @cell-dblclick="dbClick">
          <vxe-table-column width="24%" field="id" title="故障单编号"></vxe-table-column>
          <vxe-table-column width="11%" field="timeLimit" title="故障时限(分钟)"></vxe-table-column>
          <vxe-table-column width="13%" field="timeText" title="故障历时(分钟)"></vxe-table-column>
          <vxe-table-column width="12%" field="netTime" title="修复净历时(分钟)"></vxe-table-column>
          <vxe-table-column width="10%" field="mark" title="标记" :filters="TOPList" :filter-multiple="false" :filter-method="filterMethodStrict"></vxe-table-column>
          <vxe-table-column width="10%" field="duty" title="责任专业" :filters="[{label:'广州责任',value:true},{label:'非广州责任',value:false}]" :filter-multiple="false" :filter-method="responsibleFilter"></vxe-table-column>
          <vxe-table-column width="17%" field="reason" title="故障原因" show-overflow></vxe-table-column>
        </vxe-table>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'timeout',
  props: ['now'],
  watch: {
    now:{
      // immediate:true,
      handler(newVal,oldVal){
        this.init(newVal);
      }
    }
  },
  data() {
    return {
      token:'',
      canDo:{},
      doList:['getAssessOrder','updateAssessOrder'],
      timeCount: [],
      timeoutList: [],
      showList: [],
      timeoutMode: 1,
      rawData: [],
      reduce: [{
        id: '',
        province: '',
        time: 0,
        maxTime: 0,
        timeLimit: 0
      }],
      isAdd: false,
      TOPList: [{
        label: 'TOP33',
        value: 'TOP33'
      }, {
        label: 'TOP210',
        value: 'TOP210'
      }, {
        label: 'TOP800',
        value: 'TOP800'
      }],
      loading:true,
    }
  },
  created: function() {
    let self = this;
    this.token = this.$cookies.get('user_token');
    this.assess_query(this.doList).then(function(){
      if(self.canDo.getAssessOrder){
        self.init(new Date());
      }else{
        self.$message.error('[timeout]:没有接口权限!')
      }
    })
  },
  methods: {
    init: function(now) {
      let self = this;
      this.loading = true;
      let end = new Date(now);
      end.setDate(end.getDate()-1);
      end.setHours(23);
      end.setMinutes(59);
      end.setSeconds(59);
      let start = new Date(end);
      start.setDate(1);
      start.setHours(0);
      start.setMinutes(0);
      start.setSeconds(0);
      this.getOrder(start.Format('yyyy-MM-dd hh:mm:ss'),end.Format('yyyy-MM-dd hh:mm:ss'),function(res){
        self.rawData = res.data.result
        self.count();
      })
    },
    getOrder:function(start,end,cb){
      let self = this;
      let data = new FormData();
      data.append('START',start);
      data.append('END',end);
      data.append('province','广州');
      data.append('token',self.token);
      this.axios
        .post('http://'+this.$global_msg.HOST+'scripts/assess_order/get_gz_order_by_datetime.php',data)
        .then(function(res){
          cb(res);
        })
        .catch(function(err){
          self.$message.error("[timeout]getOrder Error:"+err);
          console.log(err)
        });
    },
    count: function() {
      let timeCount = [{
        item: 'TOP33',
        sum: 0,
        timeout: 0,
        rate: '100.0%',
        time: 0,
        timeSum: 0
      }, {
        item: 'TOP800家1-2级',
        sum: 0,
        timeout: 0,
        rate: '100.0%',
        time: 0,
        timeSum: 0
      }, {
        item: 'TOP800家3-6级',
        sum: 0,
        timeout: 0,
        rate: '100.0%',
        time: 0,
        timeSum: 0
      }, {
        item: '所有客户',
        sum: 0,
        timeout: 0,
        rate: '100.0%',
        time: 0,
        timeSum: 0
      }, {
        item: 'TOP210',
        sum: 0,
        timeout: 0,
        rate: '100.0',
        time: 0,
        timeSum: 0,
        dutySum:0
      }];
      this.timeoutList = [];
      this.showList = [];
      for (let i in this.rawData) {
        let data = this.rawData[i]
        if (data.responsible_province == '广州') {
          let dutyFlag = data.correct_province == '广州';
          let timeoutFlag = data.is_assess == '1' && data.time_out == '1' && dutyFlag;
          let showFlag = data.is_assess == '1' && (timeoutFlag || Number(data.time) > Number(data.time_limit));
          if(data.is_assess == '1'){
            if (dutyFlag) {
              timeCount[3].sum++;
              timeCount[3].timeSum = timeCount[3].timeSum + Number(data.assessment_time);
              timeCount[3].time = (timeCount[3].timeSum / timeCount[3].sum).toFixed(2);
            }
            if (timeoutFlag && dutyFlag) {
              timeCount[3].timeout++;
            }
            timeCount[3].rate = Number((timeCount[3].sum - timeCount[3].timeout) / timeCount[3].sum * 100).toFixed(2) + '%';
            if (data.assess_TOPN == '1' && dutyFlag) {
              switch (data.level) {
                case '一级':
                case '二级':
                  timeCount[1].sum++;
                  timeCount[1].timeSum = timeCount[1].timeSum + Number(data.assessment_time);
                  timeCount[1].time = (timeCount[1].timeSum / timeCount[1].sum).toFixed(2);
                  if (timeoutFlag) {
                    timeCount[1].timeout++;
                  }
                  timeCount[1].rate = Number((timeCount[1].sum - timeCount[1].timeout) / timeCount[1].sum * 100).toFixed(2) + '%';
                  break;
                case '三级':
                case '四级':
                case '五级':
                case '六级':
                  timeCount[2].sum++;
                  timeCount[2].timeSum = timeCount[2].timeSum + Number(data.assessment_time);
                  timeCount[2].time = (timeCount[2].timeSum / timeCount[2].sum).toFixed(2);
                  if (timeoutFlag) {
                    timeCount[2].timeout++;
                  }
                  timeCount[2].rate = Number((timeCount[2].sum - timeCount[2].timeout) / timeCount[2].sum * 100).toFixed(2) + '%';
                  break;
              }
            }
            //因为TOP33采取预计澄清的模式通报，dutyFlag为假的时候也显示以作参考
            if (data.TOP33 == '1') {
              showFlag = true;
              if(dutyFlag){
                timeCount[0].sum++;
                timeCount[0].timeSum = timeCount[0].timeSum + Number(data.assessment_time);
                timeCount[0].time = (timeCount[0].timeSum / timeCount[0].sum).toFixed(2);
                if (timeoutFlag) {
                  timeCount[0].timeout++;
                }
                timeCount[0].rate = Number((timeCount[0].sum - timeCount[0].timeout) / timeCount[0].sum * 100).toFixed(2) + '%';
              }
            }
          }
          //TOP210计算的是净历时，且总数包含非责任故障，需在最后计算
          if (data.TOP210 == '1') {
            showFlag = data.is_assess == '1';
            timeoutFlag = timeoutFlag || (Number(data.net_duration) > 120 && dutyFlag && data.is_assess == '1');
            if(dutyFlag){
              timeCount[4].sum++;
            }
            if(dutyFlag && data.is_assess == '1'){
              timeCount[4].dutySum++;
              timeCount[4].timeSum = timeCount[4].timeSum + Number(data.net_duration);
            }
            timeCount[4].time = (timeCount[4].timeSum / timeCount[4].dutySum).toFixed(2);
            if (Number(data.net_duration) > 120 && dutyFlag && data.is_assess == '1') {
              timeCount[4].timeout++;
            }
            timeCount[4].rate = Number((timeCount[4].sum - timeCount[4].timeout) / timeCount[4].sum * 100).toFixed(2) + '%';
          }

          if (timeoutFlag || showFlag) {
            let mark = "";
            if (data.TOP33 == '1') {
              mark = mark + 'TOP33 ';
            }
            if (data.assess_TOPN == '1') {
              mark = mark + 'TOP800 '
            }
            if (data.TOP210 == '1') {
              mark = mark + 'TOP210 ';
            }
            mark = mark.slice(0, -1);
            let timeText = data.time;
            if (parseInt(data.reduce_time) > 0) {
              timeText = timeText + '(-' + data.reduce_time + '=' + data.assessment_time + ')';
            }

            let duty = data.major;
            if (!dutyFlag) {
              duty = data.correct_province;
            }

            let timeoutItem = {
              id: data.orderId,
              timeLimit: data.time_limit,
              time: data.time,
              reduce_time: data.reduce_time,
              timeText: timeText,
              duty: duty,
              netTime: data.net_duration,
              reason: data.trouble_reason_symptom,
              mark: mark,
              correct_province: data.correct_province,
            }
            if (timeoutFlag) {
              this.timeoutList.push(timeoutItem);
            }
            if (showFlag) {
              this.showList.push(timeoutItem);
            }
          }
        }
      }
      this.timeCount = timeCount;

      this.loading = false;

      this.reduce = [{
        id: '',
        province: '',
        time: 0,
        maxTime: 0,
        timeLimit: 0,
        mark:''
      }];
    },
    cell_class: function({
      row,
      // rowIndex,
      // column,
      columnIndex
    }) {
      if (columnIndex == 2) {
        if (Number(row.time) - Number(row.reduce_time) > Number(row.timeLimit)) {
          return "cell_timeout";
        }
        if (Number(row.reduce_time) > 0) {
          return "cell_not_responsible";
        }
      }
      if (columnIndex == 3) {
        if (row.mark.indexOf("TOP210") >= 0 && Number(row.netTime) > 120) {
          return "cell_timeout";
        }
      }
      if (columnIndex == 5) {
        if (row.correct_province != '广州') {
          return 'cell_not_responsible'
        }
      }
    },
    addReduce: function() {
      if (parseInt(this.reduce[0].time) > parseInt(this.reduce[0].maxTime)) {
        this.$XModal.message({
          message: '澄清时间不能大于故障历时',
          status: 'warning'
        });
        return;
      }

      let TOP33 = 0;
      let TOP210 = 0;
      let TOP800 = 0;
      let TOPN = 0;
      let assess_TOPN = 0;

      let marks = this.reduce[0].mark.split(' ');
      for(let i in marks){
        switch(marks[i]){
          case "TOP210":
            TOP210 = 1;
            break;
          case "TOP33":
            TOP33 = 1; 
            //TOP33必然是TOP800，自动设置
          case "TOP800":
            TOP800 = 1;
            break;
        }
      }
      TOPN = TOP33||TOP800||TOP210?1:0;
      assess_TOPN = TOP33||TOP800?1:0;

      let self = this;
      let data = new FormData();
      data.append('id', this.reduce[0].id);
      data.append('province', this.reduce[0].province);
      data.append('time', this.reduce[0].maxTime);
      data.append('reduce_time', this.reduce[0].time);
      data.append('time_limit', this.reduce[0].timeLimit);
      data.append('TOP33',TOP33);
      data.append('TOP210',TOP210);
      data.append('TOP800',TOP800);
      data.append('TOPN',TOPN);
      data.append('assess_TOPN',assess_TOPN);
      data.append('token',this.token);
      this.axios
        .post('http://' + self.$global_msg.HOST + 'scripts/assess_order/add_reduce.php', data)
        .then(function(res) {
          if (res.data.status == 'success') {
            if (res.data.row == '1') {
              self.$message.success('修改成功')
              for (let i in self.rawData) {
                let data = self.rawData[i];
                if (data.orderId == self.reduce[0].id) {
                  data.reduce_time = self.reduce[0].time;
                  if (self.reduce[0].province != '') {
                    data.correct_province = self.reduce[0].province;
                  }
                  let assess_time = parseInt(self.reduce[0].maxTime) - parseInt(self.reduce[0].time);
                  data.assessment_time = assess_time;
                  if (assess_time <= self.reduce[0].timeLimit) {
                    data.time_out = '0';
                  } else {
                    data.time_out = '1';
                  }
                  data.time_limit = self.reduce[0].timeLimit;
                  data.TOP33 = TOP33;
                  data.TOP210 = TOP210;
                  data.TOP800 = TOP800;
                  data.TOPN = TOPN;
                  data.assess_TOPN = assess_TOPN;
                  self.rawData[i] = data;
                  break;
                }
              }
              self.count();
            } else {
              console.log(res);
              self.$message.warning('未找到工单或无改动');
            }
          } else {
            self.$message.error('[addReduce]ERROR:'+res.data.errMsg)
          }
        })
        .catch(function(err) {
          self.$message.error('[addReduce]NETWOKR ERROR:'+err)
          console.log(err);
        });
    },
    dbClick: function(e) {
      if (!this.canDo.updateAssessOrder) {
        return;
      }
      this.reduce[0].id = e.row.id;
      this.reduce[0].maxTime = e.row.time;
      this.reduce[0].timeLimit = e.row.timeLimit;
      this.reduce[0].mark = e.row.mark;
      this.reduce[0].province = e.row.correct_province;
      this.isAdd = !this.isAdd;
    },
    not_edit_id({
      // column,
      columnIndex
    }) {
      if (columnIndex === 0) {
        return false
      }
      return true
    },
    filterMethodStrict: function({
      row,
      column,
      option
    }) {
      return row[column.property].indexOf(option.value) >= 0
    },
    responsibleFilter: function({
      row,
      option
    }) {
      let flag = row.correct_province == '广州';
      return option.value == flag;
    },
    toDaily: function() {
      let rd = this.$router.resolve({
        name: 'daily',
        query: {
          now:this.now.Format('yyyy-MM-dd')
        }
      });
      window.open(rd.href,'_blank');
    },
    toList: function() {
      let rd = this.$router.resolve({
        name: 'assessOrderList',
        query: {
          now:this.now.Format('yyyy-MM-dd')
        }
      });
      window.open(rd.href,'_blank');
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
<style>
.timeout_container{
  display: flex;
  height: 100%;
  width: 100%;
}
.timeout_container .timecount{
  display: inline-block;
  width:30%;
  padding:0 1% 0 1%;
  height: 100%;
}
.timeout_container .timeout{
  display: inline-block;
  width:66%;
  padding:0 1% 0 1%;
  height: 100%;
}
.timeout_container .cell_timeout{
  color: red;
}

.timeout_container .cell_not_responsible{
  color: #5ab1ef;
}

.timeout_container .title{
  margin-bottom: 18px;
  font-size: 18px;
  font-family: STHeiti;
  font-weight: bold;
  position: relative;
}
.timeout_container .title #btn_daily{
  position: absolute;
  right:0 ;
}

.timeout_container .title #btn_list{
  position: absolute;
  right:0 ;
}

.timeout_container #btn_add{
  margin-left: 30px;
}
</style>