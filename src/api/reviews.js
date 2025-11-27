import request from '@/utils/request'

/**
 * 创建评价
 * @param {object} data { orderId, rating, content, isAnonymous }
 */
export function createReview(data) {
  return request({
    url: '/reviews',
    method: 'post',
    data,
  })
}

/**
 * 获取商品评价列表
 * @param {number} productId 商品ID
 * @param {object} params { page, size }
 */
export function getProductReviews(productId, params) {
  return request({
    url: `/reviews/products/${productId}`,
    method: 'get',
    params,
  })
}

/**
 * 获取我的评价
 */
export function getMyReviews() {
  return request({
    url: '/reviews/my',
    method: 'get',
  })
}

/**
 * 卖家回复评价
 * @param {number} reviewId 评价ID
 * @param {string} replyContent 回复内容
 */
export function replyReview(reviewId, replyContent) {
  return request({
    url: `/reviews/${reviewId}/reply`,
    method: 'put',
    data: { replyContent },
  })
}
