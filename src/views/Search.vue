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

        <!-- 搜索结果 -->
        <div v-if="searchValue" class="search-results">
            <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
                <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
                    <div v-if="resultList.length > 0" class="result-list">
                        <div v-for="item in resultList" :key="item.id" class="result-item"
                            @click="goToProductDetail(item.id)">
                            <van-image :src="item.image" :alt="item.title" class="item-image" fit="cover" lazy-load />
                            <div class="item-content">
                                <div class="item-title" v-html="highlightKeyword(item.title)"></div>
                                <div class="item-price">¥{{ item.price }}</div>
                                <div class="item-location">{{ item.location }}</div>
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

        // 模拟搜索结果
        const mockResults = [
            {
                id: 1,
                title: 'iPhone 14 Pro 256GB 深空黑色，9成新，原装正品',
                price: '6888',
                image: 'https://via.placeholder.com/120x120/333333/ffffff?text=iPhone+14',
                location: '上海·浦东新区'
            },
            {
                id: 2,
                title: 'iPhone 13 Pro Max 512GB 远峰蓝色',
                price: '5999',
                image: 'https://via.placeholder.com/120x120/1E90FF/ffffff?text=iPhone+13',
                location: '北京·朝阳区'
            }
        ]

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
            resultList.value = []
            finished.value = false
            onLoad()
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
            setTimeout(() => {
                resultList.value = [...mockResults]
                refreshing.value = false
                loading.value = false
                finished.value = false
                Toast.success('刷新成功')
            }, 1000)
        }

        // 加载更多
        const onLoad = () => {
            setTimeout(() => {
                resultList.value.push(...mockResults)
                loading.value = false
                finished.value = true
            }, 1000)
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
            searchHistory,
            hotSearch,
            onSearch,
            onClear,
            clearHistory,
            onRefresh,
            onLoad,
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