import request from '@/utils/request'

/**
 * 创建订单
 * @param {number} productId 商品ID
 */
export function createOrder(productId) {
  return request({
    url: '/api/orders',
    method: 'post',
    data: { productId },
  })
}

/**
 * 获取我买到的订单列表
 */
export function getMyOrders() {
  return request({
    url: '/api/orders/my-orders',
    method: 'get',
  })
}

/**
 * 获取我卖出的订单列表
 */
export function getSoldOrders() {
  return request({
    url: '/api/orders/sold-orders',
    method: 'get',
  })
}

/**
 * 根据ID获取订单详情
 * @param {number} id 订单ID
 */
export function getOrderById(id) {
  return request({
    url: `/api/orders/${id}`,
    method: 'get',
  })
}

/**
 * 更新订单状态
 * @param {number} id 订单ID
 * @param {string} status 新状态
 */
export function updateOrderStatus(id, status) {
  return request({
    url: `/api/orders/${id}/status`,
    method: 'put',
    params: { status },
  })
}
