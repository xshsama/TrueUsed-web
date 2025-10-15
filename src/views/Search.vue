<template>
    <div class="search-page">
        <van-nav-bar left-arrow @click-left="$router.go(-1)">
            <template #title>
                <van-search v-model="searchValue" placeholder="搜索商品" autofocus @search="onSearch" @clear="onClear" />
            </template>
        </van-nav-bar>

        <!-- 搜索历史 -->
        <div v-if="!searchValue && searchHistory.length > 0" class="search-history">
            <div class="section-header">
                <span class="section-title">搜索历史</span>
                <van-button size="small" plain @click="clearHistory">清空</van-button>
            </div>
            <div class="history-tags">
                <van-tag v-for="(item, index) in searchHistory" :key="index" @click="searchValue = item">
                    {{ item }}
                </van-tag>
            </div>
        </div>

        <!-- 热门搜索 -->
        <div v-if="!searchValue" class="hot-search">
            <div class="section-title">热门搜索</div>
            <div class="hot-tags">
                <van-tag v-for="(item, index) in hotSearch" :key="index" type="primary" plain
                    @click="searchValue = item">
                    {{ item }}
                </van-tag>
            </div>
        </div>

        <!-- 搜索与筛选结果 -->
        <div class="search-results">
            <!-- 顶部筛选栏（排序/价格区间/类目占位） -->
            <div class="filter-bar">
                <van-dropdown-menu>
                    <van-dropdown-item v-model="sort" :options="sortOptions" @change="onSortChange" />
                </van-dropdown-menu>
                <div class="price-range">
                    <van-field v-model.number="priceMin" type="number" placeholder="最低价" input-align="center" />
                    <span class="sep">-</span>
                    <van-field v-model.number="priceMax" type="number" placeholder="最高价" input-align="center" />
                    <van-button size="small" type="primary" @click="applyFilters">筛选</van-button>
                </div>
            </div>

            <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
                <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
                    <div v-if="resultList.length > 0" class="result-list">
                        <div v-for="item in resultList" :key="item.id" class="result-item"
                            @click="goToProductDetail(item.id)">
                            <van-image :src="(item.images && item.images[0]?.url) || placeholderImg" :alt="item.title"
                                class="item-image" fit="cover" lazy-load />
                            <div class="item-content">
                                <div class="item-title" v-html="highlightKeyword(item.title)"></div>
                                <div class="item-price">¥{{ item.price }}</div>
                                <div class="item-location">{{ item.locationText }}</div>
                            </div>
                        </div>
                    </div>
                    <van-empty v-else-if="searched" image="search" description="没有找到相关商品" />
                </van-list>
            </van-pull-refresh>
        </div>
    </div>
</template>

<script>
import { listProducts } from '@/api/products'
import { Toast } from 'vant'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
    name: 'Search',
    setup() {
        const router = useRouter()

        const searchValue = ref('')
        const refreshing = ref(false)
        const loading = ref(false)
        const finished = ref(false)
        const searched = ref(false)
        const resultList = ref([])
        const page = ref(0)
        const size = ref(10)
        const sort = ref('created,desc')
        const priceMin = ref()
        const priceMax = ref()
        const categoryId = ref()
        const placeholderImg = ref('https://via.placeholder.com/120x120/eeeeee/999999?text=No+Image')

        const sortOptions = [
            { text: '最新发布', value: 'created,desc' },
            { text: '价格从低到高', value: 'price,asc' },
            { text: '价格从高到低', value: 'price,desc' },
            { text: '收藏最多', value: 'favorites,desc' },
            { text: '浏览最多', value: 'views,desc' },
        ]

        // 搜索历史
        const searchHistory = ref([
            'iPhone 14',
            'MacBook',
            '耐克鞋',
            '二手相机'
        ])

        // 热门搜索
        const hotSearch = ref([
            '手机数码',
            '笔记本电脑',
            '运动鞋',
            '相机镜头',
            '游戏主机',
            '平板电脑'
        ])

        // 拉取列表
        const fetchList = async () => {
            loading.value = true
            try {
                const params = {
                    q: searchValue.value || undefined,
                    categoryId: categoryId.value || undefined,
                    priceMin: priceMin.value || undefined,
                    priceMax: priceMax.value || undefined,
                    sort: sort.value || undefined,
                    page: page.value,
                    size: size.value,
                }
                const res = await listProducts(params)
                // 后端返回 Page<ProductDTO>
                const content = res?.content || []
                if (page.value === 0) resultList.value = []
                resultList.value.push(...content)
                finished.value = res?.last || content.length < size.value
                page.value += 1
            } catch (e) {
                Toast.fail('加载失败')
                finished.value = true
            } finally {
                loading.value = false
                refreshing.value = false
            }
        }

        // 搜索
        const onSearch = () => {
            if (!searchValue.value.trim()) return

            // 添加到搜索历史
            const keyword = searchValue.value.trim()
            if (!searchHistory.value.includes(keyword)) {
                searchHistory.value.unshift(keyword)
                if (searchHistory.value.length > 10) {
                    searchHistory.value.pop()
                }
            }

            // 执行搜索
            searched.value = true
            page.value = 0
            resultList.value = []
            finished.value = false
            fetchList()
        }

        // 清空搜索
        const onClear = () => {
            searched.value = false
            resultList.value = []
        }

        // 清空历史
        const clearHistory = () => {
            searchHistory.value = []
            Toast.success('已清空搜索历史')
        }

        // 下拉刷新
        const onRefresh = () => {
            page.value = 0
            finished.value = false
            fetchList()
        }

        // 加载更多
        const onLoad = () => {
            if (finished.value) return
            fetchList()
        }

        const onSortChange = () => {
            page.value = 0
            resultList.value = []
            finished.value = false
            fetchList()
        }

        const applyFilters = () => {
            page.value = 0
            resultList.value = []
            finished.value = false
            fetchList()
        }

        // 高亮关键词
        const highlightKeyword = (text) => {
            if (!searchValue.value) return text
            const keyword = searchValue.value.trim()
            return text.replace(new RegExp(`(${keyword})`, 'gi'), '<span style="color: #ee0a24;">$1</span>')
        }

        // 跳转商品详情
        const goToProductDetail = (id) => {
            router.push(`/product/${id}`)
        }

        return {
            searchValue,
            refreshing,
            loading,
            finished,
            searched,
            resultList,
            page,
            size,
            sort,
            sortOptions,
            priceMin,
            priceMax,
            categoryId,
            placeholderImg,
            searchHistory,
            hotSearch,
            onSearch,
            onClear,
            clearHistory,
            onRefresh,
            onLoad,
            onSortChange,
            applyFilters,
            highlightKeyword,
            goToProductDetail
        }
    }
}
</script>

<style scoped>
.search-page {
    min-height: 100vh;
    background-color: #f7f8fa;
}

.search-history,
.hot-search {
    background: #fff;
    padding: 16px;
    margin-bottom: 8px;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.section-title {
    font-size: 14px;
    font-weight: 500;
    color: #323233;
    margin-bottom: 12px;
}

.history-tags,
.hot-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.result-list {
    padding: 0 16px;
}

.filter-bar {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 8px 12px;
    background: #fff;
    margin-bottom: 8px;
}

.price-range {
    display: flex;
    align-items: center;
    gap: 6px;
}

.price-range .sep {
    color: #c8c9cc;
}

.result-item {
    display: flex;
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-image {
    width: 80px;
    height: 80px;
    border-radius: 4px;
    margin-right: 12px;
}

.item-content {
    flex: 1;
    min-width: 0;
}

.item-title {
    font-size: 14px;
    font-weight: 500;
    color: #323233;
    margin-bottom: 8px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    line-height: 1.4;
}

.item-price {
    font-size: 16px;
    font-weight: 600;
    color: #ee0a24;
    margin-bottom: 4px;
}

.item-location {
    font-size: 12px;
    color: #969799;
}
</style>