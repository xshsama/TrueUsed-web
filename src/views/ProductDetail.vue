<template>
    <div class="product-detail-page">
        <van-nav-bar title="商品详情" left-arrow @click-left="$router.go(-1)" />

        <div class="product-content">
            <!-- 商品图片 -->
            <van-swipe class="product-swipe" indicator-color="white">
                <van-swipe-item v-for="(image, index) in productImages" :key="index">
                    <van-image :src="image" fit="cover" @click="previewImages(index)" />
                </van-swipe-item>
            </van-swipe>

            <!-- 商品信息 -->
            <div class="product-info">
                <div class="product-price">¥{{ productInfo.price }}</div>
                <div class="product-title">{{ productInfo.title }}</div>
                <div class="product-meta">
                    <span class="product-views">{{ productInfo.viewsCount }}人看过</span>
                    <span class="product-time">{{ productInfo.createdAt && (new
                        Date(productInfo.createdAt)).toLocaleString() }}</span>
                </div>
            </div>

            <!-- 卖家信息 -->
            <div class="seller-info" @click="goToSellerProfile">
                <van-image :src="sellerInfo.avatar" class="seller-avatar" round fit="cover" />
                <div class="seller-content">
                    <div class="seller-name">{{ sellerInfo.name }}</div>
                    <div class="seller-desc">信用: {{ sellerInfo.credit }}分</div>
                </div>
                <van-button size="small" type="primary" plain>查看主页</van-button>
            </div>

            <!-- 商品详情 -->
            <div class="product-detail">
                <div class="detail-title">商品详情</div>
                <div class="detail-content">
                    {{ productInfo.description }}
                </div>
            </div>
        </div>

        <!-- 底部操作栏 -->
        <div class="action-bar">
            <van-button icon="star-o" plain @click="toggleFavorite" :type="isFavorited ? 'primary' : 'default'">
                {{ isFavorited ? '已收藏' : '收藏' }}
            </van-button>
            <van-button type="warning" @click="contactSeller">立即沟通</van-button>
        </div>
    </div>
</template>

<script>
import { addFavorite, removeFavorite } from '@/api/favorites'
import { getProduct } from '@/api/products'
import { ImagePreview, Toast } from 'vant'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
    name: 'ProductDetail',
    setup() {
        const router = useRouter()
        const route = useRoute()

        const isFavorited = ref(false)

        // 商品图片
        const productImages = ref([])

        // 商品信息
        const productInfo = ref({})

        // 卖家信息
        const sellerInfo = ref({
            id: 0,
            name: '卖家',
            avatar: 'https://placehold.co/40x40/4CAF50/ffffff?text=U',
            credit: 95
        })

        // 预览图片
        const previewImages = (startPosition = 0) => {
            ImagePreview({
                images: productImages.value,
                startPosition
            })
        }

        // 切换收藏状态
        const toggleFavorite = async () => {
            const prev = isFavorited.value
            // 乐观更新
            isFavorited.value = !prev
            try {
                if (prev) {
                    await removeFavorite(route.params.id)
                    Toast.success('已取消收藏')
                } else {
                    await addFavorite(route.params.id)
                    Toast.success('已添加到收藏')
                }
            } catch (e) {
                // 回滚
                isFavorited.value = prev
                // 详细错误由拦截器提示，这里避免重复
            }
        }

        // 联系卖家
        const contactSeller = () => {
            router.push(`/messages/chat/${sellerInfo.value.id}`)
        }

        // 查看卖家主页
        const goToSellerProfile = () => {
            Toast('卖家主页功能开发中')
        }

        const loadDetail = async () => {
            try {
                const res = await getProduct(route.params.id)
                productInfo.value = res
                productImages.value = (res.images || []).map((img) => img.url)
                // isFavorited 后端未直接返回，后续可通过单独接口判断；这里默认 false
            } catch (e) {
                Toast.fail('加载失败')
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
            previewImages,
            toggleFavorite,
            contactSeller,
            goToSellerProfile
        }
    }
}
</script>

<style scoped>
.product-detail-page {
    min-height: 100vh;
    background-color: #f7f8fa;
    padding-bottom: 60px;
}

.product-swipe {
    height: 300px;
}

.product-swipe .van-image {
    width: 100%;
    height: 300px;
}

.product-info {
    background: #fff;
    padding: 16px;
    margin-bottom: 8px;
}

.product-price {
    font-size: 24px;
    font-weight: 600;
    color: #ee0a24;
    margin-bottom: 8px;
}

.product-title {
    font-size: 16px;
    font-weight: 500;
    color: #323233;
    line-height: 1.5;
    margin-bottom: 12px;
}

.product-meta {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #969799;
}

.seller-info {
    display: flex;
    align-items: center;
    background: #fff;
    padding: 16px;
    margin-bottom: 8px;
}

.seller-avatar {
    width: 48px;
    height: 48px;
    margin-right: 12px;
}

.seller-content {
    flex: 1;
}

.seller-name {
    font-size: 14px;
    font-weight: 500;
    color: #323233;
    margin-bottom: 4px;
}

.seller-desc {
    font-size: 12px;
    color: #969799;
}

.product-detail {
    background: #fff;
    padding: 16px;
}

.detail-title {
    font-size: 16px;
    font-weight: 500;
    color: #323233;
    margin-bottom: 12px;
}

.detail-content {
    font-size: 14px;
    color: #646566;
    line-height: 1.6;
}

.action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    border-top: 1px solid #ebedf0;
    padding: 8px 16px;
    display: flex;
    gap: 12px;
}

.action-bar .van-button {
    flex: 1;
}
</style>