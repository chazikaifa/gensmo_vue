<template>
  <div>
    <ve-histogram element-loading-background="#222933" v-loading="loading" :data="showData" :extend="extend" :settings="settings"></ve-histogram>
  </div>
</template>

<script>

export default {
  name: 'orderCompare',
  props: ['now'],
  watch: {
    now:{
      // immediate:true,
      handler(newVal,oldVal){
        this.getData(newVal);
      }
    }
  },
  data(){
    return{
      token:'',
      canDo:{},
      doList:['getAssessOrder'],
      extend:{
        title:{
          show:true,
          text:'所有故障量同比'
        },
        series:{
          smooth:false
        },
        legend:{
          bottom:'5%'
        },
        yAxis:function(item){
          item[1].splitLine = {
            show:false
          }
          return item;
        },
        toolbox:{
          show:true,
          feature:{
            myPause:{
              show:true,
              title:'暂停轮播',
              icon:'path://M341.333333 113.777778a28.444444 28.444444 0 0 1 28.444445 28.444444v739.555556a28.444444 28.444444 0 0 1-56.888889 0V142.222222a28.444444 28.444444 0 0 1 28.444444-28.444444z m341.333334 0a28.444444 28.444444 0 0 1 28.444444 28.444444v739.555556a28.444444 28.444444 0 0 1-56.888889 0V142.222222a28.444444 28.444444 0 0 1 28.444445-28.444444z',
              onclick:this.play
            },
            myPlay:{
              show:false,
              title:'继续轮播',
              icon:'path://M221.790362 1014.94374c-36.775578 0-68.472488-13.843286-91.662653-40.033785-23.130813-26.121937-35.868929-63.466474-35.868928-105.155968V154.424068c0-41.691541 12.739139-79.041194 35.869952-105.169271 23.193235-26.197662 54.889121-40.044018 91.662652-40.044018 27.752064 0 56.166207 8.159844 84.451414 24.25338l570.119699 358.735338 0.153496 0.088004c50.086745 28.728298 78.901001 72.395844 79.053474 119.806643 0 48.284703-28.559453 91.193978-80.418564 120.835066l-0.163729 0.093121L308.632219 989.273081C278.266631 1006.546489 249.860674 1014.94374 221.790362 1014.94374zM221.790362 63.144132c-44.709271 0-73.598228 35.82902-73.598228 91.279936v715.330942c0 55.43659 28.888957 91.2564 73.598228 91.2564 18.275225 0 38.137599-6.03239 59.034535-17.929348l0.165775-0.095167 566.30993-356.24154c35.544541-20.447704 54.333466-46.232974 54.333466-74.56423-0.105401-37.916565-32.837896-62.23953-52.339042-73.362868l-1.198292-0.713244L278.571576 79.725786l-0.169868-0.096191C259.408121 68.843948 239.833297 63.144132 221.790362 63.144132z',
              onclick:this.play
            },
            myChange:{
              show:true,
              title:'切换维度',
              icon:'path://M480 32a32 32 0 0 0 32 32c119.664 0 232.16 46.608 316.768 131.232C913.392 279.84 960 392.336 960 512c0 118.096-45.472 229.168-128 313.392V736a32 32 0 0 0-64 0v192h192a32 32 0 0 0 0-64h-76.416C974.16 768.512 1024 644.112 1024 512c0-136.752-53.264-265.328-149.984-362.032C777.328 53.264 648.752 0 512 0a32 32 0 0 0-32 32zM149.984 874.032C246.672 970.736 375.248 1024 512 1024a32 32 0 0 0 0-64c-119.664 0-232.16-46.608-316.768-131.232C110.608 744.16 64 631.664 64 512c0-118.096 45.472-229.168 128-313.392V288a32 32 0 0 0 64 0V96H64a32 32 0 0 0 0 64h76.416C49.84 255.488 0 379.888 0 512c0 136.752 53.264 265.328 149.984 362.032z',
              onclick:this.change
            },
            saveAsImage:{
              show:true
            }
          }
        }
      },
      dataArray:{
        length:4,
        flag:0,
        title:['所有故障量同比','责任故障量同比','所有故障量环比','责任故障量环比'],
        columns:[['时间','去年故障量','故障量','同比'],['时间','去年故障量','故障量','同比'],['时间','故障量','环比'],['时间','故障量','环比']],
        rows:[],
      },
      showData:{
        columns:['时间','去年故障量','故障量','同比'],
        rows:[],
      },
      settings:{
        showLine:['同比','环比'],
        yAxisType:['value','percent'],
        axisSite:{right:['环比','同比']}
      },
      rawData:[],
      rawDataLast:[],
      currentMonth:-1,
      ready:0,
      loading:true,
      timer:undefined,
      playing:true,
    }
  },
  created:function(){
    let self = this;
    this.token = this.$cookies.get('user_token');
    this.assess_query(this.doList).then(function(){
      if(self.canDo.getAssessOrder){
        self.init();
      }else{
        self.$message.error('[orderCompare]:没有接口权限！')
      }
    })
  },
  methods:{
    init:function(){
      this.getData(new Date());
    },
    getData:function(now){
      let self = this;
      this.ready = 0;
      self.rawData = [];
      self.rawDataLast = [];
      self.loading = true;
      if(this.timer){
        clearTimeout(this.timer);
        this.timer = undefined;
      }
      let end = new Date(now);
      end.setDate(end.getDate()-1);
      end.setHours(23);
      end.setMinutes(59);
      end.setSeconds(59);
      this.currentMonth = end.getMonth();
      
      let start = new Date(end);
      start.setDate(1);
      start.setMonth(0);
      start.setHours(0);
      start.setMinutes(0);
      start.setSeconds(0);

      for(let i=0;i<=this.currentMonth;i++){
        let current = new Date(start);
        current.setMonth(i);
        let next = this.getEnd(end,i);
        this.getOrder(current.Format('yyyy-MM-dd hh:mm:ss'),next.Format('yyyy-MM-dd hh:mm:ss'),function(res){
          if(res.data.status == 'success'){
            self.rawData[i] = {
              sum:res.data.sum,
              data:res.data.result
            }
            self.ready++;
            if(self.ready >= self.currentMonth+13){
              self.get_union();
            }
          }else{
            self.$message.error("[orderCompare]Error:"+res.data.errMsg);
          }
        })
      }

      let lastStart = new Date(start);
      lastStart.setFullYear(lastStart.getFullYear()-1);
      let lastEnd = new Date(end);
      lastEnd.setFullYear(lastEnd.getFullYear()-1);
      for(let i=0;i<12;i++){
        let current = new Date(lastStart);
        current.setMonth(i);
        let next = this.getEnd(lastEnd,i);
        this.getOrder(current.Format('yyyy-MM-dd hh:mm:ss'),next.Format('yyyy-MM-dd hh:mm:ss'),function(res){
          if(res.data.status == 'success'){
            self.rawDataLast[i] = {
              sum:res.data.sum,
              data:res.data.result
            }
            self.ready++;
            if(self.ready >= self.currentMonth+13){
              self.get_union();
            }
          }else{
            self.$message.error("[orderCompare]Error:"+res.data.errMsg);
          }
        })
      }
    },
    getEnd:function(now,i){
      let end = new Date(now);
      let day = end.getDate();
      if(day < 29){
        end.setMonth(i);
        return end;
      }
      let year = end.getFullYear();
      let leap = false
      if(year % 400 == 0 || year % 4 == 0 && year % 100 != 0){
        leap = true;
      }
      switch(i){
        case 0:
        case 2:
        case 4:
        case 6:
        case 7:
        case 9:
        case 11:
          end.setMonth(i);
          return end;
        case 1:
          if(leap && day == 29){
            end.setMonth(i);
          }else{
            end.setDate(28);
            end.setMonth(i);
          }
          return end
        case 3:
        case 5:
        case 8:
        case 10:
          if(day < 31){
            end.setMonth(i);
          }else{
            end.setDate(30);
            end.setMonth(i);
          }
          return end;
      }
    },
    getOrder:function(start,end,cb){
      let self = this;
      let data = new FormData();
      data.append('START',start);
      data.append('END',end);
      data.append('province','广东省广州市');
      data.append('token',self.token);
      this.axios
        .post('http://'+self.$global_msg.HOST+'scripts/assess_order/get_gz_order_by_datetime.php',data)
        .then(function(res){
          // console.log(res);
          cb(res)
        })
        .catch(function(err){
          self.$message.error("[orderCompare]Network Error:"+err);
        });
    },
    get_union:function(){
      for(let i=0;i<=this.currentMonth;i++){
        let list = this.rawData[i].data;
        let sum = 0;
        for(let n in list){
          if(list[n].responsible_province == '广州' && list[n].is_assess == '1'){
            sum++;
          }
        }
        this.rawData[i].reSum = sum;
      }
      for(let i=0;i<=this.currentMonth;i++){
        let list = this.rawDataLast[i].data;
        let sum = 0;
        for(let n in list){
          if(list[n].responsible_province == '广州' && list[n].is_assess == '1'){
            sum++;
          }
        }
        this.rawDataLast[i].reSum = sum;
      }
      this.dataArray.rows = [[],[],[],[]];
      for(let i=0;i<=this.currentMonth;i++){
        let cur = this.rawData[i].sum;
        let last = this.rawDataLast[i].sum;
        let rate = ((cur-last)/last).toFixed(4);
        rate = rate=='NaN'?0.00:rate;
        this.dataArray.rows[0][i] = {'时间':(i+1)+'月','去年故障量':last,'故障量':cur,'同比':rate};

        let reCur = this.rawData[i].reSum;
        let reLast = this.rawDataLast[i].reSum;
        let reRate = ((reCur-reLast)/reLast).toFixed(4);
        reRate = reRate=='NaN'?0.00:reRate;
        this.dataArray.rows[1][i] = {'时间':(i+1)+'月','去年故障量':reLast,'故障量':reCur,'同比':reRate};

        let sumRate;
        let reSumRate;
        if(i == 0){
          sumRate = ((this.rawData[i].sum - this.rawDataLast[11].sum)/this.rawDataLast[11].sum).toFixed(4);
          reSumRate = ((this.rawData[i].reSum - this.rawDataLast[11].reSum)/this.rawDataLast[11].reSum).toFixed(4);
        }else{
          sumRate = ((this.rawData[i].sum - this.rawData[i-1].sum)/this.rawData[i-1].sum).toFixed(4);
          reSumRate = ((this.rawData[i].reSum - this.rawData[i-1].reSum)/this.rawData[i-1].reSum).toFixed(4);
        }
        sumRate = sumRate=='NaN'?0.00:sumRate;
        reSumRate = reSumRate=='NaN'?0.00:reSumRate;
        this.dataArray.rows[2][i] = {'时间':(i+1)+'月','故障量':this.rawData[i].sum,'环比':sumRate};
        this.dataArray.rows[3][i] = {'时间':(i+1)+'月','故障量':this.rawData[i].reSum,'环比':reSumRate};
      }
      this.loading = false;
      this.showData.rows = this.dataArray.rows[0];
      this.timer = setTimeout(this.change,5000);
    },
    change:function(){
      if(this.timer != undefined){
        clearTimeout(this.timer)
      }
      if(this.playing){
        this.timer = setTimeout(this.change,5000);
      }
      if(this.loading){
        return;
      }
      if(this.dataArray.flag + 1 >= this.dataArray.length){
        this.dataArray.flag = 0;
      }else{
        this.dataArray.flag++;
      }
      let i = this.dataArray.flag;
      this.showData.rows = this.dataArray.rows[i];
      this.showData.columns = this.dataArray.columns[i];
      this.extend.title = {
        show:true,
        text:this.dataArray.title[i]
      }
    },
    play:function(){
      if(this.timer != undefined){
        clearTimeout(this.timer);
        this.timer = undefined;
        this.playing = false;
        this.extend.toolbox.feature.myPlay.show = true;
        this.extend.toolbox.feature.myPause.show = false;
      }else{
        this.playing = true;
        this.change();
        this.extend.toolbox.feature.myPlay.show = false;
        this.extend.toolbox.feature.myPause.show = true;
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
</style>
