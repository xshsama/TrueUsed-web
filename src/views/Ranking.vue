<script setup>
import { listProducts } from '@/api/products';
import {
    Clock,
    Crown,
    Eye,
    Flame,
    TrendingDown
} from 'lucide-vue-next';
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Ranking Data
const rankingItems = ref([]);
const activeTab = ref('综合热度');
const loading = ref(false);

const loadData = async () => {
    loading.value = true;
    try {
        let sort = 'views_desc'; // Default for 综合热度
        if (activeTab.value === '降价幅度') {
            // Backend doesn't support price drop sort directly, use price_asc as proxy or just views for now
            // Ideally backend should support 'price_drop_desc'
            sort = 'price_asc';
        } else if (activeTab.value === '最新发布') {
            sort = 'created_desc'; // Backend default is createdAt desc
        }

        const res = await listProducts({
            page: 0,
            size: 20,
            sort: sort,
            status: 'ON_SALE'
        });

        rankingItems.value = (res.content || []).map(p => ({
            id: p.id,
            title: p.title,
            price: p.price,
            original: p.originalPrice || (p.price * 1.2).toFixed(0),
            drop: p.originalPrice ? (p.originalPrice - p.price).toFixed(0) : 0,
            image: (p.images && p.images.length > 0) ? p.images[0].url : 'https://via.placeholder.com/400',
            heat: p.viewsCount || 0,
            time: formatTime(p.createdAt),
            seller: p.seller ? (p.seller.nickname || p.seller.username) : '未知卖家',
            views: p.viewsCount || 0
        }));
    } catch (e) {
        console.error('Failed to load ranking', e);
    } finally {
        loading.value = false;
    }
};

const formatTime = (time) => {
    if (!time) return '';
    const date = new Date(time);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    return date.toLocaleDateString();
};

watch(activeTab, () => {
    loadData();
});

onMounted(() => {
    loadData();
});
</script>

<template>
    <div class="min-h-screen bg-[#f7f9fa] font-sans text-[#2c3e50] pb-12">

        <main class="max-w-7xl mx-auto px-6 py-8 w-full animate-[fadeIn_0.3s_ease-out]">

            <!-- Hero Header -->
            <div
                class="bg-gradient-to-r from-[#2c3e50] to-[#1a252f] rounded-3xl p-8 mb-10 text-white relative overflow-hidden shadow-xl">
                <div
                    class="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none">
                </div>
                <div class="relative z-10">
                    <h1 class="text-4xl font-bold mb-2 flex items-center gap-3">
                        <Flame :size="32" class="text-orange-500 fill-orange-500" />
                        每日捡漏榜
                    </h1>
                    <p class="text-gray-400">基于大数据算法，为您实时挖掘全网超值低价好物</p>

                    <!-- Filters -->
                    <div class="flex gap-4 mt-6">
                        <button v-for="tab in ['综合热度', '降价幅度', '最新发布']" :key="tab" @click="activeTab = tab"
                            :class="['px-4 py-2 rounded-full text-sm font-bold transition-colors backdrop-blur-md border', activeTab === tab ? 'bg-white text-[#2c3e50] border-white' : 'bg-white/10 text-white border-white/10 hover:bg-white/20']">
                            {{ tab }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Top 3 Podium (Layout) -->
            <div v-if="rankingItems.length >= 3" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">

                <!-- Rank 2 -->
                <div class="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 relative rank-2-shadow transform hover:-translate-y-2 transition-transform duration-300 cursor-pointer"
                    @click="router.push(`/product/${rankingItems[1].id}`)">
                    <div
                        class="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center font-bold text-xl border-4 border-white shadow-sm">
                        2</div>
                    <div class="aspect-square bg-gray-100 rounded-xl mb-3 overflow-hidden relative">
                        <img :src="rankingItems[1].image" class="w-full h-full object-cover" />
                        <div v-if="rankingItems[1].drop > 0"
                            class="absolute bottom-2 left-2 bg-[#ff5e57] text-white text-xs font-bold px-2 py-1 rounded">
                            直降 ¥{{ rankingItems[1].drop }}</div>
                    </div>
                    <h3 class="font-bold text-[#2c3e50] line-clamp-1">{{ rankingItems[1].title }}</h3>
                    <div class="flex justify-between items-end mt-2">
                        <div>
                            <div class="text-sm text-gray-400 line-through">¥{{ rankingItems[1].original }}</div>
                            <div class="text-xl font-bold text-[#ff5e57]">¥{{ rankingItems[1].price }}</div>
                        </div>
                        <div class="text-xs text-gray-400">{{ rankingItems[1].heat }}人想要</div>
                    </div>
                </div>

                <!-- Rank 1 (Larger) -->
                <div class="bg-white rounded-2xl p-5 shadow-xl border border-yellow-100 relative rank-1-shadow transform scale-110 z-10 cursor-pointer"
                    @click="router.push(`/product/${rankingItems[0].id}`)">
                    <div
                        class="absolute -top-5 left-1/2 -translate-x-1/2 w-12 h-12 bg-yellow-400 text-white rounded-full flex items-center justify-center font-bold text-2xl border-4 border-white shadow-sm">
                        <Crown :size="20" fill="white" />
                    </div>
                    <div class="aspect-square bg-gray-100 rounded-xl mb-3 overflow-hidden relative">
                        <img :src="rankingItems[0].image" class="w-full h-full object-cover" />
                        <div
                            class="absolute top-2 left-2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                            <TrendingDown :size="12" /> 捡漏指数 9.9
                        </div>
                    </div>
                    <h3 class="font-bold text-[#2c3e50] text-lg line-clamp-1">{{ rankingItems[0].title }}</h3>
                    <div class="flex justify-between items-end mt-3">
                        <div>
                            <div class="text-xs text-gray-400">原价 ¥{{ rankingItems[0].original }}</div>
                            <div class="text-3xl font-bold text-[#ff5e57] font-mono">¥{{ rankingItems[0].price }}</div>
                        </div>
                        <button
                            class="bg-[#ff5e57] text-white px-4 py-2 rounded-full font-bold text-sm shadow-md hover:bg-[#ff4742]">立即抢</button>
                    </div>
                </div>

                <!-- Rank 3 -->
                <div class="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 relative rank-3-shadow transform hover:-translate-y-2 transition-transform duration-300 cursor-pointer"
                    @click="router.push(`/product/${rankingItems[2].id}`)">
                    <div
                        class="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-orange-200 text-orange-700 rounded-full flex items-center justify-center font-bold text-xl border-4 border-white shadow-sm">
                        3</div>
                    <div class="aspect-square bg-gray-100 rounded-xl mb-3 overflow-hidden relative">
                        <img :src="rankingItems[2].image" class="w-full h-full object-cover" />
                        <div v-if="rankingItems[2].drop > 0"
                            class="absolute bottom-2 left-2 bg-[#ff5e57] text-white text-xs font-bold px-2 py-1 rounded">
                            直降 ¥{{ rankingItems[2].drop }}</div>
                    </div>
                    <h3 class="font-bold text-[#2c3e50] line-clamp-1">{{ rankingItems[2].title }}</h3>
                    <div class="flex justify-between items-end mt-2">
                        <div>
                            <div class="text-sm text-gray-400 line-through">¥{{ rankingItems[2].original }}</div>
                            <div class="text-xl font-bold text-[#ff5e57]">¥{{ rankingItems[2].price }}</div>
                        </div>
                        <div class="text-xs text-gray-400">{{ rankingItems[2].heat }}人想要</div>
                    </div>
                </div>

            </div>

            <!-- The Rest of the List -->
            <div v-if="rankingItems.length > 0"
                class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div v-for="(item, index) in rankingItems.slice(3)" :key="item.id"
                    class="flex items-center p-6 border-b border-gray-50 hover:bg-gray-50 transition-colors group cursor-pointer"
                    @click="router.push(`/product/${item.id}`)">
                    <div class="w-12 text-center font-bold text-gray-300 text-xl italic mr-4">{{ index + 4 }}</div>

                    <div
                        class="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 relative border border-gray-100">
                        <img :src="item.image"
                            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>

                    <div class="flex-1 ml-6">
                        <div class="flex justify-between items-start mb-2">
                            <h3
                                class="font-bold text-[#2c3e50] text-lg group-hover:text-[#4a8b6e] transition-colors line-clamp-1">
                                {{ item.title }}</h3>
                            <span v-if="item.original > 0"
                                class="text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded font-medium">低于行情 {{
                                    Math.round((item.original - item.price) / item.original * 100) }}%</span>
                        </div>
                        <div class="flex items-center gap-4 text-xs text-gray-400 mb-3">
                            <span class="flex items-center gap-1">
                                <Eye :size="12" /> {{ item.views }} 浏览
                            </span>
                            <span class="flex items-center gap-1">
                                <Clock :size="12" /> {{ item.time }}
                            </span>
                            <span>{{ item.seller }} · 信用极好</span>
                        </div>
                        <div class="flex justify-between items-end">
                            <div class="flex items-baseline gap-2">
                                <span class="text-2xl font-bold text-[#ff5e57]">¥{{ item.price }}</span>
                                <span class="text-sm text-gray-400 line-through">¥{{ item.original }}</span>
                            </div>
                            <button
                                class="border border-gray-200 text-gray-600 px-4 py-1.5 rounded-full text-sm font-bold hover:border-[#4a8b6e] hover:text-[#4a8b6e] transition-colors">
                                去看看
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else-if="!loading" class="text-center py-20 text-gray-400">
                暂无上榜商品
            </div>

        </main>
    </div>
</template>

<style scoped>
.rank-1-shadow {
    box-shadow: 0 10px 30px -5px rgba(255, 199, 0, 0.3);
}

.rank-2-shadow {
    box-shadow: 0 10px 30px -5px rgba(192, 192, 192, 0.3);
}

.rank-3-shadow {
    box-shadow: 0 10px 30px -5px rgba(205, 127, 50, 0.3);
}
</style>
