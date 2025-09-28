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
                    <span class="product-views">{{ productInfo.views }}人看过</span>
                    <span class="product-time">{{ productInfo.publishTime }}</span>
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
import { ImagePreview, Toast } from 'vant'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
    name: 'ProductDetail',
    setup() {
        const router = useRouter()
        const route = useRoute()

        const isFavorited = ref(false)

        // 商品图片
        const productImages = ref([
            'https://via.placeholder.com/375x300/333333/ffffff?text=iPhone+14+1',
            'https://via.placeholder.com/375x300/666666/ffffff?text=iPhone+14+2',
            'https://via.placeholder.com/375x300/999999/ffffff?text=iPhone+14+3'
        ])

        // 商品信息
        const productInfo = ref({
            id: route.params.id,
            title: 'iPhone 14 Pro 256GB 深空黑色，9成新，原装正品',
            price: '6888',
            views: 125,
            publishTime: '2天前发布',
            description: '购买于2023年3月，使用时间不长，9成新。原装充电器、数据线、耳机都在。手机运行流畅，无维修记录，支持面交验机。因为换新手机所以出售，诚心出售，价格可小刀。'
        })

        // 卖家信息
        const sellerInfo = ref({
            id: 1,
            name: '张小明',
            avatar: 'https://via.placeholder.com/40x40/4CAF50/ffffff?text=张',
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
        const toggleFavorite = () => {
            isFavorited.value = !isFavorited.value
            Toast.success(isFavorited.value ? '已添加到收藏' : '已取消收藏')
        }

        // 联系卖家
        const contactSeller = () => {
            router.push(`/messages/chat/${sellerInfo.value.id}`)
        }

        // 查看卖家主页
        const goToSellerProfile = () => {
            Toast('卖家主页功能开发中')
        }

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