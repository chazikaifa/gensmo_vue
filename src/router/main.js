import Vue from 'vue'
import Router from 'vue-router'

import Index from '@/components/index.vue'
import Login from '@/components/login.vue'
import Daily from '@/components/daily.vue'
import Add from '@/components/add.vue'
import Search from '@/components/search.vue'
import OrderEdit from '@/components/orderEdit.vue'
import AssessOrderList from '@/components/assessOrderList.vue'
import ReportGenerator from '@/components/reportGenerator.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',   
      name: 'index',
      component: Index,
      meta:{
        keepAlive:false
      }
    },
    {
      path: '/login',   
      name: 'login',
      component: Login,
      meta:{
        keepAlive:false
      }
    },
    {
      path: '/add',   
      name: 'add',
      component: Add,
      meta:{
        keepAlive:false
      }
    },
    {
      path: '/daily',
      name: 'daily',
      component:Daily,
      meta:{
        keepAlive:false
      }
    },
    {
      path: '/orderEdit',
      name: 'orderEdit',
      component:OrderEdit,
      meta:{
        keepAlive:false
      }
    },
    {
      path: '/assessOrderList',
      name: 'assessOrderList',
      component:AssessOrderList,
      meta:{
        keepAlive:false
      }
    },
    {
      path:'/reportGenerator',
      name:'reportGenerator',
      component:ReportGenerator,
      meta:{
        keepAlive:true
      }
    }
  ]
})