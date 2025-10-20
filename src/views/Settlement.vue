<template>
    <div class="page">
        <van-nav-bar title="资金结算" left-arrow @click-left="$router.back()" fixed />
        <div class="container" style="padding-top:56px;">
            <div class="wallet shadow-soft-lg">
                <div class="label">可用余额（元）</div>
                <div class="amount">{{ balance.toFixed(2) }}</div>
                <div class="ops">
                    <van-button size="small" type="primary" round @click="withdraw">提现</van-button>
                    <van-button size="small" round plain @click="recharge">充值</van-button>
                </div>
            </div>

            <van-tabs v-model:active="active">
                <van-tab title="资金明细" name="details" />
                <van-tab title="结算记录" name="settlement" />
            </van-tabs>

            <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
                <template v-if="isInitialLoading">
                    <van-skeleton v-for="i in 4" :key="i" title :row="2" style="margin:12px 0" />
                </template>
                <template v-else>
                    <template v-if="records.length === 0">
                        <van-empty description="暂无记录" />
                    </template>
                    <van-cell v-for="r in records" :key="r.id" :title="r.title" :label="r.time"
                        :value="(r.sign === '+' ? '+' : '-') + r.amount" />
                </template>
            </van-list>

            <van-dialog v-model:show="showWithdraw" title="提现" show-cancel-button @confirm="doWithdraw">
                <van-field v-model.number="withdrawAmount" type="number" label="金额" placeholder="请输入提现金额" />
            </van-dialog>
        </div>
    </div>
</template>

<script>
import { Toast } from 'vant';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

export default {
    name: 'Settlement',
    setup() {
        const route = useRoute()
        const active = ref('details')
        const balance = ref(2356.78)
        const loading = ref(false)
        const finished = ref(false)
        const isInitialLoading = ref(true)
        const page = ref(1)
        const pageSize = 10
        const records = ref([])

        const allMock = Array.from({ length: 24 }).map((_, i) => ({
            id: i + 1,
            title: i % 2 === 0 ? '订单收入' : '提现',
            sign: i % 2 === 0 ? '+' : '-',
            amount: (50 + (i % 5) * 10).toFixed(2),
            time: `2025-10-${String((i % 28) + 1).padStart(2, '0')} 12:${String(i % 60).padStart(2, '0')}`,
        }))

        const loadPage = () => {
            const start = (page.value - 1) * pageSize
            const end = start + pageSize
            records.value = records.value.concat(allMock.slice(start, end))
            if (end >= allMock.length) finished.value = true
            page.value += 1
        }
        const onLoad = () => { loading.value = true; setTimeout(() => { loadPage(); loading.value = false; isInitialLoading.value = false }, 400) }

        const showWithdraw = ref(false)
        const withdrawAmount = ref(null)
        const withdraw = () => { withdrawAmount.value = null; showWithdraw.value = true }
        const doWithdraw = () => {
            const amt = Number(withdrawAmount.value || 0)
            if (amt <= 0 || amt > balance.value) { Toast.fail('金额不合法'); return }
            balance.value -= amt
            Toast.success('提现申请已提交')
            showWithdraw.value = false
        }
        const recharge = () => Toast('充值（占位）')

        onMounted(() => {
            if (route.query.action === 'withdraw') showWithdraw.value = true
            onLoad()
        })

        return { active, balance, loading, finished, isInitialLoading, records, onLoad, showWithdraw, withdrawAmount, withdraw, doWithdraw, recharge }
    }
}
</script>

<style scoped>
.wallet {
    background: #fff;
    border-radius: 16px;
    padding: 16px;
    text-align: center;
    margin-bottom: 10px;
}

.wallet .label {
    color: #64748b;
    font-size: 12px;
}

.wallet .amount {
    font-weight: 800;
    font-size: 28px;
    margin: 6px 0 10px;
}

.wallet .ops {
    display: flex;
    gap: 8px;
    justify-content: center;
}
</style>
