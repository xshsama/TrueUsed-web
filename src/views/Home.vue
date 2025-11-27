<template>
    <div class="home-page">
        <!-- 顶部头部区域 (已移除，使用全局导航) -->
        <!-- 欢迎 Banner -->
        <div class="welcome-banner">
            <div class="banner-content">
                <h1 class="banner-title">发现好物，真实交易</h1>
                <p class="banner-subtitle">TrueUsed 为您提供安全可靠的二手交易平台</p>
            </div>
            <div class="banner-illustration">
                <!-- 3D Illustration Placeholder -->
                <img src="https://img.yzcdn.cn/vant/cat.jpeg" alt="Illustration" class="illustration-img" />
            </div>
            <div class="banner-decoration-circle"></div>
            <div class="banner-decoration-dots"></div>
        </div>

        <!-- 分类标签 -->
        <div class="category-section">
            <div class="category-scroll">
                <div v-for="category in categories" :key="category.id"
                    :class="['category-tag', { active: activeCategory === category.id }]"
                    @click="selectCategory(category.id)">
                    <van-icon :name="category.icon" size="20" />
                    <span>{{ category.name }}</span>
                </div>
            </div>
        </div>

        <!-- 统计卡片 -->
        <div class="stats-card">
            <div class="stat-item">
                <van-icon name="bag-o" size="24" color="#388E3C" />
                <div class="stat-value">1000+</div>
                <div class="stat-label">在售商品</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
                <van-icon name="shield-o" size="24" color="#388E3C" />
                <div class="stat-value">100%</div>
                <div class="stat-label">真实可靠</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
                <van-icon name="clock-o" size="24" color="#388E3C" />
                <div class="stat-value">24h</div>
                <div class="stat-label">快速响应</div>
            </div>
        </div>

        <!-- 商品列表 -->
        <div class="product-section">
            <div class="section-header">
                <h2 class="section-title">{{ activeCategory === 0 ? '今日精选' : currentCategoryName }}</h2>
                <span class="section-subtitle">{{ subtitleText }}</span>
            </div>

            <!-- 骨架屏 -->
            <div v-if="isInitialLoading" class="product-grid">
                <div v-for="i in 4" :key="i" class="product-skeleton">
                    <van-skeleton animated :row="3" />
                </div>
            </div>

            <!-- 空状态 -->
            <van-empty v-else-if="productList.length === 0" description="暂无商品" />

            <!-- 商品列表 -->
            <div v-else class="product-grid">
                <ProductCard v-for="product in productList" :key="product.id" :product="toCard(product)"
                    :show-desc="true" @click="() => goToProductDetail(product.id)" />
            </div>

            <!-- 加载更多 -->
            <div v-if="productList.length" class="load-more-area">
                <van-loading v-if="loading" class="loading-more">加载中...</van-loading>
                <div v-else-if="!hasMore" class="finished-text">没有更多了</div>
                <van-button v-else size="small" round class="load-more-btn" @click="fetchProducts">
                    加载更多
                </van-button>
            </div>
        </div>
    </div>
</template>

<script>
import { listProducts } from '@/api/products'
import ProductCard from '@/components/ProductCard.vue'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
    name: 'Home',
    components: { ProductCard },
    setup() {
        const router = useRouter()

        const activeCategory = ref(0)
        const loading = ref(false)
        const hasMore = ref(true)

        // 分类数据
        const categories = ref([
            { id: 0, name: '推荐', icon: 'fire-o', categoryKey: 'all' },
            { id: 1, name: '数码', icon: 'phone-o', categoryKey: 'digital' },
            { id: 2, name: '服饰', icon: 'shopping-cart-o', categoryKey: 'clothing' },
            { id: 3, name: '家具', icon: 'home-o', categoryKey: 'furniture' },
            { id: 4, name: '图书', icon: 'book-mark-o', categoryKey: 'books' },
            { id: 5, name: '运动', icon: 'play', categoryKey: 'sports' },
            { id: 6, name: '美妆', icon: 'gem-o', categoryKey: 'beauty' },
            { id: 7, name: '其他', icon: 'apps-o', categoryKey: 'other' }
        ])

        // 商品分区数据
        const productList = ref([])
        const page = ref(0)
        const size = ref(10)
        const isInitialLoading = computed(() => loading.value && page.value === 0)
        const currentCategoryName = computed(() => {
            return categories.value.find(c => c.id === activeCategory.value)?.name || '分类'
        })
        const subtitleText = computed(() => {
            return activeCategory.value === 0 ? '编辑为您精心挑选' : `共 ${productList.value.length} 件`
        })

        // 选择分类
        const selectCategory = (categoryId) => {
            activeCategory.value = categoryId
            page.value = 0
            productList.value = []
            fetchProducts()
        }

        // 跳转到搜索
        const goToSearch = () => {
            router.push('/search')
        }

        // 跳转到商品详情
        const goToProductDetail = (id) => {
            router.push(`/product/${id}`)
        }

        const fetchProducts = async () => {
            loading.value = true
            try {
                const params = {
                    page: page.value,
                    size: size.value,
                    sort: 'created_desc',
                    categoryId: activeCategory.value === 0 ? undefined : activeCategory.value,
                }
                const res = await listProducts(params)
                const content = res?.content || []
                if (page.value === 0) productList.value = []
                productList.value.push(...content)
                hasMore.value = !(res?.last || content.length < size.value)
                page.value += 1
            } catch (e) {
                console.error('加载失败', e)
            } finally {
                loading.value = false
            }
        }

        const toCard = (p) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            price: p.price,
            location: p.locationText,
            image: (p.images && p.images[0]?.url) || '',
            condition: p.condition || 95,
            seller: p.user || { nickname: '卖家', avatar: '' }
        })

        onMounted(() => {
            fetchProducts()
        })

        return {
            activeCategory,
            loading,
            categories,
            productList,
            hasMore,
            isInitialLoading,
            currentCategoryName,
            subtitleText,
            selectCategory,
            goToSearch,
            goToProductDetail,
            toCard,
            fetchProducts
        }
    }
}
</script>

<style scoped>
.home-page {
    min-height: 100vh;
    background: var(--bg-page);
    padding-bottom: 70px;
}

/* 欢迎 Banner */
.welcome-banner {
    margin: 24px 20px;
    border-radius: 24px;
    background: linear-gradient(135deg, #81C784 0%, #4CAF50 100%);
    padding: 40px 32px;
    color: #fff;
    position: relative;
    overflow: hidden;
    box-shadow: 0 10px 20px -5px rgba(76, 175, 80, 0.4);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.banner-content {
    position: relative;
    z-index: 2;
    max-width: 60%;
}

.banner-title {
    font-size: 28px;
    font-weight: 800;
    margin: 0 0 8px;
    letter-spacing: -0.5px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.banner-subtitle {
    font-size: 15px;
    opacity: 0.95;
    margin: 0;
    font-weight: 500;
}

.banner-illustration {
    position: absolute;
    right: 20px;
    bottom: -20px;
    width: 140px;
    height: 140px;
    z-index: 2;
    transform: rotate(-10deg);
}

.illustration-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2));
}

.banner-decoration-circle {
    position: absolute;
    top: -40px;
    right: -40px;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
    border-radius: 50%;
    z-index: 1;
}

.banner-decoration-dots {
    position: absolute;
    bottom: 20px;
    left: 20%;
    width: 100px;
    height: 60px;
    background-image: radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px);
    background-size: 10px 10px;
    z-index: 1;
}

/* 分类标签 */
.category-section {
    padding: 16px 0;
    background: var(--bg-card);
    margin-bottom: 24px;
    border-bottom: 1px solid var(--border-color);
    position: sticky;
    top: 72px;
    z-index: 100;
    box-shadow: var(--shadow-sm);
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.95);
}

.category-scroll {
    display: flex;
    overflow-x: auto;
    padding: 0 20px;
    gap: 16px;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.category-scroll::-webkit-scrollbar {
    display: none;
}

.category-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: #f7f8fa;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
    color: #646566;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    flex-shrink: 0;
    border: 1px solid transparent;
    user-select: none;
}

.category-tag:hover {
    background: #f0f2f5;
}

.category-tag:active {
    transform: scale(0.92);
    transition-duration: 0.1s;
}

.category-tag.active {
    background: #E8F5E9;
    color: var(--primary-color);
    font-weight: 600;
    border-color: rgba(76, 175, 80, 0.1);
    box-shadow: none;
}

.category-tag.active .van-icon {
    color: var(--primary-color) !important;
}

/* 统计卡片 */
.stats-card {
    display: flex;
    align-items: center;
    justify-content: space-around;
    background: var(--bg-card);
    margin: 24px 20px;
    padding: 24px 16px;
    border-radius: var(--radius-lg);
    color: var(--text-primary);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color);
}

.stat-item {
    text-align: center;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.stat-value {
    font-size: 20px;
    font-weight: 700;
    color: #388E3C;
    /* 深绿色 */
    font-family: var(--font-family-number);
}

.stat-label {
    font-size: 12px;
    color: var(--text-secondary);
}

.stat-divider {
    width: 1px;
    height: 40px;
    background: var(--border-color);
}

/* 商品区域 */
.product-section {
    padding: 0 20px;
    margin-top: 32px;
}

.section-header {
    margin-bottom: 24px;
}

.section-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 4px;
}

.section-subtitle {
    font-size: 14px;
    color: var(--text-tertiary);
}

/* 商品网格 */
.product-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
}

@media (max-width: 1024px) {
    .product-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 640px) {
    .product-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
    }
}

.product-skeleton {
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    padding: 16px;
}

/* 加载更多 */
.load-more-area {
    padding: 20px 0;
    text-align: center;
}

.loading-more {
    color: var(--text-tertiary);
}

.finished-text {
    color: var(--text-tertiary);
    font-size: 13px;
}

.load-more-btn {
    background: var(--bg-card);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    padding: 0 32px;
    height: 40px;
    font-weight: 500;
}

/* 响应式 */
@media (max-width: 480px) {
    .welcome-banner {
        padding: 24px 16px;
    }

    .banner-title {
        font-size: 20px;
    }

    .stats-card {
        margin: 16px;
        padding: 16px 12px;
    }

    .stat-value {
        font-size: 18px;
    }

    .product-section {
        padding: 0 16px;
    }

    .product-grid {
        gap: 12px;
    }

    .section-title {
        font-size: 18px;
    }
}
</style>
