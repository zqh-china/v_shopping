import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  // 根地址重定向到登录页面
  {
    path: '/',
    redirect: '/login'
  },
  // 登录组件
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView')
  },
  // 主页组件
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/HomeView')
  }
]

const router = new VueRouter({
  routes
})

// 路由导航守卫
router.beforeEach((to, from, next) => {
  // 如果用户访问的是登录页面，直接放行
  if (to.path === '/login') return next()
  // 从sessionStorage中获取保存的token值
  const tokenStr = window.sessionStorage.getItem('token')
  // 没有token，强制跳转到登录页面
  if (!tokenStr) return next('/login')
  next()
})

export default router
