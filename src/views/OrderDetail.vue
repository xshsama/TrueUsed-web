<template>
    <div class="page">
        <van-nav-bar title="订单详情" left-arrow @click-left="$router.back()" fixed />
        <div class="container" style="padding-top: 56px;">
            <div v-if="loading" class="loading-container">
                <van-loading size="24px">加载中...</van-loading>
            </div>
            <div v-else-if="order" class="order-detail-card shadow-soft-lg">
                <div class="section">
                    <div class="section-title">订单状态</div>
                    <div class="section-content">
                        <van-tag type="primary" size="medium">{{ order.status }}</van-tag>
                    </div>
                </div>
                <div class="section">
                    <div class="section-title">商品信息</div>
                    <div class="section-content product-info">
                        <van-image :src="order.product.images?.url" width="80" height="80" radius="8" fit="cover" />
                        <div class="info">
                            <div class="title">{{ order.product.title }}</div>
                            <div class="price">￥{{ order.price }}</div>
                        </div>
                    </div>
                </div>
                <div class="section">
                    <div class="section-title">卖家信息</div>
                    <div class="section-content">
                        <p>用户名: {{ order.seller.username }}</p>
                    </div>
                </div>
                <div class="section">
                    <div class="section-title">买家信息</div>
                    <div class="section-content">
                        <p>用户名: {{ order.buyer.username }}</p>
                    </div>
                </div>
                <div class="section">
                    <div class="section-title">订单号</div>
                    <div class="section-content">
                        <p>{{ order.id }}</p>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="actions" v-if="order">
                    <van-button v-if="isCurrentUserSeller && order.status === 'PAID'" type="primary" block
                        @click="handleUpdateStatus('ship')">
                        发货
                    </van-button>
                    <van-button v-if="isCurrentUserBuyer && order.status === 'SHIPPED'" type="success" block
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
        };
    },
};
</script>

<style scoped>
.order-detail-card {
    background: #fff;
    border-radius: 16px;
    padding: 16px;
    margin: 10px 0;
}

.section {
    margin-bottom: 16px;
}

.section-title {
    font-weight: 700;
    color: #111827;
    margin-bottom: 8px;
}

.product-info {
    display: flex;
    gap: 12px;
    align-items: center;
}

.product-info .info {
    flex: 1;
}

.product-info .title {
    font-weight: 600;
}

.product-info .price {
    color: #ef4444;
    margin-top: 4px;
}

.loading-container {
    display: flex;
    justify-content: center;
    padding: 20px;
}

.actions {
    margin-top: 20px;
}
</style>