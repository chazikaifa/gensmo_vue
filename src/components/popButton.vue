<template>
  <el-button
    class="pop_btn"
    :type="type" 
    :icon="icon"
    :circle="!hover"
    :round="hover"
    @mouseover.native="hoverIn"
    @mouseleave.native="hoverOut"
    >
    {{show_text}}
  </el-button>
</template>

<script>

export default {
  name: 'pop-button',
  props: ['type','text','icon'],
  data() {
    return {
      hover:false,
      show_text:'',
      hover_timer:undefined
    }
  },
  created: function() {
    
  },
  methods: {
    hoverIn:function(){
      let self = this;
      this.hover = true;
      if(this.hover_timer){
        clearTimeout(this.hover_timer);
      }
      this.hover_timer = setTimeout(function(){
        self.show_text = self.text;
        self.hover_timer = undefined;
      },250)
    },
    hoverOut:function(){
      this.hover = false;
      this.show_text = '';
      if(this.hover_timer){
        clearTimeout(this.hover_timer)
        this.hover_timer = undefined;
      }
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.pop_btn{
  transition: all .5s
}
</style>
