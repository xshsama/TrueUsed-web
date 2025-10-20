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
                        <div v-for="o in filteredOrders" :key="o.id" class="order-card shadow-soft-lg">
                            <div class="order-head">
                                <div class="order-no">订单号：{{ o.no }}</div>
                                <van-tag type="primary" plain size="small">{{ statusText(o.status) }}</van-tag>
                            </div>
                            <div class="order-body">
                                <van-image :src="o.cover" width="72" height="72" fit="cover" radius="8" />
                                <div class="info">
                                    <div class="title">{{ o.title }}</div>
                                    <div class="meta">数量 x{{ o.quantity }} · ￥{{ o.price }}</div>
                                </div>
                                <div class="amount">￥{{ (o.price * o.quantity).toFixed(2) }}</div>
                            </div>
                            <div class="order-actions">
                                <van-button v-if="o.status === 'unpaid'" type="primary" size="small" round
                                    @click="pay(o)">去支付</van-button>
                                <van-button v-if="o.status === 'unpaid'" type="default" size="small" round plain
                                    @click="cancel(o)">取消</van-button>
                                <van-button v-if="o.status === 'toreceive'" type="primary" size="small" round
                                    @click="confirm(o)">确认收货</van-button>
                                <van-button type="default" size="small" round plain @click="view(o)">查看详情</van-button>
                            </div>
                        </div>
                    </template>
                </van-list>
            </van-pull-refresh>
        </div>
    </div>

</template>

<script>
import { Dialog, Toast } from 'vant';
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

        const allMock = Array.from({ length: 23 }).map((_, i) => ({
            id: i + 1,
            no: 'TU' + String(202501010000 + i),
            title: '二手良品 · ' + (i + 1),
            quantity: (i % 3) + 1,
            price: Number((99 + (i % 5) * 20).toFixed(2)),
            status: ['unpaid', 'toship', 'toreceive', 'afterSale'][i % 4],
            cover: `https://placehold.co/160x160/EEF2FF/334155?text=Item+${i + 1}`,
        }))

        const statusText = (s) => ({
            all: '全部',
            unpaid: '待付款',
            toship: '待发货',
            toreceive: '待收货',
            afterSale: '售后',
        }[s] || s)

        const filteredOrders = computed(() => {
            if (active.value === 'all') return orders.value
            return orders.value.filter(o => o.status === active.value)
        })

        const loadPage = (reset = false) => {
            if (reset) {
                page.value = 1
                finished.value = false
                orders.value = []
            }
            const start = (page.value - 1) * pageSize
            const end = start + pageSize
            const slice = allMock.slice(start, end)
            orders.value = orders.value.concat(slice)
            if (end >= allMock.length) finished.value = true
            page.value += 1
        }

        const onLoad = () => {
            loading.value = true
            setTimeout(() => {
                loadPage()
                loading.value = false
                isInitialLoading.value = false
            }, 400)
        }

        const onRefresh = () => {
            refreshing.value = true
            setTimeout(() => {
                loadPage(true)
                refreshing.value = false
                Toast.success('已刷新')
            }, 500)
        }

        const onTabChange = (name) => {
            router.replace({ name: 'Orders', query: { status: name === 'all' ? undefined : name } })
        }

        const applyStatusFromQuery = () => {
            const s = route.query.status
            const allowed = ['all', 'unpaid', 'toship', 'toreceive', 'afterSale']
            active.value = allowed.includes(s) ? s : (s ? 'all' : 'all')
        }

        const pay = (o) => Toast(`去支付：${o.no}`)
        const cancel = (o) => {
            Dialog.confirm({ title: '取消订单', message: '确定取消这个订单吗？' })
                .then(() => Toast.success('已取消'))
                .catch(() => { })
        }
        const confirm = (o) => {
            Dialog.confirm({ title: '确认收货', message: '确认收到货物？' })
                .then(() => Toast.success('已确认收货'))
                .catch(() => { })
        }
        const view = (o) => Toast(`查看订单：${o.no}`)

        onMounted(() => {
            applyStatusFromQuery()
            // 首次触发加载
            onLoad()
        })

        watch(() => route.query.status, () => {
            applyStatusFromQuery()
        })

        return { active, loading, refreshing, finished, isInitialLoading, filteredOrders, statusText, onLoad, onRefresh, onTabChange, pay, cancel, confirm, view }
    }
}
</script>

<style scoped>
.order-card {
    background: #fff;
    border-radius: 16px;
    padding: 12px;
    margin: 12px 0;
}

.order-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.order-no {
    color: #64748b;
    font-size: 12px;
}

.order-body {
    display: flex;
    gap: 12px;
    align-items: center;
}

.order-body .info {
    flex: 1;
    min-width: 0;
}

.order-body .title {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
}

.order-body .meta {
    font-size: 12px;
    color: #6b7280;
    margin-top: 6px;
}

.order-body .amount {
    font-weight: 700;
    color: #111827;
}

.order-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 10px;
}
</style>
