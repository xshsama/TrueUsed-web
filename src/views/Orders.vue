<template>
    <div class="page">
        <van-nav-bar title="我的订单" left-arrow @click-left="$router.back()" fixed />
        <div class="container" style="padding-top:56px;">
            <van-tabs v-model:active="active" @change="onTabChange" sticky offset-top="56">
                <van-tab title="全部" name="all" />
                <van-tab name="unpaid">
                    <template #title>
                        待付款 <van-icon v-if="active === 'unpaid'" name="card" />
                    </template>
                </van-tab>
                <van-tab title="待发货" name="toship" />
                <van-tab title="待收货" name="toreceive" />
                <van-tab title="售后" name="afterSale" />
            </van-tabs>

            <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
                <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
                    <template v-if="isInitialLoading">
                        <van-skeleton v-for="i in 4" :key="i" title :row="3" style="margin:12px 0" />
                    </template>
                    <template v-else>
                        <template v-if="filteredOrders.length === 0">
                            <van-empty class="custom-empty" image="search">
                                <template #description>
                                    <div class="empty-text">您的订单列表是空的</div>
                                </template>
                                <van-button round type="primary" class="bottom-button" to="/home">
                                    去首页看看
                                </van-button>
                            </van-empty>
                        </template>
                        <transition-group name="order-list" tag="div" class="order-list-container">
                            <div v-for="o in filteredOrders" :key="o.id" class="order-card">
                                <div class="order-head">
                                    <span class="order-no">订单号 {{ o.id }}</span>
                                    <div class="status-col">
                                        <van-tag :color="getStatusColor(o.status)"
                                            :text-color="getStatusTextColor(o.status)" size="medium">
                                            {{ statusText(o.status) }}
                                        </van-tag>
                                        <!-- 待付款倒计时 -->
                                        <div v-if="o.status === 'PENDING'" class="mini-countdown">
                                            <van-icon name="clock-o" />
                                            <van-count-down :time="getRemainingTime(o.createdAt)" format="mm:ss"
                                                @finish="onRefresh" />
                                        </div>
                                    </div>
                                </div>
                                <div class="order-body" @click="view(o)">
                                    <van-image :src="o.product.images?.url" width="80" height="80" fit="cover"
                                        radius="8" />
                                    <div class="info">
                                        <div class="title">{{ o.product.title }}</div>
                                        <div class="meta">共1件</div>
                                    </div>
                                    <div class="amount">￥{{ o.price }}</div>
                                </div>
                                <div class="order-actions">
                                    <van-button v-if="o.status === 'PENDING'" type="danger" size="small" round
                                        @click="pay(o)">立即支付</van-button>
                                    <van-button v-if="o.status === 'PENDING'" size="small" round plain
                                        @click="cancel(o)">取消订单</van-button>
                                    <van-button v-if="o.status === 'SHIPPED'" type="success" size="small" round
                                        @click="confirm(o)">确认收货</van-button>
                                    <van-button v-if="o.status === 'PAID'" size="small" round plain
                                        @click="cancel(o)">取消订单</van-button>
                                    <van-button v-if="o.status === 'COMPLETED'" size="small" round plain type="primary"
                                        @click.stop="$router.push({ path: '/review/create', query: { orderId: o.id } })">
                                        评价
                                    </van-button>
                                    <van-button size="small" round plain class="btn-detail"
                                        @click="view(o)">查看详情</van-button>
                                </div>
                            </div>
                        </transition-group>
                    </template>
                </van-list>
            </van-pull-refresh>
        </div>
    </div>

</template>

<script>
import { cancelOrder, confirmDelivery, getMyOrders } from '@/api/orders';
import '@/styles/order-card.css';
import { showConfirmDialog, showFailToast, showSuccessToast, CountDown as VanCountDown } from 'vant';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
export default {
    name: 'Orders',
    components: {
        VanCountDown,
    },
    setup() {
        const route = useRoute()
        const router = useRouter()
        const active = ref('all')
        const loading = ref(false)
        const refreshing = ref(false)
        const finished = ref(false)
        const isInitialLoading = ref(true)
        const page = ref(1)
        const pageSize = 10
        const orders = ref([])

        const statusMap = {
            all: '全部',
            PENDING: '待付款',
            PAID: '待发货',
            SHIPPED: '待收货',
            COMPLETED: '已完成',
            CANCELLED: '已取消',
        };

        const getStatusType = (status) => {
            if (status === 'COMPLETED' || status === 'SHIPPED') return 'success';
            if (status === 'PENDING') return 'warning';
            if (status === 'CANCELLED') return 'default';
            return 'primary';
        };

        const getStatusColor = (status) => {
            if (status === 'PENDING') return '#fff7cc'; // 暖黄背景
            if (status === 'COMPLETED' || status === 'SHIPPED') return '#e8f5e9'; // 绿色背景
            if (status === 'CANCELLED') return '#f5f5f5'; // 灰色背景
            if (status === 'PAID') return '#e3f2fd'; // 蓝色背景
            return '';
        };

        const getStatusTextColor = (status) => {
            if (status === 'PENDING') return '#ff9800';
            if (status === 'COMPLETED' || status === 'SHIPPED') return '#4caf50';
            if (status === 'CANCELLED') return '#999999';
            if (status === 'PAID') return '#1989fa';
            return '';
        };

        const filteredOrders = computed(() => {
            if (active.value === 'all') return orders.value;
            const statusMapping = {
                unpaid: 'PENDING',
                toship: 'PAID',
                toreceive: 'SHIPPED',
            };

            if (active.value === 'afterSale') {
                const refundStatuses = ['REFUND_PENDING', 'REFUND_APPROVED', 'RETURN_PENDING', 'REFUNDED', 'REFUND_REJECTED'];
                return orders.value.filter(o => refundStatuses.includes(o.status));
            }

            const targetStatus = statusMapping[active.value];
            if (!targetStatus) return [];
            return orders.value.filter(o => o.status === targetStatus);
        });

        const loadOrders = async () => {
            loading.value = true;
            isInitialLoading.value = true;
            try {
                const res = await getMyOrders();
                orders.value = res;
                finished.value = true; // 假设一次性加载
            } catch (error) {
                showFailToast('加载订单失败');
            } finally {
                loading.value = false;
                isInitialLoading.value = false;
            }
        };

        const onLoad = () => {
            // 初始加载由 onMounted 调用
        };

        const onRefresh = async () => {
            refreshing.value = true;
            await loadOrders();
            refreshing.value = false;
            showSuccessToast('已刷新');
        };

        const onTabChange = (name) => {
            router.replace({ name: 'Orders', query: { status: name === 'all' ? undefined : name } })
        }

        const applyStatusFromQuery = () => {
            const s = route.query.status
            const allowed = ['all', 'unpaid', 'toship', 'toreceive', 'afterSale']
            active.value = allowed.includes(s) ? s : (s ? 'all' : 'all')
        }

        const pay = (order) => {
            // 跳转到独立的支付页面
            router.push({ name: 'Payment', params: { id: order.id } });
        };

        const cancel = (order) => {
            showConfirmDialog({ title: '取消订单', message: '确定取消这个订单吗？' })
                .then(async () => {
                    await cancelOrder(order.id);
                    showSuccessToast('已取消');
                    order.status = 'CANCELLED';
                })
        };

        const confirm = (order) => {
            showConfirmDialog({ title: '确认收货', message: '确认收到货物？' })
                .then(async () => {
                    await confirmDelivery(order.id);

                    showSuccessToast('已确认收货');
                    order.status = 'COMPLETED';
                })
        };

        const view = (order) => {
            router.push({ name: 'OrderDetail', params: { id: order.id } });
        };

        const getRemainingTime = (createdAt) => {
            let timeVal = createdAt
            // 兼容 Instant 序列化为秒级时间戳的情况
            if (typeof timeVal === 'number' && timeVal < 100000000000) {
                timeVal = timeVal * 1000
            }
            const createTime = new Date(timeVal).getTime()
            const now = Date.now()
            const diff = 15 * 60 * 1000 - (now - createTime)
            return diff > 0 ? diff : 0
        }

        onMounted(() => {
            applyStatusFromQuery();
            loadOrders();
        });

        watch(() => route.query.status, () => {
            applyStatusFromQuery()
        })

        return {
            active, loading, refreshing, finished, isInitialLoading, filteredOrders,
            statusText: (s) => statusMap[s] || s,
            onLoad, onRefresh, onTabChange, pay, cancel, confirm, view,
            getRemainingTime, getStatusType, getStatusColor, getStatusTextColor
        };
    }
}
</script>

<style scoped>
/* 样式已迁移至 order-card.css */

/* 空状态优化 */
.custom-empty {
    padding: 48px 0;
}

.custom-empty :deep(.van-empty__image) {
    width: 120px;
    height: 120px;
    filter: sepia(100%) hue-rotate(70deg) saturate(400%) opacity(0.8);
}

.empty-text {
    font-size: 16px;
    color: #323233;
    font-weight: 500;
    margin-top: 16px;
    margin-bottom: 8px;
}

.bottom-button {
    width: 160px;
    height: 40px;
    margin-top: 16px;
}

/* 列表过渡动画 */
.order-list-container {
    position: relative;
    width: 100%;
}

.order-list-enter-active,
.order-list-leave-active {
    transition: all 0.4s cubic-bezier(0.55, 0, 0.1, 1);
}

/* 关键：让离开的元素脱离文档流，从而让剩余元素能平滑移动占位 */
.order-list-leave-active {
    position: absolute;
    width: 100%;
    z-index: 0;
}

.order-list-enter-from,
.order-list-leave-to {
    opacity: 0;
    transform: translateY(30px);
}

.order-list-move {
    transition: transform 0.4s ease;
}

.status-col {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.mini-countdown {
    display: flex;
    align-items: center;
    font-size: 11px;
    color: #ff9f0a;
    margin-top: 2px;
}

.mini-countdown .van-count-down {
    font-size: 11px;
    color: #ff9f0a;
    margin-left: 2px;
    line-height: 1;
}

/* 覆盖 Tab 徽标颜色 */
:deep(.van-badge--fixed) {
    background-color: #FF9800;
}

/* 页面布局调整 */
.page {
    min-height: 100vh;
    background: var(--bg-page);
}

.container {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    padding-top: 56px !important;
    box-sizing: border-box;
}
</style>
