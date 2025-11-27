<template>
    <div class="product-card" @click="onClick">
        <div class="card-media">
            <van-image :src="productImage" :alt="product.title || '商品'" fit="cover" class="product-image" lazy-load
                radius="14">
                <template #loading>
                    <div class="image-placeholder">
                        <van-icon name="photo-o" size="24" color="#cbd5e1" />
                    </div>
                </template>
                <template #error>
                    <div class="image-placeholder">
                        <van-icon name="bag-o" size="24" color="#cbd5e1" />
                    </div>
                </template>
            </van-image>
            <div v-if="product.condition" class="condition-tag">{{ product.condition }}新</div>
            <slot name="badge"></slot>
            <slot name="favorite"></slot>
            <div v-if="statusText" class="status-tag" :class="'status-' + statusType">
                <van-icon :name="statusIcon" size="12" />
                <span>{{ statusText }}</span>
            </div>
        </div>
        <div class="card-content">
            <h3 class="product-title" :title="product.title || '商品'">{{ product.title || '商品' }}</h3>
            <div class="product-meta">
                <span class="product-price">
                    <span class="price-symbol">¥</span>
                    <span class="price-value">{{ product.price ?? '-' }}</span>
                </span>
            </div>
            <div class="seller-info" v-if="showSeller && product.seller">
                <van-image :src="product.seller.avatar || defaultAvatar" round width="20" height="20" />
                <span class="seller-name">{{ product.seller.nickname || '匿名' }}</span>
            </div>
            <div class="card-footer" v-if="$slots['footer-left'] || $slots['footer-right']">
                <div class="footer-left">
                    <slot name="footer-left"></slot>
                </div>
                <div class="footer-right">
                    <slot name="footer-right"></slot>
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
        showDesc: { type: Boolean, default: true },
        clickable: { type: Boolean, default: true },
        status: { type: String, default: '' }, // selling | sold | offline
        showSeller: { type: Boolean, default: true },
    },
    emits: ['click'],
    data() {
        return {
            defaultAvatar: defaultAvatarUrl
        }
    },
    computed: {
        productImage() {
            // 优先使用 image 字段，其次尝试从 images 数组获取
            if (this.product.image) return this.product.image
            if (this.product.images && this.product.images.length > 0) {
                // 支持 images 为对象数组 [{url: '...'}] 或字符串数组
                const firstImg = this.product.images[0]
                return typeof firstImg === 'string' ? firstImg : firstImg?.url
            }
            return ''
        },
        statusText() {
            const map = { selling: '在售', sold: '已售', offline: '已下架' }
            return map[this.status] || ''
        },
        statusType() {
            return this.status || 'default'
        },
        statusIcon() {
            const iconMap = { selling: 'checked', sold: 'success', offline: 'close' }
            return iconMap[this.status] || 'info-o'
        }
    },
    methods: {
        onClick() {
            if (!this.clickable) return
            this.$emit('click', this.product)
        }
    }
}
</script>

<style scoped>
.product-card {
    background: var(--bg-card);
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: 1px solid transparent;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
    border-color: var(--primary-color-light, #e0e7ff);
}

.product-card:active {
    transform: scale(0.98);
}

/* 媒体区域 */
.card-media {
    position: relative;
    aspect-ratio: 1;
    background: var(--bg-input);
    overflow: hidden;
}

.product-image {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    background: #f8fafc;
    /* 默认背景，防止加载前白屏 */
}

/* 隐藏 alt 文本，防止图片加载失败时显示巨大的文字 */
.product-image :deep(img) {
    transition: transform 0.5s ease;
    text-indent: -9999px;
    color: transparent;
    /* 双重保险隐藏 alt 文本 */
}

.product-card:hover .product-image :deep(.van-image__img) {
    transform: scale(1.08);
}

/* 状态标签 */
.status-tag {
    position: absolute;
    left: 8px;
    top: 8px;
    bottom: auto;
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 600;
    border-radius: 20px;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(4px);
}

.condition-tag {
    position: absolute;
    left: 8px;
    bottom: 8px;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    backdrop-filter: blur(4px);
}

.status-selling {
    background: rgba(16, 185, 129, 0.9);
}

.status-sold {
    background: rgba(245, 158, 11, 0.9);
}

.status-offline {
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.8);
    color: #fff;
}

/* 内容区域 */
.card-content {
    padding: 12px;
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 8px;
}

.product-title {
    font-size: 15px;
    font-weight: 700;
    /* 粗体 */
    color: var(--text-primary);
    margin: 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    height: 42px;
}

/* 价格和位置信息 */
.product-meta {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: auto;
}

.product-price {
    display: flex;
    align-items: baseline;
    gap: 2px;
    color: #ff9800;
    /* 橙色辅助色 */
}

.price-symbol {
    font-size: 14px;
    font-weight: 700;
}

.price-value {
    font-size: 22px;
    /* 更大字号 */
    font-weight: 900;
    /* 极粗体 */
    letter-spacing: -0.5px;
    font-family: var(--font-family-number);
}

.seller-info {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--border-color);
}

.seller-name {
    font-size: 11px;
    color: var(--text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* 底部插槽区域 */
.card-footer {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--border-color);
    display: flex;
    flex-direction: column-reverse;
    /* 垂直堆叠，按钮在上，日期在下 */
    gap: 8px;
    /* 增加垂直间距 */
    font-size: 11px;
    color: #94a3b8;
}

.footer-left {
    width: 100%;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    opacity: 0.8;
    /* 视觉降级 */
}

.footer-right {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    /* 按钮靠右 */
}

/* 占位图样式 */
.image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #e8f5e9;
    /* 浅绿色背景 */
}

.image-placeholder .van-icon {
    color: rgba(76, 175, 80, 0.6) !important;
    /* 绿色图标 */
}

/* 响应式调整 */
@media (max-width: 720px) {
    .card-content {
        padding: 12px;
    }

    .product-title {
        font-size: 14px;
    }

    .price-value {
        font-size: 18px;
    }
}
</style>
