<template>
    <div class="page">
        <van-nav-bar title="订单详情" left-arrow @click-left="$router.back()" fixed />
        <div class="container" style="padding-top: 56px;">
            <div v-if="loading" class="loading-container">
                <van-loading size="24px">加载中...</van-loading>
            </div>
            <div v-else-if="order" class="order-detail-container">
                <!-- 支付倒计时 -->
                <div v-if="order.status === 'PENDING' && isCurrentUserBuyer" class="countdown-card">
                    <div class="countdown-title">请在15分钟内完成支付</div>
                    <van-count-down :time="remainingTime" @finish="handleTimeout" format="mm:ss" />
                    <div class="countdown-tip">超时订单将自动取消</div>
                </div>

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

                <!-- 收货地址 -->
                <div class="address-card" v-if="order.address">
                    <div class="address-card-title">收货地址</div>
                    <div class="address-info">
                        <div class="recipient-info">
                            <span class="recipient-name">{{ order.address.recipientName }}</span>
                            <span class="recipient-phone">{{ order.address.phone }}</span>
                        </div>
                        <div class="address-detail">
                            {{ order.address.province }} {{ order.address.city }} {{ order.address.district }}
                            {{ order.address.detailedAddress }}
                        </div>
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
                    <div v-if="isCurrentUserBuyer && order.status === 'PENDING'" class="pending-actions">
                        <van-button type="default" block round @click="handleUpdateStatus('cancel')">取消订单</van-button>
                        <van-button type="primary" block round @click="handleUpdateStatus('pay')">立即支付</van-button>
                    </div>
                    <van-button v-if="isCurrentUserSeller && order.status === 'PAID'" type="primary" block round
                        @click="handleUpdateStatus('ship')">
                        确认发货
                    </van-button>
                    <van-button v-if="isCurrentUserBuyer && order.status === 'SHIPPED'" type="success" block round
                        @click="handleUpdateStatus('confirm')">
                        确认收货
                    </van-button>
                    <van-button v-if="isCurrentUserBuyer && order.status === 'PAID'" type="default" block round
                        @click="handleUpdateStatus('cancel')">
                        取消订单
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
import { cancelOrder, confirmDelivery, getOrderById, payOrder, shipOrder } from '@/api/orders';
import { useUserStore } from '@/stores/user';
import '@/styles/order-card.css';
import { showConfirmDialog, showFailToast, showSuccessToast, CountDown as VanCountDown } from 'vant';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

export default {
    name: 'OrderDetail',
    components: {
        VanCountDown,
    },
    setup() {
        const route = useRoute();
        const userStore = useUserStore();
        const loading = ref(true);
        const order = ref(null);
        const remainingTime = ref(0);

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
                console.log('Order data:', order.value);
                if (order.value.status === 'PENDING') {
                    const createdAt = new Date(order.value.createdAt).getTime();
                    const now = Date.now();
                    const diff = now - createdAt;
                    if (diff < 15 * 60 * 1000) {
                        remainingTime.value = 15 * 60 * 1000 - diff;
                    }
                }
            } catch (error) {
                showFailToast('加载订单详情失败');
            } finally {
                loading.value = false;
            }
        };

        const handleUpdateStatus = (action) => {
            const actions = {
                pay: { api: payOrder, success: '支付成功', confirm: { title: '确认支付', message: '您将要完成支付' } },
                cancel: { api: cancelOrder, success: '订单已取消', confirm: { title: '确认取消订单', message: '您确定要取消此订单吗？' } },
                ship: { api: shipOrder, success: '发货成功', confirm: { title: '确认发货', message: '您确定要将此订单标记为已发货吗？' } },
                confirm: { api: confirmDelivery, success: '收货成功', confirm: { title: '确认收货', message: '您确定已收到此订单的商品吗？' } },
            };

            const { api, success, confirm } = actions[action];

            showConfirmDialog(confirm)
                .then(async () => {
                    try {
                        const updatedOrder = await api(order.value.id);
                        order.value = updatedOrder;
                        showSuccessToast(success);
                    } catch (error) {
                        showFailToast('操作失败');
                    }
                })
        };

        const handleTimeout = async () => {
            if (order.value.status === 'PENDING') {
                try {
                    await cancelOrder(order.value.id);
                    order.value.status = 'CANCELLED';
                    showFailToast('支付超时，订单已自动取消');
                } catch (error) {
                    console.error('Failed to cancel order on timeout:', error);
                }
            }
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
            remainingTime,
            handleTimeout
        };
    },
};
</script>

<style scoped>
.countdown-card {
    background: #fff;
    border-radius: 16px;
    padding: 16px;
    margin: 10px 0;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.countdown-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
}

:deep(.van-count-down) {
    font-size: 24px;
    font-weight: bold;
    color: #ee0a24;
}

.countdown-tip {
    font-size: 12px;
    color: #969799;
    margin-top: 8px;
}

.pending-actions {
    display: flex;
    gap: 10px;
}

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

.address-card {
    background: #fff;
    border-radius: 16px;
    padding: 16px;
    margin-top: 14px;
}

.address-card-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
}

.address-info {
    font-size: 14px;
    line-height: 1.6;
}

.recipient-info {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}

.recipient-name {
    font-weight: 500;
    margin-right: 10px;
}

.address-detail {
    color: #6b7280;
}
</style>
