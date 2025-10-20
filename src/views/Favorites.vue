<template>
    <div class="favorites-page">
        <van-nav-bar title="我的收藏" fixed />
        <div class="favorites-layout">
            <div class="favorites-main">
                <!-- 过滤与概览 -->
                <div class="favorites-header-card">
                    <div class="header-top-row">
                        <h1 class="page-title">我的收藏</h1>
                        <div class="total-count" v-if="filteredList.length">共 {{ filteredList.length }} 件</div>
                    </div>
                    <div class="header-filters">
                        <van-tabs v-model:active="activeTab" @change="onTabChange" shrink line-width="24px">
                            <van-tab title="全部" name="all" />
                            <van-tab title="在售" name="selling" />
                            <van-tab title="已售" name="sold" />
                            <van-tab title="已下架" name="offline" />
                        </van-tabs>
                    </div>
                </div>

                <!-- 收藏网格 -->
                <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
                    <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
                        <div v-if="loading && page === 0" class="fav-grid">
                            <van-skeleton v-for="i in 6" :key="i" animated :row="4" />
                        </div>
                        <div v-else-if="filteredList.length" class="fav-grid">
                            <ProductCard v-for="item in filteredList" :key="item.id" :product="item" :show-desc="false"
                                :status="item.status" @click="() => goToProductDetail(item.id)">
                                <template #footer-left>
                                    <span class="time">{{ item.favoriteTime }}</span>
                                </template>
                                <template #footer-right>
                                    <van-button size="mini" type="danger" plain round
                                        @click.stop="removeFavorite(item.id)">取消</van-button>
                                </template>
                            </ProductCard>
                        </div>
                        <van-empty v-else image="search" description="还没有收藏任何商品">
                            <van-button type="primary" size="small" @click="$router.push('/home')">去看看</van-button>
                        </van-empty>
                        <div v-if="filteredList.length && finished" class="finished-text">没有更多了</div>
                    </van-list>
                </van-pull-refresh>
            </div>
        </div>
    </div>
</template>

<script>
import { removeFavorite as apiRemoveFavorite, listMyFavorites } from '@/api/favorites'
import { getProduct } from '@/api/products'
import ProductCard from '@/components/ProductCard.vue'
import { Dialog, Toast } from 'vant'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
    name: 'Favorites',
    components: { ProductCard },
    setup() {
        const router = useRouter()

        const activeTab = ref('all')
        const refreshing = ref(false)
        const loading = ref(false)
        const finished = ref(false)
        const favoriteList = ref([])
        const keyword = ref('')
        const debounceTimer = ref(null)

        const filteredList = computed(() => {
            const kw = keyword.value.trim().toLowerCase()
            if (!kw) return favoriteList.value
            return favoriteList.value.filter(item =>
                (item.title && item.title.toLowerCase().includes(kw)) ||
                (item.location && item.location.toLowerCase().includes(kw))
            )
        })

        const fetchFavorites = async () => {
            loading.value = true
            try {
                const res = await listMyFavorites({ page: page.value, size: size.value })
                const favs = res?.content || []
                // 先占位，再并行获取详情
                const content = favs.map(f => ({
                    id: f.productId,
                    title: `商品 #${f.productId}`,
                    price: '-',
                    image: 'https://via.placeholder.com/160x120/eeeeee/999999?text=No+Image',
                    location: '',
                    favoriteTime: new Date(f.createdAt).toLocaleString(),
                    status: 'selling',
                }))
                if (page.value === 0) favoriteList.value = []
                favoriteList.value.push(...content)
                // 并行拉取产品详情，更新对应卡片
                await Promise.all(
                    favs.map(async (f, idx) => {
                        try {
                            const p = await getProduct(f.productId)
                            const card = favoriteList.value[(page.value === 0 ? 0 : favoriteList.value.length - content.length) + idx]
                            if (card && card.id === f.productId) {
                                card.title = p.title
                                card.price = p.price
                                card.image = (p.images && p.images[0]?.url) || card.image
                                card.location = p.locationText || ''
                            }
                        } catch (e) { /* ignore single item errors */ }
                    })
                )
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

        const page = ref(0)
        const size = ref(12)

        // 标签切换
        const onTabChange = (name) => {
            console.log('标签切换:', name)
            // 重新加载数据
            favoriteList.value = []
            finished.value = false
            onLoad()
        }

        const onKeywordInput = () => {
            if (debounceTimer.value) clearTimeout(debounceTimer.value)
            debounceTimer.value = setTimeout(() => { }, 220) // 触发 computed
        }

        // 下拉刷新
        const onRefresh = () => {
            page.value = 0
            finished.value = false
            fetchFavorites()
        }

        // 上拉加载更多
        const onLoad = () => {
            if (finished.value) return
            fetchFavorites()
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
            }).then(async () => {
                try {
                    // 后端以 productId 为路径参数
                    await apiRemoveFavorite(id)
                    favoriteList.value = favoriteList.value.filter(item => item.id !== id)
                    Toast.success('已取消收藏')
                } catch (e) {
                    Toast.fail('操作失败')
                }
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
            filteredList,
            keyword,
            onKeywordInput,
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
    background: #f2f2f7;
    min-height: 100vh;
}

.favorites-layout {
    padding-top: 46px;
}

.favorites-main {
    max-width: 1280px;
    margin: 0 auto;
    padding: 16px 20px 40px;
}

/* 顶部卡片头部 */
.favorites-header-card {
    background: #fff;
    border-radius: 20px;
    padding: 18px 20px 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, .05);
    margin-bottom: 22px;
    position: relative;
}

.header-top-row {
    display: flex;
    align-items: flex-end;
    gap: 12px;
    margin-bottom: 12px;
}

.page-title {
    font-size: 30px;
    font-weight: 700;
    color: #1d1d1f;
    margin: 0;
    line-height: 1.1;
}

.total-count {
    font-size: 14px;
    color: #8e8e93;
    margin-bottom: 4px;
}

.header-filters {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    flex-wrap: wrap;
}


/* Tabs 微调与 Home 保持风格近似 */
:deep(.van-tabs__wrap) {
    margin-bottom: 4px;
}

:deep(.van-tab) {
    font-size: 14px;
    font-weight: 500;
    padding: 0 4px;
}

:deep(.van-tabs__line) {
    background: #007AFF;
    height: 3px;
    border-radius: 3px;
}

/* 网格布局 模仿首页 product-pair-grid 的双列，但更弹性 */
.fav-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
}

/* 单卡片 */
.fav-card {
    background: #fff;
    border-radius: 18px;
    overflow: hidden;
    cursor: pointer;
    box-shadow: 0 2px 16px rgba(0, 0, 0, .06);
    display: flex;
    flex-direction: column;
    position: relative;
    transition: transform .25s ease, box-shadow .25s ease;
}

.fav-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 28px rgba(0, 0, 0, .12);
}

.fav-card:active {
    transform: translateY(-1px);
}

.card-media-wrapper {
    position: relative;
    aspect-ratio: 4/3;
    background: #f2f2f7;
}

.card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

/* 收藏标记与状态 */
.fav-icon {
    position: absolute;
    top: 8px;
    right: 10px;
    color: #ffd700;
    font-size: 20px;
    text-shadow: 0 2px 6px rgba(0, 0, 0, .25);
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

.card-info {
    padding: 14px 16px 16px;
    display: flex;
    flex-direction: column;
    flex: 1;
}

.card-title {
    font-size: 15px;
    font-weight: 600;
    color: #1d1d1f;
    margin: 0 0 8px;
    line-height: 1.35;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    /* 标准属性补充 */
    overflow: hidden;
}

.card-meta {
    display: flex;
    justify-content: space-between;
    margin: 0 0 10px;
    font-size: 13px;
    color: #8e8e93;
    align-items: center;
}

.card-meta .price {
    font-size: 18px;
    font-weight: 700;
    color: #007AFF;
}

.card-meta .loc {
    font-size: 11px;
    max-width: 50%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: right;
}

.card-footer {
    margin-top: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    color: #8e8e93;
}

.card-footer .time {
    font-size: 11px;
}

/* 按钮微调 */
:deep(.van-button--mini) {
    line-height: 1.1;
    font-size: 11px;
    padding: 0 10px;
}

/* 空状态对齐 */
:deep(.van-empty) {
    padding: 40px 0 60px;
}

/* 响应式 */
@media (max-width: 960px) {
    .page-title {
        font-size: 26px;
    }

    .fav-grid {
        gap: 14px;
    }
}

@media (max-width: 720px) {
    .favorites-main {
        padding: 12px 16px 32px;
    }

    .page-title {
        font-size: 24px;
    }

    .fav-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }

    .card-meta .price {
        font-size: 16px;
    }
}

@media (max-width: 520px) {
    .page-title {
        font-size: 22px;
    }

    .fav-grid {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 12px;
    }

    .card-info {
        padding: 12px 12px 14px;
    }

    .card-title {
        font-size: 14px;
        margin-bottom: 6px;
    }

    .card-meta {
        margin-bottom: 8px;
    }

    .card-meta .price {
        font-size: 15px;
    }
}
</style>