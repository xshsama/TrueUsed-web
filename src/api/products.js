import request from '@/utils/request'

// 列表查询：支持 q, categoryId, priceMin, priceMax, sort, page, size
export function listProducts(params = {}) {
  return request({
    url: '/products',
    method: 'get',
    params,
  })
}

// 详情
export function getProduct(id) {
  return request({ url: `/products/${id}`, method: 'get' })
}

// 创建
export function createProduct(payload) {
  return request({ url: '/products', method: 'post', data: payload })
}

// 更新
export function updateProduct(id, payload) {
  return request({ url: `/products/${id}`, method: 'put', data: payload })
}

// 删除
export function deleteProduct(id) {
  return request({ url: `/products/${id}`, method: 'delete' })
}
