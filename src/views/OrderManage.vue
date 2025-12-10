<script setup>
import { getSoldOrders, shipOrder } from '@/api/orders';
import SearchBar from '@/components/SearchBar.vue';
import TopNavbar from '@/components/TopNavbar.vue';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    Copy,
    MessageCircle,
    Package,
    Settings,
    ShoppingBag,
    Star,
    Truck,
    Wallet,
    X
} from 'lucide-vue-next';
import { showFailToast, showSuccessToast } from 'vant';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();

// --- State ---
const activeMenu = ref('订单管理');
const activeTab = ref('all');
const searchQuery = ref('');
const orders = ref([]);
const loading = ref(false);
const refreshing = ref(false);
const finished = ref(false);
const isInitialLoading = ref(true);

// Shipping State
const showShipDialog = ref(false);
const currentOrder = ref(null);
const shipForm = ref({
    trackingCompany: '顺丰速运',
    senderCity: '',
});

const menuItems = [
    { name: '商品管理', icon: Package, route: '/my-products' },
    { name: '订单管理', icon: ShoppingBag, route: '/order-manage' },
    { name: '评价管理', icon: Star, route: '/my-reviews' },
    { name: '店铺设置', icon: Settings, route: '/settings' },
];

const tabs = [
    { name: '全部', key: 'all' },
    { name: '待发货', key: 'PAID' },
    { name: '已发货', key: 'SHIPPED' },
    { name: '售后/退款', key: 'REFUNDING' }, // Simplified mapping
    { name: '已完成', key: 'COMPLETED' },
];

const expressCompanies = [
    '顺丰速运', '中通快递', '圆通速递', '韵达快递',
    '申通快递', '极兔速递', '邮政EMS', '京东物流'
];

// --- Status Mapping ---
const statusMap = {
    'PENDING_PAYMENT': '待付款',
    'PAID': '待发货',
    'SHIPPED': '已发货',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消',
    'REFUNDING': '售后中',
    'REFUNDED': '已退款'
};

const getStatusText = (status) => statusMap[status] || status;

const getStatusColor = (status) => {
    switch (status) {
        case 'PENDING_PAYMENT': return 'text-[#ff5e57]';
        case 'PAID': return 'text-[#1989fa]';
        case 'SHIPPED': return 'text-[#4a8b6e]';
        case 'REFUNDING': return 'text-orange-500';
        case 'COMPLETED': return 'text-gray-500';
        default: return 'text-gray-500';
    }
};

// --- Computed Stats ---
const stats = computed(() => {
    const paid = orders.value.filter(o => o.status === 'PAID').length;
    const refund = orders.value.filter(o => ['REFUNDING', 'REFUNDED'].includes(o.status)).length;
    const completed = orders.value.filter(o => o.status === 'COMPLETED').length;
    const totalAmount = orders.value
        .filter(o => ['PAID', 'SHIPPED', 'COMPLETED'].includes(o.status))
        .reduce((sum, o) => sum + (o.price || 0), 0)
        .toFixed(2);

    return {
        pendingShip: paid,
        refund: refund,
        completedMonth: completed, // Simplified: total completed
        balance: totalAmount
    };
});

const tabCounts = computed(() => {
    const counts = {};
    tabs.forEach(tab => {
        if (tab.key === 'all') {
            counts[tab.key] = orders.value.length;
        } else {
            counts[tab.key] = orders.value.filter(o => o.status === tab.key).length;
        }
    });
    return counts;
});

const filteredOrders = computed(() => {
    let result = orders.value;

    if (activeTab.value !== 'all') {
        result = result.filter(o => o.status === activeTab.value);
    }

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(o =>
            (o.product?.title && o.product.title.toLowerCase().includes(query)) ||
            (o.id && String(o.id).includes(query)) ||
            (o.buyer?.username && o.buyer.username.toLowerCase().includes(query))
        );
    }

    return result;
});

// --- Actions ---
const loadOrders = async () => {
    if (isInitialLoading.value) loading.value = true;
    try {
        const res = await getSoldOrders();
        orders.value = Array.isArray(res) ? res : (res.content || []);
        finished.value = true;
    } catch (error) {
        showFailToast('加载订单失败');
    } finally {
        loading.value = false;
        isInitialLoading.value = false;
        refreshing.value = false;
    }
};

const onRefresh = async () => {
    await loadOrders();
    showSuccessToast('已刷新');
};

const handleShip = (order) => {
    currentOrder.value = order;
    shipForm.value = {
        trackingCompany: '顺丰速运',
        senderCity: '',
    };
    showShipDialog.value = true;
};

const confirmShip = async () => {
    if (!currentOrder.value) return;
    if (!shipForm.value.trackingCompany) {
        showFailToast('请选择快递公司');
        return;
    }
    if (!shipForm.value.senderCity) {
        showFailToast('请输入发货城市');
        return;
    }

    try {
        const shipData = {
            expressCompany: shipForm.value.trackingCompany,
            senderCity: shipForm.value.senderCity,
        };
        const updatedOrder = await shipOrder(currentOrder.value.id, shipData);
        showSuccessToast('发货成功');

        // Update local state
        const index = orders.value.findIndex(o => o.id === currentOrder.value.id);
        if (index !== -1) {
            orders.value[index] = { ...orders.value[index], ...updatedOrder };
        }
        showShipDialog.value = false;
    } catch (error) {
        showFailToast('发货失败');
    }
};

const contactBuyer = (order) => {
    if (order.buyer?.id) {
        router.push(`/messages/chat/${order.buyer.id}`);
    }
};

const viewDetail = (order) => {
    router.push({ name: 'OrderDetail', params: { id: order.id } });
};

const copyInfo = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        showSuccessToast('复制成功');
    });
};

const handleMenuClick = (item) => {
    if (item.route) {
        router.push(item.route);
    }
};

// --- Helpers ---
const getProductImage = (product) => {
    if (!product) return '';
    if (Array.isArray(product.images) && product.images.length > 0) {
        return product.images[0].url || product.images[0];
    }
    return product.images?.url || product.image || '';
};

const formatTime = (time) => {
    if (!time) return '';
    const date = new Date(time);
    return date.toLocaleString();
};

// --- Lifecycle ---
onMounted(() => {
    const status = route.query.status;
    if (status) {
        const found = tabs.find(t => t.key === status || t.name === status);
        if (found) activeTab.value = found.key;
    }
    loadOrders();
});

watch(() => route.query.status, (newStatus) => {
    if (newStatus) {
        const found = tabs.find(t => t.key === newStatus || t.name === newStatus);
        if (found) activeTab.value = found.key;
    }
});
</script>

<template>
    <div class="min-h-screen bg-[#f7f9fa] font-sans text-[#2c3e50] pb-12">

        <!-- --- Top Navigation --- -->
        <TopNavbar mode="seller" />

        <main class="max-w-7xl mx-auto px-4 md:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

            <!-- Left Sidebar -->
            <aside class="hidden lg:block lg:col-span-2 space-y-6">
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-4 sticky top-24">
                    <div class="flex items-center gap-3 mb-6 px-2">
                        <div class="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
                                class="w-full h-full object-cover" />
                        </div>
                        <div>
                            <div class="font-bold text-sm text-[#2c3e50]">卖家中心</div>
                            <div class="text-xs text-gray-400">个人卖家</div>
                        </div>
                    </div>

                    <nav class="space-y-1">
                        <a v-for="item in menuItems" :key="item.name" href="#"
                            :class="['flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all', activeMenu === item.name ? 'bg-[#4a8b6e]/10 text-[#4a8b6e]' : 'text-gray-600 hover:bg-gray-50']"
                            @click.prevent="handleMenuClick(item); activeMenu = item.name">
                            <component :is="item.icon" :size="18" />
                            {{ item.name }}
                        </a>
                    </nav>
                </div>
            </aside>

            <!-- Right Main Content -->
            <div class="lg:col-span-10 space-y-6">

                <!-- 1. Fulfillment Dashboard -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div
                        class="bg-gradient-to-br from-[#4a8b6e] to-[#3b755b] rounded-2xl p-5 text-white shadow-lg shadow-[#4a8b6e]/20 group cursor-pointer hover:scale-[1.02] transition-transform">
                        <div class="flex justify-between items-start">
                            <div>
                                <div class="text-3xl font-bold font-mono">{{ stats.pendingShip }}</div>
                                <div class="text-xs font-medium text-white/80 mt-1">待发货订单</div>
                            </div>
                            <div class="bg-white/20 p-2 rounded-lg">
                                <Package :size="20" />
                            </div>
                        </div>
                        <div class="mt-4 text-[10px] bg-white/20 w-fit px-2 py-0.5 rounded">
                            请尽快发货
                        </div>
                    </div>

                    <div
                        class="bg-white rounded-2xl p-5 border border-gray-100/50 shadow-sm group cursor-pointer hover:border-orange-200 transition-colors">
                        <div class="flex justify-between items-start">
                            <div>
                                <div class="text-3xl font-bold text-[#2c3e50] font-mono">{{ stats.refund }}</div>
                                <div class="text-xs font-medium text-gray-400 mt-1">售后/退款</div>
                            </div>
                            <div class="bg-orange-50 text-orange-500 p-2 rounded-lg">
                                <AlertCircle :size="20" />
                            </div>
                        </div>
                        <div class="mt-4 text-[10px] text-orange-500 font-medium">需立即处理</div>
                    </div>

                    <div class="bg-white rounded-2xl p-5 border border-gray-100/50 shadow-sm">
                        <div class="flex justify-between items-start">
                            <div>
                                <div class="text-3xl font-bold text-[#2c3e50] font-mono">{{ stats.completedMonth }}
                                </div>
                                <div class="text-xs font-medium text-gray-400 mt-1">本月已成交</div>
                            </div>
                            <div class="bg-blue-50 text-blue-500 p-2 rounded-lg">
                                <CheckCircle2 :size="20" />
                            </div>
                        </div>
                        <div class="mt-4 text-[10px] text-gray-400">总计完成订单</div>
                    </div>

                    <div class="bg-white rounded-2xl p-5 border border-gray-100/50 shadow-sm">
                        <div class="flex justify-between items-start">
                            <div>
                                <div class="text-3xl font-bold text-[#2c3e50] font-mono">¥{{ stats.balance }}</div>
                                <div class="text-xs font-medium text-gray-400 mt-1">账户余额</div>
                            </div>
                            <div class="bg-gray-50 text-gray-500 p-2 rounded-lg">
                                <Wallet :size="20" />
                            </div>
                        </div>
                        <button class="mt-3 text-[#4a8b6e] text-xs font-bold hover:underline">
                            申请提现
                        </button>
                    </div>
                </div>

                <!-- 2. Filters & Search -->
                <div
                    class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/50 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div class="flex gap-2 w-full md:w-auto overflow-x-auto scrollbar-hide">
                        <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key" :class="[
                            'px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2',
                            activeTab === tab.key ? 'bg-[#2c3e50] text-white' : 'text-gray-500 hover:bg-gray-50'
                        ]">
                            {{ tab.name }}
                            <span v-if="tabCounts[tab.key] > 0"
                                :class="['text-xs px-1.5 py-0.5 rounded-full', activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-[#ff5e57] text-white']">
                                {{ tabCounts[tab.key] }}
                            </span>
                        </button>
                    </div>
                    <div class="w-full md:w-72">
                        <SearchBar v-model="searchQuery" placeholder="搜索订单号 / 买家昵称..." />
                    </div>
                </div>

                <!-- 3. Seller Order List -->
                <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
                    <div class="space-y-4">

                        <div v-for="order in filteredOrders" :key="order.id"
                            class="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden hover:border-[#4a8b6e]/30 transition-all group"
                            @click="viewDetail(order)">
                            <!-- Order Top Bar -->
                            <div
                                class="bg-gray-50/50 px-6 py-3 border-b border-gray-50 flex flex-wrap items-center justify-between text-xs text-gray-500 gap-2">
                                <div class="flex items-center gap-6">
                                    <span class="font-mono">{{ formatTime(order.createdAt) }}</span>
                                    <span class="font-mono">订单号：{{ order.id }}</span>
                                    <div class="flex items-center gap-1">
                                        <span>买家:</span>
                                        <span class="font-bold text-gray-700">{{ order.buyer?.username || '买家' }}</span>
                                        <div class="text-[#4a8b6e] cursor-pointer" @click.stop="contactBuyer(order)">
                                            <MessageCircle :size="12" />
                                        </div>
                                    </div>
                                </div>
                                <!-- Countdown -->
                                <div v-if="order.status === 'PAID'"
                                    class="flex items-center gap-1 text-[#ff5e57] font-bold bg-[#ff5e57]/5 px-2 py-0.5 rounded">
                                    <Clock :size="12" />
                                    剩余发货时间: 12小时30分
                                </div>
                            </div>

                            <!-- Order Content Grid -->
                            <div class="grid grid-cols-1 md:grid-cols-12 gap-6 p-6">

                                <!-- Product Info (5 cols) -->
                                <div class="md:col-span-5 flex gap-4">
                                    <div
                                        class="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden border border-gray-100">
                                        <img :src="getProductImage(order.product)" class="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h3
                                            class="font-bold text-[#2c3e50] text-sm line-clamp-2 mb-2 hover:text-[#4a8b6e] cursor-pointer transition-colors">
                                            {{ order.product?.title }}
                                        </h3>
                                        <div class="text-xs text-gray-400">
                                            {{ order.product?.description?.slice(0, 20) }}...
                                        </div>
                                        <div class="mt-2 font-bold text-[#2c3e50]">¥{{ order.price }}</div>
                                    </div>
                                </div>

                                <!-- Shipping Info (3 cols) -->
                                <div class="md:col-span-3 text-xs border-l border-gray-100 pl-6 flex flex-col justify-center"
                                    v-if="order.address">
                                    <div class="text-gray-400 mb-1">收货信息:</div>
                                    <div class="font-bold text-gray-700 mb-1">
                                        {{ order.address.recipientName }} {{ order.address.phone }}
                                    </div>
                                    <div class="text-gray-600 leading-relaxed line-clamp-2"
                                        :title="order.address.detailedAddress">
                                        {{ order.address.province }} {{ order.address.city }} {{ order.address.district
                                        }}
                                        {{ order.address.detailedAddress }}
                                    </div>
                                    <button
                                        class="text-[#4a8b6e] text-xs flex items-center gap-1 mt-2 hover:underline w-fit"
                                        @click.stop="copyInfo(`${order.address.recipientName} ${order.address.phone} ${order.address.province}${order.address.city}${order.address.district}${order.address.detailedAddress}`)">
                                        <Copy :size="10" /> 复制信息
                                    </button>
                                </div>

                                <!-- Status & Actions (4 cols) -->
                                <div
                                    class="md:col-span-4 flex flex-col items-end justify-center gap-3 pl-6 border-l border-gray-100">
                                    <div :class="['font-bold text-sm', getStatusColor(order.status)]">{{
                                        getStatusText(order.status) }}</div>

                                    <!-- Actions based on status -->
                                    <div class="flex gap-2 w-full justify-end" @click.stop>

                                        <!-- Pending Shipment -->
                                        <template v-if="order.status === 'PAID'">
                                            <button @click="handleShip(order)"
                                                class="bg-[#4a8b6e] hover:bg-[#3b755b] text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-lg shadow-[#4a8b6e]/20 transition-all flex-1 md:flex-none">
                                                去发货
                                            </button>
                                        </template>

                                        <!-- Shipped -->
                                        <template v-if="order.status === 'SHIPPED'">
                                            <button
                                                class="border border-gray-200 text-gray-600 hover:text-[#4a8b6e] hover:border-[#4a8b6e] text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                                                查看物流
                                            </button>
                                        </template>

                                        <!-- Refund -->
                                        <template v-if="order.status === 'REFUND_PENDING'">
                                            <button
                                                class="bg-[#ff5e57] hover:bg-[#e04f49] text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-colors">
                                                处理退款
                                            </button>
                                        </template>

                                        <!-- Completed -->
                                        <template v-if="order.status === 'COMPLETED'">
                                            <span class="text-xs text-gray-400">资金已到账</span>
                                        </template>

                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </van-pull-refresh>

            </div>

        </main>

        <!-- --- Ship Dialog (Modal) --- -->
        <div v-if="showShipDialog" class="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <!-- Backdrop -->
            <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                @click="showShipDialog = false"></div>

            <!-- Modal Content -->
            <div class="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative z-10 animate-in fade-in zoom-in duration-200"
                style="max-height: 90vh; display: flex; flex-direction: column;">

                <!-- Header -->
                <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h3 class="font-bold text-lg text-[#2c3e50]">确认发货</h3>
                    <button @click="showShipDialog = false"
                        class="p-1 rounded-full hover:bg-gray-200 text-gray-400 transition-colors">
                        <X :size="20" />
                    </button>
                </div>

                <!-- Scrollable Body -->
                <div class="p-6 overflow-y-auto custom-scrollbar space-y-6">
                    <!-- Product Info -->
                    <div class="flex gap-3 bg-gray-50 p-3 rounded-xl">
                        <img :src="getProductImage(currentOrder?.product)"
                            class="w-12 h-12 rounded-lg object-cover bg-white border border-gray-100" />
                        <div class="flex-1 min-w-0 flex flex-col justify-center">
                            <p class="text-sm font-bold text-[#2c3e50] truncate">{{ currentOrder?.product?.title }}</p>
                            <p class="text-xs text-gray-500">买家: {{ currentOrder?.buyer?.username }}</p>
                        </div>
                    </div>

                    <!-- Address Info -->
                    <div class="relative pl-4 border-l-2 border-[#4a8b6e]">
                        <p class="text-xs font-bold text-gray-400 mb-1">收货地址</p>
                        <p class="text-sm font-bold text-[#2c3e50]">{{ currentOrder?.address?.recipientName }} <span
                                class="font-normal text-gray-500 ml-1">{{ currentOrder?.address?.phone }}</span></p>
                        <p class="text-xs text-gray-600 mt-1 leading-relaxed">
                            {{ currentOrder?.address?.province }} {{ currentOrder?.address?.city }} {{
                                currentOrder?.address?.district }}
                            <br />{{ currentOrder?.address?.detailedAddress }}
                        </p>
                    </div>

                    <!-- Express Company Selection -->
                    <div>
                        <label class="text-sm font-bold text-[#2c3e50] mb-3 block">选择快递公司</label>
                        <div class="grid grid-cols-3 gap-2">
                            <button v-for="company in expressCompanies" :key="company"
                                @click="shipForm.trackingCompany = company" :class="[
                                    'px-2 py-2.5 rounded-xl text-xs font-medium transition-all border',
                                    shipForm.trackingCompany === company
                                        ? 'bg-[#1989fa]/10 border-[#1989fa] text-[#1989fa]'
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                ]">
                                {{ company }}
                            </button>
                        </div>
                    </div>

                    <!-- Sender City Input -->
                    <div>
                        <label class="text-sm font-bold text-[#2c3e50] mb-2 block">发货城市</label>
                        <input type="text" v-model="shipForm.senderCity" placeholder="例如: 广州市"
                            class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#1989fa] focus:ring-4 focus:ring-[#1989fa]/10 transition-all outline-none" />
                    </div>
                </div>

                <!-- Footer -->
                <div class="p-4 border-t border-gray-100 bg-white">
                    <button @click="confirmShip"
                        class="w-full bg-[#1989fa] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 hover:bg-[#1578dc] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                        <Truck :size="18" />
                        立即发货
                    </button>
                </div>
            </div>
        </div>

    </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #e5e7eb;
    border-radius: 20px;
}
</style>
