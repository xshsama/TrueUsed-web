<template>
    <div class="favorites-page">
        <!-- 顶部导航 -->
        <van-nav-bar title="我的收藏" fixed />

        <div class="page-content">
            <!-- 筛选标签 -->
            <div class="filter-tabs">
                <van-tabs v-model:active="activeTab" @change="onTabChange">
                    <van-tab title="全部" name="all" />
                    <van-tab title="在售" name="selling" />
                    <van-tab title="已售" name="sold" />
                    <van-tab title="已下架" name="offline" />
                </van-tabs>
            </div>

            <!-- 收藏列表 -->
            <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
                <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
                    <!-- 有收藏商品时显示列表 -->
                    <div v-if="favoriteList.length > 0" class="favorites-list">
                        <div v-for="item in favoriteList" :key="item.id" class="favorite-item"
                            @click="goToProductDetail(item.id)">
                            <van-image :src="item.image" :alt="item.title" class="item-image" fit="cover" lazy-load />
                            <div class="item-content">
                                <div class="item-title">{{ item.title }}</div>
                                <div class="item-price">¥{{ item.price }}</div>
                                <div class="item-meta">
                                    <span class="item-location">{{ item.location }}</span>
                                    <span class="item-time">{{ item.favoriteTime }}</span>
                                </div>
                                <div class="item-status">
                                    <van-tag :type="getStatusType(item.status)" size="small">
                                        {{ getStatusText(item.status) }}
                                    </van-tag>
                                </div>
                            </div>
                            <div class="item-actions">
                                <van-button icon="delete" type="danger" size="small" plain
                                    @click.stop="removeFavorite(item.id)">
                                    取消收藏
                                </van-button>
                            </div>
                        </div>
                    </div>

                    <!-- 空状态 -->
                    <van-empty v-else image="search" description="还没有收藏任何商品">
                        <van-button type="primary" size="small" @click="$router.push('/home')">
                            去看看
                        </van-button>
                    </van-empty>
                </van-list>
            </van-pull-refresh>
        </div>
    </div>
</template>

<script>
import { Dialog, Toast } from 'vant'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
    name: 'Favorites',
    setup() {
        const router = useRouter()

        const activeTab = ref('all')
        const refreshing = ref(false)
        const loading = ref(false)
        const finished = ref(false)
        const favoriteList = ref([])

        // 模拟收藏数据
        const mockFavorites = [
            {
                id: 1,
                title: 'iPhone 14 Pro 256GB 深空黑色，9成新，原装正品',
                price: '6888',
                image: 'https://via.placeholder.com/120x120/333333/ffffff?text=iPhone+14',
                location: '上海·浦东新区',
                favoriteTime: '2天前收藏',
                status: 'selling'
            },
            {
                id: 2,
                title: '全新MacBook Air M2芯片 13英寸 8GB+256GB',
                price: '8999',
                image: 'https://via.placeholder.com/120x120/silver/000000?text=MacBook',
                location: '北京·朝阳区',
                favoriteTime: '1周前收藏',
                status: 'sold'
            },
            {
                id: 3,
                title: 'NIKE Air Jordan 1 黑红配色 US10码 95新',
                price: '1299',
                image: 'https://via.placeholder.com/120x120/ff0000/ffffff?text=Jordan+1',
                location: '深圳·南山区',
                favoriteTime: '3天前收藏',
                status: 'selling'
            },
            {
                id: 4,
                title: '小米13 Ultra 512GB 黑色 徕卡影像',
                price: '4999',
                image: 'https://via.placeholder.com/120x120/000000/ffffff?text=小米13',
                location: '杭州·西湖区',
                favoriteTime: '5天前收藏',
                status: 'offline'
            }
        ]

        // 标签切换
        const onTabChange = (name) => {
            console.log('标签切换:', name)
            // 重新加载数据
            favoriteList.value = []
            finished.value = false
            onLoad()
        }

        // 下拉刷新
        const onRefresh = () => {
            setTimeout(() => {
                favoriteList.value = [...mockFavorites]
                refreshing.value = false
                loading.value = false
                finished.value = false
                Toast.success('刷新成功')
            }, 1000)
        }

        // 上拉加载更多
        const onLoad = () => {
            setTimeout(() => {
                const filteredData = filterByStatus(mockFavorites, activeTab.value)
                favoriteList.value.push(...filteredData)
                loading.value = false
                finished.value = true // 模拟数据已全部加载
            }, 1000)
        }

        // 根据状态筛选数据
        const filterByStatus = (data, status) => {
            if (status === 'all') return data
            return data.filter(item => item.status === status)
        }

        // 获取状态类型
        const getStatusType = (status) => {
            const types = {
                selling: 'success',
                sold: 'warning',
                offline: 'danger'
            }
            return types[status] || 'default'
        }

        // 获取状态文本
        const getStatusText = (status) => {
            const texts = {
                selling: '在售',
                sold: '已售',
                offline: '已下架'
            }
            return texts[status] || '未知'
        }

        // 取消收藏
        const removeFavorite = (id) => {
            Dialog.confirm({
                title: '确认取消收藏',
                message: '取消收藏后，该商品将从收藏列表中移除',
            }).then(() => {
                favoriteList.value = favoriteList.value.filter(item => item.id !== id)
                Toast.success('已取消收藏')
            }).catch(() => {
                console.log('取消操作')
            })
        }

        // 跳转到商品详情
        const goToProductDetail = (id) => {
            router.push(`/product/${id}`)
        }

        onMounted(() => {
            onLoad()
        })

        return {
            activeTab,
            refreshing,
            loading,
            finished,
            favoriteList,
            onTabChange,
            onRefresh,
            onLoad,
            getStatusType,
            getStatusText,
            removeFavorite,
            goToProductDetail
        }
    }
}
</script>

<style scoped>
.favorites-page {
    background-color: #f7f8fa;
    min-height: 100vh;
}

.page-content {
    padding-top: 46px;
    /* 为固定导航栏留出空间 */
}

.filter-tabs {
    background: #fff;
    margin-bottom: 8px;
}

.favorites-list {
    padding: 0 16px;
}

.favorite-item {
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
    margin-bottom: 8px;
}

.item-meta {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
}

.item-location,
.item-time {
    font-size: 12px;
    color: #969799;
}

.item-status {
    display: flex;
    align-items: center;
}

.item-actions {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-left: 12px;
}
</style>