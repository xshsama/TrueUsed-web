<template>
    <div class="page">
        <van-nav-bar title="我的订单" left-arrow @click-left="$router.back()" fixed />
        <div class="container" style="padding-top:56px;">
            <van-tabs v-model:active="active" @change="onTabChange">
                <van-tab title="全部" name="all" />
                <van-tab title="待付款" name="unpaid" />
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
                            <van-empty description="暂无相关订单" />
                        </template>
                        <div v-for="o in filteredOrders" :key="o.id" class="order-card">
                            <div class="order-head">
                                <span class="order-no">订单号：{{ o.id }}</span>
                                <span class="order-status" :data-status="o.status">{{ statusText(o.status) }}</span>
                            </div>
                            <div class="order-body" @click="view(o)">
                                <van-image :src="o.product.images?.url" width="80" height="80" fit="cover"
                                    radius="12" />
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
                                <van-button size="small" round plain @click="view(o)">查看详情</van-button>
                            </div>
                        </div>
                    </template>
                </van-list>
            </van-pull-refresh>
        </div>
    </div>

</template>

<script>
import { cancelOrder, confirmDelivery, getMyOrders, payOrder } from '@/api/orders';
import '@/styles/order-card.css';
import { showConfirmDialog, showFailToast, showSuccessToast } from 'vant';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
export default {
    name: 'Orders',
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

        const filteredOrders = computed(() => {
            if (active.value === 'all') return orders.value;
            const statusMapping = {
                unpaid: 'PENDING',
                toship: 'PAID',
                toreceive: 'SHIPPED',
            };
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

        const pay = async (order) => {
            try {
                await payOrder(order.id);
                showSuccessToast('支付成功');
                order.status = 'PAID';
                // 支付成功后跳转到订单详情，保持与结算页一致的行为
                router.replace({ name: 'OrderDetail', params: { id: order.id } });
            } catch (error) {
                showFailToast('支付失败');
            }
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

        onMounted(() => {
            applyStatusFromQuery();
            loadOrders();
        });

        watch(() => route.query.status, () => {
            applyStatusFromQuery()
        })

        return { active, loading, refreshing, finished, isInitialLoading, filteredOrders, statusText: (s) => statusMap[s] || s, onLoad, onRefresh, onTabChange, pay, cancel, confirm, view };
    }
}
</script>

<style scoped>
/* 样式已迁移至 order-card.css */
</style>
