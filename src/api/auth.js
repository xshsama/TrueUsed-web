import request from '@/utils/request'

export function loginApi(data) {
  // 后端登录路径为 /auth/login，这里通过 Vite 代理前缀 /api 调用
  return request.post('/auth/login', data)
}

export function registerApi(data) {
  return request.post('/auth/register', data)
}

export function logoutApi() {
  // 调用后端登出以清除 HttpOnly 刷新 Cookie
  return request.post('/auth/logout')
}
