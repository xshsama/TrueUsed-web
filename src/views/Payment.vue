<script setup>
import { getOrderById, payOrder } from '@/api/orders';
import { createPayment } from '@/api/payments';
import { Check, Clock, CreditCard, Loader2, Lock, ShieldCheck } from 'lucide-vue-next';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// --- State ---
const loading = ref(true);
const order = ref(null);
const selectedMethod = ref('alipay');
const isProcessing = ref(false);
const showSuccess = ref(false);
const countdown = ref('15:00');
let timerInterval = null;

// --- Computed ---
const orderAmount = computed(() => {
    return order.value ? order.value.price.toFixed(2) : '0.00';
});

const orderTitle = computed(() => {
    return order.value ? `订单号：${order.value.id}` : '';
});

// --- Methods ---
const startCountdown = (createdAt) => {
    const createdTime = new Date(createdAt).getTime();
    const maxTime = 15 * 60 * 1000; // 15 minutes

    const updateTimer = () => {
        const now = Date.now();
        const diff = now - createdTime;
        const remaining = maxTime - diff;

        if (remaining <= 0) {
            countdown.value = '00:00';
            clearInterval(timerInterval);
            // Handle timeout (optional: auto-cancel or show expired state)
        } else {
            const m = Math.floor(remaining / 60000).toString().padStart(2, '0');
            const s = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0');
            countdown.value = `${m}:${s}`;
        }
    };

    updateTimer(); // Initial run
    timerInterval = setInterval(updateTimer, 1000);
};

const loadOrder = async () => {
    try {
        loading.value = true;
        const orderId = route.params.id;
        if (!orderId) {
            // Handle missing ID
            return;
        }
        const res = await getOrderById(orderId);
        order.value = res;

        if (res.status === 'PENDING') {
            startCountdown(res.createdAt);
        } else if (res.status === 'PAID') {
            // If already paid, redirect or show success
            showSuccess.value = true;
        }
    } catch (error) {
        console.error('Failed to load order', error);
    } finally {
        loading.value = false;
    }
};

const handlePayment = async () => {
    if (!order.value) return;

    isProcessing.value = true;
    try {
        if (selectedMethod.value === 'alipay') {
            await createPayment({
                outTradeNo: String(order.value.id),
                totalAmount: order.value.price.toFixed(2),
                subject: `TrueUsed Order ${order.value.id}`,
                body: 'TrueUsed Transaction'
            });
        } else {
            // Simulate network delay for better UX
            await new Promise(resolve => setTimeout(resolve, 800));

            await payOrder(order.value.id);
            showSuccess.value = true;
        }
    } catch (error) {
        console.error('Payment failed', error);
        // You might want to show a toast here
    } finally {
        isProcessing.value = false;
    }
};

const goToOrderDetail = () => {
    if (order.value) {
        router.replace(`/order/${order.value.id}`);
    } else {
        router.push('/');
    }
};

onMounted(() => {
    loadOrder();
});

onUnmounted(() => {
    if (timerInterval) clearInterval(timerInterval);
});
</script>

<template>
    <div class="min-h-screen flex flex-col bg-[#f7f9fa] font-sans text-[#2c3e50]">

        <!-- --- Simple Header (Focus on Payment) --- -->
        <header class="bg-white border-b border-gray-100 py-4">
            <div class="max-w-5xl mx-auto px-4 flex items-center justify-between">
                <div class="flex items-center gap-3 cursor-pointer" @click="router.push('/')">
                    <div class="flex items-center gap-1.5">
                        <div
                            class="w-8 h-8 bg-[#4a8b6e] rounded-lg flex items-center justify-center text-white font-bold text-lg italic shadow-sm">
                            T</div>
                        <span class="text-xl font-bold text-[#2c3e50] tracking-tight">TrueUsed<span
                                class="text-[#4a8b6e]">.</span></span>
                    </div>
                    <div class="h-6 w-px bg-gray-200 mx-2"></div>
                    <span class="text-lg text-gray-600 font-medium">收银台</span>
                </div>

                <div
                    class="hidden md:flex items-center gap-2 text-sm text-[#4a8b6e] bg-[#4a8b6e]/10 px-3 py-1.5 rounded-full">
                    <ShieldCheck :size="16" />
                    <span class="font-bold">平台资金托管 · 确认收货后打款</span>
                </div>
            </div>
        </header>

        <!-- --- Main Content --- -->
        <main class="flex-1 flex items-start justify-center pt-12 px-4 pb-12" v-if="!loading && order">

            <div class="w-full max-w-lg space-y-6">

                <!-- 1. Order Summary Card -->
                <div
                    class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center relative overflow-hidden">
                    <!-- Top Stripe -->
                    <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4a8b6e] to-[#3b755b]"></div>

                    <p class="text-gray-500 text-sm mb-2">支付剩余时间</p>
                    <div
                        class="inline-flex items-center gap-2 bg-orange-50 text-[#ff5e57] px-4 py-1 rounded-full text-sm font-bold font-mono mb-6">
                        <Clock :size="14" />
                        {{ countdown }}
                    </div>

                    <div class="flex flex-col items-center justify-center">
                        <span class="text-4xl font-bold text-[#2c3e50] tracking-tight mb-2">
                            <span class="text-2xl align-top mr-1">¥</span>{{ orderAmount }}
                        </span>
                        <p class="text-gray-400 text-sm">{{ orderTitle }}</p>
                    </div>

                    <!-- Divider -->
                    <div class="relative mt-8 mb-2">
                        <div class="absolute inset-0 flex items-center" aria-hidden="true">
                            <div class="w-full border-t border-gray-100"></div>
                        </div>
                        <div class="relative flex justify-center">
                            <span class="bg-white px-2 text-xs text-gray-400">选择支付方式</span>
                        </div>
                    </div>
                </div>

                <!-- 2. Payment Methods -->
                <div class="space-y-3">

                    <!-- Alipay -->
                    <div @click="selectedMethod = 'alipay'"
                        :class="['bg-white rounded-xl p-5 border-2 cursor-pointer transition-all flex items-center justify-between group', selectedMethod === 'alipay' ? 'payment-card-selected' : 'border-transparent hover:border-gray-100']">
                        <div class="flex items-center gap-4">
                            <div
                                class="w-10 h-10 rounded-lg bg-[#1677ff] flex items-center justify-center text-white shrink-0">
                                <span class="font-bold text-sm">支</span>
                            </div>
                            <div>
                                <div class="font-bold text-gray-800 flex items-center gap-2">
                                    支付宝
                                    <span
                                        class="bg-[#1677ff]/10 text-[#1677ff] text-[10px] px-1.5 py-0.5 rounded">推荐</span>
                                </div>
                                <div class="text-xs text-gray-400">数亿用户的选择，安全快捷</div>
                            </div>
                        </div>
                        <div
                            :class="['w-5 h-5 rounded-full border-2 flex items-center justify-center radio-ring', selectedMethod === 'alipay' ? 'border-[#4a8b6e] bg-[#4a8b6e]' : 'border-gray-300']">
                            <Check v-if="selectedMethod === 'alipay'" :size="12" class="text-white" />
                        </div>
                    </div>

                    <!-- WeChat Pay -->
                    <div @click="selectedMethod = 'wechat'"
                        :class="['bg-white rounded-xl p-5 border-2 cursor-pointer transition-all flex items-center justify-between group', selectedMethod === 'wechat' ? 'payment-card-selected' : 'border-transparent hover:border-gray-100']">
                        <div class="flex items-center gap-4">
                            <div
                                class="w-10 h-10 rounded-lg bg-[#07c160] flex items-center justify-center text-white shrink-0">
                                <span class="font-bold text-sm">微</span>
                            </div>
                            <div>
                                <div class="font-bold text-gray-800">微信支付</div>
                                <div class="text-xs text-gray-400">亿万用户的选择</div>
                            </div>
                        </div>
                        <div
                            :class="['w-5 h-5 rounded-full border-2 flex items-center justify-center radio-ring', selectedMethod === 'wechat' ? 'border-[#4a8b6e] bg-[#4a8b6e]' : 'border-gray-300']">
                            <Check v-if="selectedMethod === 'wechat'" :size="12" class="text-white" />
                        </div>
                    </div>

                    <!-- Bank Card -->
                    <div @click="selectedMethod = 'card'"
                        :class="['bg-white rounded-xl p-5 border-2 cursor-pointer transition-all flex items-center justify-between group', selectedMethod === 'card' ? 'payment-card-selected' : 'border-transparent hover:border-gray-100']">
                        <div class="flex items-center gap-4">
                            <div
                                class="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-white shrink-0">
                                <CreditCard :size="20" />
                            </div>
                            <div>
                                <div class="font-bold text-gray-800">银行卡 / 信用卡</div>
                                <div class="text-xs text-gray-400">支持大额支付</div>
                            </div>
                        </div>
                        <div
                            :class="['w-5 h-5 rounded-full border-2 flex items-center justify-center radio-ring', selectedMethod === 'card' ? 'border-[#4a8b6e] bg-[#4a8b6e]' : 'border-gray-300']">
                            <Check v-if="selectedMethod === 'card'" :size="12" class="text-white" />
                        </div>
                    </div>

                </div>

                <!-- Pay Button -->
                <button @click="handlePayment" :disabled="isProcessing"
                    class="w-full bg-gradient-to-r from-[#4a8b6e] to-[#3b755b] hover:shadow-lg hover:shadow-[#4a8b6e]/30 text-white font-bold text-lg py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8">
                    <Loader2 v-if="isProcessing" class="animate-spin" :size="20" />
                    <span v-else>立即支付 ¥{{ orderAmount }}</span>
                </button>

                <p class="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                    <Lock :size="12" />
                    SSL加密传输，保障您的支付安全
                </p>

            </div>

        </main>

        <!-- Loading State -->
        <div v-else class="flex-1 flex items-center justify-center">
            <Loader2 class="animate-spin text-[#4a8b6e]" :size="32" />
        </div>

        <!-- --- Success Modal --- -->
        <div v-if="showSuccess" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"></div>
            <div
                class="bg-white rounded-2xl p-8 max-w-sm w-full relative z-10 text-center animate-[bounce_0.5s_ease-out]">
                <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check class="text-green-500 w-10 h-10" />
                </div>
                <h2 class="text-2xl font-bold text-gray-800 mb-2">支付成功!</h2>
                <p class="text-gray-500 mb-8">卖家将尽快为您发货，请留意消息通知。</p>
                <button @click="goToOrderDetail"
                    class="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors">
                    查看订单详情
                </button>
            </div>
        </div>

    </div>
</template>

<style scoped>
.radio-ring {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 选中态的动画 */
.payment-card-selected {
    border-color: #4a8b6e;
    background-color: rgba(74, 139, 110, 0.03);
    box-shadow: 0 4px 6px -1px rgba(74, 139, 110, 0.1), 0 2px 4px -1px rgba(74, 139, 110, 0.06);
}
</style>
