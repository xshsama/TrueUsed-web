<template>
    <div class="product-card-wrapper tu-card" @click="onClick">
        <div class="media">
            <van-image :src="product.image" :alt="product.title" fit="cover" class="media-img" lazy-load />
            <slot name="badge"></slot>
            <slot name="favorite"></slot>
            <div v-if="statusText" class="status-chip" :class="'status-' + statusType">{{ statusText }}</div>
        </div>
        <div class="info">
            <h3 class="title" :title="product.title">{{ product.title }}</h3>
            <p v-if="showDesc && product.description" class="desc">{{ product.description }}</p>
            <div class="meta-row">
                <span class="price">¥{{ product.price }}</span>
                <span v-if="product.location" class="loc">{{ product.location }}</span>
            </div>
            <div class="footer-row">
                <slot name="footer-left"></slot>
                <slot name="footer-right"></slot>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ProductCard',
    props: {
        product: { type: Object, required: true },
        showDesc: { type: Boolean, default: true },
        clickable: { type: Boolean, default: true },
        status: { type: String, default: '' }, // selling | sold | offline
    },
    emits: ['click'],
    computed: {
        statusText() {
            const map = { selling: '在售', sold: '已售', offline: '已下架' }
            return map[this.status] || ''
        },
        statusType() {
            return this.status || 'default'
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
.product-card-wrapper {
    border-radius: var(--card-radius);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    position: relative;
}

.product-card-wrapper:active {
    transform: translateY(-1px);
}

.media {
    position: relative;
    aspect-ratio: 4/3;
    background: #f2f2f7;
}

.media-img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
}

.status-chip {
    position: absolute;
    left: 10px;
    bottom: 10px;
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 14px;
    backdrop-filter: blur(6px);
    color: #fff;
    letter-spacing: .5px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, .25);
}

.status-selling {
    background: linear-gradient(135deg, #34c759, #2faa4f);
}

.status-sold {
    background: linear-gradient(135deg, #ffa726, #fb8c00);
}

.status-offline {
    background: linear-gradient(135deg, #ff3b30, #d32f2f);
}

.info {
    padding: 14px 16px 16px;
    display: flex;
    flex-direction: column;
    flex: 1;
}

.title {
    font-size: 15px;
    font-weight: 600;
    color: #1d1d1f;
    margin: 0 0 8px;
    line-height: 1.35;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
}

.desc {
    font-size: 13px;
    color: #8e8e93;
    line-height: 1.4;
    margin: 0 0 10px;
    height: 38px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
}

.meta-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 0 10px;
}

.price {
    font-size: 18px;
    font-weight: 700;
    color: var(--primary-color);
}

.loc {
    font-size: 11px;
    max-width: 50%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: right;
    color: #8e8e93;
}

.footer-row {
    margin-top: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    color: #8e8e93;
    min-height: 18px;
}

@media (max-width:720px) {
    .info {
        padding: 12px 12px 14px;
    }

    .title {
        font-size: 14px;
        margin-bottom: 6px;
    }

    .price {
        font-size: 16px;
    }
}

@media (max-width:520px) {}
</style>
