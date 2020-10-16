<template>
  <div class="daily_container">
    <!-- <vxe-button type="text" icon="vxe-icon--d-arrow-left" id="btn_back" @click="back">返回</vxe-button> -->
    <div class="title">{{now}}政企网络服务中台考核指标通报</div>
    <vxe-table 
      class="table"
      border 
      ref="xTable" 
      align="center" 
      :data="dailyData"
      :span-method="colspanMethod"
      :header-cell-class-name="headerCellClassName"
      :footer-cell-class-name="footerCellClassName"
      :cell-class-name="cellClassName"
      size="mini"
      :loading="!dataReady"
      show-footer
      :footer-method="showRemark"
      :footer-span-method="spanRemark"
      @header-cell-dblclick="copy_desc"
      auto-resize>
      <vxe-table-column class="desc" :title="dailyDesc" align="left">
        <vxe-table-column width="17%" field="item" title="考核项目"></vxe-table-column>
        <vxe-table-column width="6%" field="duty" title="责任专业"></vxe-table-column>
        <vxe-table-column width="6%" field="target" :formatter="to100" title="目标"></vxe-table-column>

        <vxe-table-column width="6%" v-for="(item,index) in days" :formatter="to100" :key="index" v-bind="item"></vxe-table-column>

        <vxe-table-column width="6%" field="compare" :formatter="to100" title="环比"></vxe-table-column>
        <vxe-table-column width="6%" field="toTarget" :formatter="to100" title="目标比"></vxe-table-column>
        <vxe-table-column width="17%" field="desc" align="left" header-align="center" title="概况"></vxe-table-column>
        <vxe-table-column width="6%" field="sum" :formatter="to100" title="总计"></vxe-table-column>
        <vxe-table-column width="6%" field="sumToTarget" :formatter="to100" title="总目标比"></vxe-table-column>
      </vxe-table-column>
    </vxe-table>
  </div>
</template>

<script>
var EXCEPT_NUMBER = ['','无','客户无法提供','-'];

Date.prototype.Format = function(fmt) { //author: meizz   
  var o = {
    "M+": this.getMonth() + 1, //月份   
    "d+": this.getDate(), //日   
    "h+": this.getHours(), //小时   
    "m+": this.getMinutes(), //分   
    "s+": this.getSeconds(), //秒   
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度   
    "S": this.getMilliseconds() //毫秒   
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}

export default {
  name: 'Daily',
  components: {},
  activated:function(){
    this.$setgoindex();
  },
  data() {
    return {
      token:'',
      canDo:{},
      doList:['getAssessOrder'],
      days: [],
      TOP33_sum:0,
      TOP33_time_sum:0,
      dailyData: [{
        item: '责任故障重复次数',
        target: 0,
        targetType: '<'
      }, {
        item: 'TOP33责任故障次数',
        target: 11,
        targetType: '<'
      }, {
        item: 'TOP33责任故障历时',
        target: 100,
        targetType: '<'
      }, {
        item: '集团直属客户故障及时率',
        target: 0.98,
        duty: '传输',
        targetType: '>'
      }, {
        item: '集团直属客户故障及时率',
        target: 0.98,
        duty: '数据',
        targetType: '>'
      }, {
        item: '集团直属客户故障及时率',
        target: 0.98,
        duty: '交换',
        targetType: '>'
      }, {
        item: '集团直属客户故障及时率',
        target: 0.98,
        duty: '政企云',
        targetType: '>'
      }, {
        item: '集团直属客户故障及时率',
        target: 0.98,
        duty: '其他',
        targetType: '>'
      }, {
        item: 'TOP800家1-2级故障及时率',
        target: 0.95,
        duty: '传输',
        targetType: '>'
      }, {
        item: 'TOP800家1-2级故障及时率',
        target: 0.95,
        duty: '数据',
        targetType: '>'
      }, {
        item: 'TOP800家1-2级故障及时率',
        target: 0.95,
        duty: '交换',
        targetType: '>'
      }, {
        item: 'TOP800家1-2级故障及时率',
        target: 0.95,
        duty: '政企云',
        targetType: '>'
      }, {
        item: 'TOP800家1-2级故障及时率',
        target: 0.95,
        duty: '其他',
        targetType: '>'
      }, {
        item: 'TOP800家3-6级故障及时率',
        target: 0.95,
        duty: '传输',
        targetType: '>'
      }, {
        item: 'TOP800家3-6级故障及时率',
        target: 0.95,
        duty: '数据',
        targetType: '>'
      }, {
        item: 'TOP800家3-6级故障及时率',
        target: 0.95,
        duty: '交换',
        targetType: '>'
      }, {
        item: 'TOP800家3-6级故障及时率',
        target: 0.95,
        duty: '政企云',
        targetType: '>'
      }, {
        item: 'TOP800家3-6级故障及时率',
        target: 0.95,
        duty: '其他',
        targetType: '>'
      }, {
        item: 'TOP800家客户故障及时率',
        target: 0.95,
        duty: '传输',
        targetType: '>'
      }, {
        item: 'TOP800家客户故障及时率',
        target: 0.95,
        duty: '数据',
        targetType: '>'
      }, {
        item: 'TOP800家客户故障及时率',
        target: 0.95,
        duty: '交换',
        targetType: '>'
      }, {
        item: 'TOP800家客户故障及时率',
        target: 0.95,
        duty: '政企云',
        targetType: '>'
      }, {
        item: 'TOP800家客户故障及时率',
        target: 0.95,
        duty: '其他',
        targetType: '>'
      }, {
        item: '所有客户故障及时率',
        target: 0.95,
        duty: '传输',
        targetType: '>'
      }, {
        item: '所有客户故障及时率',
        target: 0.95,
        duty: '数据',
        targetType: '>'
      }, {
        item: '所有客户故障及时率',
        target: 0.95,
        duty: '交换',
        targetType: '>'
      }, {
        item: '所有客户故障及时率',
        target: 0.95,
        duty: '政企云',
        targetType: '>'
      }, {
        item: '所有客户故障及时率',
        target: 0.95,
        duty: '其他',
        targetType: '>'
      }, {
        item: '发函投诉',
        target: 0,
        targetType: '<',
        day0: 0,
        day1: 0,
        day2: 0,
        day3: 0,
        day4: 0,
        sum: 0,
        toTarget: 0,
        sumToTarget: 0
      }, ],
      rawData: [],
      dataReady: false,
      assessData: [],
      dateNow:new Date(),
      now: "",
      dailyDesc: "",
      desc_arr: [{
        fmt: "1、责任故障重复次数，{d}次，{t}；\r\n",
        index: 0,
        type: "number"
      }, {
        fmt: "2、TOP33责任故障次数，{d}次，{t}；",
        index: 1,
        type: "number"
      }, {
        fmt: "全年累计责任故障次数，{d}次，{t}；\r\n",
        index: 'TOP33_sum',
        type: "number"
      }, {
        fmt: "3、TOP33责任平均历时，{d}分钟，{t}；",
        index: 2,
        type: "float"
      }, {
        fmt: "全年责任平均历时{d}分钟，{t}；\r\n",
        index: 'TOP33_time',
        type: "float"
      }, {
        fmt: "4、集团直属客户故障及时率，{d}，{t}；\r\n",
        index: 3,
        type: "percent"
      }, {
        fmt: "5、TOP800家1-2级客户故障及时率，{d}，{t}；\r\n",
        index: 8,
        type: "percent"
      }, {
        fmt: "6、TOP800家3-6级客户故障及时率，{d}，{t}；\r\n",
        index: 13,
        type: "percent"
      }, {
        fmt: "7、TOP800家客户故障及时率，{d}，{t}；\r\n",
        index: 18,
        type: "percent"
      }, {
        fmt: "8、所有客户故障及时率，{d}，{t}；\r\n",
        index: 23,
        type: "percent"
      }, {
        fmt: "9、客户发函投诉，{d}，{t}。",
        index: 28,
        type: "number"
      }]
    }
  },
  created: function() {
    let self = this;
    this.token = this.$cookies.get('user_token');
    if(this.$route.query.now){
      this.dateNow = new Date(this.$route.query.now)
    }
    this.countDay();
    this.assess_query(this.doList).then(function(){
      if(self.canDo.getAssessOrder){
        let now = new Date(self.dateNow);
        now.setDate(now.getDate() - 1);
        self.getTOP33Data(now.getMonth()).then(function(res){
          console.log(res)
          self.TOP33_sum = res.TOP33_sum;
          self.TOP33_time_sum = res.TOP33_time_sum;
          self.init();
        })
      }else{
        self.$message.error('[daily]:没有接口权限！')
      }
    })
  },
  updated: function() {},
  methods: {
    //必须在渲染之前填充days数组，否则动态生成的列不能正常显示
    countDay:function(){
      let now = new Date(this.dateNow);
      this.now = now.Format("yyyy年MM月dd日");
      now.setDate(now.getDate() - 1);
      now.setHours(23);
      now.setMinutes(59);
      now.setSeconds(59);

      // let maxDay = new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
      let maxDay = now.getDate();
      let minDay;
      let dateLimit = new Date(now);
      dateLimit.setHours(23);
      dateLimit.setMinutes(59);
      dateLimit.setSeconds(59);
      if (maxDay < 5) {
        minDay = 1;
      } else {
        minDay = maxDay - 4;
      }
      dateLimit.setDate(minDay);
      this.days = [];
      for (let i = 0; i <= (maxDay - minDay); i++) {
        let day = {
          field: 'day' + i,
          title: (now.getMonth() + 1) + "月" + (minDay + i) + "日"
        };
        this.days.push(day);
        let limit = new Date(dateLimit);
        limit.setDate(minDay + i);
        this.assessData.push({
          dateLimit: limit,
          data: []
        });
      }
    },
    init: function() {
      this.dailyData['TOP33_sum'] = {
        item: 'TOP33全年累计',
        target: 139,
        targetType: '<'
      };
      this.dailyData['TOP33_time'] = {
        item: 'TOP33全年平均历时',
        target: 112,
        targetType: '<'
      };

      let now = new Date(this.dateNow);
      now.setDate(now.getDate() - 1);
      now.setHours(23);
      now.setMinutes(59);
      now.setSeconds(59);

      let start = new Date(now);
      start.setDate(1);
      start.setHours(0);
      start.setMinutes(0);
      start.setSeconds(0);

      this.getData(start.Format('yyyy-MM-dd hh:mm:ss'), now.Format('yyyy-MM-dd hh:mm:ss'));
    },
    colspanMethod: function({
      // row,
      rowIndex,
      // column,
      columnIndex,
      // data
    }) {
      if (columnIndex == 0) {
        switch (rowIndex) {
          case 0:
          case 1:
          case 2:
          case 28:
            return {
              rowspan: 1,
              colspan: 2
            };
          case 3:
          case 8:
          case 13:
          case 18:
          case 23:
            return {
              rowspan: 5,
              colspan: 1
            };
          default:
            return {
              rowspan: 0,
              colspan: 0
            };
        }
      }
      if (columnIndex == 1) {
        switch (rowIndex) {
          case 0:
          case 1:
          case 2:
          case 28:
            return {
              rowspan: 0,
              colspan: 0
            };
        }
      }
      if (columnIndex == 2 || columnIndex == 6 + this.days.length || columnIndex == 7 + this.days.length) {
        switch (rowIndex) {
          case 0:
          case 1:
          case 2:
          case 28:
            return {
              rowspan: 1,
              colspan: 1
            };
          case 3:
          case 8:
          case 13:
          case 18:
          case 23:
            return {
              rowspan: 5,
              colspan: 1
            };
          default:
            return {
              rowspan: 0,
              colspan: 0
            };
        }
      }
      return {
        rowspan: 1,
        colspan: 1
      };
    },
    getTOP33Data:async function(month){
      let result = {
        TOP33_sum:0,
        TOP33_time_sum:0
      };
      await this.axios
        .get('http://' + this.$global_msg.HOST + 'scripts/report/reportData.php')
        .then(function(res){
          let d = res.data;
          for(let i in d){
            if(d[i].name == 'TOP55_list'){
              for(let j = 0;j < month;j++){
                result.TOP33_sum = result.TOP33_sum + d[i].data[j];
              }
            }
            if(d[i].name == 'TOP55_time_list'){
              for(let j = 0;j < month;j++){
                result.TOP33_time_sum = result.TOP33_time_sum + d[i].data[j];
              }
            }
          }
        }).catch(function(e){
          self.$message.error('[daily]:TOP33数据获取失败！错误：'+e);
          console.log(e)
        })
      return result;
    },
    getData: function(start, end) {
      let self = this;
      self.dataReady = false;
      let data = new FormData();
      data.append('START', start);
      data.append('END', end);
      data.append('token',this.token)
      data.append('province','广东省广州市')
      this.axios
        .post('http://' + self.$global_msg.HOST + 'scripts/assess_order/get_gz_order_by_datetime.php', data)
        .then(function(res) {
          if (res.data.status == 'success') {
            self.rawData = res.data.result;

            for (let i in self.rawData) {
              let data = self.rawData[i];
              if (data.responsible_province != '广州' || data.is_assess == 0) {
                continue;
              }
              let end_time = new Date(data.end_time);
              for (let n in self.assessData) {
                if (self.assessData[n].dateLimit - end_time > 0) {
                  self.assessData[n].data.push(data);
                }
              }
            }

            self.judge(self.judgeRepeat, "sum", 0, function(data) {
              self.dailyData[0]['toTarget'] = data.sum - self.dailyData[0]['target'];
              self.dailyData[0]['desc'] = 'TOP33重复故障次数' + data.TOP33 + ',TOP800重复故障次数' + data.TOP800;
              self.dailyData[0]['sum'] = data.sum;
              self.dailyData[0]['sumToTarget'] = data.sum - self.dailyData[0]['target'];
            })

            self.judge(self.judgeTOP33, "sum", 1, function(data) {
              self.dailyData[1]['sum'] = data.sum;
              self.dailyData[1]['sumToTarget'] = self.dailyData[1]['sum'] - self.dailyData[1]['target'];
              self.dailyData[1]['desc'] = '2020年累计责任故障' + (data.sum + self.TOP33_sum) + '次';

              self.dailyData['TOP33_sum']['sum'] = data.sum + self.TOP33_sum;
              self.dailyData['TOP33_sum']['sumToTarget'] = self.dailyData['TOP33_sum']['sum'] - self.dailyData['TOP33_sum']['target'];
            })
            self.judge(self.judgeTOP33, "time", 2, function(data) {
              self.dailyData[2]['sum'] = data.time;
              self.dailyData[2]['sumToTarget'] = self.dailyData[2]['sum'] - self.dailyData[2]['target'];
              let timeSum = (self.TOP33_time_sum + data.timeSum) / (self.TOP33_sum + data.sum);
              self.dailyData[2]['desc'] = '2020年平均历时' + timeSum.toFixed(2) + '分钟';

              self.dailyData['TOP33_time']['sum'] = timeSum;
              self.dailyData['TOP33_time']['sumToTarget'] = self.dailyData['TOP33_time']['sum'] - self.dailyData['TOP33_time']['target'];
            })

            self.judge(self.judgeTOP210, "cs", 3, function(data) {
              self.dailyData[3]['desc'] = "共" + data.cs_sum + "单，超时" + data.cs_timeout + "单";
              if (data.sum > 0) {
                self.dailyData[3]['sum'] = (data.sum - data.timeout) / data.sum;
              } else {
                self.dailyData[3]['sum'] = 1;
              }
              self.dailyData[3]['sumToTarget'] = self.dailyData[3]['sum'] - self.dailyData[3]['target'];
            })
            self.judge(self.judgeTOP210, "sj", 4, function(data) {
              self.dailyData[4]['desc'] = "共" + data.sj_sum + "单，超时" + data.sj_timeout + "单";
            })
            self.judge(self.judgeTOP210, "jh", 5, function(data) {
              self.dailyData[5]['desc'] = "共" + data.jh_sum + "单，超时" + data.jh_timeout + "单";
            })
            self.judge(self.judgeTOP210, "zq", 6, function(data) {
              self.dailyData[6]['desc'] = "共" + data.zq_sum + "单，超时" + data.zq_timeout + "单";
            })
            self.judge(self.judgeTOP210, "qt", 7, function(data) {
              self.dailyData[7]['desc'] = "共" + data.qt_sum + "单，超时" + data.qt_timeout + "单";
            })

            self.judge(self.judgeTOP800_1_2, "cs", 8, function(data) {
              self.dailyData[8]['desc'] = "共" + data.cs_sum + "单，超时" + data.cs_timeout + "单";
              if (data.sum > 0) {
                self.dailyData[8]['sum'] = (data.sum - data.timeout) / data.sum;
              } else {
                self.dailyData[8]['sum'] = 1;
              }
              self.dailyData[8]['sumToTarget'] = self.dailyData[8]['sum'] - self.dailyData[8]['target'];
            })
            self.judge(self.judgeTOP800_1_2, "sj", 9, function(data) {
              self.dailyData[9]['desc'] = "共" + data.sj_sum + "单，超时" + data.sj_timeout + "单";
            })
            self.judge(self.judgeTOP800_1_2, "jh", 10, function(data) {
              self.dailyData[10]['desc'] = "共" + data.jh_sum + "单，超时" + data.jh_timeout + "单";
            })
            self.judge(self.judgeTOP800_1_2, "zq", 11, function(data) {
              self.dailyData[11]['desc'] = "共" + data.zq_sum + "单，超时" + data.zq_timeout + "单";
            })
            self.judge(self.judgeTOP800_1_2, "qt", 12, function(data) {
              self.dailyData[12]['desc'] = "共" + data.qt_sum + "单，超时" + data.qt_timeout + "单";
            })

            self.judge(self.judgeTOP800_3_6, "cs", 13, function(data) {
              self.dailyData[13]['desc'] = "共" + data.cs_sum + "单，超时" + data.cs_timeout + "单";
              if (data.sum > 0) {
                self.dailyData[13]['sum'] = (data.sum - data.timeout) / data.sum;
              } else {
                self.dailyData[13]['sum'] = 1;
              }
              self.dailyData[13]['sumToTarget'] = self.dailyData[13]['sum'] - self.dailyData[13]['target'];
            })
            self.judge(self.judgeTOP800_3_6, "sj", 14, function(data) {
              self.dailyData[14]['desc'] = "共" + data.sj_sum + "单，超时" + data.sj_timeout + "单";
            })
            self.judge(self.judgeTOP800_3_6, "jh", 15, function(data) {
              self.dailyData[15]['desc'] = "共" + data.jh_sum + "单，超时" + data.jh_timeout + "单";
            })
            self.judge(self.judgeTOP800_3_6, "zq", 16, function(data) {
              self.dailyData[16]['desc'] = "共" + data.zq_sum + "单，超时" + data.zq_timeout + "单";
            })
            self.judge(self.judgeTOP800_3_6, "qt", 17, function(data) {
              self.dailyData[17]['desc'] = "共" + data.qt_sum + "单，超时" + data.qt_timeout + "单";
            })

            self.judge(self.judgeTOP800, "cs", 18, function(data) {
              self.dailyData[18]['desc'] = "共" + data.cs_sum + "单，超时" + data.cs_timeout + "单";
              if (data.sum > 0) {
                self.dailyData[18]['sum'] = (data.sum - data.timeout) / data.sum;
              } else {
                self.dailyData[18]['sum'] = 1;
              }
              self.dailyData[18]['sumToTarget'] = self.dailyData[18]['sum'] - self.dailyData[18]['target'];
            })
            self.judge(self.judgeTOP800, "sj", 19, function(data) {
              self.dailyData[19]['desc'] = "共" + data.sj_sum + "单，超时" + data.sj_timeout + "单";
            })
            self.judge(self.judgeTOP800, "jh", 20, function(data) {
              self.dailyData[20]['desc'] = "共" + data.jh_sum + "单，超时" + data.jh_timeout + "单";
            })
            self.judge(self.judgeTOP800, "zq", 21, function(data) {
              self.dailyData[21]['desc'] = "共" + data.zq_sum + "单，超时" + data.zq_timeout + "单";
            })
            self.judge(self.judgeTOP800, "qt", 22, function(data) {
              self.dailyData[22]['desc'] = "共" + data.qt_sum + "单，超时" + data.qt_timeout + "单";
            })

            self.judge(self.judgeAll, "cs", 23, function(data) {
              self.dailyData[23]['desc'] = "共" + data.cs_sum + "单，超时" + data.cs_timeout + "单";
              if (data.sum > 0) {
                self.dailyData[23]['sum'] = (data.sum - data.timeout) / data.sum;
              } else {
                self.dailyData[23]['sum'] = 1;
              }
              self.dailyData[23]['sumToTarget'] = self.dailyData[23]['sum'] - self.dailyData[23]['target'];
            })
            self.judge(self.judgeAll, "sj", 24, function(data) {
              self.dailyData[24]['desc'] = "共" + data.sj_sum + "单，超时" + data.sj_timeout + "单";
            })
            self.judge(self.judgeAll, "jh", 25, function(data) {
              self.dailyData[25]['desc'] = "共" + data.jh_sum + "单，超时" + data.jh_timeout + "单";
            })
            self.judge(self.judgeAll, "zq", 26, function(data) {
              self.dailyData[26]['desc'] = "共" + data.zq_sum + "单，超时" + data.zq_timeout + "单";
            })
            self.judge(self.judgeAll, "qt", 27, function(data) {
              self.dailyData[27]['desc'] = "共" + data.qt_sum + "单，超时" + data.qt_timeout + "单";
            })

            self.countCompare();
            self.setDesc();
            self.dataReady = true;
          } else {
            self.$message.error(res.data.errMsg);
          }
        })
        .catch(function(err) {
          self.$message.error(err);
        });
    },
    judgeRepeat: function(data) {
      let circuit_arr = [];
      for (let i in data) {
        if (EXCEPT_NUMBER.includes(data[i].circuit_number)) {
          continue;
        }
        if (circuit_arr[data[i].circuit_number] == undefined) {
          let repeat = {
            sum: 1
          }
          if (data[i].TOP33 == 1) {
            repeat.TOP33 = true;
          } else {
            repeat.TOP33 = false;
          }
          if (data[i].assess_TOPN == 1) {
            repeat.TOP800 = true;
          } else {
            repeat.TOP800 = false;
          }
          circuit_arr[data[i].circuit_number] = repeat;
        } else {
          circuit_arr[data[i].circuit_number].sum++;
          if ((circuit_arr[data[i].circuit_number].TOP800 || circuit_arr[data[i].circuit_number].TOP33) && circuit_arr[data[i].circuit_number].sum > 1 || circuit_arr[data[i].circuit_number].sum > 2) {
            let log = data[i].circuit_number;
            log = log + (circuit_arr[data[i].circuit_number].TOP800?'|TOP800':'') + (circuit_arr[data[i].circuit_number].TOP33?'|TOP33':'');
            log = log + '|repeat:' + circuit_arr[data[i].circuit_number].sum
            console.log(log);
          }
        }
      }
      let result = {
        sum: 0,
        TOP800: 0,
        TOP33: 0
      };
      for (let i in circuit_arr) {
        if (circuit_arr[i].TOP800 || circuit_arr[i].TOP33) {
          result.sum = result.sum + circuit_arr[i].sum - 1;
          if (circuit_arr[i].TOP800) {
            result.TOP800 = result.TOP800 + circuit_arr[i].sum - 1;
          }
          if (circuit_arr[i].TOP33) {
            result.TOP33 = result.TOP33 + circuit_arr[i].sum - 1;
          }
        } else {
          if (circuit_arr[i].sum > 2) {
            result.sum = result.sum + circuit_arr[i].sum - 2
          }
        }
      }
      return result;
    },
    judgeTOP33: function(data) {
      let result = {
        sum: 0,
        timeSum: 0
      };
      for (let i in data) {
        if (data[i].TOP33 == 1) {
          result.sum++;
          result.timeSum = result.timeSum + Number(data[i].assessment_time);
        }
      }
      if (result.sum > 0) {
        result.time = (result.timeSum / result.sum).toFixed(2);
      } else {
        result.time = 0;
      }
      return result;
    },
    judgeTOP210: function(data) {
      let result = {
        sum: 0,
        timeout: 0,
        cs: 1,
        cs_sum: 0,
        cs_timeout: 0,
        sj: 1,
        sj_sum: 0,
        sj_timeout: 0,
        jh: 1,
        jh_sum: 0,
        jh_timeout: 0,
        zq: 1,
        zq_sum: 0,
        zq_timeout: 0,
        qt: 1,
        qt_sum: 0,
        qt_timeout: 0
      }
      for (let i in data) {
        if (data[i].TOP210 == 0) {
          continue;
        }
        result.sum++;
        let major;
        switch (data[i].major) {
          case '传输':
            major = 'cs';
            break;
          case '数据':
            major = 'sj';
            break;
          case '交换':
            major = 'jh';
            break;
          case '政企云':
            major = 'zq';
            break;
          case '其他':
            major = 'qt';
            break;
          default:
            major = 'qt';
            break;
        }
        result[major + "_sum"]++;
        if (Number(data[i].net_duration) > 120) {
          result.timeout++;
          result[major + "_timeout"]++;
        }
        result[major] = (result[major + "_sum"] - result[major + "_timeout"]) / result[major + "_sum"];
      }
      return result;
    },
    judgeTOP800_1_2: function(data) {
      let result = {
        sum: 0,
        timeout: 0,
        cs: 1,
        cs_sum: 0,
        cs_timeout: 0,
        sj: 1,
        sj_sum: 0,
        sj_timeout: 0,
        jh: 1,
        jh_sum: 0,
        jh_timeout: 0,
        zq: 1,
        zq_sum: 0,
        zq_timeout: 0,
        qt: 1,
        qt_sum: 0,
        qt_timeout: 0
      }
      for (let i in data) {
        if (data[i].assess_TOPN == 0 || data[i].level != '一级' && data[i].level != '二级') {
          continue;
        }
        result.sum++;
        let major;
        switch (data[i].major) {
          case '传输':
            major = 'cs';
            break;
          case '数据':
            major = 'sj';
            break;
          case '交换':
            major = 'jh';
            break;
          case '政企云':
            major = 'zq';
            break;
          case '其他':
            major = 'qt';
            break;
          default:
            major = 'qt';
            break;
        }
        result[major + "_sum"]++;
        if (data[i].time_out == '1') {
          result.timeout++;
          result[major + "_timeout"]++;
        }
        result[major] = (result[major + "_sum"] - result[major + "_timeout"]) / result[major + "_sum"];
      }
      return result;
    },
    judgeTOP800_3_6: function(data) {
      let result = {
        sum: 0,
        timeout: 0,
        cs: 1,
        cs_sum: 0,
        cs_timeout: 0,
        sj: 1,
        sj_sum: 0,
        sj_timeout: 0,
        jh: 1,
        jh_sum: 0,
        jh_timeout: 0,
        zq: 1,
        zq_sum: 0,
        zq_timeout: 0,
        qt: 1,
        qt_sum: 0,
        qt_timeout: 0
      }
      for (let i in data) {
        if (data[i].assess_TOPN == 0 || data[i].level != '三级' && data[i].level != '四级' && data[i].level != '五级' && data[i].level != '六级') {
          continue;
        }
        result.sum++;
        let major;
        switch (data[i].major) {
          case '传输':
            major = 'cs';
            break;
          case '数据':
            major = 'sj';
            break;
          case '交换':
            major = 'jh';
            break;
          case '政企云':
            major = 'zq';
            break;
          case '其他':
            major = 'qt';
            break;
          default:
            major = 'qt';
            break;
        }
        result[major + "_sum"]++;
        if (data[i].time_out == '1') {
          result.timeout++;
          result[major + "_timeout"]++;
        }
        result[major] = (result[major + "_sum"] - result[major + "_timeout"]) / result[major + "_sum"];
      }
      return result;
    },
    judgeTOP800: function(data) {
      let result = {
        sum: 0,
        timeout: 0,
        cs: 1,
        cs_sum: 0,
        cs_timeout: 0,
        sj: 1,
        sj_sum: 0,
        sj_timeout: 0,
        jh: 1,
        jh_sum: 0,
        jh_timeout: 0,
        zq: 1,
        zq_sum: 0,
        zq_timeout: 0,
        qt: 1,
        qt_sum: 0,
        qt_timeout: 0
      }
      for (let i in data) {
        if (data[i].assess_TOPN == 0) {
          continue;
        }
        result.sum++;
        let major;
        switch (data[i].major) {
          case '传输':
            major = 'cs';
            break;
          case '数据':
            major = 'sj';
            break;
          case '交换':
            major = 'jh';
            break;
          case '政企云':
            major = 'zq';
            break;
          case '其他':
            major = 'qt';
            break;
          default:
            major = 'qt';
            break;
        }
        result[major + "_sum"]++;
        if (data[i].time_out == '1') {
          result.timeout++;
          result[major + "_timeout"]++;
        }
        result[major] = (result[major + "_sum"] - result[major + "_timeout"]) / result[major + "_sum"];
      }
      return result;
    },
    judgeAll: function(data) {
      let result = {
        sum: 0,
        timeout: 0,
        cs: 1,
        cs_sum: 0,
        cs_timeout: 0,
        sj: 1,
        sj_sum: 0,
        sj_timeout: 0,
        jh: 1,
        jh_sum: 0,
        jh_timeout: 0,
        zq: 1,
        zq_sum: 0,
        zq_timeout: 0,
        qt: 1,
        qt_sum: 0,
        qt_timeout: 0
      }
      for (let i in data) {
        result.sum++;
        let major;
        switch (data[i].major) {
          case '传输':
            major = 'cs';
            break;
          case '数据':
            major = 'sj';
            break;
          case '交换':
            major = 'jh';
            break;
          case '政企云':
            major = 'zq';
            break;
          case '其他':
            major = 'qt';
            break;
          default:
            major = 'qt';
            break;
        }
        result[major + "_sum"]++;
        if (data[i].time_out == '1') {
          result.timeout++;
          result[major + "_timeout"]++;
        }
        result[major] = (result[major + "_sum"] - result[major + "_timeout"]) / result[major + "_sum"];
      }
      return result;
    },
    judge: function(get_func, result_name, row_index, callback) {
      let self = this;
      let data;
      for (let i in self.assessData) {
        data = get_func(self.assessData[i].data);
        self.dailyData[row_index]['day' + i] = data[result_name];
      }
      callback(data);
    },
    descFmt: function(fmt, d, t) {
      let re = fmt.replace('{d}', d);
      re = re.replace('{t}', t)
      return re;
    },
    setDesc: function() {
      this.dailyDesc = "";
      for (let i in this.desc_arr) {
        let des = this.desc_arr[i];
        let data = this.dailyData[des.index];
        let d = "";
        switch (des.type) {
          case "number":
            d = Number(data.sum).toFixed(0);
            break;
          case "float":
            d = Number(data.sum).toFixed(2);
            break;
          case "percent":
            d = (data.sum * 100).toFixed(2) + "%";
            break;
          default:
            d = data.sum + "";
        }
        let t;
        if (data.targetType == "<" && data.sumToTarget <= 0 || data.targetType == ">" && data.sumToTarget >= 0) {
          t = "达标";
        } else {
          t = "不达标";
        }
        this.dailyDesc = this.dailyDesc + this.descFmt(des.fmt, d, t);
      }
    },
    copy_desc: function(e) {
      if (e.$rowIndex == 0) {
        let text = "【" + this.now + "政企网络服务中台考核指标通报】\r\n" + this.dailyDesc;
        this.$copyText(text).then(res => {
            alert('已复制到剪切板！');
          },
          err => {
            alert('复制失败，请手动复制！');
            console.log(err);
          }
        );
      }
    },
    to100: function({
      cellValue,
      row,
    }) {
      switch (row.item) {
        case '责任故障重复次数':
        case 'TOP33责任故障次数':
        case '发函投诉':
          return cellValue;
        case 'TOP33责任故障历时':
          return Number(cellValue).toFixed(2);
        default:
          if (cellValue != undefined) {
            if (cellValue == '-') {
              return '-';
            } else {
              return (cellValue * 100).toFixed(2) + "%";
            }
          }
          return '-';
      }
    },
    headerCellClassName: function(e) {
      switch (e.$rowIndex) {
        case 0:
          return 'desc';
        default:
          return 'header';
      }
    },
    footerCellClassName: function() {
      return 'footer';
    },
    cellClassName: function({
      row,
      // rowIndex,
      column,
      // columnIndex
    }) {
      switch (column.property) {
        case 'day0':
        case 'day1':
        case 'day2':
        case 'day3':
        case 'day4':
          if (row.targetType == '>' && (row[column.property] - row.target) < 0 || row.targetType == '<' && (row[column.property] - row.target) > 0) {
            return 'mainWarn'
          }
          break;
        case 'sum':
          if (row.targetType == '>' && (row[column.property] - row.target) < 0 || row.targetType == '<' && (row[column.property] - row.target) > 0) {
            return 'warn'
          }
          break;
        case 'compare':
        case 'toTarget':
        case 'sumToTarget':
          if (row.targetType == '>' && row[column.property] < 0 || row.targetType == '<' && row[column.property] > 0) {
            return 'warn'
          }
          break;
      }
      return null;
    },
    spanRemark: function({
      columnIndex
    }) {
      //概况为居左，故选用该做footer列
      if (columnIndex == 5 + this.days.length) {
        return {
          rowspan: 1,
          colspan: 8 + this.days.length
        };
      } else {
        return {
          rowspan: 0,
          colspan: 0
        };
      }
    },
    showRemark: function() {
      let remark = "备注：\n1、工单数据取自“沃运维”系统故障单日报，由程序自动下载并录入数据库，当月内数据累积\n2、故障恢复历时包括了挂起时间，这部分时间需要每周在澄清系统上进行澄清，澄清通过后会在后台手动录入澄清信息。\n3、专业分类依据为工单中的“主要处理部门”（对应表格EC列）字段";
      let arr = [];
      for (let i = 0; i < 5 + this.days.length; i++) {
        arr.push('');
      }
      arr.push(remark);
      return [arr];
    },
    countCompare: function() {
      let day = this.days[this.days.length - 1].field;
      if (this.days.length > 1) {
        for (let i in this.dailyData) {
          let lastDay = this.days[this.days.length - 2].field;
          if (this.dailyData[i][day] != undefined) {
            if (this.dailyData[i][lastDay] != undefined) {
              this.dailyData[i]['compare'] = Number(this.dailyData[i][day]) - Number(this.dailyData[i][lastDay]);
            } else {
              this.dailyData[i]['compare'] = '-';
            }
            if (this.dailyData[i]['target'] != undefined) {
              this.dailyData[i]['toTarget'] = Number(this.dailyData[i][day]) - Number(this.dailyData[i]['target']);
            } else {
              this.dailyData[i]['toTarget'] = '-';
            }
          } else {
            this.dailyData[i]['compare'] = '-';
            this.dailyData[i]['toTarget'] = '-';
          }
        }
      } else {
        for (let i in this.dailyData) {
          this.dailyData[i]['compare'] = '-';
          if (this.dailyData[i][day] != undefined && this.dailyData[i]['target'] != undefined) {
            this.dailyData[i]['toTarget'] = Number(this.dailyData[i][day]) - Number(this.dailyData[i]['target']);
          } else {
            this.dailyData[i]['toTarget'] = '-';
          }
        }
      }
    },
    back:function(){
      if (this.$route.query.goindex === 'true') {
        this.$router.replace({
          name: 'index',
          params: {}
        });
      } else {
        this.$router.back(-1);
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
<style>
.daily_container{
  display: flex;
  align-items: center;
  flex-direction: column;
  position: relative;
  background: #FFFFFF;
  height: fit-content;
  padding-bottom: 20px;
}
#btn_back{
  position: absolute;
  left:30px;
  top:20px;
}
.daily_container .title{
  font-weight: bold;
  font-size: 18px;
  width: 1380px;
  text-align: center;
  margin: 10px 0 2px 0;
  color:#000000;
}
.daily_container .table{
  width:1380px;
}
.daily_container .table .desc .vxe-cell--title{
  white-space: pre-line;
  font-weight: normal;
  user-select: all;
}
.daily_container .table .desc.vxe-header--column{
  line-height: 18px;
}
.daily_container .table .header.vxe-header--column{
  line-height: 12px;
}
.daily_container .table .footer .vxe-cell{
  white-space: pre-line;
  font-weight: normal;
}
.daily_container .table .footer.vxe-footer--column{
  line-height: 18px;
}
.daily_container .table .vxe-body--column{
  line-height: 12px;
}

.daily_container .table .mainWarn{
  background: #EA7777;
  color: white;
}
.daily_container .table .warn{
  color: #EA7777;
}
</style>
