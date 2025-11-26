<template>
    <div class="page">
        <van-nav-bar title="订单支付" left-arrow @click-left="handleBack" fixed />
        <div class="container" style="padding-top: 56px;">
            <div v-if="loading" class="loading-container">
                <van-loading size="24px">加载订单...</van-loading>
            </div>
            <template v-else-if="order">
                <!-- 支付倒计时 -->
                <div class="countdown-card">
                    <div class="countdown-icon">⏰</div>
                    <div class="countdown-info">
                        <div class="countdown-title">请在规定时间内完成支付</div>
                        <van-count-down :time="remainingTime" @finish="handleTimeout" format="mm 分 ss 秒"
                            class="countdown-timer" />
                    </div>
                    <div class="countdown-tip">超时订单将自动取消</div>
                </div>

                <!-- 订单信息卡片 -->
                <div class="order-info-card">
                    <div class="card-header">
                        <span class="card-title">订单信息</span>
                        <span class="order-id">订单号: {{ order.id }}</span>
                    </div>
                    <div class="product-info">
                        <van-image :src="order.product?.images?.url" width="80" height="80" radius="12" fit="cover" />
                        <div class="product-detail">
                            <div class="product-title">{{ order.product?.title }}</div>
                            <div class="product-desc">{{ order.product?.description?.slice(0, 30) }}...</div>
                        </div>
                    </div>
                </div>

                <!-- 支付金额 -->
                <div class="amount-card">
                    <div class="amount-label">支付金额</div>
                    <div class="amount-value">
                        <span class="currency">￥</span>
                        <span class="price">{{ order.price }}</span>
                    </div>
                </div>

                <!-- 支付方式选择 -->
                <div class="payment-methods-card">
                    <div class="card-title">选择支付方式</div>
                    <van-radio-group v-model="paymentMethod">
                        <van-cell-group :border="false">
                            <van-cell clickable @click="paymentMethod = 'wechat'" class="payment-option">
                                <template #icon>
                                    <div class="payment-icon wechat">
                                        <span>💚</span>
                                    </div>
                                </template>
                                <template #title>
                                    <span class="payment-name">微信支付</span>
                                </template>
                                <template #label>
                                    <span class="payment-desc">推荐使用微信支付</span>
                                </template>
                                <template #right-icon>
                                    <van-radio name="wechat" />
                                </template>
                            </van-cell>
                            <van-cell clickable @click="paymentMethod = 'alipay'" class="payment-option">
                                <template #icon>
                                    <div class="payment-icon alipay">
                                        <span>💙</span>
                                    </div>
                                </template>
                                <template #title>
                                    <span class="payment-name">支付宝</span>
                                </template>
                                <template #label>
                                    <span class="payment-desc">支付宝安全支付</span>
                                </template>
                                <template #right-icon>
                                    <van-radio name="alipay" />
                                </template>
                            </van-cell>
                        </van-cell-group>
                    </van-radio-group>
                </div>

                <!-- 温馨提示 -->
                <div class="tips-card">
                    <div class="tips-title">💡 温馨提示</div>
                    <ul class="tips-list">
                        <li>支付完成后请勿关闭页面，等待系统确认</li>
                        <li>如遇支付问题，请联系客服处理</li>
                        <li>您可以暂时离开此页面，稍后在"我的订单"中继续支付</li>
                    </ul>
                </div>
            </template>
            <div v-else class="error-container">
                <van-empty description="订单不存在或已失效" />
                <van-button type="primary" round @click="$router.push('/orders')">查看我的订单</van-button>
            </div>
        </div>

        <!-- 底部支付按钮 -->
        <div class="payment-footer" v-if="order && order.status === 'PENDING'">
            <div class="footer-left">
                <span class="footer-label">需支付</span>
                <span class="footer-amount">￥{{ order.price }}</span>
            </div>
            <van-button type="danger" round :loading="isPaying" @click="handlePayment" class="pay-button">
                确认支付
            </van-button>
        </div>

        <!-- 已支付/已取消状态 -->
        <div class="status-footer" v-else-if="order">
            <van-button type="primary" round block
                @click="$router.push({ name: 'OrderDetail', params: { id: order.id } })">
                查看订单详情
            </van-button>
        </div>
    </div>
</template>

<script>
import { cancelOrder, getOrderById, payOrder } from '@/api/orders';
import { showConfirmDialog, showFailToast, showSuccessToast, CountDown as VanCountDown } from 'vant';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default {
    name: 'Payment',
    components: {
        VanCountDown,
    },
    setup() {
        const route = useRoute();
        const router = useRouter();
        const loading = ref(true);
        const order = ref(null);
        const paymentMethod = ref('wechat');
        const isPaying = ref(false);
        const remainingTime = ref(0);

        const loadOrder = async () => {
            try {
                loading.value = true;
                const orderId = route.params.id;
                order.value = await getOrderById(orderId);

                // 计算剩余支付时间（15分钟）
                if (order.value.status === 'PENDING') {
                    const createdAt = new Date(order.value.createdAt).getTime();
                    const now = Date.now();
                    const diff = now - createdAt;
                    const maxTime = 15 * 60 * 1000; // 15分钟
                    if (diff < maxTime) {
                        remainingTime.value = maxTime - diff;
                    } else {
                        remainingTime.value = 0;
                    }
                }
            } catch (error) {
                console.error('Failed to load order:', error);
                showFailToast('加载订单失败');
            } finally {
                loading.value = false;
            }
        };

        const handlePayment = async () => {
            if (!order.value) return;

            isPaying.value = true;
            try {
                const updatedOrder = await payOrder(order.value.id);
                order.value = updatedOrder;
                showSuccessToast('支付成功');
                // 延迟跳转，让用户看到成功提示
                setTimeout(() => {
                    router.replace({ name: 'OrderDetail', params: { id: order.value.id } });
                }, 1500);
            } catch (error) {
                console.error('Payment failed:', error);
                showFailToast('支付失败，请重试');
            } finally {
                isPaying.value = false;
            }
        };

        const handleTimeout = async () => {
            if (order.value && order.value.status === 'PENDING') {
                try {
                    await cancelOrder(order.value.id);
                    order.value.status = 'CANCELLED';
                    showFailToast('支付超时，订单已自动取消');
                } catch (error) {
                    console.error('Failed to cancel order on timeout:', error);
                }
            }
        };

        const handleBack = () => {
            // 如果订单还在待支付状态，提示用户
            if (order.value && order.value.status === 'PENDING') {
                showConfirmDialog({
                    title: '确认离开？',
                    message: '订单尚未支付，您可以稍后在"我的订单"中继续支付',
                    confirmButtonText: '暂时离开',
                    cancelButtonText: '继续支付',
                }).then(() => {
                    // 确认离开，跳转到订单详情
                    router.push({ name: 'OrderDetail', params: { id: order.value.id } });
                }).catch(() => {
                    // 取消，继续停留在支付页面
                });
            } else {
                router.back();
            }
        };

        onMounted(() => {
            loadOrder();
        });

        return {
            loading,
            order,
            paymentMethod,
            isPaying,
            remainingTime,
            handlePayment,
            handleTimeout,
            handleBack,
        };
    },
};
</script>

<style scoped>
.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
}

.error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 20px;
}

/* 倒计时卡片 */
.countdown-card {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 16px;
    color: #fff;
    text-align: center;
}

.countdown-icon {
    font-size: 32px;
    margin-bottom: 8px;
}

.countdown-info {
    margin-bottom: 8px;
}

.countdown-title {
    font-size: 14px;
    opacity: 0.9;
    margin-bottom: 8px;
}

.countdown-timer {
    font-size: 28px;
    font-weight: bold;
}

:deep(.van-count-down) {
    color: #fff;
    font-size: 28px;
    font-weight: bold;
}

.countdown-tip {
    font-size: 12px;
    opacity: 0.8;
    margin-top: 8px;
}

/* 订单信息卡片 */
.order-info-card {
    background: #fff;
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 16px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.card-title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
}

.order-id {
    font-size: 12px;
    color: #9ca3af;
}

.product-info {
    display: flex;
    gap: 12px;
}

.product-detail {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.product-title {
    font-size: 15px;
    font-weight: 500;
    color: #1f2937;
    margin-bottom: 6px;
    line-height: 1.4;
}

.product-desc {
    font-size: 13px;
    color: #6b7280;
}

/* 金额卡片 */
.amount-card {
    background: #fff;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 16px;
    text-align: center;
}

.amount-label {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 8px;
}

.amount-value {
    color: #ee0a24;
}

.currency {
    font-size: 20px;
}

.price {
    font-size: 36px;
    font-weight: bold;
}

/* 支付方式卡片 */
.payment-methods-card {
    background: #fff;
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 16px;
}

.payment-methods-card .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 12px;
}

.payment-option {
    margin: 8px 0;
    border-radius: 12px;
    background: #f9fafb;
}

.payment-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    font-size: 24px;
}

.payment-icon.wechat {
    background: #e8f8e8;
}

.payment-icon.alipay {
    background: #e8f0ff;
}

.payment-name {
    font-size: 15px;
    font-weight: 500;
    color: #1f2937;
}

.payment-desc {
    font-size: 12px;
    color: #9ca3af;
}

/* 提示卡片 */
.tips-card {
    background: #fffbeb;
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 100px;
}

.tips-title {
    font-size: 14px;
    font-weight: 600;
    color: #92400e;
    margin-bottom: 10px;
}

.tips-list {
    margin: 0;
    padding-left: 20px;
    font-size: 13px;
    color: #a16207;
    line-height: 1.8;
}

/* 底部支付栏 */
.payment-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
    z-index: 100;
}

.footer-left {
    display: flex;
    flex-direction: column;
}

.footer-label {
    font-size: 12px;
    color: #6b7280;
}

.footer-amount {
    font-size: 22px;
    font-weight: bold;
    color: #ee0a24;
}

.pay-button {
    min-width: 140px;
    height: 44px;
    font-size: 16px;
    font-weight: 600;
}

.status-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    padding: 12px 16px;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}
</style>
