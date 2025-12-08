<script setup>
import { deleteProduct, getMyProducts, hideProduct, publishProduct } from '@/api/products';
import TopNavbar from '@/components/TopNavbar.vue';
import {
    ArrowDown,
    Check,
    Eye,
    Heart,
    MessageCircle,
    MessageSquare,
    MoreHorizontal,
    Package,
    RefreshCw,
    Search,
    Settings,
    ShoppingBag,
    Star,
    TrendingUp
} from 'lucide-vue-next';
import { showConfirmDialog, showFailToast, showSuccessToast } from 'vant';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// --- State ---
const activeMenu = ref('商品管理');
const activeTab = ref('active');
const searchQuery = ref('');
const isBatchMode = ref(false);
const selectedItems = ref([]);
const products = ref([]);
const loading = ref(false);
const refreshing = ref(false);
const finished = ref(false);
const isInitialLoading = ref(true);
const page = ref(0);
const pageSize = 20;

// Stats (Mock for now, can be replaced with API)
const stats = ref({
    views: 1208,
    unread: 8,
    income: 4850
});

const menuItems = [
    { name: '商品管理', icon: Package, route: '/my-products' },
    { name: '订单管理', icon: ShoppingBag, route: '/order-manage' },
    { name: '评价管理', icon: Star, route: '/my-reviews' },
    { name: '店铺设置', icon: Settings, route: '/settings' },
];

const tabs = [
    { name: '全部', key: 'all' },
    { name: '出售中', key: 'active' },
    { name: '审核中', key: 'audit' },
    { name: '已售出', key: 'sold' },
    { name: '已下架', key: 'off' },
];

// --- Helpers ---
const getStatusText = (status) => {
    const map = {
        'active': '出售中',
        'audit': '审核中',
        'sold': '已售出',
        'off': '已下架'
    };
    return map[status] || status;
};

// --- API & Data ---
const loadProducts = async () => {
    if (isInitialLoading.value) loading.value = true;
    try {
        const res = await getMyProducts({
            page: page.value,
            size: pageSize,
            sort: 'created_desc'
        });

        const newItems = (res.content || []).map(p => ({
            id: p.id,
            title: p.title,
            price: p.price,
            originalPrice: p.originalPrice || (p.price * 1.2).toFixed(0),
            image: p.images && p.images.length > 0 ? p.images[0].url : '',
            views: p.viewsCount || 0,
            comments: 0, // Backend doesn't return this yet
            likes: p.favoritesCount || 0,
            status: mapBackendStatus(p.status)
        }));

        if (page.value === 0) {
            products.value = newItems;
        } else {
            products.value = [...products.value, ...newItems];
        }

        finished.value = res.last;
        page.value++;
    } catch (error) {
        showFailToast('加载失败');
    } finally {
        loading.value = false;
        isInitialLoading.value = false;
        refreshing.value = false;
    }
};

const mapBackendStatus = (status) => {
    if (status === 'AVAILABLE') return 'active';
    if (status === 'SOLD') return 'sold';
    if (status === 'HIDDEN') return 'off';
    if (status === 'PENDING_REVIEW') return 'audit';
    return 'off';
};

const onRefresh = async () => {
    page.value = 0;
    finished.value = false;
    await loadProducts();
    showSuccessToast('已刷新');
};

const onLoad = () => {
    if (!refreshing.value && !isInitialLoading.value) {
        loadProducts();
    }
};

// --- Computed ---
const filteredProducts = computed(() => {
    let result = products.value;

    if (activeTab.value !== 'all') {
        result = result.filter(p => p.status === activeTab.value);
    }

    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        result = result.filter(p => p.title.toLowerCase().includes(q));
    }
    return result;
});

const tabCounts = computed(() => {
    const counts = {};
    tabs.forEach(t => {
        if (t.key === 'all') counts[t.key] = products.value.length;
        else counts[t.key] = products.value.filter(p => p.status === t.key).length;
    });
    return counts;
});

// --- Actions ---
const handleMenuClick = (item) => {
    if (item.route) router.push(item.route);
};

const toggleSelect = (id) => {
    if (!isBatchMode.value) return;
    if (selectedItems.value.includes(id)) {
        selectedItems.value = selectedItems.value.filter(i => i !== id);
    } else {
        selectedItems.value.push(id);
    }
};

const toggleStatus = async (item) => {
    const action = item.status === 'active' ? '下架' : '上架';
    showConfirmDialog({ title: `${action}商品`, message: `确定要${action}这个商品吗？` })
        .then(async () => {
            try {
                if (item.status === 'active') {
                    await hideProduct(item.id);
                    item.status = 'off';
                } else {
                    await publishProduct(item.id);
                    item.status = 'active';
                }
                showSuccessToast(`${action}成功`);
            } catch (e) {
                showFailToast('操作失败');
            }
        }).catch(() => { });
};

const removeItem = (item) => {
    showConfirmDialog({ title: '删除商品', message: '删除后无法恢复，确定删除吗？' })
        .then(async () => {
            try {
                await deleteProduct(item.id);
                products.value = products.value.filter(p => p.id !== item.id);
                showSuccessToast('已删除');
            } catch (e) {
                showFailToast('删除失败');
            }
        }).catch(() => { });
};

// --- Lifecycle ---
onMounted(() => {
    loadProducts();
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

            <!-- Right Content -->
            <div class="lg:col-span-10 space-y-6">

                <!-- 1. Data Dashboard -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div
                        class="bg-white rounded-2xl p-6 border border-gray-100/50 shadow-sm relative overflow-hidden group">
                        <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Eye :size="64" class="text-[#4a8b6e]" />
                        </div>
                        <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">昨日曝光量</div>
                        <div class="text-3xl font-bold text-[#2c3e50] font-mono">{{ stats.views }}</div>
                        <div class="mt-4 flex items-center gap-1 text-xs font-medium text-[#4a8b6e]">
                            <TrendingUp :size="12" /> 较上周 +12%
                        </div>
                    </div>

                    <div
                        class="bg-white rounded-2xl p-6 border border-gray-100/50 shadow-sm relative overflow-hidden group">
                        <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <MessageCircle :size="64" class="text-blue-500" />
                        </div>
                        <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">未读留言</div>
                        <div class="text-3xl font-bold text-[#2c3e50] font-mono">{{ stats.unread }}</div>
                        <div class="mt-4 flex items-center gap-1 text-xs font-medium text-gray-500">
                            3 个买家正在咨询
                        </div>
                    </div>

                    <div
                        class="bg-gradient-to-r from-[#4a8b6e] to-[#3b755b] rounded-2xl p-6 text-white shadow-lg shadow-[#4a8b6e]/20 relative overflow-hidden">
                        <div class="text-xs font-bold text-white/80 uppercase tracking-wider mb-1">本月预估收入</div>
                        <div class="text-3xl font-bold font-mono">¥ {{ stats.income }}</div>
                        <button
                            class="mt-4 bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm transition-colors flex items-center gap-1">
                            去提现 <div class="i-lucide-chevron-right w-3 h-3"></div>
                        </button>
                    </div>
                </div>

                <!-- 2. Toolbar -->
                <div
                    class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/50 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div class="flex gap-2 w-full md:w-auto overflow-x-auto scrollbar-hide">
                        <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
                            :class="['px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2', activeTab === tab.key ? 'bg-[#2c3e50] text-white' : 'text-gray-500 hover:bg-gray-50']">
                            {{ tab.name }}
                            <span v-if="tabCounts[tab.key] > 0"
                                :class="['text-xs px-1.5 py-0.5 rounded-full', activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400']">{{
                                    tabCounts[tab.key] }}</span>
                        </button>
                    </div>

                    <div class="flex gap-3 w-full md:w-auto">
                        <div class="relative flex-1 md:w-64 group">
                            <input type="text" v-model="searchQuery" placeholder="搜索商品..."
                                class="w-full bg-gray-100/80 border-none rounded-full h-10 pl-4 pr-10 text-sm text-gray-700 placeholder-gray-400 focus:bg-white focus:ring-1 focus:ring-[#4a8b6e]/30 transition-all outline-none" />
                            <div
                                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#4a8b6e] transition-colors">
                                <Search :size="18" />
                            </div>
                        </div>
                        <button @click="isBatchMode = !isBatchMode"
                            :class="['px-4 py-2 rounded-xl text-sm font-bold transition-all border', isBatchMode ? 'bg-[#4a8b6e]/10 text-[#4a8b6e] border-[#4a8b6e]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50']">
                            {{ isBatchMode ? '完成' : '批量管理' }}
                        </button>
                    </div>
                </div>

                <!-- Batch Action Bar -->
                <div v-if="isBatchMode"
                    class="bg-[#2c3e50] text-white px-6 py-3 rounded-xl flex items-center justify-between shadow-lg animate-in slide-in-from-top-2 duration-200">
                    <span class="text-sm font-medium">已选 {{ selectedItems.length }} 件商品</span>
                    <div class="flex gap-3">
                        <button class="text-xs hover:text-gray-300">下架</button>
                        <button class="text-xs text-[#ff5e57] hover:text-red-400">删除</button>
                    </div>
                </div>

                <!-- 3. Product List -->
                <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
                    <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
                        <div class="space-y-4">
                            <div v-for="product in filteredProducts" :key="product.id"
                                :class="['bg-white rounded-2xl p-5 border shadow-sm transition-all group item-card flex flex-col md:flex-row gap-6 relative', isBatchMode && selectedItems.includes(product.id) ? 'border-[#4a8b6e] bg-[#4a8b6e]/5' : 'border-gray-100 hover:border-[#4a8b6e]/30 hover:shadow-md']"
                                @click="toggleSelect(product.id)">

                                <!-- Batch Checkbox -->
                                <div v-if="isBatchMode" class="absolute top-5 left-5 z-10">
                                    <div
                                        :class="['w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white check-circle', selectedItems.includes(product.id) ? 'border-[#4a8b6e] bg-[#4a8b6e]' : 'border-gray-300']">
                                        <Check v-if="selectedItems.includes(product.id)" :size="12"
                                            class="text-white" />
                                    </div>
                                </div>

                                <!-- Image Section -->
                                <div class="flex gap-5 flex-1 pl-0 md:pl-0" :class="isBatchMode ? 'pl-8 md:pl-0' : ''">
                                    <div
                                        class="w-28 h-28 bg-gray-100 rounded-xl overflow-hidden border border-gray-100 relative group-hover:scale-[1.02] transition-transform flex-shrink-0">
                                        <img :src="product.image" class="w-full h-full object-cover" />
                                        <div v-if="product.status === 'audit'"
                                            class="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <span class="text-white text-xs font-bold">审核中</span>
                                        </div>
                                    </div>

                                    <div class="flex flex-col justify-between py-1 flex-1">
                                        <div>
                                            <div class="flex justify-between items-start">
                                                <h3
                                                    class="font-bold text-[#2c3e50] text-base mb-1 line-clamp-1 hover:text-[#4a8b6e] transition-colors cursor-pointer">
                                                    {{ product.title }}</h3>
                                                <button class="text-gray-400 hover:text-[#2c3e50] md:hidden">
                                                    <MoreHorizontal :size="20" />
                                                </button>
                                            </div>
                                            <div class="flex items-center gap-2 text-sm mb-3">
                                                <span class="font-bold text-[#ff5e57] text-lg">¥{{ product.price
                                                    }}</span>
                                                <span class="text-xs text-gray-400 line-through">¥{{
                                                    product.originalPrice }}</span>
                                            </div>
                                        </div>

                                        <!-- Data Tags -->
                                        <div
                                            class="flex items-center gap-4 text-xs text-gray-500 bg-gray-50 w-fit px-3 py-1.5 rounded-lg">
                                            <span class="flex items-center gap-1.5" title="浏览量">
                                                <Eye :size="14" class="text-gray-400" /> {{ product.views }}
                                            </span>
                                            <div class="w-px h-3 bg-gray-300"></div>
                                            <span
                                                class="flex items-center gap-1.5 hover:text-[#4a8b6e] cursor-pointer transition-colors"
                                                title="留言">
                                                <MessageSquare :size="14" class="text-gray-400" /> {{ product.comments
                                                }}
                                            </span>
                                            <div class="w-px h-3 bg-gray-300"></div>
                                            <span class="flex items-center gap-1.5" title="想要">
                                                <Heart :size="14" class="text-gray-400" /> {{ product.likes }}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Action Section (Desktop) -->
                                <div class="hidden md:flex flex-col justify-center gap-2 w-40 border-l border-gray-100 pl-6"
                                    @click.stop>
                                    <template v-if="product.status === 'active'">
                                        <button
                                            class="w-full bg-[#4a8b6e] hover:bg-[#3b755b] text-white text-xs font-bold py-2 rounded-lg shadow-sm shadow-[#4a8b6e]/20 transition-all flex items-center justify-center gap-1">
                                            <RefreshCw :size="12" /> 擦亮
                                        </button>
                                        <button
                                            class="w-full border border-gray-200 hover:border-[#ff5e57] hover:text-[#ff5e57] text-gray-600 text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1">
                                            <ArrowDown :size="12" /> 降价
                                        </button>
                                        <div class="flex justify-center gap-4 mt-1">
                                            <span class="text-xs text-gray-400 hover:text-[#2c3e50] cursor-pointer"
                                                @click="router.push({ name: 'PostCreate', query: { id: product.id } })">编辑</span>
                                            <span class="text-xs text-gray-400 hover:text-[#ff5e57] cursor-pointer"
                                                @click="toggleStatus(product)">下架</span>
                                        </div>
                                    </template>
                                    <template v-if="product.status === 'off'">
                                        <button @click="toggleStatus(product)"
                                            class="w-full bg-[#2c3e50] hover:bg-[#34495e] text-white text-xs font-bold py-2 rounded-lg shadow-sm transition-all">
                                            上架
                                        </button>
                                        <span
                                            class="text-xs text-center text-gray-400 hover:text-[#ff5e57] cursor-pointer mt-2"
                                            @click="removeItem(product)">删除</span>
                                    </template>
                                    <template v-if="product.status === 'audit' || product.status === 'sold'">
                                        <span class="text-center text-xs text-gray-400 py-2">{{
                                            getStatusText(product.status) }}</span>
                                    </template>
                                </div>

                            </div>
                        </div>
                    </van-list>
                </van-pull-refresh>

            </div>

        </main>

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

/* 选中动画 */
.check-circle {
    transition: all 0.2s;
}

.item-card:hover .check-circle {
    border-color: #4a8b6e;
}
</style>
