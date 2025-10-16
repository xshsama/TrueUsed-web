import router from '@/router'
import { useUserStore } from '@/stores/user'
import axios from 'axios'
import { Toast } from 'vant'

// 创建 axios 实例，统一走 /api，交由 Vite 代理到后端
const request = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

// 单独的刷新实例，携带 Cookie（存放 refresh_token）
const refreshClient = axios.create({
  baseURL: '/api',
  timeout: 15000,
  withCredentials: true,
})

// 请求拦截：附加 Authorization 头
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    // 可选：基于后端返回的 expiresInMs 做简单过期判断
    const expAt = parseInt(localStorage.getItem('token_expires_at') || '0', 10)
    if (expAt && Date.now() > expAt) {
      // 过期则清理并避免带上旧 token
      localStorage.removeItem('token')
      localStorage.removeItem('token_expires_at')
    } else if (token) {
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
  async (error) => {
    const original = error?.config
    const status = error?.response?.status
    if (status === 401 && !original?._retry) {
      // 尝试静默刷新一次
      original._retry = true
      try {
        const res = await refreshClient.post('/auth/refresh')
        // 返回结构沿用 LoginResponse：{ token, expiresInMs, username ... }
        if (res?.data?.token) {
          const store = useUserStore()
          store.setToken(res.data.token)
          if (
            typeof res.data.expiresInMs === 'number' &&
            res.data.expiresInMs > 0
          ) {
            localStorage.setItem(
              'token_expires_at',
              String(Date.now() + res.data.expiresInMs),
            )
          }
          // 重新设置头并重试原请求
          original.headers = original.headers || {}
          original.headers.Authorization = `Bearer ${res.data.token}`
          return request(original)
        }
      } catch (e) {
        // ignore -> fallback to logout below
      }
      // 刷新失败：清空并跳转登录
      const store = useUserStore()
      store.logout()
      const redirect = router.currentRoute.value.fullPath
      if (router.currentRoute.value.name !== 'Login') {
        router.replace({ name: 'Login', query: { redirect } })
      }
    }
    // 非 401 的错误，统一弹出提示（可通过 config.silent 抑制）
    try {
      if (!original?.silent) {
        const msg =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          '请求失败，请稍后重试'
        Toast.fail(String(msg))
      }
    } catch {}
    return Promise.reject(error)
  },
)

export default request
