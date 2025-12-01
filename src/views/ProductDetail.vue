<template>
    <div class="product-detail-page">
        <!-- 顶部导航栏 -->
        <van-nav-bar class="nav-bar" left-arrow @click-left="$router.go(-1)" :border="false">
            <template #right>
                <van-icon name="share-o" size="20" @click="handleShare" />
            </template>
        </van-nav-bar>

        <div class="product-content">
            <!-- 商品图片 / 骨架屏 -->
            <div v-if="loading" class="product-skeleton">
                <van-skeleton animated :row="0" class="image-skeleton" />
                <div class="info-skeleton">
                    <van-skeleton animated :row="3" />
                </div>
            </div>
            <template v-else>
                <div class="swipe-container">
                    <van-swipe v-if="productImages.length" class="product-swipe" :autoplay="5000" indicator-color="#fff"
                        :show-indicators="productImages.length > 1">
                        <van-swipe-item v-for="(image, index) in productImages" :key="index">
                            <van-image :src="image" fit="cover" @click="previewImages(index)" class="swipe-image" />
                        </van-swipe-item>
                    </van-swipe>
                    <van-empty v-else description="暂无图片" class="empty-image" />
                    <!-- 图片计数器 -->
                    <div v-if="productImages.length > 1" class="image-counter">
                        {{ currentImageIndex + 1 }}/{{ productImages.length }}
                    </div>
                </div>

                <!-- 商品信息卡片 -->
                <div class="product-info-card">
                    <div class="price-row">
                        <div class="product-price">
                            <span class="currency">¥</span>
                            <span class="price-value">{{ productInfo.price ?? '-' }}</span>
                        </div>
                        <div class="product-condition" v-if="productInfo.condition">
                            <van-tag type="primary" size="medium">{{ productInfo.condition }}</van-tag>
                        </div>
                    </div>
                    <div class="product-title">{{ productInfo.title || '商品' }}</div>
                    <div class="product-tags" v-if="productInfo.category">
                        <van-tag plain type="primary" size="small">{{ productInfo.category?.name }}</van-tag>
                    </div>
                    <div class="product-meta">
                        <div class="meta-item">
                            <van-icon name="eye-o" />
                            <span>{{ productInfo.viewsCount || 0 }}次浏览</span>
                        </div>
                        <div class="meta-item">
                            <van-icon name="clock-o" />
                            <span>{{ formatTime(productInfo.createdAt) }}</span>
                        </div>
                    </div>
                </div>

                <!-- 卖家信息卡片 -->
                <div class="seller-card" @click="goToSellerProfile">
                    <div class="seller-left">
                        <van-image :src="sellerInfo.avatarUrl || defaultAvatar" class="seller-avatar" round
                            fit="cover" />
                        <div class="seller-info">
                            <div class="seller-name">{{ sellerInfo.name }}</div>
                            <div class="seller-stats">
                                <span class="stat-item">
                                    <van-icon name="goods-collect-o" />
                                    在售 {{ sellerInfo.productCount || 0 }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <van-icon name="arrow" class="arrow-icon" />
                </div>

                <!-- 评价板块 -->
                <div class="review-section">
                    <div class="section-header">
                        <div class="section-title">
                            <span class="title-icon">💬</span>
                            商品评价 ({{ reviewCount }})
                        </div>
                        <div class="more-reviews" v-if="reviewCount > 0" @click="viewAllReviews">
                            查看全部 <van-icon name="arrow" />
                        </div>
                    </div>
                    <div class="review-list" v-if="reviews.length > 0">
                        <div class="review-item" v-for="review in reviews" :key="review.id">
                            <div class="review-user">
                                <van-image :src="review.reviewerAvatar || defaultAvatar" round class="user-avatar"
                                    fit="cover" />
                                <span class="user-name">{{ review.isAnonymous ? '匿名用户' : review.reviewerName }}</span>
                                <van-rate v-model="review.rating" readonly size="12px" color="#ffd21e" void-icon="star"
                                    void-color="#eee" />
                            </div>
                            <div class="review-content">{{ review.content }}</div>
                            <div class="review-time">{{ formatTime(review.createdAt) }}</div>
                            <div class="seller-reply" v-if="review.replyContent">
                                <span class="reply-label">卖家回复：</span>{{ review.replyContent }}
                            </div>
                        </div>
                    </div>
                    <div class="empty-reviews" v-else>
                        暂无评价
                    </div>
                </div>

                <!-- 商品详情 -->
                <div class="detail-section">
                    <div class="section-header">
                        <div class="section-title">
                            <span class="title-icon">📝</span>
                            商品详情
                        </div>
                    </div>
                    <div class="detail-content">
                        <p v-if="productInfo.description">{{ productInfo.description }}</p>
                        <p v-else class="empty-desc">暂无详细描述</p>
                    </div>
                </div>

                <!-- 交易须知 -->
                <div class="notice-section">
                    <div class="section-header">
                        <div class="section-title">
                            <span class="title-icon">💡</span>
                            交易须知
                        </div>
                    </div>
                    <div class="notice-list">
                        <div class="notice-item">
                            <van-icon name="shield-o" class="notice-icon" />
                            <span>平台担保交易，先验货后确认</span>
                        </div>
                        <div class="notice-item">
                            <van-icon name="service-o" class="notice-icon" />
                            <span>有问题请联系客服处理</span>
                        </div>
                        <div class="notice-item">
                            <van-icon name="warning-o" class="notice-icon" />
                            <span>请勿私下交易，谨防诈骗</span>
                        </div>
                    </div>
                </div>
            </template>
        </div>

        <!-- 底部操作栏 -->
        <div class="action-bar" v-if="!loading">
            <div class="action-left">
                <div class="action-item" @click="toggleFavorite">
                    <van-icon :name="isFavorited ? 'star' : 'star-o'" :class="{ 'icon-favorited': isFavorited }" />
                    <span>{{ isFavorited ? '已收藏' : '收藏' }}</span>
                </div>
                <div class="action-item" @click="contactSeller">
                    <van-icon name="chat-o" />
                    <span>聊一聊</span>
                </div>
            </div>
            <div class="action-right">
                <van-button class="buy-btn" type="danger" round @click="handlePurchase">
                    <span class="btn-text">立即购买</span>
                    <span class="btn-price">¥{{ productInfo.price }}</span>
                </van-button>
            </div>
        </div>
    </div>
</template>

<script>
import { createConversation } from '@/api/chat'
import { getProduct } from '@/api/products'
import { getProductReviews } from '@/api/reviews'
import { useAuth } from '@/composables/useAuth'
import { useFavoritesStore } from '@/stores/favorites'
import { ImagePreview, Rate, showFailToast, showSuccessToast, showToast } from 'vant'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
    name: 'ProductDetail',
    components: {
        [Rate.name]: Rate,
    },
    setup() {
        const router = useRouter()
        const route = useRoute()
        const favoritesStore = useFavoritesStore()
        const { requireLogin } = useAuth()

        const isFavorited = ref(false)
        const loading = ref(true)
        const currentImageIndex = ref(0)
        const defaultAvatar = ''

        // 商品图片
        const productImages = ref([])

        // 商品信息
        const productInfo = ref({})

        // 评价信息
        const reviews = ref([])
        const reviewCount = ref(0)

        // 卖家信息
        const sellerInfo = ref({
            id: 0,
            name: '卖家',
            avatarUrl: '',
            productCount: 0,
        })

        // 格式化时间
        const formatTime = (time) => {
            if (!time) return ''
            const date = new Date(time)
            const now = new Date()
            const diff = now - date
            const minutes = Math.floor(diff / 60000)
            const hours = Math.floor(diff / 3600000)
            const days = Math.floor(diff / 86400000)

            if (minutes < 1) return '刚刚'
            if (minutes < 60) return `${minutes}分钟前`
            if (hours < 24) return `${hours}小时前`
            if (days < 7) return `${days}天前`
            return date.toLocaleDateString()
        }

        // 预览图片
        const previewImages = (startPosition = 0) => {
            ImagePreview({
                images: productImages.value,
                startPosition,
                onChange: (index) => {
                    currentImageIndex.value = index
                }
            })
        }

        // 切换收藏状态
        const toggleFavorite = async () => {
            // 检查登录状态
            const loggedIn = await requireLogin({ message: '收藏商品需要登录，是否立即登录？' })
            if (!loggedIn) return

            const productId = Number(route.params.id)
            const prev = isFavorited.value
            // 乐观更新
            isFavorited.value = !prev
            try {
                if (prev) {
                    await favoritesStore.remove(productId)
                    showSuccessToast('已取消收藏')
                } else {
                    await favoritesStore.add(productId)
                    showSuccessToast('已添加到收藏')
                }
            } catch (e) {
                // 回滚
                isFavorited.value = prev
            }
        }

        // 联系卖家
        const contactSeller = async () => {
            // 检查登录状态
            const loggedIn = await requireLogin({ message: '联系卖家需要登录，是否立即登录？' })
            if (!loggedIn) return

            if (!sellerInfo.value.id) {
                showFailToast('卖家信息加载失败')
                return
            }

            try {
                const res = await createConversation(sellerInfo.value.id)
                if (res && res.id) {
                    router.push(`/messages/chat/${res.id}`)
                } else {
                    showFailToast('无法启动会话')
                }
            } catch (e) {
                console.error(e)
                if (e.response && e.response.data && e.response.data.message) {
                    showFailToast(e.response.data.message)
                } else {
                    showFailToast('启动会话失败')
                }
            }
        }

        // 查看卖家主页
        const goToSellerProfile = () => {
            showToast('卖家主页功能开发中')
        }

        // 查看所有评价
        const viewAllReviews = () => {
            showToast('更多评价功能开发中')
        }

        // 分享
        const handleShare = () => {
            showToast('分享功能开发中')
        }

        // 购买商品
        const handlePurchase = async () => {
            // 检查登录状态
            const loggedIn = await requireLogin({ message: '购买商品需要登录，是否立即登录？' })
            if (!loggedIn) return

            router.push({
                name: 'Settlement',
                query: {
                    productId: productInfo.value.id,
                    title: productInfo.value.title,
                    price: productInfo.value.price,
                    image: productImages.value[0] || ''
                }
            });
        }

        const loadDetail = async () => {
            try {
                const productId = Number(route.params.id)
                await favoritesStore.fetchFavorites()
                const res = await getProduct(productId)
                console.log('Product Detail Response:', res) // Debug log
                productInfo.value = res
                productImages.value = (res.images || []).map((img) => img.url)
                isFavorited.value = favoritesStore.isFavorited(productId)

                // 获取评价
                try {
                    const reviewsData = await getProductReviews(productId, { page: 0, size: 3 })
                    reviews.value = reviewsData.content || []
                    reviewCount.value = reviewsData.totalElements || 0
                } catch (e) {
                    console.error('获取评价失败', e)
                }

                // 设置卖家信息
                if (res.seller) {
                    sellerInfo.value = {
                        id: res.seller.id,
                        name: res.seller.username || res.seller.nickname || '卖家',
                        avatarUrl: res.seller.avatarUrl || '',
                        productCount: res.seller.productCount || 0,
                    }
                }
            } catch (e) {
                showFailToast('加载失败')
            } finally {
                loading.value = false
            }
        }

        onMounted(() => {
            loadDetail()
        })

        return {
            productImages,
            productInfo,
            sellerInfo,
            isFavorited,
            loading,
            currentImageIndex,
            defaultAvatar,
            formatTime,
            previewImages,
            toggleFavorite,
            contactSeller,
            goToSellerProfile,
            handleShare,
            handlePurchase,
            reviews,
            reviewCount,
            viewAllReviews
        }
    }
}
</script>

<style scoped>
.product-detail-page {
    min-height: 100vh;
    background: linear-gradient(180deg, #f8f9fa 0%, #f0f2f5 100%);
    padding-bottom: 80px;
}

/* 导航栏 */
.nav-bar {
    background: transparent;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
}

.nav-bar :deep(.van-nav-bar__content) {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
}

/* 骨架屏 */
.product-skeleton {
    background: #fff;
}

.image-skeleton {
    height: 320px;
    background: #f5f5f5;
}

.info-skeleton {
    padding: 16px;
}

/* 图片轮播区域 */
.swipe-container {
    position: relative;
    background: #f8f9fa;
    margin: 0 12px;
    margin-top: 56px;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.product-swipe {
    height: 300px;
    border-radius: 16px;
}

.swipe-image {
    width: 100%;
    height: 300px;
    border-radius: 16px;
}

.swipe-image :deep(.van-image__img) {
    border-radius: 16px;
}

.empty-image {
    height: 300px;
    background: #f5f5f5;
    border-radius: 16px;
}

.image-counter {
    position: absolute;
    bottom: 16px;
    right: 16px;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    font-size: 12px;
    padding: 4px 10px;
    border-radius: 12px;
    backdrop-filter: blur(4px);
}

/* 商品信息卡片 */
.product-info-card {
    background: #fff;
    margin: 12px;
    border-radius: 16px;
    padding: 20px;
    position: relative;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.product-price {
    color: #ee0a24;
    font-weight: 700;
}

.product-price .currency {
    font-size: 16px;
}

.product-price .price-value {
    font-size: 28px;
    letter-spacing: -1px;
}

.product-condition :deep(.van-tag) {
    padding: 4px 10px;
    border-radius: 8px;
}

.product-title {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    line-height: 1.5;
    margin-bottom: 12px;
}

.product-tags {
    margin-bottom: 16px;
}

.product-tags :deep(.van-tag) {
    margin-right: 8px;
    border-radius: 6px;
}

.product-meta {
    display: flex;
    gap: 20px;
    padding-top: 12px;
    border-top: 1px solid #f5f5f5;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #999;
}

.meta-item .van-icon {
    font-size: 14px;
}

/* 卖家卡片 */
.seller-card {
    background: #fff;
    margin: 0 12px 12px;
    border-radius: 16px;
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

.seller-card:active {
    transform: scale(0.98);
}

/* 评价板块 */
.review-section {
    background: #fff;
    margin: 0 12px 12px;
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.more-reviews {
    font-size: 12px;
    color: #999;
    display: flex;
    align-items: center;
    margin-left: auto;
}

.review-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.review-item {
    border-bottom: 1px solid #f5f5f5;
    padding-bottom: 12px;
}

.review-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
}

.review-user {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
}

.user-avatar {
    width: 24px;
    height: 24px;
}

.user-name {
    font-size: 13px;
    color: #333;
    margin-right: auto;
}

.review-content {
    font-size: 14px;
    color: #333;
    line-height: 1.5;
    margin-bottom: 6px;
}

.review-time {
    font-size: 11px;
    color: #999;
}

.seller-reply {
    margin-top: 8px;
    background: #f8f9fa;
    padding: 8px;
    border-radius: 4px;
    font-size: 12px;
    color: #666;
    line-height: 1.4;
}

.reply-label {
    color: #ee0a24;
    font-weight: 500;
}

.empty-reviews {
    text-align: center;
    color: #999;
    font-size: 13px;
    padding: 20px 0;
}

.seller-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.seller-avatar {
    width: 48px;
    height: 48px;
    border: 2px solid #f0f0f0;
}

.seller-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.seller-name {
    font-size: 15px;
    font-weight: 600;
    color: #1a1a1a;
}

.seller-stats {
    display: flex;
    gap: 12px;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #999;
}

.stat-item .van-icon {
    font-size: 12px;
}

.arrow-icon {
    color: #c8c9cc;
    font-size: 16px;
}

/* 详情区块 */
.detail-section,
.notice-section {
    background: #fff;
    margin: 0 12px 12px;
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.section-header {
    margin-bottom: 12px;
}

.section-title {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
    display: flex;
    align-items: center;
    gap: 6px;
}

.title-icon {
    font-size: 18px;
}

.detail-content {
    font-size: 14px;
    color: #4a4a4a;
    line-height: 1.8;
    white-space: pre-wrap;
    word-break: break-word;
}

.detail-content p {
    margin: 0;
}

.empty-desc {
    color: #999;
    font-style: italic;
}

/* 交易须知 */
.notice-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.notice-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: #666;
}

.notice-icon {
    font-size: 16px;
    color: #07c160;
}

/* 底部操作栏 */
.action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    padding: 10px 16px;
    padding-bottom: calc(10px + env(safe-area-inset-bottom));
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
    z-index: 100;
}

.action-left {
    display: flex;
    gap: 24px;
}

.action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    font-size: 11px;
    color: #666;
    cursor: pointer;
    transition: color 0.2s;
}

.action-item:active {
    color: #ee0a24;
}

.action-item .van-icon {
    font-size: 22px;
    transition: transform 0.2s;
}

.action-item:active .van-icon {
    transform: scale(1.15);
}

.icon-favorited {
    color: #ee0a24 !important;
}

.action-right {
    flex: 1;
    display: flex;
    justify-content: flex-end;
}

.buy-btn {
    min-width: 140px;
    height: 44px;
    font-size: 15px;
    font-weight: 600;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 24px;
    background: linear-gradient(135deg, #ff6b6b 0%, #ee0a24 100%);
    border: none;
}

.buy-btn .btn-text {
    font-size: 14px;
    line-height: 1.2;
}

.buy-btn .btn-price {
    font-size: 11px;
    opacity: 0.9;
    line-height: 1.2;
}
</style>