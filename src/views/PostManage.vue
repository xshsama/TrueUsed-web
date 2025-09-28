<template>
    <div class="post-manage-page">
        <!-- 顶部导航 -->
        <van-nav-bar title="我的发布" left-arrow @click-left="$router.go(-1)" />

        <div class="page-content">
            <!-- 状态标签 -->
            <div class="status-tabs">
                <van-tabs v-model:active="activeTab" @change="onTabChange" sticky>
                    <van-tab title="全部" name="all" />
                    <van-tab title="审核中" name="reviewing" />
                    <van-tab title="在售" name="selling" />
                    <van-tab title="已售" name="sold" />
                    <van-tab title="已下架" name="offline" />
                </van-tabs>
            </div>

            <!-- 商品列表 -->
            <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
                <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
                    <div v-if="productList.length > 0" class="product-list">
                        <div v-for="item in productList" :key="item.id" class="product-item" @click="editProduct(item)">
                            <van-image :src="item.image" :alt="item.title" class="item-image" fit="cover" lazy-load />
                            <div class="item-content">
                                <div class="item-title">{{ item.title }}</div>
                                <div class="item-price">¥{{ item.price }}</div>
                                <div class="item-meta">
                                    <span class="item-time">{{ item.publishTime }}</span>
                                    <span class="item-views">浏览 {{ item.views }}</span>
                                </div>
                                <div class="item-status">
                                    <van-tag :type="getStatusType(item.status)" size="small">
                                        {{ getStatusText(item.status) }}
                                    </van-tag>
                                </div>
                            </div>
                            <div class="item-actions">
                                <van-button v-if="item.status === 'selling'" size="mini" type="warning" plain
                                    @click.stop="soldOut(item.id)">
                                    标记售出
                                </van-button>
                                <van-button size="mini" plain @click.stop="showActionSheet(item)">
                                    更多
                                </van-button>
                            </div>
                        </div>
                    </div>

                    <van-empty v-else image="search" description="还没有发布任何商品">
                        <van-button type="primary" size="small" @click="$router.push('/post/create')">
                            立即发布
                        </van-button>
                    </van-empty>
                </van-list>
            </van-pull-refresh>
        </div>

        <!-- 操作面板 -->
        <van-action-sheet v-model:show="showActions" :actions="actionSheetActions" @select="onActionSelect"
            cancel-text="取消" />
    </div>
</template>

<script>
import { Dialog, Toast } from 'vant'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
    name: 'PostManage',
    setup() {
        const router = useRouter()

        const activeTab = ref('all')
        const refreshing = ref(false)
        const loading = ref(false)
        const finished = ref(false)
        const productList = ref([])
        const showActions = ref(false)
        const currentProduct = ref(null)

        // 操作面板选项
        const actionSheetActions = reactive([
            { name: '编辑商品', value: 'edit' },
            { name: '置顶商品', value: 'pin' },
            { name: '复制商品', value: 'copy' },
            { name: '下架商品', value: 'offline', color: '#ee0a24' },
            { name: '删除商品', value: 'delete', color: '#ee0a24' }
        ])

        // 模拟商品数据
        const mockProducts = [
            {
                id: 1,
                title: 'iPhone 14 Pro 256GB 深空黑色',
                price: '6888',
                image: 'https://via.placeholder.com/120x120/333333/ffffff?text=iPhone+14',
                publishTime: '2天前发布',
                views: 125,
                status: 'selling'
            },
            {
                id: 2,
                title: '全新MacBook Air M2芯片 13英寸',
                price: '8999',
                image: 'https://via.placeholder.com/120x120/silver/000000?text=MacBook',
                publishTime: '1周前发布',
                views: 89,
                status: 'reviewing'
            },
            {
                id: 3,
                title: 'NIKE Air Jordan 1 黑红配色',
                price: '1299',
                image: 'https://via.placeholder.com/120x120/ff0000/ffffff?text=Jordan+1',
                publishTime: '3天前发布',
                views: 203,
                status: 'sold'
            },
            {
                id: 4,
                title: '小米13 Ultra 512GB 黑色',
                price: '4999',
                image: 'https://via.placeholder.com/120x120/000000/ffffff?text=小米13',
                publishTime: '5天前发布',
                views: 67,
                status: 'offline'
            }
        ]

        // 标签切换
        const onTabChange = (name) => {
            console.log('标签切换:', name)
            productList.value = []
            finished.value = false
            onLoad()
        }

        // 下拉刷新
        const onRefresh = () => {
            setTimeout(() => {
                productList.value = [...mockProducts]
                refreshing.value = false
                loading.value = false
                finished.value = false
                Toast.success('刷新成功')
            }, 1000)
        }

        // 上拉加载更多
        const onLoad = () => {
            setTimeout(() => {
                const filteredData = filterByStatus(mockProducts, activeTab.value)
                productList.value.push(...filteredData)
                loading.value = false
                finished.value = true
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
                reviewing: 'warning',
                selling: 'success',
                sold: 'default',
                offline: 'danger'
            }
            return types[status] || 'default'
        }

        // 获取状态文本
        const getStatusText = (status) => {
            const texts = {
                reviewing: '审核中',
                selling: '在售',
                sold: '已售',
                offline: '已下架'
            }
            return texts[status] || '未知'
        }

        // 编辑商品
        const editProduct = (product) => {
            Toast(`编辑商品：${product.title}`)
        }

        // 标记售出
        const soldOut = (id) => {
            Dialog.confirm({
                title: '确认标记售出',
                message: '确认该商品已售出？售出后将无法继续接收买家询问。',
            }).then(() => {
                const product = productList.value.find(item => item.id === id)
                if (product) {
                    product.status = 'sold'
                    Toast.success('已标记为售出')
                }
            }).catch(() => {
                console.log('取消操作')
            })
        }

        // 显示操作面板
        const showActionSheet = (product) => {
            currentProduct.value = product
            showActions.value = true
        }

        // 操作面板选择
        const onActionSelect = (action) => {
            const product = currentProduct.value
            if (!product) return

            switch (action.value) {
                case 'edit':
                    Toast(`编辑商品：${product.title}`)
                    break
                case 'pin':
                    Toast('置顶功能开发中')
                    break
                case 'copy':
                    Toast('复制功能开发中')
                    break
                case 'offline':
                    Dialog.confirm({
                        title: '确认下架',
                        message: '下架后买家将无法搜索到该商品',
                    }).then(() => {
                        product.status = 'offline'
                        Toast.success('商品已下架')
                    })
                    break
                case 'delete':
                    Dialog.confirm({
                        title: '确认删除',
                        message: '删除后无法恢复，确认删除该商品？',
                    }).then(() => {
                        const index = productList.value.findIndex(item => item.id === product.id)
                        if (index > -1) {
                            productList.value.splice(index, 1)
                            Toast.success('商品已删除')
                        }
                    })
                    break
            }

            showActions.value = false
            currentProduct.value = null
        }

        // 初始加载
        onLoad()

        return {
            activeTab,
            refreshing,
            loading,
            finished,
            productList,
            showActions,
            actionSheetActions,
            onTabChange,
            onRefresh,
            onLoad,
            getStatusType,
            getStatusText,
            editProduct,
            soldOut,
            showActionSheet,
            onActionSelect
        }
    }
}
</script>

<style scoped>
.post-manage-page {
    background-color: #f7f8fa;
    min-height: 100vh;
}

.page-content {
    padding-top: 46px;
}

.status-tabs {
    background: #fff;
    margin-bottom: 8px;
}

.product-list {
    padding: 0 16px;
}

.product-item {
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

.item-time,
.item-views {
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
    gap: 8px;
}
</style>