<template>
    <div class="page">
        <van-nav-bar title="我卖出的" left-arrow @click-left="$router.back()" fixed />
        <div class="container" style="padding-top: 56px;">
            <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="loadOrders">
                <template v-if="orders.length === 0 && !loading">
                    <van-empty description="暂无卖出订单" />
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
    name: 'OrderManage',
    setup() {
        const router = useRouter();
        const loading = ref(false); // Start false, let List trigger load
        const finished = ref(false);
        const orders = ref([]);
        const page = ref(0);
        const pageSize = 10;

        const loadOrders = async () => {
            try {
                const res = await getSoldOrders({
                    page: page.value,
                    size: pageSize,
                    sort: 'created_desc'
                });

                if (page.value === 0) {
                    orders.value = res.content;
                } else {
                    orders.value = orders.value.concat(res.content);
                }

                loading.value = false;

                if (res.last) {
                    finished.value = true;
                } else {
                    page.value++;
                }
            } catch (error) {
                showFailToast('加载订单失败');
                loading.value = false;
                finished.value = true;
            }
        };

        // Remove explicit onMounted call, let van-list @load trigger it
        // onMounted(() => {
        //     loadOrders();
        // });

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

        return {
            loading,
            finished,
            orders,
            loadOrders,
            viewOrderDetail,
            handleShipOrder,
        };
    },
};
</script>

<style scoped>
@import '@/styles/order-card.css';
</style>
