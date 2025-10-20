<template>
    <div class="page">
        <van-nav-bar title="订单管理" left-arrow @click-left="$router.back()" fixed />
        <div class="container" style="padding-top:56px;">
            <van-tabs v-model:active="active">
                <van-tab title="全部" name="all" />
                <van-tab title="待发货" name="toship" />
                <van-tab title="售后" name="afterSale" />
            </van-tabs>
            <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
                <template v-if="isInitialLoading">
                    <van-skeleton v-for="i in 4" :key="i" title :row="3" style="margin:12px 0" />
                </template>
                <template v-else>
                    <template v-if="filtered.length === 0">
                        <van-empty description="暂无相关订单" />
                    </template>
                    <div v-for="o in filtered" :key="o.id" class="order-card shadow-soft-lg">
                        <div class="head">
                            <div class="user">买家：{{ o.buyer }}</div>
                            <van-tag plain type="primary" size="small">{{ o.status === 'toship' ? '待发货' : '售后' }}</van-tag>
                        </div>
                        <div class="body">
                            <van-image :src="o.cover" width="64" height="64" radius="8" fit="cover" />
                            <div class="info">
                                <div class="title">{{ o.title }}</div>
                                <div class="meta">数量 x{{ o.quantity }} · ￥{{ o.amount }}</div>
                            </div>
                            <div class="actions">
                                <van-button v-if="o.status === 'toship'" size="small" type="primary" round
                                    @click="ship(o)">发货</van-button>
                                <van-button v-else size="small" round @click="afterSale(o)">处理售后</van-button>
                            </div>
                        </div>
                    </div>
                </template>
            </van-list>
        </div>
    </div>
</template>

<script>
import { Toast } from 'vant';
import { computed, ref } from 'vue';

export default {
    name: 'OrderManage',
    setup() {
        const active = ref('all')
        const loading = ref(false)
        const finished = ref(false)
        const isInitialLoading = ref(true)
        const page = ref(1)
        const pageSize = 10
        const items = ref([])

        const allMock = Array.from({ length: 18 }).map((_, i) => ({
            id: i + 1,
            title: `订单商品 ${i + 1}`,
            amount: (199 + (i % 6) * 20).toFixed(0),
            quantity: (i % 3) + 1,
            buyer: `用户${1000 + i}`,
            status: i % 3 === 0 ? 'afterSale' : 'toship',
            cover: `https://placehold.co/150x150/F8FAFC/334155?text=OM${i + 1}`,
        }))

        const filtered = computed(() => active.value === 'all' ? items.value : items.value.filter(x => x.status === active.value))

        const loadPage = () => {
            const start = (page.value - 1) * pageSize
            const end = start + pageSize
            items.value = items.value.concat(allMock.slice(start, end))
            if (end >= allMock.length) finished.value = true
            page.value += 1
        }
        const onLoad = () => { loading.value = true; setTimeout(() => { loadPage(); loading.value = false; isInitialLoading.value = false }, 400) }

        const ship = (o) => Toast(`为 ${o.title} 填写发货信息（占位）`)
        const afterSale = (o) => Toast(`处理售后：${o.title}`)

        return { active, loading, finished, isInitialLoading, filtered, onLoad, ship, afterSale }
    }
}
</script>

<style scoped>
.order-card {
    background: #fff;
    border-radius: 16px;
    padding: 12px;
    margin: 10px 0;
}

.head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
}

.body {
    display: flex;
    gap: 12px;
    align-items: center;
}

.info {
    flex: 1;
    min-width: 0;
}

.title {
    font-weight: 700;
    color: #111827;
}

.meta {
    color: #6b7280;
    font-size: 12px;
    margin-top: 4px;
}
</style>
