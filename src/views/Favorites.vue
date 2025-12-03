<template>
    <div class="favorites-page">
        <van-nav-bar title="我的收藏" fixed placeholder />
        <div class="favorites-layout">
            <div class="favorites-main">
                <!-- 过滤与概览 -->
                <div class="favorites-header-card">
                    <div class="header-top-row">
                        <div class="title-area">
                            <h1 class="page-title">我的收藏</h1>
                            <span class="total-count" v-if="filteredList.length">共 {{ filteredList.length }} 件</span>
                        </div>
                        <van-button v-if="hasInvalidItems" size="small" plain round type="danger" class="clean-btn"
                            @click="cleanInvalid">
                            清空失效
                        </van-button>
                    </div>
                    <div class="header-filters">
                        <van-tabs v-model:active="activeTab" @change="onTabChange" shrink line-width="20px"
                            color="#2196F3">
                            <van-tab :title="`全部 (${favoriteList.length})`" name="all" />
                            <van-tab :title="`降价 (${priceDropCount})`" name="priceDrop" />
                            <van-tab :title="`在售 (${sellingCount})`" name="selling" />
                            <van-tab :title="`失效 (${invalidCount})`" name="invalid" />
                        </van-tabs>
                    </div>
                </div>

                <!-- 收藏网格 -->
                <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
                    <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
                        <div v-if="loading && page === 0" class="fav-grid">
                            <van-skeleton v-for="i in 6" :key="i" class="skeleton-item" title avatar :row="3" />
                        </div>
                        <div v-else-if="filteredList.length" class="fav-grid">
                            <div v-for="item in filteredList" :key="item.id" class="fav-item-wrapper"
                                :class="{ 'is-invalid': isInvalid(item) }" @click="goToProductDetail(item.id)">
                                <ProductCard :product="item" :show-desc="false" :status="item.status">
                                    <template #tags>
                                        <div v-if="item.priceDrop > 0 && !isInvalid(item)" class="price-drop-tag">
                                            <van-icon name="down" /> 降 ¥{{ item.priceDrop }}
                                        </div>
                                    </template>
                                    <template #footer-right>
                                        <div class="action-buttons">
                                            <template v-if="!isInvalid(item)">
                                                <van-button size="mini" round plain type="primary" class="action-btn"
                                                    @click.stop="goToChat(item)">
                                                    砍价
                                                </van-button>
                                                <van-button size="mini" round color="#FF5722" class="action-btn"
                                                    @click.stop="goToProductDetail(item.id)">
                                                    购买
                                                </van-button>
                                            </template>
                                            <template v-else>
                                                <van-button size="mini" round plain class="action-btn"
                                                    @click.stop="findSimilar(item)">
                                                    找相似
                                                </van-button>
                                            </template>
                                            <van-button size="mini" round plain class="action-btn remove-btn"
                                                @click.stop="removeFavorite(item.id)">
                                                <van-icon name="delete-o" />
                                            </van-button>
                                        </div>
                                    </template>
                                </ProductCard>
                                <!-- 失效遮罩 -->
                                <div v-if="isInvalid(item)" class="invalid-overlay">
                                    <span class="invalid-text">{{ getStatusText(item.status) }}</span>
                                </div>
                            </div>
                        </div>
                        <div v-else class="empty-state-wrapper">
                            <van-empty description="暂无相关收藏">
                                <template #image>
                                    <van-icon name="like-o" size="64" color="#e0e0e0" />
                                </template>
                                <van-button type="primary" size="small" color="#2196F3"
                                    @click="$router.push('/home')">去逛逛</van-button>
                            </van-empty>
                        </div>
                    </van-list>
                </van-pull-refresh>
            </div>
        </div>
    </div>
</template>

<script>
import { listMyFavorites } from '@/api/favorites'
import { getProduct } from '@/api/products'
import ProductCard from '@/components/ProductCard.vue'
import { useFavoritesStore } from '@/stores/favorites'
import { showConfirmDialog, showFailToast, showSuccessToast } from 'vant'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
    name: 'Favorites',
    components: { ProductCard },
    setup() {
        const router = useRouter()
        const favoritesStore = useFavoritesStore()

        const activeTab = ref('all')
        const refreshing = ref(false)
        const loading = ref(false)
        const finished = ref(false)
        const favoriteList = ref([])
        const keyword = ref('')
        const debounceTimer = ref(null)

        const sellingCount = computed(() => favoriteList.value.filter(i => i.status === 'selling').length)
        const priceDropCount = computed(() => favoriteList.value.filter(i => i.priceDrop > 0 && i.status === 'selling').length)
        const invalidCount = computed(() => favoriteList.value.filter(i => i.status === 'sold' || i.status === 'offline').length)
        const hasInvalidItems = computed(() => invalidCount.value > 0)

        const isInvalid = (item) => item.status === 'sold' || item.status === 'offline'

        const filteredList = computed(() => {
            let list = favoriteList.value
            if (activeTab.value === 'selling') {
                list = list.filter(i => i.status === 'selling')
            } else if (activeTab.value === 'priceDrop') {
                list = list.filter(i => i.priceDrop > 0 && i.status === 'selling')
            } else if (activeTab.value === 'invalid') {
                list = list.filter(i => isInvalid(i))
            }

            const kw = keyword.value.trim().toLowerCase()
            if (!kw) return list
            return list.filter(item =>
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
                    image: '',
                    location: '',
                    favoriteTime: new Date(f.createdAt).toLocaleString(),
                    status: 'selling',
                    priceDrop: 0
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
                                card.status = p.status || 'selling'
                                card.sellerId = p.sellerId // Add sellerId

                                // Mock price drop logic
                                if (card.status === 'selling' && Math.random() > 0.7) {
                                    card.priceDrop = Math.floor(Math.random() * 500) + 50
                                }
                            }
                        } catch (e) { /* ignore single item errors */ }
                    })
                )
                finished.value = res?.last || content.length < size.value
                page.value += 1
            } catch (e) {
                showFailToast('加载失败')
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
            // Tab change is handled by computed filteredList
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

        // 获取状态文本
        const getStatusText = (status) => {
            const texts = {
                selling: '在售',
                sold: '已售出',
                offline: '已失效'
            }
            return texts[status] || '失效'
        }

        // 取消收藏
        const removeFavorite = (id) => {
            showConfirmDialog({
                title: '确认取消收藏',
                message: '取消收藏后，该商品将从收藏列表中移除',
            }).then(async () => {
                try {
                    await favoritesStore.remove(id)
                    favoriteList.value = favoriteList.value.filter(item => item.id !== id)
                    showSuccessToast('已取消收藏')
                } catch (e) {
                    showFailToast('操作失败')
                }
            })
        }

        const cleanInvalid = () => {
            showConfirmDialog({
                title: '清空失效商品',
                message: '确定要清空所有已失效的商品吗？',
            }).then(async () => {
                const invalidIds = favoriteList.value.filter(isInvalid).map(i => i.id)
                // In real app, call API to batch remove. Here we just remove locally.
                // await favoritesStore.batchRemove(invalidIds) 
                favoriteList.value = favoriteList.value.filter(i => !isInvalid(i))
                showSuccessToast(`已清理 ${invalidIds.length} 个失效商品`)
            })
        }

        const goToChat = (item) => {
            // Assuming we have a chat route
            router.push({ name: 'MessageChat', params: { id: item.sellerId }, query: { productId: item.id } })
        }

        const findSimilar = (item) => {
            router.push({ name: 'Search', query: { q: item.title } })
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
            getStatusText,
            removeFavorite,
            goToProductDetail,
            sellingCount,
            priceDropCount,
            invalidCount,
            hasInvalidItems,
            cleanInvalid,
            isInvalid,
            goToChat,
            findSimilar,
            page
        }
    }
}
</script>

<style scoped>
.favorites-page {
    background: #f5f7fa;
    min-height: 100vh;
}

.favorites-layout {
    padding-top: 12px;
}

.favorites-main {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 16px 40px;
}

/* 顶部卡片头部 */
.favorites-header-card {
    background: #fff;
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    margin-bottom: 16px;
}

.header-top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.title-area {
    display: flex;
    align-items: baseline;
    gap: 8px;
}

.page-title {
    font-size: 20px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
}

.total-count {
    font-size: 12px;
    color: #999;
}

.clean-btn {
    height: 28px;
    padding: 0 12px;
    font-size: 12px;
}

.header-filters {
    margin: 0 -8px;
}

/* Tabs 微调 */
:deep(.van-tabs__wrap) {
    height: 36px;
}

:deep(.van-tab) {
    font-size: 14px;
    color: #666;
    padding: 0 12px;
}

:deep(.van-tab--active) {
    color: #1a1a1a;
    font-weight: 600;
}

/* 网格布局 */
.fav-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.fav-item-wrapper {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
    background: #fff;
}

.fav-item-wrapper.is-invalid {
    filter: grayscale(1);
    opacity: 0.8;
}

/* 降价标签 */
.price-drop-tag {
    position: absolute;
    top: 8px;
    left: 8px;
    background: #ff3b30;
    color: #fff;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 2px;
    z-index: 2;
    box-shadow: 0 2px 6px rgba(255, 59, 48, 0.3);
}

/* 失效遮罩 */
.invalid-overlay {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    pointer-events: none;
}

.invalid-text {
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
}

/* 底部按钮组 */
.action-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
}

.action-btn {
    height: 24px;
    padding: 0 10px;
    font-size: 12px;
}

.remove-btn {
    padding: 0 8px;
    color: #999;
    border-color: #eee;
}

/* 空状态 */
.empty-state-wrapper {
    padding: 40px 0;
    background: #fff;
    border-radius: 16px;
    margin-top: 16px;
}

/* 响应式 */
@media (min-width: 640px) {
    .fav-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
    }
}

@media (min-width: 1024px) {
    .fav-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
    }
}

@media (min-width: 1440px) {
    .fav-grid {
        grid-template-columns: repeat(5, 1fr);
    }
}
</style>
