import Vue from 'vue'
import App from './App.vue'
import VCharts from 'v-charts'
import router from './router/main.js'
import axios from 'axios'
import VueAxios from 'vue-axios'
import XEUtils from 'xe-utils'
import VXEUtils from 'vxe-utils'
import VXETable from 'vxe-table'
import ElementUI from 'element-ui'
import VueCookies from 'vue-cookies'
import 'element-ui/lib/theme-chalk/index.css'
import 'vxe-table/lib/index.css'

import global_msg from './global.js'
Vue.prototype.$global_msg = global_msg

Vue.config.productionTip = false
Vue.use(VueAxios,axios)
Vue.use(VCharts)
Vue.use(VXETable)
Vue.use(VXEUtils, XEUtils)
Vue.use(ElementUI)
Vue.use(VueCookies)

Vue.prototype.$setgoindex = function () {
  if (window.history.length <= 1) {
    if (location.href.indexOf('?') === -1) {
      window.location.href = location.href + '?goindex=true'
    } else if (location.href.indexOf('?') !== -1 && location.href.indexOf('goindex') === -1) {
      window.location.href = location.href + '&goindex=true'
    }
  }
}

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

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
