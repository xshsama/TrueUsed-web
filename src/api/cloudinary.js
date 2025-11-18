import request from '@/utils/request'

/**
 * 获取 Cloudinary 上传签名
 * @returns {Promise<object>}
 */
export function getCloudinarySignature() {
  return request({
    url: '/api/cloudinary/signature',
    method: 'get',
  })
}
