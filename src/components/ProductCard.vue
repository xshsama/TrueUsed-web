<template>
    <div class="product-card" @click="onClick">
        <!-- 封面图 (60%高度) -->
        <div class="card-media">
            <van-image :src="productImage" :alt="product.title || '商品'" fit="cover" class="product-image" lazy-load>
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

            <!-- 状态遮罩 (如果在售状态不需要显示，其他状态显示) -->
            <div v-if="statusText && status !== 'selling'" class="status-overlay">
                {{ statusText }}
            </div>
        </div>

        <!-- 信息区 (40%高度) -->
        <div class="card-content">
            <!-- 价格行 -->
            <div class="price-row">
                <div class="price-main">
                    <span class="currency">¥</span>
                    <span class="amount">{{ product.price ?? '-' }}</span>
                </div>
                <!-- 降价提示 -->
                <div v-if="savedAmount > 0" class="price-drop-tag">
                    ⬇降价 ¥{{ savedAmount }}
                </div>
            </div>

            <!-- 标题 (两行省略) -->
            <h3 class="product-title" :title="product.title || '商品'">
                {{ product.title || '商品' }}
            </h3>

            <!-- 底部操作栏 -->
            <div class="action-bar">
                <div class="action-btn" @click.stop="$emit('delete', product)">
                    <van-icon name="delete-o" size="18" />
                </div>
                <div class="action-btn" @click.stop="$emit('cart', product)">
                    <van-icon name="cart-o" size="18" />
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
        status: { type: String, default: 'selling' }, // selling | sold | offline
        showSeller: { type: Boolean, default: true },
    },
    emits: ['click', 'delete', 'cart'],
    data() {
        return {
            defaultAvatar: defaultAvatarUrl
        }
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
        statusText() {
            const map = { selling: '', sold: '已售', offline: '已下架' }
            return map[this.status] || ''
        },
        savedAmount() {
            if (this.product.originalPrice && this.product.price) {
                const diff = Math.floor(this.product.originalPrice - this.product.price);
                return diff > 0 ? diff : 0;
            }
            return 0;
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
    background: #FFF;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    position: relative;
    /* Aspect Ratio 3:4 */
    aspect-ratio: 3/4;
    transition: transform 0.2s;
}

.product-card:hover {
    transform: translateY(-4px);
}

.product-card:active {
    transform: scale(0.98);
}

/* 封面图 60% */
.card-media {
    height: 60%;
    width: 100%;
    position: relative;
    background: #f8fafc;
    overflow: hidden;
}

.product-image {
    width: 100%;
    height: 100%;
    display: block;
}

/* 状态遮罩 */
.status-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 600;
    font-size: 16px;
    backdrop-filter: blur(2px);
}

/* 信息区 40% */
.card-content {
    height: 40%;
    padding: 12px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

/* 价格行 */
.price-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.price-main {
    color: #000;
    font-weight: bold;
    display: flex;
    align-items: baseline;
}

.currency {
    font-size: 14px;
    margin-right: 1px;
}

.amount {
    font-size: 20px;
    font-family: 'Oswald', sans-serif;
    /* Keep font if available */
    font-weight: 700;
}

.price-drop-tag {
    color: #EE0A24;
    font-size: 11px;
    font-weight: 500;
}

/* 标题 */
.product-title {
    font-size: 14px;
    color: #333;
    line-height: 1.4;
    margin: 0;
    font-weight: 500;

    /* 2 lines truncate */
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 底部操作栏 */
.action-bar {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    margin-top: auto;
    padding-top: 8px;
}

.action-btn {
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;
    padding: 4px;
}

.action-btn:hover {
    color: #0f172a;
}

.action-btn:active {
    opacity: 0.7;
}

/* Placeholder */
.image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1f5f9;
}
</style>
