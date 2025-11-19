<template>
    <div class="page">
        <van-nav-bar title="我卖出的" left-arrow @click-left="$router.back()" fixed />
        <div class="container" style="padding-top: 56px;">
            <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了">
                <template v-if="loading">
                    <van-skeleton v-for="i in 3" :key="i" title :row="3" style="margin: 12px 0;" />
                </template>
                <template v-else-if="orders.length === 0">
                    <van-empty description="您还没有购买任何商品" />
                </template>
                <template v-else>
                    <div v-for="order in orders" :key="order.id" class="order-card shadow-soft-lg">
                        <div class="head">
                            <div class="user">买家：{{ order.buyer.username }}</div>
                            <van-tag plain type="primary" size="small">{{ order.status }}</van-tag>
                        </div>
                        <div class="body">
                            <van-image :src="order.product.images?.url" width="64" height="64" radius="8" fit="cover" />
                            <div class="info">
                                <div class="title">{{ order.product.title }}</div>
                                <div class="meta">￥{{ order.price }}</div>
                            </div>
                            <div class="actions">
                                <van-button size="small" type="primary" round @click="viewOrderDetail(order)">查看详情
                                </van-button>
                                <van-button v-if="order.status === 'PAID'" size="small" type="info" round
                                    @click="handleShipOrder(order)">
                                    发货
                                </van-button>
                            </div>
                        </div>
                    </div>
                </template>
            </van-list>
        </div>
    </div>
</template>

<script>
import { getSoldOrders, shipOrder } from '@/api/orders';
import { showFailToast, showSuccessToast } from 'vant';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
    name: 'OrderManage',
    setup() {
        const router = useRouter();
        const loading = ref(true);
        const finished = ref(false);
        const orders = ref([]);

        const loadOrders = async () => {
            try {
                loading.value = true;
                const res = await getSoldOrders();
                orders.value = res;
                finished.value = true; // 假设一次性加载所有订单
            } catch (error) {
                showFailToast('加载订单失败');
            } finally {
                loading.value = false;
            }
        };

        const viewOrderDetail = (order) => {
            router.push({ name: 'OrderDetail', params: { id: order.id } });
        };

        const handleShipOrder = async (order) => {
            try {
                await shipOrder(order.id);
                showSuccessToast('发货成功');
                // 更新订单状态
                const index = orders.value.findIndex(o => o.id === order.id);
                if (index !== -1) {
                    orders.value[index].status = 'SHIPPED';
                }
            } catch (error) {
                showFailToast('发货失败');
            }
        };

        onMounted(() => {
            loadOrders();
        });

        return {
            loading,
            finished,
            orders,
            viewOrderDetail,
            handleShipOrder,
        };
    },
};
</script>

<style scoped>
@import '@/styles/order-card.css';
</style>
