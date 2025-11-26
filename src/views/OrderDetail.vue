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

                <!-- 物流信息 -->
                <div class="shipping-card" v-if="order.trackingNumber">
                    <div class="shipping-header">
                        <div class="shipping-title">
                            <van-icon name="logistics" />
                            <span>物流信息</span>
                        </div>
                        <div class="shipping-status"
                            :class="'status-' + (shippingInfo?.shippingStatus || 'pending').toLowerCase()">
                            {{ shippingStatusText(shippingInfo?.shippingStatus) }}
                        </div>
                    </div>
                    <div class="shipping-basic">
                        <div class="shipping-row">
                            <span class="label">快递公司</span>
                            <span class="value">{{ order.expressCompany }}</span>
                        </div>
                        <div class="shipping-row">
                            <span class="label">快递单号</span>
                            <span class="value tracking-number">{{ order.trackingNumber }}</span>
                        </div>
                        <div class="shipping-row" v-if="order.estimatedDeliveryTime">
                            <span class="label">预计送达</span>
                            <span class="value">{{ formatDate(order.estimatedDeliveryTime) }}</span>
                        </div>
                    </div>

                    <!-- 物流轨迹 -->
                    <div class="shipping-timeline" v-if="shippingInfo?.trackingEvents?.length">
                        <div class="timeline-title">物流轨迹</div>
                        <van-steps direction="vertical" :active="0">
                            <van-step v-for="(event, index) in shippingInfo.trackingEvents.slice().reverse()"
                                :key="index">
                                <div class="timeline-event">
                                    <div class="event-desc">{{ event.description }}</div>
                                    <div class="event-meta">
                                        <span class="event-time">{{ formatDateTime(event.time) }}</span>
                                        <span class="event-location" v-if="event.location">{{ event.location }}</span>
                                    </div>
                                </div>
                            </van-step>
                        </van-steps>
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
                        <van-button type="primary" block round @click="goToPayment">去支付</van-button>
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
import { cancelOrder, confirmDelivery, getOrderById, getOrderShipping, shipOrder } from '@/api/orders';
import { useUserStore } from '@/stores/user';
import '@/styles/order-card.css';
import { showConfirmDialog, showFailToast, showSuccessToast, CountDown as VanCountDown } from 'vant';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default {
    name: 'OrderDetail',
    components: {
        VanCountDown,
    },
    setup() {
        const route = useRoute();
        const router = useRouter();
        const userStore = useUserStore();
        const loading = ref(true);
        const order = ref(null);
        const remainingTime = ref(0);
        const shippingInfo = ref(null);

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

        const shippingStatusMap = {
            PENDING: '待揽收',
            PICKED: '已揽收',
            IN_TRANSIT: '运输中',
            DELIVERING: '派送中',
            DELIVERED: '已签收',
        };

        const statusText = (status) => statusMap[status] || status;
        const shippingStatusText = (status) => shippingStatusMap[status] || status || '查询中';

        const formatDate = (dateStr) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
        };

        const formatDateTime = (dateStr) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return date.toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        const loadOrder = async () => {
            try {
                loading.value = true;
                const orderId = route.params.id;
                order.value = await getOrderById(orderId);
                console.log('Order data:', order.value);

                // 如果订单已发货，加载物流信息
                if (order.value.trackingNumber) {
                    loadShippingInfo(orderId);
                }

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

        const loadShippingInfo = async (orderId) => {
            try {
                shippingInfo.value = await getOrderShipping(orderId);
            } catch (error) {
                console.error('Failed to load shipping info:', error);
            }
        };

        const goToPayment = () => {
            if (order.value) {
                router.push({ name: 'Payment', params: { id: order.value.id } });
            }
        };

        const handleUpdateStatus = (action) => {
            const actions = {
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
            goToPayment,
            statusText,
            remainingTime,
            handleTimeout,
            shippingInfo,
            shippingStatusText,
            formatDate,
            formatDateTime,
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

/* 物流信息卡片 */
.shipping-card {
    background: #fff;
    border-radius: 16px;
    padding: 16px;
    margin-top: 14px;
}

.shipping-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.shipping-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
}

.shipping-title .van-icon {
    color: #10b981;
    font-size: 18px;
}

.shipping-status {
    font-size: 12px;
    font-weight: 500;
    padding: 4px 10px;
    border-radius: 12px;
}

.shipping-status.status-pending {
    background: #fef3c7;
    color: #d97706;
}

.shipping-status.status-picked {
    background: #dbeafe;
    color: #2563eb;
}

.shipping-status.status-in_transit {
    background: #e0e7ff;
    color: #4f46e5;
}

.shipping-status.status-delivering {
    background: #d1fae5;
    color: #059669;
}

.shipping-status.status-delivered {
    background: #f3f4f6;
    color: #6b7280;
}

.shipping-basic {
    background: #f9fafb;
    border-radius: 12px;
    padding: 12px;
}

.shipping-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #f3f4f6;
}

.shipping-row:last-child {
    border-bottom: none;
}

.shipping-row .label {
    color: #6b7280;
    font-size: 13px;
}

.shipping-row .value {
    color: #1f2937;
    font-size: 13px;
    font-weight: 500;
}

.shipping-row .tracking-number {
    color: #2563eb;
    font-family: monospace;
}

.shipping-timeline {
    margin-top: 16px;
}

.timeline-title {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 12px;
}

.timeline-event {
    padding: 4px 0;
}

.event-desc {
    font-size: 13px;
    color: #1f2937;
    line-height: 1.5;
}

.event-meta {
    display: flex;
    gap: 12px;
    margin-top: 4px;
    font-size: 12px;
    color: #9ca3af;
}

:deep(.van-steps--vertical) {
    padding-left: 0;
}

:deep(.van-step__circle) {
    background: #10b981;
}

:deep(.van-step__line) {
    background: #e5e7eb;
}
</style>
