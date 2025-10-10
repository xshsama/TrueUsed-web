import router from '@/router'
import axios from 'axios'

// 创建 axios 实例，统一走 /api，交由 Vite 代理到后端
const request = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

// 请求拦截：附加 Authorization 头
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 响应拦截：统一处理 401
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error?.response?.status === 401) {
      // 清空无效 token 并跳转登录
      localStorage.removeItem('token')
      const redirect = router.currentRoute.value.fullPath
      if (router.currentRoute.value.name !== 'Login') {
        router.replace({ name: 'Login', query: { redirect } })
      }
    }
    return Promise.reject(error)
  },
)

export default request
