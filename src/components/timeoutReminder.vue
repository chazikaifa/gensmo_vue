<template>
  <div>
    <el-input 
      ref="text"
      v-if="rate>0.75"
      type="textarea" 
      class="reminder_container" 
      v-model="show_text" 
      autosize
      disabled
      resize="none"
      ></el-input>
  </div>
</template>

<script>

export default {
  name: 'timeoutReminder',
  props: ['rate'],
  data() {
    return {
      text:[
        '工单即将超时，请值班同事完成以下工作：\r\n'+
        '1、电话通知代维与客户沟通协调，能否以客户理由先挂起工单\r\n'+
        '2、升级给处理故障的代维主管\r\n'+
        '3、升及给网络经理\r\n'+
        '4、故障所属专业的主管及科室主任\r\n'+
        '5、升级给带班负责人',
        '工单已超时，请值班同事通知代维尽量协调以客户理由回单。'
      ],
      show_text:'',
    }
  },
  created: function() {
    
  },
  watch:{
    rate:{
      handler(newV,oldV){
        console.log(newV)
        if(newV > 1){
          this.show_text = this.text[1];
        }else if(newV > 0.75){
          this.show_text =  this.text[0];
        }
        let self = this;
        this.$nextTick(function(){
          self.$refs.text.resizeTextarea();
        })
      },
      deep:true
    }
  },
  methods: {
    
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.reminder_container{
  width: 300px;
  font-size: 16px;
  user-select: none;
}
</style>
