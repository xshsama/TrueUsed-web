<template>
    <div class="min-h-screen pb-12 bg-[#f7f9fa] font-sans text-[#2c3e50]">

        <!-- --- Top Navigation --- -->
        <nav class="bg-white sticky top-0 z-50 border-b border-gray-100">
            <div class="max-w-4xl mx-auto px-6 h-[72px] flex items-center justify-between gap-4">
                <div class="flex items-center gap-10">
                    <div class="flex items-center gap-1.5 cursor-pointer" @click="$router.push('/')">
                        <div
                            class="w-9 h-9 bg-[#4a8b6e] rounded-lg flex items-center justify-center text-white font-bold text-xl italic shadow-sm">
                            T</div>
                        <span class="text-2xl font-bold text-[#2c3e50] tracking-tight">TrueUsed<span
                                class="text-[#4a8b6e]">.</span></span>
                    </div>
                    <div class="hidden md:flex items-center gap-2 text-lg font-bold text-gray-700">
                        我的钱包
                    </div>
                </div>

                <div class="flex items-center gap-4">
                    <div class="text-xs text-gray-400 flex items-center gap-1">
                        <i data-lucide="shield-check" width="14" class="text-[#4a8b6e]"></i> 资金由银行存管
                    </div>
                    <div class="w-9 h-9 rounded-full bg-gray-200 overflow-hidden ml-2 border border-gray-100">
                        <img :src="userStore.userInfo?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'"
                            class="w-full h-full object-cover" />
                    </div>
                </div>
            </div>
        </nav>

        <main class="max-w-4xl mx-auto px-6 py-8 space-y-8">

            <!-- 1. Asset Card (The "Black Card") -->
            <section
                class="bg-[#2c3e50] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden h-64 flex flex-col justify-between">
                <!-- Decoration -->
                <div
                    class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none">
                </div>
                <div class="card-shine absolute inset-0 pointer-events-none"></div>

                <!-- Top Row -->
                <div class="relative z-10 flex justify-between items-start">
                    <div>
                        <div class="text-white/60 text-sm mb-1 flex items-center gap-2">
                            总资产 (元)
                            <i v-if="!showBalance" @click="showBalance = true" data-lucide="eye-off" width="14"
                                class="cursor-pointer hover:text-white"></i>
                            <i v-else @click="showBalance = false" data-lucide="eye" width="14"
                                class="cursor-pointer hover:text-white"></i>
                        </div>
                        <div class="text-4xl font-bold font-mono tracking-tight">
                            {{ showBalance ? formatCurrency(wallet.balance + wallet.frozenAmount) : '****' }}
                        </div>
                    </div>
                    <div class="flex gap-3">
                        <button @click="handleTopUp"
                            class="bg-[#4a8b6e] hover:bg-[#3b755b] text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-[#4a8b6e]/30 transition-all flex items-center gap-2 active:scale-95">
                            <i data-lucide="arrow-up-right" width="16"></i> 充值
                        </button>
                    </div>
                </div>

                <!-- Bottom Row -->
                <div class="relative z-10 flex gap-20 border-t border-white/10 pt-6">
                    <div>
                        <div class="text-white/60 text-xs mb-1">可用余额</div>
                        <div class="text-xl font-bold font-mono">{{ showBalance ? formatCurrency(wallet.balance) :
                            '****' }}</div>
                    </div>
                    <div>
                        <div class="text-white/60 text-xs mb-1">本月收益</div>
                        <div class="text-xl font-bold font-mono text-[#4a8b6e]">+{{ showBalance ? '0.00' : '****' }}
                        </div>
                    </div>
                </div>
            </section>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <!-- Left: Transactions List (2/3) -->
                <div class="lg:col-span-2 space-y-6">
                    <div class="flex items-center justify-between">
                        <h2 class="text-lg font-bold text-[#2c3e50]">收支明细</h2>
                        <div class="flex bg-white rounded-lg p-1 shadow-sm border border-gray-100">
                            <button v-for="tab in tabs" :key="tab" @click="activeTab = tab"
                                :class="['px-4 py-1.5 rounded-md text-xs font-bold transition-all', activeTab === tab ? 'bg-[#2c3e50] text-white' : 'text-gray-500 hover:text-gray-800']">
                                {{ tab }}
                            </button>
                        </div>
                    </div>

                    <div class="bg-white rounded-2xl border border-gray-100/50 shadow-sm overflow-hidden">
                        <div v-for="(item, index) in filteredTransactions" :key="item.id"
                            class="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                            <div class="flex items-center gap-4">
                                <div
                                    :class="['w-10 h-10 rounded-full flex items-center justify-center', getIconBg(item.type)]">
                                    <i :data-lucide="getIcon(item.type)" width="18"
                                        :class="getIconColor(item.type)"></i>
                                </div>
                                <div>
                                    <div class="text-sm font-bold text-[#2c3e50] mb-0.5">{{ item.remark || item.type }}
                                    </div>
                                    <div class="text-xs text-gray-400">{{ formatDate(item.createdAt) }} · {{ item.status
                                        }}</div>
                                </div>
                            </div>
                            <div class="text-right">
                                <div
                                    :class="['text-base font-bold font-mono', isPositive(item) ? 'text-[#ff5e57]' : 'text-[#2c3e50]']">
                                    {{ isPositive(item) ? '+' : '' }}{{ formatCurrency(item.amount) }}
                                </div>
                                <!-- <div class="text-[10px] text-gray-400 mt-0.5">余额 {{ item.balance }}</div> -->
                            </div>
                        </div>

                        <!-- Empty State -->
                        <div v-if="filteredTransactions.length === 0" class="py-12 text-center">
                            <i data-lucide="file-text" width="32" class="text-gray-300 mx-auto mb-2"></i>
                            <p class="text-xs text-gray-400">暂无相关记录</p>
                        </div>
                    </div>
                </div>

                <!-- Right: Services & Ads (1/3) -->
                <div class="space-y-6">

                    <!-- Quick Services -->
                    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50">
                        <h3 class="text-sm font-bold text-[#2c3e50] mb-4">常用功能</h3>
                        <div class="grid grid-cols-2 gap-3">
                            <button @click="handleSetPassword"
                                class="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-50 hover:border-[#4a8b6e]/30 hover:bg-[#4a8b6e]/5 transition-all group">
                                <div
                                    class="bg-gray-100 p-2 rounded-full text-gray-500 group-hover:bg-white group-hover:text-[#4a8b6e] transition-colors">
                                    <i data-lucide="lock" width="18"></i>
                                </div>
                                <span class="text-xs font-medium text-gray-600">支付密码</span>
                            </button>
                            <button
                                class="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-50 hover:border-[#4a8b6e]/30 hover:bg-[#4a8b6e]/5 transition-all group">
                                <div
                                    class="bg-gray-100 p-2 rounded-full text-gray-500 group-hover:bg-white group-hover:text-[#4a8b6e] transition-colors">
                                    <i data-lucide="file-text" width="18"></i>
                                </div>
                                <span class="text-xs font-medium text-gray-600">账单下载</span>
                            </button>
                        </div>
                    </div>

                    <!-- Security Banner -->
                    <div
                        class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100 flex items-start gap-3">
                        <i data-lucide="shield-check" width="20" class="text-blue-600 mt-0.5 flex-shrink-0"></i>
                        <div>
                            <h4 class="text-xs font-bold text-blue-800 mb-1">资金安全保障中</h4>
                            <p class="text-[10px] text-blue-600/80 leading-relaxed">
                                您的资金由平安银行存管，交易全链路加密。未完成的交易资金将暂时冻结，确保买卖双方权益。
                            </p>
                        </div>
                    </div>

                </div>

            </div>

        </main>

        <!-- Top Up Modal -->
        <div v-if="showTopUpModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl p-6 w-full max-w-md">
                <h3 class="text-lg font-bold mb-4">充值余额</h3>
                <input v-model="topUpAmount" type="number" placeholder="请输入充值金额"
                    class="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:border-[#4a8b6e]">
                <div class="flex justify-end gap-3">
                    <button @click="showTopUpModal = false"
                        class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
                    <button @click="confirmTopUp"
                        class="px-4 py-2 bg-[#4a8b6e] text-white rounded-lg hover:bg-[#3b755b]">确认充值</button>
                </div>
            </div>
        </div>

        <!-- Set Password Modal -->
        <div v-if="showPasswordModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl p-6 w-full max-w-md">
                <h3 class="text-lg font-bold mb-4">设置支付密码</h3>
                <input v-model="password" type="password" placeholder="请输入6位数字密码" maxlength="6"
                    class="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:border-[#4a8b6e]">
                <div class="flex justify-end gap-3">
                    <button @click="showPasswordModal = false"
                        class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
                    <button @click="confirmSetPassword"
                        class="px-4 py-2 bg-[#4a8b6e] text-white rounded-lg hover:bg-[#3b755b]">确认设置</button>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { getMyWallet, getTransactions, setPayPassword, topUp } from '@/api/wallet'
import { useUserStore } from '@/stores/user'
import { createIcons, icons } from 'lucide'
import { computed, nextTick, onMounted, ref, watch } from 'vue'

const userStore = useUserStore()
const showBalance = ref(true)
const activeTab = ref('全部')
const tabs = ['全部', '收入', '支出', '提现']
const wallet = ref({
    balance: 0,
    frozenAmount: 0,
    hasPayPassword: false
})
const transactions = ref([])
const showTopUpModal = ref(false)
const topUpAmount = ref('')
const showPasswordModal = ref(false)
const password = ref('')

const fetchWallet = async () => {
    try {
        const res = await getMyWallet()
        wallet.value = res
    } catch (error) {
        console.error('Failed to fetch wallet:', error)
    }
}

const fetchTransactions = async () => {
    try {
        const res = await getTransactions({ page: 0, size: 20 })
        transactions.value = res.content
        refreshIcons()
    } catch (error) {
        console.error('Failed to fetch transactions:', error)
    }
}

const handleTopUp = () => {
    showTopUpModal.value = true
}

const confirmTopUp = async () => {
    if (!topUpAmount.value || topUpAmount.value <= 0) return
    try {
        await topUp({ amount: topUpAmount.value })
        showTopUpModal.value = false
        topUpAmount.value = ''
        fetchWallet()
        fetchTransactions()
    } catch (error) {
        console.error('Top up failed:', error)
    }
}

const handleSetPassword = () => {
    showPasswordModal.value = true
}

const confirmSetPassword = async () => {
    if (!password.value || password.value.length !== 6) {
        alert('请输入6位数字密码')
        return
    }
    try {
        await setPayPassword({ password: password.value })
        showPasswordModal.value = false
        password.value = ''
        fetchWallet()
        alert('支付密码设置成功')
    } catch (error) {
        console.error('Set password failed:', error)
    }
}

const filteredTransactions = computed(() => {
    if (activeTab.value === '全部') return transactions.value
    if (activeTab.value === '收入') return transactions.value.filter(t => t.type === 'INCOME' || t.type === 'TOP_UP' || t.type === 'REFUND')
    if (activeTab.value === '支出') return transactions.value.filter(t => t.type === 'PAYMENT')
    if (activeTab.value === '提现') return transactions.value.filter(t => t.type === 'WITHDRAWAL')
    return transactions.value
})

const isPositive = (item) => {
    return ['INCOME', 'TOP_UP', 'REFUND'].includes(item.type)
}

const getIcon = (type) => {
    switch (type) {
        case 'INCOME':
        case 'TOP_UP':
        case 'REFUND':
            return 'arrow-down-left'
        case 'PAYMENT':
        case 'WITHDRAWAL':
            return 'arrow-up-right'
        default: return 'circle-dollar-sign'
    }
}

const getIconBg = (type) => {
    switch (type) {
        case 'INCOME':
        case 'TOP_UP':
        case 'REFUND':
            return 'bg-red-50'
        case 'PAYMENT':
        case 'WITHDRAWAL':
            return 'bg-gray-100'
        default: return 'bg-gray-50'
    }
}

const getIconColor = (type) => {
    switch (type) {
        case 'INCOME':
        case 'TOP_UP':
        case 'REFUND':
            return 'text-[#ff5e57]'
        case 'PAYMENT':
        case 'WITHDRAWAL':
            return 'text-[#2c3e50]'
        default: return 'text-gray-500'
    }
}

const formatCurrency = (value) => {
    return Number(value).toFixed(2)
}

const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
}

const refreshIcons = () => {
    nextTick(() => {
        createIcons({ icons })
    })
}

// Watch for changes in filteredTransactions to refresh icons
watch(filteredTransactions, () => {
    refreshIcons()
})

onMounted(() => {
    fetchWallet()
    fetchTransactions()
    refreshIcons()
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

/* 银行卡光泽效果 */
.card-shine {
    background: linear-gradient(105deg, transparent 20%, rgba(255, 255, 255, 0.1) 25%, transparent 30%);
    background-size: 200% 100%;
    animation: shine 3s infinite linear;
}

@keyframes shine {
    0% {
        background-position: 100% 0;
    }

    100% {
        background-position: -100% 0;
    }
}
</style>
