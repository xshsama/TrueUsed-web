import { useUserStore } from '@/stores/user'
import { createRouter, createWebHistory } from 'vue-router'

// 导入页面组件
import About from '@/views/About.vue'
import Address from '@/views/Address.vue'
import AddressEdit from '@/views/AddressEdit.vue'
import Favorites from '@/views/Favorites.vue'
import Feedback from '@/views/Feedback.vue'
import Help from '@/views/Help.vue'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Messages from '@/views/Messages.vue'
import MyProducts from '@/views/MyProducts.vue'
import OrderManage from '@/views/OrderManage.vue'
import Orders from '@/views/Orders.vue'
import Payment from '@/views/Payment.vue'
import PaymentSuccess from '@/views/PaymentSuccess.vue'
import PostCreate from '@/views/PostCreate.vue'
import ProductDetail from '@/views/ProductDetail.vue'
import Profile from '@/views/Profile.vue'
import Register from '@/views/Register.vue'
import Search from '@/views/Search.vue'
import SellerProfile from '@/views/SellerProfile.vue'
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
    path: '/ranking',
    name: 'Ranking',
    component: () => import('@/views/Ranking.vue'),
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: Favorites,
    meta: { requiresAuth: true },
  },
  {
    path: '/post/create',
    name: 'PostCreate',
    component: PostCreate,
    meta: { requiresAuth: true, hideNavbar: true },
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
    component: Messages,
    meta: { requiresAuth: true },
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
    meta: { hideNavbar: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { hideNavbar: true },
  },
  {
    path: '/seller/:id',
    name: 'SellerProfile',
    component: SellerProfile,
    meta: { hideNavbar: true },
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: ProductDetail,
    meta: { hideNavbar: true },
  },
  {
    path: '/search',
    name: 'Search',
    component: Search,
    meta: { hideNavbar: true },
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
    meta: { requiresAuth: true, hideNavbar: true },
  },
  {
    path: '/verification',
    name: 'Verification',
    component: Verification,
    meta: { requiresAuth: true, hideNavbar: true },
  },
  {
    path: '/address-edit/:id?',
    name: 'AddressEdit',
    component: AddressEdit,
    meta: { requiresAuth: true, hideNavbar: true },
  },
  {
    path: '/service',
    name: 'ServiceCenter',
    component: ServiceCenter,
    meta: { requiresAuth: true, hideNavbar: true },
  },
  { path: '/help', name: 'Help', component: Help },
  { path: '/feedback', name: 'Feedback', component: Feedback },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true, hideNavbar: true },
  },
  { path: '/about', name: 'About', component: About },
  {
    path: '/my-products',
    name: 'MyProducts',
    component: MyProducts,
    meta: { requiresAuth: true, hideNavbar: true },
  },
  {
    path: '/sold-products',
    name: 'SoldProducts',
    component: SoldProducts,
    meta: { requiresAuth: true, hideNavbar: true },
  },
  {
    path: '/order/:id',
    name: 'OrderDetail',
    component: () => import('@/views/OrderDetail.vue'),
    meta: { requiresAuth: true, hideNavbar: true },
  },
  {
    path: '/order-manage',
    name: 'OrderManage',
    component: OrderManage,
    meta: { requiresAuth: true, hideNavbar: true },
  },
  {
    path: '/settlement',
    name: 'Settlement',
    component: Settlement,
    meta: { requiresAuth: true, hideNavbar: true },
  },
  {
    path: '/service-messages',
    name: 'ServiceMessages',
    component: ServiceMessages,
    meta: { requiresAuth: true, hideNavbar: true },
  },
  {
    path: '/payment/success',
    name: 'PaymentSuccess',
    component: PaymentSuccess,
    meta: { requiresAuth: true, hideNavbar: true },
  },
  {
    path: '/payment/:id',
    name: 'Payment',
    component: Payment,
    meta: { requiresAuth: true, hideNavbar: true },
  },
  {
    path: '/order/:id/refund-apply',
    name: 'RefundApply',
    component: () => import('@/views/RefundApply.vue'),
    meta: { requiresAuth: true, hideNavbar: true },
  },
  {
    path: '/order/:id/refund-detail',
    name: 'RefundDetail',
    component: () => import('@/views/RefundDetail.vue'),
    meta: { requiresAuth: true, hideNavbar: true },
  },
  {
    path: '/review/create',
    name: 'ReviewCreate',
    component: () => import('@/views/ReviewCreate.vue'),
    meta: { requiresAuth: true, hideNavbar: true },
  },
  {
    path: '/my-reviews',
    name: 'MyReviews',
    component: () => import('@/views/MyReviews.vue'),
    meta: { requiresAuth: true, hideNavbar: true },
  },
  {
    path: '/history',
    name: 'BrowsingHistory',
    component: () => import('@/views/BrowsingHistory.vue'),
    meta: { requiresAuth: true, hideNavbar: true },
  },
  {
    path: '/notifications',
    name: 'SystemNotifications',
    component: () => import('@/views/SystemNotifications.vue'),
    meta: { requiresAuth: true, hideNavbar: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 根据路由meta设置body class
  if (to.meta.hideNavbar) {
    document.body.classList.add('hide-navbar')
  } else {
    document.body.classList.remove('hide-navbar')
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
