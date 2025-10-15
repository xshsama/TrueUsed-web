<template>
    <div class="home-page">

        <!-- 轮播图 -->
        <div class="banner-section">
            <van-swipe class="banner-swipe" :autoplay="4000" indicator-color="#d0d0d0">
                <van-swipe-item v-for="(banner, index) in banners" :key="index">
                    <div class="banner-item" @click="handleBannerClick(banner)">
                        <img :src="banner.image" :alt="banner.title" class="banner-image" />
                    </div>
                </van-swipe-item>
            </van-swipe>
        </div>

        <!-- 主内容区 -->
        <div class="main-content">
            <!-- 左侧分类导航 -->
            <div class="sidebar">
                <div class="category-list">
                    <div v-for="category in categories" :key="category.id"
                        :class="['category-item', { active: activeCategory === category.id }]"
                        @click="selectCategory(category.id)">
                        <van-icon :name="category.icon" size="20" />
                        <span class="category-name">{{ category.name }}</span>
                    </div>
                </div>
            </div>

            <!-- 右侧内容区 -->
            <div class="content-area">
                <!-- 推荐列表 / 类目筛选结果 -->
                <div class="product-section">
                    <div class="section-header">
                        <h2 class="section-title">{{ activeCategory === 0 ? '今日精选' : currentCategoryName + '商品' }}</h2>
                        <span class="section-subtitle">{{ subtitleText }}</span>
                    </div>

                    <div class="product-pair-grid">
                        <ProductCard v-for="product in productList" :key="product.id" :product="toCard(product)"
                            :show-desc="true" @click="() => goToProductDetail(product.id)" />
                    </div>
                </div>

                <!-- 加载更多 -->
                <van-loading v-if="loading" class="loading-more">加载更多商品...</van-loading>
            </div>
        </div>
        <!-- 全局卖出按钮已移动到 App.vue -->
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

        const searchValue = ref('')
        const activeCategory = ref(0)
        const loading = ref(false)

        // 轮播图数据
        const banners = ref([
            {
                title: '精选二手数码',
                image: 'https://placehold.co/375x160/6c7b7f/ffffff?text=精选数码产品'
            },
            {
                title: '时尚服饰专区',
                image: 'https://placehold.co/375x160/8d9098/ffffff?text=时尚服饰专区'
            },
            {
                title: '居家好物',
                image: 'https://placehold.co/375x160/9ba0a6/ffffff?text=居家生活好物'
            }
        ])

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
        const loadingMore = ref(false)
        const currentCategoryName = computed(() => {
            return categories.value.find(c => c.id === activeCategory.value)?.name || '分类'
        })
        const subtitleText = computed(() => {
            return activeCategory.value === 0 ? '编辑为您精心挑选' : `为您找到 ${productList.value.length} 个${currentCategoryName.value}商品`
        })

        // 选择分类
        const selectCategory = (categoryId) => {
            activeCategory.value = categoryId
            page.value = 0
            productList.value = []
            fetchProducts()
        }

        // 处理轮播图点击
        const handleBannerClick = (banner) => {
            console.log('轮播图点击:', banner)
        }

        // 跳转到商品详情
        const goToProductDetail = (id) => {
            router.push(`/product/${id}`)
        }

        const fetchProducts = async () => {
            loading.value = true
            loadingMore.value = true
            try {
                const params = {
                    page: page.value,
                    size: size.value,
                    sort: 'created,desc',
                    categoryId: activeCategory.value === 0 ? undefined : activeCategory.value,
                }
                const res = await listProducts(params)
                const content = res?.content || []
                if (page.value === 0) productList.value = []
                productList.value.push(...content)
                page.value += 1
            } catch (e) {
                // 可选：Toast.fail('加载失败')
            } finally {
                loading.value = false
                loadingMore.value = false
            }
        }

        const toCard = (p) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            price: p.price,
            location: p.locationText,
            image: (p.images && p.images[0]?.url) || 'https://via.placeholder.com/160x120/eeeeee/999999?text=No+Image'
        })

        onMounted(() => {
            fetchProducts()
        })

        return {
            searchValue,
            activeCategory,
            loading,
            banners,
            categories,
            productList,
            currentCategoryName,
            subtitleText,
            selectCategory,
            handleBannerClick,
            goToProductDetail,
            toCard
        }
    }
}
</script>

<style scoped>
.home-page {
    background-color: #f2f2f7;
    min-height: 100vh;
}


/* 搜索区域 */
.search-section {
    background: white;
    padding: 20px 0 16px 0;
    border-bottom: 1px solid #e5e5e7;
}

.search-container {
    width: 90%;
    margin: 0 auto;
}

.search-container .van-search {
    background: #f2f2f7;
    border-radius: 24px;
    border: none;
    padding: 0;
    height: 48px !important;
    min-height: 48px !important;
}

.search-container .van-search__content {
    background: transparent;
    border-radius: 24px;
    padding: 0 20px !important;
    height: 48px !important;
    min-height: 48px !important;
    display: flex;
    align-items: center;
}

.search-container .van-field__control {
    color: #666;
    font-size: 17px !important;
    font-weight: 400;
    line-height: 1.2;
    height: 48px !important;
    padding: 0 !important;
}

.search-container .van-field__left-icon {
    margin-right: 12px;
}

.search-container .van-search__action {
    height: 48px !important;
    display: flex;
    align-items: center;
}

.search-container .van-field {
    height: 48px !important;
    min-height: 48px !important;
    line-height: 48px;
    padding: 0 !important;
}

.search-container .van-field__body {
    height: 48px !important;
    min-height: 48px !important;
    display: flex;
    align-items: center;
    padding: 0 !important;
}

.search-container .van-cell {
    height: 48px !important;
    min-height: 48px !important;
    padding: 0 !important;
}

/* 强制覆盖所有可能的内部样式 */
.search-container :deep(.van-search__content),
.search-container :deep(.van-field),
.search-container :deep(.van-field__body),
.search-container :deep(.van-field__control),
.search-container :deep(.van-cell) {
    height: 48px !important;
    min-height: 48px !important;
    line-height: 48px !important;
}

/* 轮播图样式 */
.banner-section {
    margin: 16px 20px;
}

.banner-swipe {
    height: 180px;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.banner-item {
    height: 100%;
    cursor: pointer;
}

.banner-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* 主内容区 */
.main-content {
    display: flex;
    gap: 16px;
    padding: 0 20px 20px 20px;
    align-items: flex-start;
}

/* 左侧分类导航 */
.sidebar {
    width: 80px;
    flex-shrink: 0;
    position: sticky;
    top: 20px;
    height: fit-content;
    z-index: 10;
}

.category-list {
    background: white;
    border-radius: 16px;
    padding: 12px 0;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.05);
}

.category-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 12px;
    margin: 0 8px 4px 8px;
}

.category-item:hover {
    background-color: #f2f2f7;
}

.category-item.active {
    background-color: #007AFF;
    color: white;
}

.category-item.active .van-icon {
    color: white !important;
}

.category-name {
    font-size: 11px;
    margin-top: 6px;
    text-align: center;
    font-weight: 500;
    line-height: 1.2;
}

/* 右侧内容区 */
.content-area {
    flex: 1;
    min-width: 0;
}

/* 商品分区 */
.product-section {
    margin-bottom: 40px;
}

.section-header {
    margin-bottom: 16px;
}

.section-title {
    font-size: 28px;
    font-weight: 700;
    color: #1d1d1f;
    margin: 0 0 4px 0;
    line-height: 1.1;
}

.section-subtitle {
    font-size: 16px;
    color: #86868b;
    font-weight: 400;
}

/* 商品对布局 */
.product-pair-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.product-card {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
}

.product-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.product-image {
    width: 100%;
    height: 120px;
    background-color: #f2f2f7;
}

.product-info {
    padding: 16px;
}

.product-title {
    font-size: 16px;
    font-weight: 600;
    color: #1d1d1f;
    margin: 0 0 4px 0;
    line-height: 1.3;
}

.product-desc {
    font-size: 14px;
    color: #86868b;
    margin: 0 0 12px 0;
    line-height: 1.4;
}

.price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.product-price {
    font-size: 18px;
    font-weight: 700;
    color: #007AFF;
    margin: 0;
}

.product-location {
    font-size: 12px;
    color: #8e8e93;
    font-weight: 500;
}

/* 加载更多 */
.loading-more {
    text-align: center;
    padding: 20px;
    color: #86868b;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .main-content {
        flex-direction: column;
        padding: 0 16px 16px 16px;
    }


    .sidebar {
        width: 100%;
        margin-bottom: 20px;
        position: static;
        top: auto;
    }

    .category-list {
        display: flex;
        overflow-x: auto;
        padding: 12px 16px;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    .category-list::-webkit-scrollbar {
        display: none;
    }

    .category-item {
        flex-shrink: 0;
        margin: 0 8px 0 0;
        padding: 12px 16px;
        flex-direction: row;
        gap: 8px;
        white-space: nowrap;
    }

    .category-name {
        margin-top: 0;
        font-size: 14px;
    }

    .section-title {
        font-size: 24px;
    }
}

@media (max-width: 480px) {
    .banner-section {
        margin: 12px 16px;
    }

    .banner-swipe {
        height: 140px;
    }

    .product-pair-grid {
        grid-template-columns: 1fr;
        gap: 12px;
    }

    .section-title {
        font-size: 22px;
    }

}
</style>
