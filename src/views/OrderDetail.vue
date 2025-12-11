<script setup>
import { cancelOrder, confirmDelivery, getOrderById, getOrderShipping, shipOrder } from '@/api/orders';
import { useUserStore } from '@/stores/user';
import { Check, ChevronRight, Copy, MapPin, PackageSearch, Store, Truck } from 'lucide-vue-next';
import { showConfirmDialog, showFailToast, showSuccessToast } from 'vant';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// --- State ---
const loading = ref(true);
const order = ref(null);
const shippingInfo = ref(null);

// --- Computed ---
const isCurrentUserBuyer = computed(() => userStore.userInfo && order.value?.buyer.id === userStore.userInfo.id);
const isCurrentUserSeller = computed(() => userStore.userInfo && order.value?.seller.id === userStore.userInfo.id);

const statusText = computed(() => {
    if (!order.value) return '';
    const map = {
        PENDING_PAYMENT: '待付款',
        PAID: '待发货',
        SHIPPED: '已发货',
        COMPLETED: '已完成',
        CANCELLED: '已取消',
        REFUNDING: '售后中',
        REFUNDED: '已退款'
    };
    return map[order.value.status] || order.value.status;
});

const statusDesc = computed(() => {
    if (!order.value) return '';
    const map = {
        PENDING_PAYMENT: '请尽快完成支付',
        PAID: '等待卖家发货',
        SHIPPED: '商品正在运输中',
        COMPLETED: '交易已完成',
        CANCELLED: '订单已取消',
        REFUNDING: '正在处理退款',
        REFUNDED: '退款已完成'
    };
    return map[order.value.status] || '';
});

const steps = [
    { label: '买家付款', status: 'PENDING_PAYMENT' },
    { label: '卖家发货', status: 'PAID' },
    { label: '确认收货', status: 'SHIPPED' },
    { label: '交易成功', status: 'COMPLETED' }
];

const currentStep = computed(() => {
    if (!order.value) return 0;
    const s = order.value.status;

    // Handle non-happy paths
    if (['CANCELLED', 'REFUNDING', 'REFUNDED'].includes(s)) {
        return -1; // Special state
    }

    if (s === 'PENDING_PAYMENT') return 1;
    if (s === 'PAID') return 2;
    if (s === 'SHIPPED') return 3;
    if (s === 'COMPLETED') return 4;
    return 0;
});

// --- Methods ---
const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const loadOrder = async () => {
    try {
        loading.value = true;
        const orderId = route.params.id;
        order.value = await getOrderById(orderId);

        if (order.value.trackingNumber) {
            try {
                shippingInfo.value = await getOrderShipping(orderId);
            } catch (e) {
                console.error('Shipping info error', e);
            }
        }
    } catch (error) {
        showFailToast('加载订单详情失败');
    } finally {
        loading.value = false;
    }
};

const handleUpdateStatus = (action) => {
    const actions = {
        cancel: { api: cancelOrder, success: '订单已取消', confirm: { title: '确认取消订单', message: '您确定要取消此订单吗？' } },
        ship: { api: shipOrder, success: '发货成功', confirm: { title: '确认发货', message: '您确定要将此订单标记为已发货吗？' } },
        confirm: { api: confirmDelivery, success: '收货成功', confirm: { title: '确认收货', message: '您确定已收到此订单的商品吗？' } },
    };

    const { api, success, confirm } = actions[action];

    showConfirmDialog(confirm)
        .then(async () => {
            try {
                const updatedOrder = await api(order.value.id);
                order.value = updatedOrder;
                showSuccessToast(success);
            } catch (error) {
                showFailToast('操作失败');
            }
        });
};

const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        showSuccessToast('复制成功');
    });
};

onMounted(() => {
    loadOrder();
});
</script>

<template>
    <div class="min-h-screen bg-[#f7f9fa] font-sans text-[#2c3e50] pb-12">

        <!-- --- Top Navigation --- -->
        <nav class="bg-white sticky top-0 z-50 border-b border-gray-100">
            <div class="max-w-6xl mx-auto px-4 h-[72px] flex items-center justify-between gap-4">
                <div class="flex items-center gap-10">
                    <div class="flex items-center gap-1.5 cursor-pointer" @click="router.push('/')">
                        <div
                            class="w-9 h-9 bg-[#4a8b6e] rounded-lg flex items-center justify-center text-white font-bold text-xl italic shadow-sm">
                            T</div>
                        <span class="text-2xl font-bold text-[#2c3e50] tracking-tight">TrueUsed<span
                                class="text-[#4a8b6e]">.</span></span>
                    </div>
                    <div class="hidden md:flex items-center gap-8 text-[15px] font-medium text-gray-500">
                        <a @click="router.push('/')"
                            class="hover:text-[#4a8b6e] transition-colors cursor-pointer">首页</a>
                        <a @click="router.push('/orders')"
                            class="hover:text-[#4a8b6e] transition-colors cursor-pointer">我的订单</a>
                        <span class="text-gray-300">/</span>
                        <span class="text-[#4a8b6e] font-bold">订单详情</span>
                    </div>
                </div>

                <div class="flex items-center gap-3">
                    <button @click="router.push('/service')"
                        class="text-sm font-bold text-[#4a8b6e] border border-[#4a8b6e] px-4 py-1.5 rounded-full hover:bg-[#4a8b6e]/5 transition-colors">
                        联系客服
                    </button>
                    <div class="w-9 h-9 rounded-full bg-gray-200 overflow-hidden border border-gray-100 cursor-pointer"
                        @click="router.push('/profile')">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
                            class="w-full h-full object-cover" />
                    </div>
                </div>
            </div>
        </nav>

        <main v-if="!loading && order" class="max-w-6xl mx-auto px-4 py-8 space-y-6">

            <!-- 1. Order Status & Stepper -->
            <section
                class="bg-[#2c3e50] rounded-2xl p-8 text-white shadow-lg shadow-[#2c3e50]/20 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
                <!-- Background Decoration -->
                <div
                    class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2">
                </div>

                <!-- Left: Text Status -->
                <div class="relative z-10 text-center lg:text-left">
                    <div class="flex items-center gap-3 justify-center lg:justify-start mb-2">
                        <PackageSearch :size="28" class="text-[#4a8b6e]" />
                        <h1 class="text-3xl font-bold">{{ statusText }}</h1>
                    </div>
                    <p class="text-gray-300 text-sm">{{ statusDesc }}</p>

                    <div class="mt-6 flex gap-3 justify-center lg:justify-start">
                        <!-- Buyer Actions -->
                        <template v-if="isCurrentUserBuyer">
                            <button v-if="order.status === 'PENDING_PAYMENT'"
                                @click="router.push(`/payment/${order.id}`)"
                                class="bg-[#4a8b6e] hover:bg-[#3b755b] text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg transition-all active:scale-95">
                                去支付
                            </button>
                            <button v-if="order.status === 'SHIPPED'" @click="handleUpdateStatus('confirm')"
                                class="bg-[#4a8b6e] hover:bg-[#3b755b] text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg transition-all active:scale-95">
                                确认收货
                            </button>
                            <button v-if="['PAID', 'SHIPPED'].includes(order.status)"
                                @click="router.push(`/order/${order.id}/refund-apply`)"
                                class="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-full font-bold text-sm backdrop-blur-md transition-all">
                                申请退款
                            </button>
                            <button v-if="order.status === 'COMPLETED'"
                                @click="router.push({ path: '/review/create', query: { orderId: order.id } })"
                                class="bg-[#4a8b6e] hover:bg-[#3b755b] text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg transition-all active:scale-95">
                                评价商品
                            </button>
                        </template>

                        <!-- Seller Actions -->
                        <template v-if="isCurrentUserSeller">
                            <button v-if="order.status === 'PAID'" @click="handleUpdateStatus('ship')"
                                class="bg-[#4a8b6e] hover:bg-[#3b755b] text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg transition-all active:scale-95">
                                确认发货
                            </button>
                        </template>
                    </div>
                </div>

                <!-- Right: Stepper (Simplified Visual) -->
                <div class="w-full max-w-2xl relative z-10 hidden md:block" v-if="currentStep > 0">
                    <div class="relative flex justify-between items-center w-full">
                        <!-- Progress Line Background -->
                        <div class="absolute top-1/2 left-0 w-full h-1 bg-gray-600 rounded-full -z-10"></div>
                        <!-- Active Progress Line -->
                        <div class="absolute top-1/2 left-0 h-1 bg-[#4a8b6e] rounded-full -z-10 step-line"
                            :style="{ width: (currentStep - 1) * 25 + '%' }"></div>

                        <!-- Steps -->
                        <div v-for="(step, index) in steps" :key="index" class="flex flex-col items-center gap-2">
                            <div :class="['w-8 h-8 rounded-full flex items-center justify-center border-4',
                                (index + 1) < currentStep ? 'bg-[#4a8b6e] border-[#2c3e50]' :
                                    (index + 1) === currentStep ? 'bg-[#f7f9fa] border-[#4a8b6e] w-10 h-10 shadow-[0_0_15px_rgba(74,139,110,0.6)]' :
                                        'bg-gray-600 border-[#2c3e50]']">
                                <Check v-if="(index + 1) < currentStep" :size="14" class="text-white" />
                                <span v-else-if="(index + 1) === currentStep"
                                    class="text-[#4a8b6e] font-bold text-xs">{{ index + 1
                                    }}</span>
                                <span v-else class="text-gray-400 text-xs font-bold">{{ index + 1 }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-between text-xs text-gray-400 mt-2 px-2">
                        <span v-for="(step, index) in steps" :key="index"
                            :class="{ 'text-[#4a8b6e] font-bold': (index + 1) === currentStep }">
                            {{ step.label }}
                        </span>
                    </div>
                </div>

                <!-- Cancelled/Refund State Visual -->
                <div class="w-full max-w-2xl relative z-10 hidden md:flex items-center justify-center"
                    v-else-if="currentStep === -1">
                    <div
                        class="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 flex items-center gap-3">
                        <div class="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
                        <span class="font-bold text-white tracking-wide">当前订单处于特殊状态（取消/退款），流程已终止</span>
                    </div>
                </div>
            </section>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <!-- Left Column: Details (2/3) -->
                <div class="lg:col-span-2 space-y-6">

                    <!-- 2. Logistics Info -->
                    <section v-if="order.trackingNumber"
                        class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50">
                        <h2 class="font-bold text-lg text-[#2c3e50] mb-4 flex items-center gap-2">
                            <Truck :size="20" class="text-[#4a8b6e]" /> 物流信息
                        </h2>
                        <div class="flex items-start gap-4">
                            <div class="flex flex-col items-center gap-1">
                                <div class="w-2.5 h-2.5 rounded-full bg-[#4a8b6e] ring-4 ring-[#4a8b6e]/20"></div>
                                <div class="w-px h-12 bg-gray-200"></div>
                            </div>
                            <div class="flex-1">
                                <div class="flex justify-between items-start">
                                    <p class="text-sm font-bold text-[#2c3e50]">{{ order.expressCompany }} {{
                                        order.trackingNumber }}</p>
                                    <span class="text-xs text-gray-400">最新</span>
                                </div>
                                <p class="text-sm text-gray-600 mt-1">
                                    {{ shippingInfo?.trackingEvents?.[0]?.description || '暂无物流轨迹' }}
                                </p>
                            </div>
                        </div>
                    </section>

                    <!-- 3. Product List -->
                    <section class="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
                        <div class="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                            <h2 class="font-bold text-lg text-[#2c3e50]">商品信息</h2>
                            <div
                                class="flex items-center gap-2 text-sm text-gray-500 cursor-pointer hover:text-[#4a8b6e]">
                                <Store :size="16" />
                                <span>{{ order.seller.username }} 的店铺</span>
                                <ChevronRight :size="14" />
                            </div>
                        </div>

                        <div class="p-6 flex gap-5">
                            <div
                                class="w-28 h-28 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden border border-gray-100 relative group">
                                <img :src="order.product.images?.[0]?.url || order.product.image"
                                    class="w-full h-full object-cover" />
                            </div>
                            <div class="flex-1 flex flex-col justify-between">
                                <div>
                                    <div class="flex justify-between items-start gap-4">
                                        <h3 class="font-bold text-[#2c3e50] text-lg line-clamp-1">{{ order.product.title
                                        }}</h3>
                                        <span class="font-bold text-[#2c3e50] text-lg font-mono">¥{{ order.price
                                        }}</span>
                                    </div>
                                    <div class="flex flex-wrap gap-2 mt-2">
                                        <span class="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">官方验货</span>
                                    </div>
                                </div>

                                <div class="flex items-center justify-between mt-4">
                                    <div class="flex items-center gap-2">
                                        <span
                                            class="text-xs text-[#4a8b6e] border border-[#4a8b6e] px-2 py-0.5 rounded">官方验货服务</span>
                                        <span class="text-xs text-[#4a8b6e] font-bold">免费</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>

                <!-- Right Column: Summary & Info (1/3) -->
                <div class="space-y-6">

                    <!-- 4. Address Card -->
                    <section
                        class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50 relative overflow-hidden">
                        <div
                            class="absolute top-0 left-0 w-full h-1 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0Ij48cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iNCIgZmlsbD0iIzRhOGI2ZSIvPjxyZWN0IHg9IjIwIiB3aWR0aD0iMjAiIGhlaWdodD0iNCIgZmlsbD0iI2ZmNWU1NyIvPjwvc3ZnPg==')]">
                        </div>
                        <h2 class="font-bold text-base text-[#2c3e50] mb-4">收货信息</h2>
                        <div class="flex items-start gap-3" v-if="order.address">
                            <div class="mt-1 text-gray-400">
                                <MapPin :size="18" />
                            </div>
                            <div>
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="font-bold text-[#2c3e50]">{{ order.address.recipientName }}</span>
                                    <span class="text-gray-500 text-sm">{{ order.address.phone }}</span>
                                </div>
                                <p class="text-sm text-gray-600 leading-relaxed">
                                    {{ order.address.province }} {{ order.address.city }} {{ order.address.district }}
                                    <br>
                                    {{ order.address.detailedAddress }}
                                </p>
                            </div>
                        </div>
                    </section>

                    <!-- 5. Order Summary -->
                    <section class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50">
                        <h2 class="font-bold text-base text-[#2c3e50] mb-4">订单明细</h2>
                        <div class="space-y-3 text-sm">
                            <div class="flex justify-between text-gray-600">
                                <span>商品总价</span>
                                <span>¥{{ order.price }}</span>
                            </div>
                            <div class="flex justify-between text-gray-600">
                                <span>运费</span>
                                <span>¥0.00</span>
                            </div>
                            <div class="flex justify-between text-[#4a8b6e]">
                                <span>优惠券</span>
                                <span>- ¥0.00</span>
                            </div>
                            <div class="border-t border-gray-100 pt-3 mt-3 flex justify-between items-center">
                                <span class="font-bold text-[#2c3e50]">实付款</span>
                                <span class="font-bold text-xl text-[#ff5e57]">¥{{ order.price }}</span>
                            </div>
                        </div>
                    </section>

                    <!-- 6. Order Meta -->
                    <section class="bg-gray-50 rounded-2xl p-6 text-xs text-gray-500 space-y-2">
                        <div class="flex justify-between">
                            <span>订单编号</span>
                            <span class="font-mono select-all cursor-pointer hover:text-[#2c3e50]"
                                @click="copyToClipboard(order.id)">
                                {{ order.id }}
                                <Copy :size="10" class="inline ml-1" />
                            </span>
                        </div>
                        <div class="flex justify-between">
                            <span>创建时间</span>
                            <span>{{ formatDate(order.createdAt) }}</span>
                        </div>
                        <div class="flex justify-between" v-if="order.paymentTime">
                            <span>付款时间</span>
                            <span>{{ formatDate(order.paymentTime) }}</span>
                        </div>
                    </section>

                </div>

            </div>

        </main>

        <!-- Loading State -->
        <div v-else class="flex items-center justify-center min-h-screen">
            <div class="animate-pulse flex flex-col items-center">
                <div class="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
                <div class="h-4 bg-gray-200 rounded w-32"></div>
            </div>
        </div>

    </div>
</template>

<style scoped>
.step-line {
    transition: width 1s ease-in-out;
}
</style>
