<template>
    <div class="h-[calc(100vh-72px)] flex flex-col overflow-hidden">
        <!-- Main Content (Split View) -->
        <main class="flex-1 flex overflow-hidden">
            
            <!-- Left: Filter & List Panel -->
            <aside class="w-[450px] lg:w-[500px] bg-white border-r border-gray-200 flex flex-col shadow-xl z-20 flex-shrink-0">
                
                <!-- Search & Filters -->
                <div class="p-5 border-b border-gray-100 space-y-4">
                    <div class="relative">
                        <input 
                            type="text" 
                            v-model="searchQuery"
                            placeholder="搜索附近好物..." 
                            class="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#4a8b6e]/20 outline-none transition-all"
                            @keyup.enter="handleSearch"
                        />
                        <div class="i-lucide-search w-4 h-4 absolute left-3.5 top-3.5 text-gray-400"></div>
                    </div>
                    
                    <div class="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                        <button 
                            v-for="filter in filters" 
                            :key="filter.label"
                            @click="activeFilter = filter.value"
                            :class="['px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border cursor-pointer', activeFilter === filter.value ? 'bg-[#2c3e50] text-white border-[#2c3e50]' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50']"
                        >
                            {{ filter.label }}
                        </button>
                    </div>
                </div>

                <!-- Items List -->
                <div class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50" id="itemList">
                    <div class="text-xs text-gray-400 px-1 mb-1">附近 {{ filteredItems.length }} 件商品</div>
                    
                    <div 
                        v-for="item in filteredItems" 
                        :key="item.id" 
                        @mouseenter="hoveredItem = item.id"
                        @mouseleave="hoveredItem = null"
                        :class="['flex gap-4 p-3 rounded-2xl bg-white border transition-all cursor-pointer group relative', hoveredItem === item.id ? 'border-[#4a8b6e] shadow-md ring-1 ring-[#4a8b6e]/10' : 'border-gray-100 shadow-sm hover:border-[#4a8b6e]/30']"
                        @click="router.push(`/product/${item.id}`)"
                    >
                        <div class="w-28 h-28 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0 relative">
                            <img :src="item.image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div class="absolute top-1 left-1 bg-[#4a8b6e] text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm">
                                {{ item.categoryName || '闲置' }}
                            </div>
                        </div>
                        
                        <div class="flex-1 flex flex-col justify-between py-0.5">
                            <div>
                                <h3 class="font-bold text-[#2c3e50] text-sm line-clamp-2 mb-1">{{ item.title }}</h3>
                                <div class="flex items-center gap-1 text-xs text-gray-500">
                                    <div class="i-lucide-map-pin w-3 h-3 text-[#4a8b6e]"></div>
                                    <span>{{ item.location }} · {{ item.distance }}</span>
                                </div>
                            </div>
                            
                            <div class="flex items-end justify-between">
                                <div>
                                    <span class="text-lg font-bold text-[#ff5e57]">¥{{ item.price }}</span>
                                    <span v-if="item.isNegotiable" class="text-[10px] text-gray-400 ml-1">可小刀</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <img :src="item.sellerAvatar" class="w-5 h-5 rounded-full bg-gray-100 object-cover" />
                                    <span class="text-xs text-gray-500 max-w-[60px] truncate">{{ item.sellerName }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Loading Sentinel -->
                    <div class="py-4 text-center text-xs text-gray-400">没有更多了</div>
                </div>
            </aside>

            <!-- Right: Interactive Map -->
            <section class="flex-1 bg-[#e5e7eb] relative overflow-hidden group">
                <!-- Mock Map Background -->
                <div class="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/Map_of_Shanghai_Metro.png')] bg-cover bg-center opacity-60 grayscale-[30%]"></div>
                
                <!-- Overlay Gradient -->
                <div class="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-black/5 pointer-events-none"></div>

                <!-- Markers -->
                <div 
                    v-for="item in filteredItems" 
                    :key="'marker-'+item.id"
                    :class="['absolute cursor-pointer transform transition-all duration-300 map-marker', hoveredItem === item.id ? 'marker-selected scale-110 z-50' : 'z-10']"
                    :style="{ top: item.mapY + '%', left: item.mapX + '%' }"
                    @click="scrollToItem(item.id)"
                >
                    <!-- Price Bubble -->
                    <div class="pin bg-white text-[#2c3e50] text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg border border-gray-200 flex items-center gap-1 transition-colors relative after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-white">
                        <span>¥{{ item.price }}</span>
                        <div v-if="hoveredItem === item.id" class="i-lucide-chevron-right w-3 h-3 text-[#4a8b6e]"></div>
                    </div>
                    
                    <!-- Hover Preview Card (Only visible on hover) -->
                    <div v-if="hoveredItem === item.id" class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-white rounded-xl shadow-xl p-2 border border-gray-100 animate-[fadeIn_0.2s_ease-out]">
                        <img :src="item.image" class="w-full h-24 object-cover rounded-lg mb-2 bg-gray-100" />
                        <div class="text-xs font-bold text-[#2c3e50] line-clamp-1 px-1">{{ item.title }}</div>
                        <div class="text-[10px] text-gray-500 px-1 mt-0.5">{{ item.location }}</div>
                    </div>
                </div>

                <!-- Map Controls -->
                <div class="absolute bottom-8 right-8 flex flex-col gap-2">
                    <button class="w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-[#4a8b6e] transition-colors cursor-pointer">
                        <div class="i-lucide-crosshair w-5 h-5"></div>
                    </button>
                    <div class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
                        <button class="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors border-b border-gray-100 cursor-pointer">
                            <div class="i-lucide-plus w-5 h-5"></div>
                        </button>
                        <button class="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
                            <div class="i-lucide-minus w-5 h-5"></div>
                        </button>
                    </div>
                </div>

                <!-- Search Area Button -->
                <button class="absolute top-6 left-1/2 -translate-x-1/2 bg-white text-[#2c3e50] px-5 py-2.5 rounded-full font-bold text-sm shadow-lg flex items-center gap-2 hover:bg-gray-50 transition-transform hover:scale-105 active:scale-95 cursor-pointer">
                    <div class="i-lucide-refresh-cw w-3.5 h-3.5"></div> 搜索该区域
                </button>

            </section>

        </main>

    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { listProducts } from '@/api/products';

const router = useRouter();
const searchQuery = ref('');
const activeFilter = ref('all');
const hoveredItem = ref(null);
const products = ref([]);
const loading = ref(false);

const filters = [
    { label: '全部', value: 'all' },
    { label: '3km以内', value: '3km' },
    { label: '支持面交', value: 'meetup' },
    { label: '最近发布', value: 'new' },
    { label: '家具家电', value: 'furniture' }
];

// Mock locations
const locations = ['东方曼哈顿', '港汇恒隆', '交通大学', '汇金广场', '漕河泾', '徐家汇公园', '美罗城', '宜家家居'];

const fetchProducts = async () => {
    loading.value = true;
    try {
        const res = await listProducts({ 
            page: 1, 
            size: 20,
            q: searchQuery.value
        });
        
        // Transform backend data to match UI needs + Add mock location data
        products.value = (res.content || []).map(p => {
            const mockLocationIndex = Math.floor(Math.random() * locations.length);
            const mockDistance = (Math.random() * 5).toFixed(1) + 'km';
            
            return {
                id: p.id,
                title: p.title,
                price: p.price,
                // Handle image array or string
                image: Array.isArray(p.images) && p.images.length > 0 
                    ? p.images[0] 
                    : (typeof p.images === 'string' ? p.images : 'https://placehold.co/200'),
                categoryName: p.categoryName || '闲置',
                sellerName: p.seller?.nickname || '用户',
                sellerAvatar: p.seller?.avatarUrl || 'https://ui-avatars.com/api/?name=User&background=random',
                isNegotiable: true, // Mock
                location: locations[mockLocationIndex], // Mock
                distance: mockDistance, // Mock
                mapX: 20 + Math.random() * 60, // Keep away from edges (20-80%)
                mapY: 20 + Math.random() * 60  // Keep away from edges (20-80%)
            };
        });
    } catch (error) {
        console.error('Failed to fetch products:', error);
    } finally {
        loading.value = false;
    }
};

const handleSearch = () => {
    fetchProducts();
};

const filteredItems = computed(() => {
    let result = products.value;
    
    // Client-side filtering for demo purposes since we mocked the data
    if (activeFilter.value === '3km') {
        result = result.filter(i => parseFloat(i.distance) < 3);
    } else if (activeFilter.value === 'furniture') {
        // Simple mock filter
        result = result.filter(i => i.categoryName?.includes('家具') || i.categoryName?.includes('家电'));
    }
    
    return result;
});

const scrollToItem = (id) => {
    hoveredItem.value = id;
    const el = document.getElementById('itemList');
    // Simple logic, could be improved with scrollIntoView
};

onMounted(() => {
    fetchProducts();
});
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

/* Map Marker Animation */
@keyframes bounce-in {
    0% { transform: scale(0); opacity: 0; }
    60% { transform: scale(1.1); opacity: 1; }
    100% { transform: scale(1); }
}
.map-marker {
    animation: bounce-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

/* Selected Marker Style */
.marker-selected .pin {
    background-color: #2c3e50;
    color: white;
    transform: scale(1.1);
    z-index: 50;
    border-color: #2c3e50;
}
.marker-selected .pin::after {
    border-top-color: #2c3e50;
}
</style>
