<template>
    <div class="page">
        <van-nav-bar title="订单详情" left-arrow @click-left="$router.back()" fixed />
        <div class="container" style="padding-top: 56px;">
            <div v-if="loading" class="loading-container">
                <van-loading size="24px">加载中...</van-loading>
            </div>
            <div v-else-if="order" class="order-detail-container">
                <!-- 订单状态与商品信息卡片 -->
                <div class="order-card">
                    <div class="order-head">
                        <span class="order-status-title">订单状态</span>
                        <span class="order-status" :data-status="order.status">{{ statusText(order.status) }}</span>
                    </div>
                    <div class="order-body">
                        <van-image :src="order.product.images?.url" width="80" height="80" radius="12" fit="cover" />
                        <div class="info">
                            <div class="title">{{ order.product.title }}</div>
                            <div class="meta">总价</div>
                        </div>
                        <div class="amount">￥{{ order.price }}</div>
                    </div>
                </div>

                <!-- 订单详细信息 -->
                <div class="detail-list">
                    <div class="detail-item">
                        <span class="label">卖家</span>
                        <span class="value">{{ order.seller.username }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">买家</span>
                        <span class="value">{{ order.buyer.username }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">订单号</span>
                        <span class="value">{{ order.id }}</span>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="actions-footer" v-if="order">
                    <van-button v-if="isCurrentUserSeller && order.status === 'PAID'" type="primary" block round
                        @click="handleUpdateStatus('ship')">
                        确认发货
                    </van-button>
                    <van-button v-if="isCurrentUserBuyer && order.status === 'SHIPPED'" type="success" block round
                        @click="handleUpdateStatus('confirm')">
                        确认收货
                    </van-button>
                </div>
            </div>
            <div v-else>
                <van-empty description="订单不存在" />
            </div>
        </div>
    </div>
</template>

<script>
import { getOrderById, updateOrderStatus } from '@/api/orders';
import { useUserStore } from '@/stores/user';
import '@/styles/order-card.css';
import { Dialog, showFailToast, showSuccessToast } from 'vant';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

export default {
    name: 'OrderDetail',
    setup() {
        const route = useRoute();
        const userStore = useUserStore();
        const loading = ref(true);
        const order = ref(null);

        const isCurrentUserBuyer = computed(() => userStore.userInfo && order.value?.buyer.id === userStore.userInfo.id);
        const isCurrentUserSeller = computed(() => userStore.userInfo && order.value?.seller.id === userStore.userInfo.id);

        const statusMap = {
            PENDING: '待付款',
            PAID: '待发货',
            SHIPPED: '待收货',
            COMPLETED: '已完成',
            CANCELLED: '已取消',
            DELIVERED: '已送达',
        };

        const statusText = (status) => statusMap[status] || status;

        const loadOrder = async () => {
            try {
                loading.value = true;
                const orderId = route.params.id;
                order.value = await getOrderById(orderId);
            } catch (error) {
                showFailToast('加载订单详情失败');
            } finally {
                loading.value = false;
            }
        };

        const handleUpdateStatus = (action) => {
            const actions = {
                ship: {
                    api: () => updateOrderStatus(order.value.id, 'SHIPPED'),
                    title: '确认发货',
                    message: '您确定要将此订单标记为已发货吗？',
                },
                confirm: {
                    api: () => updateOrderStatus(order.value.id, 'DELIVERED'),
                    title: '确认收货',
                    message: '您确定已收到此订单的商品吗？',
                },
            };

            const { api, title, message } = actions[action];

            Dialog.confirm({ title, message })
                .then(async () => {
                    try {
                        const updatedOrder = await api(order.value.id);
                        order.value = updatedOrder;
                        showSuccessToast('操作成功');
                    } catch (error) {
                        showFailToast('操作失败');
                    }
                })
                .catch(() => { });
        };

        onMounted(() => {
            loadOrder();
        });

        return {
            loading,
            order,
            isCurrentUserBuyer,
            isCurrentUserSeller,
            handleUpdateStatus,
            statusText,
        };
    },
};
</script>

<style scoped>
.order-detail-container {
    padding: 10px 0;
}

/* 状态标题 */
.order-status-title {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
}

/* 详细信息列表 */
.detail-list {
    background: #fff;
    border-radius: var(--radius-lg, 16px);
    padding: 8px 16px;
    margin-top: 14px;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 0;
    border-bottom: 1px solid #f0f0f0;
}

.detail-item:last-child {
    border-bottom: none;
}

.detail-item .label {
    color: #4b5563;
    font-size: 14px;
}

.detail-item .value {
    color: #1f2937;
    font-weight: 500;
    font-size: 14px;
}

/* 底部操作区 */
.actions-footer {
    margin-top: 24px;
    padding: 0 16px;
}

.loading-container {
    display: flex;
    justify-content: center;
    padding: 20px;
}
</style>