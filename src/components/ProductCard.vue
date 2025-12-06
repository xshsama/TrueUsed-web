<template>
    <div class="product-card" @click="onClick">
        <!-- Image Section -->
        <div class="card-image-box">
            <van-image :src="productImage" :alt="product.title || '商品'" fit="cover" class="product-image" lazy-load>
                <template #loading>
                    <div class="image-placeholder"><van-icon name="photo-o" /></div>
                </template>
                <template #error>
                    <div class="image-placeholder"><van-icon name="bag-o" /></div>
                </template>
            </van-image>

            <!-- Tags Overlay -->
            <div class="img-tag top-left" v-if="hasRealShot">
                <van-icon name="photograph" /> 实拍图
            </div>
            <div class="img-tag bottom-right" v-if="timeAgo">
                <van-icon name="clock-o" /> {{ timeAgo }}
            </div>

            <!-- Status Overlay -->
            <div v-if="statusText && status !== 'selling'" class="status-overlay">
                {{ statusText }}
            </div>
        </div>

        <!-- Content Section -->
        <div class="card-info">
            <h3 class="product-title">{{ product.title || '未命名商品' }}</h3>

            <div class="price-row">
                <div class="main-price">¥<span class="price-num">{{ product.price ?? '-' }}</span></div>
                <div class="original-price" v-if="product.originalPrice">¥{{ product.originalPrice }}</div>
            </div>

            <div class="save-tag-row" v-if="savedAmount > 0">
                <span class="save-tag">立省 ¥{{ savedAmount }}</span>
            </div>

            <div class="seller-row" v-if="showSeller">
                <div class="seller-left">
                    <img :src="sellerAvatar" class="seller-avatar" />
                    <div class="seller-text">
                        <div class="seller-name">{{ sellerName }}</div>
                        <div class="seller-sub">{{ sellerLocation }} · {{ sellerCredit }}</div>
                    </div>
                </div>
                <div class="want-count" v-if="wantCount > 0">
                    <van-icon name="eye-o" /> {{ wantCount }}人想要
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import defaultAvatarUrl from '@/assets/icons/user.svg';

export default {
    name: 'ProductCard',
    props: {
        product: { type: Object, required: true },
        clickable: { type: Boolean, default: true },
        status: { type: String, default: 'selling' }, // selling | sold | offline
        showSeller: { type: Boolean, default: true },
    },
    emits: ['click'],
    setup(props, { emit }) {
        const onClick = () => {
            if (props.clickable) emit('click', props.product)
        }
        return { onClick }
    },
    computed: {
        productImage() {
            if (this.product.image) return this.product.image
            if (this.product.images && this.product.images.length > 0) {
                const firstImg = this.product.images[0]
                return typeof firstImg === 'string' ? firstImg : firstImg?.url
            }
            return ''
        },
        hasRealShot() {
            // Check tags or mock
            return this.product.tags?.includes('实拍图') || false
        },
        timeAgo() {
            return this.product.timeAgo || ''
        },
        statusText() {
            const map = { selling: '', sold: '已售', offline: '已下架' }
            return map[this.status] || ''
        },
        savedAmount() {
            if (this.product.originalPrice && this.product.price) {
                const diff = Math.floor(this.product.originalPrice - this.product.price);
                return diff > 0 ? diff : 0;
            }
            // Mock saved amount if original price missing but passed in props like 'saved'
            return this.product.saved || 0
        },
        sellerAvatar() {
            return this.product.seller?.avatar || defaultAvatarUrl
        },
        sellerName() {
            return this.product.seller?.nickname || '匿名卖家'
        },
        sellerLocation() {
            return this.product.locationText || this.product.seller?.city || '未知'
        },
        sellerCredit() {
            return this.product.seller?.credit || '信用极好'
        },
        wantCount() {
            return this.product.wantCount || 0
        }
    }
}
</script>

<style scoped>
.product-card {
    background: #FFF;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    border: 1px solid #f3f4f6;
}

.product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.card-image-box {
    position: relative;
    padding-top: 100%;
    /* 1:1 Aspect Ratio */
    background: #f9fafb;
    overflow: hidden;
}

.product-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #cbd5e1;
    font-size: 24px;
}

.img-tag {
    position: absolute;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 2px;
    backdrop-filter: blur(2px);
}

.img-tag.top-left {
    top: 8px;
    left: 8px;
}

.img-tag.bottom-right {
    bottom: 8px;
    right: 8px;
}

.status-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 16px;
}

.card-info {
    padding: 12px;
}

.product-title {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    margin: 0 0 8px 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    height: 40px;
    /* Fixed height for 2 lines */
}

.price-row {
    display: flex;
    align-items: baseline;
    gap: 4px;
    margin-bottom: 4px;
}

.main-price {
    color: #EF4444;
    font-size: 12px;
    font-weight: 700;
}

.price-num {
    font-size: 18px;
}

.original-price {
    color: #9CA3AF;
    font-size: 12px;
    text-decoration: line-through;
}

.save-tag-row {
    margin-bottom: 12px;
}

.save-tag {
    background: #FEF2F2;
    color: #EF4444;
    font-size: 10px;
    padding: 2px 4px;
    border-radius: 4px;
    font-weight: 500;
}

.seller-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #F3F4F6;
    padding-top: 8px;
}

.seller-left {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    overflow: hidden;
}

.seller-avatar {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    object-fit: cover;
}

.seller-text {
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.seller-name {
    font-size: 11px;
    font-weight: 600;
    color: #374151;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.seller-sub {
    font-size: 10px;
    color: #9CA3AF;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.want-count {
    font-size: 10px;
    color: #6B7280;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 2px;
}
</style>
