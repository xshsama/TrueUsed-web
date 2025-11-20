import request from '@/utils/request'

/**
 * 创建订单
 * @param {number} productId 商品ID
 */
export function createOrder(orderRequest) {
  return request({
    url: '/orders',
    method: 'post',
    data: orderRequest,
  })
}

/**
 * 获取我买到的订单列表
 */
export function getMyOrders() {
  return request({
    url: '/orders/my-orders',
    method: 'get',
  })
}

/**
 * 获取我卖出的订单列表
 */
export function getSoldOrders() {
  return request({
    url: '/orders/sold-orders',
    method: 'get',
  })
}

/**
 * 根据ID获取订单详情
 * @param {number} id 订单ID
 */
export function getOrderById(id) {
  return request({
    url: `/orders/${id}`,
    method: 'get',
  })
}

/**
 * 支付订单
 * @param {number} id 订单ID
 */
export function payOrder(id) {
  return request({
    url: `/orders/${id}/pay`,
    method: 'put',
  })
}

/**
 * 卖家发货
 * @param {number} id 订单ID
 */
export function shipOrder(id) {
  return request({
    url: `/orders/${id}/ship`,
    method: 'put',
  })
}

/**
 * 买家确认收货
 * @param {number} id 订单ID
 */
export function confirmDelivery(id) {
  return request({
    url: `/orders/${id}/confirm-delivery`,
    method: 'put',
  })
}

/**
 * 取消订单
 * @param {number} id 订单ID
 */
export function cancelOrder(id) {
  return request({
    url: `/orders/${id}/cancel`,
    method: 'put',
  })
}

/**
 * 更新订单状态
 * @param {number} id 订单ID
 * @param {string} status 目标状态
 */
export function updateOrderStatus(id, status) {
  return request({
    url: `/orders/${id}/status`,
    method: 'put',
    data: { status },
  })
}
