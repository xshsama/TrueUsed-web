import { fetchMe, logoutApi, updateMe } from '@/api/auth'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const persistedUser = (() => {
    try {
      const raw = localStorage.getItem('user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })()

  const user = ref(persistedUser)
  const token = ref(localStorage.getItem('token') || '')
  const isLoggedIn = ref(!!token.value)

  const setUser = (userData) => {
    user.value = userData
    // 持久化用户基本信息，便于刷新后仍可展示
    try {
      localStorage.setItem('user', JSON.stringify(userData))
    } catch {
      // 忽略存储异常
    }
    isLoggedIn.value = true
  }

  const loadMe = async () => {
    const res = await fetchMe()
    setUser(res.data)
    return res.data
  }

  const saveMe = async (payload) => {
    const res = await updateMe(payload)
    setUser(res.data)
    return res.data
  }

  const setToken = (tokenValue) => {
    token.value = tokenValue
    localStorage.setItem('token', tokenValue)
    isLoggedIn.value = true
  }

  const logout = async () => {
    try {
      // 服务端清除 HttpOnly 刷新 Cookie（忽略失败）
      await logoutApi()
    } catch (e) {
      // ignore network/API errors for logout
    }
    user.value = null
    token.value = ''
    isLoggedIn.value = false
    localStorage.removeItem('token')
    localStorage.removeItem('token_expires_at')
    localStorage.removeItem('user')
  }

  return {
    user,
    token,
    isLoggedIn,
    setUser,
    setToken,
    loadMe,
    saveMe,
    logout,
  }
})
