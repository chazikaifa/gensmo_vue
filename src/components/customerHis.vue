<template>
  <div>
    <ve-histogram :data="customerData" :extend="customerExtend" :settings="customerSettings"></ve-histogram>
  </div>
</template>

<script>

//var HOST = "10.117.195.193/gensmo/";
Date.prototype.Format = function(fmt)   
{ //author: meizz   
  var o = {   
    "M+" : this.getMonth()+1,                 //月份   
    "d+" : this.getDate(),                    //日   
    "h+" : this.getHours(),                   //小时   
    "m+" : this.getMinutes(),                 //分   
    "s+" : this.getSeconds(),                 //秒   
    "q+" : Math.floor((this.getMonth()+3)/3), //季度   
    "S"  : this.getMilliseconds()             //毫秒   
  };   
  if(/(y+)/.test(fmt))   
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
  for(var k in o)   
    if(new RegExp("("+ k +")").test(fmt))   
  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
  return fmt;   
}
function myArray(){
    var values = new Array();
    values.push.apply(values, arguments);

    //添加方法
    values.clone = function(){
      let a = [];
      for(let i=0;i<this.length;i++){
        a.push(this[i].clone())
      }
      return a;
    }

    //返回数组
    return values;
}
class Customer{
  constructor(name,sum1=0,sum2=0,sum=0){
    this['客户名称'] = name;
    this['责任故障'] = sum1;
    this['非责任故障'] = sum2;
    this.sum =  sum;
  }
  clone(){
    return new Customer(this['客户名称'],this['责任故障'],this['非责任故障'],this.sum);
  }
  addSum1(){
    this['责任故障'] = this['责任故障']+1;
    this.sum = this.sum+1;
  }
  addSum2(){
    this['非责任故障'] = this['非责任故障']+1;
    this.sum = this.sum+1;
  }
  is(name){
    return this['客户名称'] == name
  }
  isCustomer(c2){
    return this['客户名称'] == c2['客户名称']
  }
  add(c2){
    this['责任故障'] = this['责任故障']+c2['责任故障'];
    this['非责任故障'] = this['非责任故障']+c2['非责任故障'];
    this.sum = this['责任故障']+this['非责任故障']
  }
}
export default {
  name: 'customerHis',
  props:['wywData','localData'],
  watch:{
    wywData(){
      this.rawData = this.wywData;
      this.getCustomer();
      if(this.dataReady && this.dataLocalReady){
        this.dataLocalReady = false;
      }
      this.dataReady = true;
      if(this.dataReady && this.dataLocalReady){
        this.get_union();
      }
    },
    localData(){
      this.rawLocalData = this.localData;
      this.getLocalCustomer();
      if(this.dataReady && this.dataLocalReady){
        this.dataReady = false;
      }
      this.dataLocalReady = true;
      if(this.dataReady && this.dataLocalReady){
        this.get_union();
      }
    }
  },
  data(){
    return{
      customerExtend:{
        title:{
          show:true,
          text:'客户故障量标题'
        },
        xAxis:{
          axisLabel:{
            rotate:-60,
            formatter:function(value){
              let txt = '';
              if(value.length > 8){
                txt = value.substring(0,8)+'...';
              }else{
                txt = value;
              }
              return txt;
            }
          }
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
        length:3,
        flag:0,
        title:['19客户故障量排行','本地客户故障量排行','总体故障量排行'],
        rows:[],
        loading:true,
      },
      customerData:{
        columns:['客户名称','责任故障','非责任故障'],
        rows:[],
      },
      customerSettings:{
        stack:{
          '故障量':['责任故障','非责任故障']
        },
      },
      fullData:[],
      fullLocalData:[],
      dataReady:false,
      dataLocalReady:false,
      rawData:this.data,
      rawLocalData:this.localData,
      sum:0,
      timer:undefined,
      playing:true
    }
  },
  created:function(){
    this.init();
  },
  methods:{
    init:function(){
      console.log('customer init');
      this.timer = setTimeout(this.change,5000);
    },
    getCustomer(){
      let customer = new myArray();
      for(let i in this.rawData){
        if(this.rawData[i].responsible_province != '广州'){
          continue;
        }
        let name = this.rawData[i].name;
        let flag = false;
        for(let j=0;j<customer.length;j++){
          if(customer[j].is(name)){
            if(this.rawData[i].is_assess == '1'){
              customer[j].addSum1();
            }else{
              customer[j].addSum2();
            }
            flag = true;
            break;
          }
        }
        if(!flag){
          let newCustomer = new Customer(name);
          if(this.rawData[i].is_assess == '1'){
            newCustomer.addSum1();
          }else{
            newCustomer.addSum2();
          }
          customer.push(newCustomer);
        }
      }
      customer.sort(function(v1,v2){
        return v1['sum']-v2['sum'];
      })
      this.fullData = customer;
      customer.reverse();
      if(customer.length > 15){
        this.dataArray.rows[0] = customer.slice(0,15);
      }else{
        this.dataArray.rows[0] = customer;
      }     
    },
    getLocalCustomer(){
      let customer = new myArray();
      for(let i in this.rawLocalData){
        let name = this.rawLocalData[i].name;
        let flag = false;
        for(let j=0;j<customer.length;j++){
          if(customer[j].is(name)){
            if(this.rawLocalData[i].is_trouble == '1'){
              customer[j].addSum1();
            }else{
              customer[j].addSum2();
            }
            flag = true;
            break;
          }
        }
        if(!flag){
          let newCustomer = new Customer(name);
          if(this.rawLocalData[i].is_trouble == '1'){
            newCustomer.addSum1();
          }else{
            newCustomer.addSum2();
          }
          customer.push(newCustomer);
        }
      }
      customer.sort(function(v1,v2){
        return v1['sum']-v2['sum'];
      })
      customer.reverse();
      this.fullLocalData = customer;
      if(customer.length > 15){
        this.dataArray.rows[1] = customer.slice(0,15);
      }else{
        this.dataArray.rows[1] = customer;
      }     
    },
    get_union:function(){
      let data = this.customerConcat(this.fullData,this.fullLocalData);
      if(data.length > 15){
        this.dataArray.rows[2] = data.slice(0,15);
      }else{
        this.dataArray.rows[2] = data;
      }
      this.dataArray.loading = false;
      this.customerData.rows = this.dataArray.rows[0];
      this.customerExtend.title = {
        show:true,
        text:this.dataArray.title[0]
      }
    },
    customerConcat:function(c1,c2){
      let result = c1.clone();
      let l = c1.length;
      for(let j=0;j<c2.length;j++){
        let flag = true;
        for(let i=0;i<l && flag;i++){
          if(c1[i].isCustomer(c2[j])){
            result[i].add(c2[j])
            flag = false;
          }
        }
        if(flag){
          result.push(c2[j].clone());
        }
      }
      result.sort(function(v1,v2){
        return v1['sum']-v2['sum'];
      })
      result.reverse();
      return result;
    },
    change:function(){
      if(this.timer != undefined){
        clearTimeout(this.timer)
      }
      if(this.playing){
        this.timer = setTimeout(this.change,5000);
      }
      if(this.dataArray.loading){
        return;
      }
      if(this.dataArray.flag+1 >= this.dataArray.length){
        this.dataArray.flag = 0;
      }else{
        this.dataArray.flag++;
      }
      let i = this.dataArray.flag;
      this.customerData.rows = this.dataArray.rows[i];
      this.customerExtend.title = {
        show:true,
        text:this.dataArray.title[i]
      }
    },
    play:function(){
      if(this.timer != undefined){
        clearTimeout(this.timer);
        this.timer = undefined;
        this.playing = false;
        this.customerExtend.toolbox.feature.myPlay.show = true;
        this.customerExtend.toolbox.feature.myPause.show = false;
      }else{
        this.playing = true;
        this.change();
        this.customerExtend.toolbox.feature.myPlay.show = false;
        this.customerExtend.toolbox.feature.myPause.show = true;
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
