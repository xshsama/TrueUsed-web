<template>
    <div class="home-page">

        <!-- 顶部搜索栏 -->
        <div class="search-section">
            <div class="search-container">
                <van-search v-model="searchValue" placeholder="搜索你想要的二手好物" shape="round" readonly
                    @click="$router.push('/search')">
                    <template #left-icon>
                        <van-icon name="search" color="#999" />
                    </template>
                </van-search>
            </div>
        </div>

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
                <!-- 商品分区 -->
                <div v-for="section in productSections" :key="section.id" class="product-section">
                    <div class="section-header">
                        <h2 class="section-title">{{ section.title }}</h2>
                        <span class="section-subtitle">{{ section.subtitle }}</span>
                    </div>

                    <div class="product-pair-grid">
                        <div v-for="product in section.products" :key="product.id" class="product-card"
                            @click="goToProductDetail(product.id)">
                            <van-image :src="product.image" :alt="product.title" class="product-image" fit="cover" />
                            <div class="product-info">
                                <h3 class="product-title">{{ product.title }}</h3>
                                <p class="product-desc">{{ product.description }}</p>
                                <div class="price-row">
                                    <span class="product-price">¥{{ product.price }}</span>
                                    <span class="product-location">{{ product.location }}</span>
                                </div>
                            </div>
                        </div>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
    name: 'Home',
    setup() {
        const router = useRouter()

        const searchValue = ref('')
        const activeCategory = ref(0)
        const loading = ref(false)

        // 轮播图数据
        const banners = ref([
            {
                title: '精选二手数码',
                image: 'https://via.placeholder.com/375x160/6c7b7f/ffffff?text=精选数码产品'
            },
            {
                title: '时尚服饰专区',
                image: 'https://via.placeholder.com/375x160/8d9098/ffffff?text=时尚服饰专区'
            },
            {
                title: '居家好物',
                image: 'https://via.placeholder.com/375x160/9ba0a6/ffffff?text=居家生活好物'
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
        const productSections = ref([])

        // 选择分类
        const selectCategory = (categoryId) => {
            activeCategory.value = categoryId
            const selectedCategory = categories.value.find(cat => cat.id === categoryId)

            if (categoryId === 0) {
                // 显示所有商品（推荐）
                initProductSections()
            } else {
                // 按分类筛选商品
                filterProductsByCategory(selectedCategory.categoryKey)
            }
        }

        // 处理轮播图点击
        const handleBannerClick = (banner) => {
            console.log('轮播图点击:', banner)
        }

        // 跳转到商品详情
        const goToProductDetail = (id) => {
            router.push(`/product/${id}`)
        }        // 初始化商品分区数据
        const initProductSections = () => {
            productSections.value = [
                {
                    id: 1,
                    title: '今日精选',
                    subtitle: '编辑为您精心挑选',
                    products: [
                        {
                            id: 1,
                            title: 'iPhone 14 Pro',
                            description: '256GB 深空黑色，9成新',
                            price: '6888',
                            location: '上海',
                            category: 'digital',
                            image: 'https://via.placeholder.com/160x120/1c1c1e/ffffff?text=iPhone+14'
                        },
                        {
                            id: 2,
                            title: 'MacBook Air M2',
                            description: '13英寸 8GB+256GB 银色',
                            price: '8999',
                            location: '北京',
                            category: 'digital',
                            image: 'https://via.placeholder.com/160x120/6c6c70/ffffff?text=MacBook'
                        }
                    ]
                },
                {
                    id: 2,
                    title: '热门数码',
                    subtitle: '品质保证，性价比之选',
                    products: [
                        {
                            id: 3,
                            title: '小米13 Ultra',
                            description: '512GB 黑色 徕卡影像',
                            price: '4999',
                            location: '杭州',
                            category: 'digital',
                            image: 'https://via.placeholder.com/160x120/48484a/ffffff?text=小米13'
                        },
                        {
                            id: 4,
                            title: 'iPad Pro 11',
                            description: '128GB WiFi版 深空灰',
                            price: '4299',
                            location: '深圳',
                            category: 'digital',
                            image: 'https://via.placeholder.com/160x120/8e8e93/ffffff?text=iPad+Pro'
                        }
                    ]
                },
                {
                    id: 3,
                    title: '时尚穿搭',
                    subtitle: '品味生活，彰显个性',
                    products: [
                        {
                            id: 5,
                            title: 'Nike Air Jordan 1',
                            description: '黑红配色 US10码 95新',
                            price: '1299',
                            location: '广州',
                            category: 'sports',
                            image: 'https://via.placeholder.com/160x120/d70015/ffffff?text=Jordan+1'
                        },
                        {
                            id: 6,
                            title: 'Adidas Yeezy 350',
                            description: '椰子鞋 Cream White',
                            price: '2199',
                            location: '成都',
                            category: 'sports',
                            image: 'https://via.placeholder.com/160x120/f5f5dc/000000?text=Yeezy'
                        }
                    ]
                },
                {
                    id: 4,
                    title: '生活家居',
                    subtitle: '温馨家庭，品质生活',
                    products: [
                        {
                            id: 7,
                            title: '宜家IKEA 书桶',
                            description: '白色简约书柜 9成新',
                            price: '299',
                            location: '上海',
                            category: 'furniture',
                            image: 'https://via.placeholder.com/160x120/f0f0f0/666666?text=书柜'
                        },
                        {
                            id: 8,
                            title: '戸外折叠桌椅',
                            description: '铝合金材质 便携式',
                            price: '199',
                            location: '深圳',
                            category: 'furniture',
                            image: 'https://via.placeholder.com/160x120/8b4513/ffffff?text=折叠桌'
                        }
                    ]
                },
                {
                    id: 5,
                    title: '美妆护肤',
                    subtitle: '美丽从这里开始',
                    products: [
                        {
                            id: 9,
                            title: 'SK-II 神仙水',
                            description: '230ml 全新未开封',
                            price: '899',
                            location: '北京',
                            category: 'beauty',
                            image: 'https://via.placeholder.com/160x120/ff69b4/ffffff?text=SK-II'
                        },
                        {
                            id: 10,
                            title: '雅诗兰黛口红',
                            description: '多色号可选 8成新',
                            price: '189',
                            location: '成都',
                            category: 'beauty',
                            image: 'https://via.placeholder.com/160x120/dc143c/ffffff?text=口红'
                        }
                    ]
                }
            ]
        }

        // 按分类筛选商品
        const filterProductsByCategory = (categoryKey) => {
            // 获取所有商品
            const allProducts = []
            // 从初始化数据中获取所有商品
            const tempSections = []
            // 重新初始化以获取所有数据
            initProductSections()
            tempSections.push(...productSections.value)

            tempSections.forEach(section => {
                allProducts.push(...section.products)
            })

            // 按分类筛选
            const filteredProducts = allProducts.filter(product => product.category === categoryKey)

            if (filteredProducts.length > 0) {
                const categoryName = categories.value.find(cat => cat.categoryKey === categoryKey)?.name || '分类'
                productSections.value = [{
                    id: 999,
                    title: `${categoryName}商品`,
                    subtitle: `为您找到 ${filteredProducts.length} 个${categoryName}商品`,
                    products: filteredProducts
                }]
            } else {
                const categoryName = categories.value.find(cat => cat.categoryKey === categoryKey)?.name || '分类'
                productSections.value = [{
                    id: 999,
                    title: `${categoryName}商品`,
                    subtitle: '暂无相关商品',
                    products: []
                }]
            }
        }

        // 初始化数据
        initProductSections()

        return {
            searchValue,
            activeCategory,
            loading,
            banners,
            categories,
            productSections,
            selectCategory,
            handleBannerClick,
            goToProductDetail,
            filterProductsByCategory
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
