import { useUserStore } from '@/stores/user'
import { createRouter, createWebHistory } from 'vue-router'

// 导入页面组件
import About from '@/views/About.vue'
import Address from '@/views/Address.vue'
import Favorites from '@/views/Favorites.vue'
import Feedback from '@/views/Feedback.vue'
import Help from '@/views/Help.vue'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import MessageChat from '@/views/MessageChat.vue'
import Messages from '@/views/Messages.vue'
import MyProducts from '@/views/MyProducts.vue'
import OrderManage from '@/views/OrderManage.vue'
import Orders from '@/views/Orders.vue'
import Post from '@/views/Post.vue'
import PostCreate from '@/views/PostCreate.vue'
import PostManage from '@/views/PostManage.vue'
import ProductDetail from '@/views/ProductDetail.vue'
import ProductManageCenter from '@/views/ProductManageCenter.vue'
import Profile from '@/views/Profile.vue'
import Register from '@/views/Register.vue'
import Search from '@/views/Search.vue'
import ServiceCenter from '@/views/ServiceCenter.vue'
import ServiceMessages from '@/views/ServiceMessages.vue'
import Settings from '@/views/Settings.vue'
import Settlement from '@/views/Settlement.vue'
import SoldProducts from '@/views/SoldProducts.vue'
import Verification from '@/views/Verification.vue'

const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: Favorites,
    meta: { requiresAuth: true },
  },
  {
    path: '/post',
    name: 'Post',
    component: Post,
    meta: { requiresAuth: true },
  },
  {
    path: '/post/create',
    name: 'PostCreate',
    component: PostCreate,
    meta: { requiresAuth: true, hideTabbar: true },
  },
  {
    path: '/post/manage',
    name: 'PostManage',
    component: PostManage,
    meta: { requiresAuth: true, hideTabbar: true },
  },
  {
    path: '/messages',
    name: 'Messages',
    component: Messages,
    meta: { requiresAuth: true },
  },
  {
    path: '/messages/chat/:id',
    name: 'MessageChat',
    component: MessageChat,
    meta: { requiresAuth: true, hideTabbar: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { hideTabbar: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { hideTabbar: true },
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: ProductDetail,
    meta: { hideTabbar: true },
  },
  {
    path: '/search',
    name: 'Search',
    component: Search,
    meta: { hideTabbar: true },
  },
  {
    path: '/orders',
    name: 'Orders',
    component: Orders,
    meta: { requiresAuth: true },
  },
  {
    path: '/address',
    name: 'Address',
    component: Address,
    meta: { requiresAuth: true },
  },
  {
    path: '/verification',
    name: 'Verification',
    component: Verification,
    meta: { requiresAuth: true },
  },
  {
    path: '/service',
    name: 'ServiceCenter',
    component: ServiceCenter,
    meta: { requiresAuth: true },
  },
  { path: '/help', name: 'Help', component: Help },
  { path: '/feedback', name: 'Feedback', component: Feedback },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true },
  },
  { path: '/about', name: 'About', component: About },
  {
    path: '/my-products',
    name: 'MyProducts',
    component: MyProducts,
    meta: { requiresAuth: true },
  },
  {
    path: '/sold-products',
    name: 'SoldProducts',
    component: SoldProducts,
    meta: { requiresAuth: true },
  },
  {
    path: '/product-manage',
    name: 'ProductManageCenter',
    component: ProductManageCenter,
    meta: { requiresAuth: true },
  },
  {
    path: '/order-manage',
    name: 'OrderManage',
    component: OrderManage,
    meta: { requiresAuth: true },
  },
  {
    path: '/settlement',
    name: 'Settlement',
    component: Settlement,
    meta: { requiresAuth: true },
  },
  {
    path: '/service-messages',
    name: 'ServiceMessages',
    component: ServiceMessages,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 根据路由meta设置body class
  if (to.meta.hideTabbar) {
    document.body.classList.add('hide-tabbar')
  } else {
    document.body.classList.remove('hide-tabbar')
  }

  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    // pinia 可能尚未初始化，这里兜底读取 localStorage
    const store = useUserStore()
    const hasToken = store?.token || localStorage.getItem('token')
    if (!hasToken) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }
  }

  next()
})

export default router
