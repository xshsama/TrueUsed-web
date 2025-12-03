<template>
    <div class="home-page">

        <!-- Hero Banner (双入口) -->
        <div class="hero-banner">
            <div class="hero-split buyer-side" @click="selectCategory(0)">
                <div class="hero-content">
                    <div class="hero-subtitle">官方正品保障</div>
                    <div class="hero-title-row">
                        <span class="title-text">大牌</span>
                        <span class="highlight-num">3</span>
                        <span class="title-small">折起</span>
                    </div>
                    <div class="hero-btn">去捡漏 <van-icon name="arrow" /></div>
                </div>
                <div class="hero-img-wrapper">
                    <span class="hero-emoji">🛍️</span>
                </div>
            </div>
            <div class="hero-split seller-side" @click="goToSell">
                <div class="hero-content">
                    <div class="hero-subtitle">极速到账</div>
                    <div class="hero-title-row">
                        <span class="title-text">闲置</span>
                        <span class="highlight-icon">⚡️</span>
                        <span class="title-text">换钱</span>
                    </div>
                    <div class="hero-btn">去估价 <van-icon name="arrow" /></div>
                </div>
                <div class="hero-img-wrapper">
                    <span class="hero-emoji">💰</span>
                </div>
            </div>
        </div>

        <!-- Data Ticker (战报条) -->
        <div class="data-ticker">
            <van-notice-bar left-icon="volume-o" :scrollable="true" background="#F9FAFB" color="#4B5563">
                用户 @Alex 3 分钟前 <span class="ticker-highlight">¥2200</span> 出掉了 iPad Air | 用户 @Sarah 刚刚 <span
                    class="ticker-highlight">¥850</span> 买到了 AirPods Pro | 用户 @Mike 5 分钟前 <span
                    class="ticker-highlight">¥4500</span> 出掉了 iPhone 13
            </van-notice-bar>
        </div>

        <!-- 分类标签 (金刚区 - 线性图标 + 极简风格) -->
        <div class="category-section">
            <div class="category-container">
                <div v-for="(category, index) in categories" :key="category.id" class="category-item"
                    :class="{ 'first-item-gap': index === 0 }" @click="selectCategory(category.id)">

                    <!-- Icon Container with Dynamic Background -->
                    <div class="icon-surface" :style="{ backgroundColor: category.bg || '#F5F7FA' }">
                        <!-- Icon with Dynamic Color -->
                        <van-icon :name="category.icon" class="surface-icon"
                            :style="{ color: category.iconColor || category.color }" />
                        <!-- Badge -->
                        <div v-if="category.badge" class="cat-badge">
                            {{ category.badge }}
                        </div>
                    </div>

                    <!-- Text -->
                    <span class="cat-text" :class="{ active: activeCategory === category.id }">
                        {{ category.name }}
                    </span>
                </div>
            </div>
        </div>

        <!-- 商品列表 -->
        <div class="product-section">
            <div class="section-header">
                <div class="header-left">
                    <h2 class="section-title">{{ activeCategory === 0 ? '今日精选' : currentCategoryName }}</h2>
                    <span class="section-subtitle">{{ subtitleText }}</span>
                </div>
                <div class="header-right">
                    <span class="sort-option active">综合排序</span>
                    <span class="sort-option">价格 <van-icon name="sort" class="sort-icon" /></span>
                    <span class="sort-option">最新发布</span>
                </div>
            </div>

            <!-- 骨架屏 -->
            <div v-if="isInitialLoading" class="product-grid">
                <div v-for="i in 8" :key="i" class="product-skeleton">
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

        <!-- 悬浮工具栏 -->
        <div class="fab-container">
            <transition name="van-fade">
                <div class="fab-item primary" v-show="isScrolled" @click="goToSell">
                    <van-icon name="plus" />
                    <span class="fab-text">发布</span>
                </div>
            </transition>
            <div class="fab-item" @click="goToHelp">
                <van-icon name="question-o" />
            </div>
            <transition name="van-fade">
                <div class="fab-item" v-show="isScrolled" @click="scrollToTop">
                    <van-icon name="arrow-up" />
                </div>
            </transition>
        </div>
    </div>
</template>

<script>
import { getUnreadCount } from '@/api/notifications'
import { listProducts } from '@/api/products'
import ProductCard from '@/components/ProductCard.vue'
import { useUserStore } from '@/stores/user'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
    name: 'Home',
    components: { ProductCard },
    setup() {
        const router = useRouter()
        const userStore = useUserStore()

        const activeCategory = ref(0)
        const loading = ref(false)
        const hasMore = ref(true)
        const unreadCount = ref(0)
        const isScrolled = ref(false)

        // Search Placeholder Logic
        const placeholders = ["搜 'MacBook' 捡漏", "搜 '考研资料' 省钱", "搜 'iPhone 15' 急售"];
        const currentPlaceholder = ref(placeholders[0]);
        let placeholderInterval;

        // 分类数据 (黑字 + 间距区分)
        const categories = ref([
            { id: 0, name: '推荐', icon: 'fire-o', bg: 'rgba(65, 179, 130, 0.1)', iconColor: '#41B382' },
            { id: 1, name: '数码', icon: 'phone-o', bg: '#F5F5F5', iconColor: '#333333', badge: 'HOT' },
            { id: 2, name: '服饰', icon: 'bag-o', bg: '#F5F5F5', iconColor: '#333333' },
            { id: 3, name: '家具', icon: 'wap-home-o', bg: '#F5F5F5', iconColor: '#333333' },
            { id: 4, name: '图书', icon: 'bookmark-o', bg: '#F5F5F5', iconColor: '#333333' },
            { id: 5, name: '运动', icon: 'medal-o', bg: '#F5F5F5', iconColor: '#333333' },
            { id: 6, name: '美妆', icon: 'gem-o', bg: '#F5F5F5', iconColor: '#333333', badge: 'NEW' },
            { id: 7, name: '其他', icon: 'ellipsis', bg: '#F5F5F5', iconColor: '#333333' }
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

        const goToNotifications = () => {
            router.push('/notifications')
        }

        const goToSell = () => {
            router.push('/post/create')
        }

        const handleScroll = () => {
            isScrolled.value = window.scrollY > 10
        }

        const scrollToTop = () => {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }

        const goToHelp = () => {
            router.push('/help')
        }

        const logout = async () => {
            await userStore.logout()
            router.push('/login')
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
            originalPrice: p.originalPrice || p.price * 1.2, // Mock original price if not exists
            location: p.locationText,
            image: (p.images && p.images[0]?.url) || '',
            condition: p.condition || 95,
            seller: p.user || { nickname: '卖家', avatar: '' },
            isUrgent: Math.random() > 0.7 // Mock urgency
        })

        onMounted(() => {
            window.addEventListener('scroll', handleScroll)
            fetchProducts()
            // 获取未读消息数
            if (userStore.isLoggedIn) {
                getUnreadCount().then(res => {
                    unreadCount.value = res
                }).catch(e => console.error(e))
            }

            // Placeholder rotation
            let i = 0;
            placeholderInterval = setInterval(() => {
                i = (i + 1) % placeholders.length;
                currentPlaceholder.value = placeholders[i];
            }, 3000);
        })

        onUnmounted(() => {
            window.removeEventListener('scroll', handleScroll)
            clearInterval(placeholderInterval);
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
            unreadCount,
            currentPlaceholder,
            selectCategory,
            goToSearch,
            goToProductDetail,
            goToNotifications,
            goToSell,
            toCard,
            fetchProducts,
            isScrolled,
            scrollToTop,
            goToHelp,
            logout,
            userStore
        }
    }
}
</script>

<style scoped>
.home-page {
    min-height: 100vh;
    background: var(--bg-page);
    padding-bottom: 70px;
    padding-top: 54px;
}

.dropdown-item {
    padding: 10px 16px;
    font-size: 13px;
    color: #374151;
    transition: background 0.2s;
}

.dropdown-item:hover {
    background: #F3F4F6;
}

.dropdown-item.logout {
    color: #EF4444;
    border-top: 1px solid #F3F4F6;
    margin-top: 4px;
}

/* Hero Banner (双入口) */
.hero-banner {
    margin: 16px 16px 0;
    display: flex;
    gap: 12px;
    height: 140px;
    /* 进一步增加高度以容纳新布局 */
}

.hero-split {
    flex: 1;
    border-radius: 16px;
    /* 更圆润 */
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 20px;
    cursor: pointer;
    border: none;
}

/* 弥散光感背景 */
.buyer-side {
    background:
        radial-gradient(circle at 10% 10%, rgba(253, 230, 138, 0.4), transparent 40%),
        /* 嫩黄色柔光 */
        linear-gradient(135deg, #34D399 0%, #059669 100%);
    box-shadow: 0 10px 25px -5px rgba(5, 150, 105, 0.3);
}

.seller-side {
    background:
        radial-gradient(circle at 10% 10%, rgba(254, 243, 199, 0.4), transparent 40%),
        /* 淡黄色柔光 */
        linear-gradient(135deg, #FB923C 0%, #EA580C 100%);
    box-shadow: 0 10px 25px -5px rgba(234, 88, 12, 0.3);
}

.hero-content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: center;
}

.hero-subtitle {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 4px;
    font-weight: 500;
    letter-spacing: 0.5px;
}

.hero-title-row {
    display: flex;
    align-items: baseline;
    /* 基线对齐 */
    color: #fff;
    margin-bottom: 12px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.title-text {
    font-size: 20px;
    font-weight: 800;
}

.highlight-num {
    font-size: 36px;
    /* 巨大数字 */
    font-family: 'Oswald', sans-serif;
    font-weight: 700;
    line-height: 1;
    margin: 0 4px;
}

.highlight-icon {
    font-size: 28px;
    margin: 0 4px;
}

.title-small {
    font-size: 14px;
    font-weight: 600;
}

.hero-btn {
    font-size: 13px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    background: #FFFFFF !important;
    padding: 0 24px;
    /* 增加留白 */
    height: 36px;
    border-radius: 18px;
    width: fit-content;
    border: none;
    transition: transform 0.2s;
}

.hero-btn:hover {
    transform: translateY(-2px);
}

/* 按钮投影 (Color Shadows) */
.buyer-side .hero-btn {
    color: #059669;
    box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
}

.seller-side .hero-btn {
    color: #EA580C;
    box-shadow: 0 4px 12px rgba(234, 88, 12, 0.25);
}

/* 破格插图 */
.hero-img-wrapper {
    position: absolute;
    right: -20px;
    bottom: -30px;
    z-index: 1;
    opacity: 0.9;
    transform: rotate(-15deg);
    pointer-events: none;
}

.hero-emoji {
    font-size: 100px;
    /* 超大图标 */
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15));
}

/* Data Ticker */
.data-ticker {
    margin: 12px 0;
    border-top: none;
    border-bottom: 1px solid #F3F4F6;
    /* 极淡的分割线 */
}

/* 覆盖 Vant NoticeBar 默认样式，增加高度 */
:deep(.van-notice-bar) {
    height: 36px !important;
    padding: 0 16px;
}

.ticker-highlight {
    background: transparent !important;
    color: #EA580C;
    /* 改为橙色，降低视觉噪音 */
    font-weight: 700;
    font-family: 'DIN Condensed', sans-serif;
    font-size: 15px;
    padding: 0;
    margin: 0 2px;
}

/* 分类标签 (金刚区) */
.category-section {
    padding: 24px 0;
    background: #FFFFFF;
    margin-bottom: 16px;
    position: sticky;
    top: 54px;
    z-index: 99;
    box-shadow: var(--shadow-sm);
}

.category-container {
    display: flex;
    padding: 0 12px;
    overflow-x: auto;
    /* 允许横向滚动，适应小屏 */
    gap: 12px;
    scrollbar-width: none;
    /* 隐藏滚动条 */
    align-items: flex-start;
    /* 顶部对齐 */
}

.category-container::-webkit-scrollbar {
    display: none;
}

.category-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    min-width: 64px;
    flex-shrink: 0;
    transition: transform 0.2s;
    position: relative;
}

/* 间距控制 */
.first-item-gap {
    margin-right: 16px;
    /* 增加到 16px，加上原本的 gap 12px，形成 28px 的显著间距 */
}

.category-item:hover {
    transform: translateY(-2px);
}

/* Icon on Surface Style */
.icon-surface {
    width: 48px;
    height: 48px;
    background: #F5F7FA;
    /* 极浅灰蓝/灰 */
    border-radius: 50%;
    /* 圆形 */
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: all 0.2s;
}

.surface-icon {
    font-size: 24px;
    color: #333333;
    font-weight: 600;
    /* 增加线性图标份量 */
}

.category-item:hover .icon-surface {
    background: #E5E7EB;
    /* 悬停加深 */
    transform: translateY(-2px);
}


/* Badges (Mini Red Dot Style) */
.cat-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: #EF4444;
    color: #fff;
    font-size: 10px;
    transform: scale(0.8);
    padding: 2px 6px;
    border-radius: 10px;
    font-weight: 800;
    border: 2px solid #fff;
    /* 白边切割 */
    box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
}

.cat-text {
    font-size: 12px;
    color: #333333;
    font-weight: 500;
    margin-top: 6px;
}

.cat-text.active {
    color: #41B382;
    font-weight: 700;
}

/* 商品区域 */
.product-section {
    padding: 0 16px;
    min-height: 80vh;
}

.section-header {
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
}

.header-left {
    display: flex;
    align-items: baseline;
    gap: 8px;
}

.section-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
}

.section-subtitle {
    font-size: 12px;
    color: var(--text-tertiary);
}

.header-right {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: #9CA3AF;
}

.sort-option {
    cursor: pointer;
    transition: color 0.2s;
    display: flex;
    align-items: center;
    gap: 2px;
}

.sort-option.active {
    color: #111827;
    font-weight: 600;
}

.sort-icon {
    transform: scale(0.8);
}

/* 商品网格 - 响应式 Grid */
.product-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    /* 手机端双列 */
    gap: 12px;
    padding: 12px 0;
}

@media (min-width: 768px) {
    .product-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
    }
}

@media (min-width: 1024px) {
    .product-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
        padding: 20px 0;
    }
}

@media (min-width: 1440px) {
    .product-grid {
        grid-template-columns: repeat(5, 1fr);
        /* 宽屏五列 */
    }
}

.product-skeleton {
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    padding: 16px;
    margin-bottom: 0;
}

/* 悬浮工具栏 */
.fab-container {
    position: fixed;
    bottom: 80px;
    right: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    z-index: 99;
}

.fab-item {
    width: 44px;
    height: 44px;
    background: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    color: #374151;
    font-size: 20px;
    cursor: pointer;
    transition: all 0.2s;
}

.fab-item:active {
    transform: scale(0.95);
}

.fab-item.primary {
    background: #00875A;
    color: #fff;
    width: auto;
    padding: 0 16px;
    border-radius: 22px;
    gap: 4px;
}

.fab-text {
    font-size: 14px;
    font-weight: 600;
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
    height: 36px;
    font-weight: 500;
}
</style>
