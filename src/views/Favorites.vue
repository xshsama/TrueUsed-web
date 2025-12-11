<template>
    <div class="min-h-screen bg-[#f7f9fa] font-sans text-[#2c3e50]">

        <!-- --- Top Navigation --- -->
        <TopNavbar mode="buyer" />

        <main class="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <!-- Left Sidebar -->
            <BuyerSidebar active-menu="我的收藏" />

            <!-- Right Content -->
            <div class="lg:col-span-10">

                <!-- --- Header & Tabs --- -->
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div class="flex items-center gap-3">
                        <h1 class="text-2xl font-bold text-[#2c3e50]">我的收藏</h1>
                        <span class="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs font-medium">{{
                            favorites.length }}</span>
                    </div>

                    <div class="flex items-center gap-4">
                        <!-- Filter Tabs -->
                        <div class="bg-white p-1 rounded-full border border-gray-100 shadow-sm flex">
                            <button v-for="tab in ['全部', '降价', '失效']" :key="tab" @click="activeTab = tab"
                                class="px-4 py-1.5 rounded-full text-sm font-medium transition-all border-none cursor-pointer"
                                :class="activeTab === tab ? 'bg-[#4a8b6e] text-white shadow-md' : 'bg-transparent text-gray-500 hover:text-[#4a8b6e] hover:bg-gray-50'">
                                {{ tab }} {{ tab === '降价' ? '(1)' : '' }} {{ tab === '失效' ? '(1)' : '' }}
                            </button>
                        </div>

                        <!-- Batch Manage Button -->
                        <button @click="isEditMode = !isEditMode"
                            class="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border transition-colors cursor-pointer"
                            :class="isEditMode ? 'bg-red-50 text-red-500 border-red-200' : 'bg-white text-gray-600 border-gray-200 hover:border-[#4a8b6e] hover:text-[#4a8b6e]'">
                            {{ isEditMode ? '完成管理' : '批量管理' }}
                        </button>
                    </div>
                </div>

                <!-- --- Favorites Grid --- -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div v-for="item in filteredItems" :key="item.id"
                        class="bg-white rounded-2xl border transition-all duration-300 group relative overflow-hidden flex flex-col"
                        :class="[
                            isEditMode ? 'ring-2 ring-transparent cursor-pointer hover:ring-red-400' : 'hover:border-[#4a8b6e]/30 hover:shadow-lg hover:-translate-y-1',
                            item.status === 'invalid' ? 'opacity-75 grayscale-[0.5]' : 'border-gray-100'
                        ]" @click="handleItemClick(item)">

                        <!-- Image Section -->
                        <div class="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                            <img :src="item.image" :alt="item.title"
                                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                            <!-- 状态遮罩 -->
                            <div v-if="item.status === 'invalid'"
                                class="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span
                                    class="text-white font-bold bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">已失效</span>
                            </div>

                            <!-- 降价提醒 Tag -->
                            <div v-if="item.status === 'price_drop'"
                                class="absolute bottom-2 left-2 bg-[#ff5e57] text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1 shadow-sm">
                                <div class="i-lucide-arrow-down-right text-xs stroke-[3]"></div>
                                直降 ¥{{ item.priceDrop }}
                            </div>

                            <!-- Edit Mode Checkbox Placeholder -->
                            <div v-if="isEditMode"
                                class="absolute top-2 right-2 w-6 h-6 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center shadow-md">
                                <div class="w-3 h-3 rounded-full bg-transparent"></div>
                            </div>
                        </div>

                        <!-- Content Section -->
                        <div class="p-4 flex-1 flex flex-col">
                            <h3
                                class="text-[#2c3e50] font-bold text-[15px] leading-snug line-clamp-2 mb-2 group-hover:text-[#4a8b6e] transition-colors">
                                {{ item.title }}
                            </h3>

                            <!-- Tags -->
                            <div class="flex flex-wrap gap-1.5 mb-3">
                                <span v-for="tag in item.tags" :key="tag"
                                    class="text-[10px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                    {{ tag }}
                                </span>
                            </div>

                            <!-- Price -->
                            <div class="mt-auto flex items-baseline gap-2 mb-3">
                                <span class="text-lg font-bold font-mono"
                                    :class="item.status === 'price_drop' ? 'text-[#ff5e57]' : 'text-[#2c3e50]'">
                                    ¥{{ item.price }}
                                </span>
                                <span v-if="item.status === 'price_drop'"
                                    class="text-xs text-gray-400 line-through decoration-gray-300">¥{{
                                        item.originalPrice
                                    }}</span>
                            </div>

                            <!-- Seller Info & Actions Divider -->
                            <div class="border-t border-gray-50 pt-3 flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <img :src="item.seller.avatar"
                                        class="w-6 h-6 rounded-full border border-gray-100" />
                                    <div class="flex flex-col">
                                        <span class="text-xs text-gray-600 font-medium scale-95 origin-left">{{
                                            item.seller.name }}</span>
                                        <span class="text-[10px] text-[#4a8b6e] scale-90 origin-left">信用{{
                                            item.seller.credit }}</span>
                                    </div>
                                </div>

                                <!-- Action Buttons -->
                                <div
                                    class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        class="p-1.5 text-gray-400 hover:text-[#4a8b6e] hover:bg-[#4a8b6e]/10 rounded-full transition-colors border-none bg-transparent cursor-pointer"
                                        title="联系卖家" @click.stop>
                                        <div class="i-lucide-message-square text-base"></div>
                                    </button>
                                    <button
                                        class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors border-none bg-transparent cursor-pointer"
                                        title="删除" @click.stop>
                                        <div class="i-lucide-trash-2 text-base"></div>
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>

                    <!-- Empty State Mockup (Visual placeholder) -->
                    <div v-if="filteredItems.length === 0"
                        class="col-span-full py-20 flex flex-col items-center justify-center text-gray-400">
                        <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <div class="i-lucide-heart text-[40px] text-gray-300"></div>
                        </div>
                        <p>暂无此类商品</p>
                    </div>
                </div>

                <!-- Bottom Status -->
                <div class="mt-12 text-center">
                    <span class="text-xs text-gray-300">没有更多了</span>
                </div>

            </div>
        </main>
        <div v-if="isEditMode"
            class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-2xl border border-gray-100 flex items-center gap-6 z-50 animate-in slide-in-from-bottom-4">
            <div class="text-sm text-gray-600 font-medium">已选 0 件</div>
            <div class="h-4 w-px bg-gray-200"></div>
            <button
                class="text-sm font-bold text-gray-500 hover:text-gray-800 border-none bg-transparent cursor-pointer">取消收藏</button>
            <button
                class="text-sm font-bold text-red-500 hover:text-red-600 border-none bg-transparent cursor-pointer">删除失效</button>
        </div>

    </div>
</template>

<script setup>
import BuyerSidebar from '@/components/BuyerSidebar.vue';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()
const activeTab = ref('全部')
const isEditMode = ref(false)

// 模拟收藏数据
const favorites = ref([
    {
        id: 1,
        title: '99新 Kindle Paperwhite 5 (11代) / 8G 翻页快',
        price: 650,
        originalPrice: 899,
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
        seller: { name: 'Geek_Tom', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100', credit: '极好' },
        status: 'normal',
        tags: ['个人自用', '箱说全'],
        priceDrop: 0
    },
    {
        id: 2,
        title: 'Sony WH-1000XM4 降噪耳机 黑色',
        price: 1200,
        originalPrice: 1599,
        image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=400',
        seller: { name: '音乐发烧友', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100', credit: '优秀' },
        status: 'price_drop',
        tags: ['降噪神器'],
        priceDrop: 300 // 降价幅度
    },
    {
        id: 3,
        title: 'Fujifilm X100V 银色 / 几乎全新 仅快门500',
        price: 9200,
        originalPrice: 9500,
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400',
        seller: { name: '摄影师阿杰', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=100', credit: '极好' },
        status: 'normal',
        tags: ['传家宝', '女生自用'],
        priceDrop: 0
    },
    {
        id: 4,
        title: 'IKEA 宜家 懒人沙发 / 自提',
        price: 150,
        originalPrice: 499,
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400',
        seller: { name: '搬家甩卖', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100', credit: '良好' },
        status: 'invalid', // 失效
        tags: [],
        priceDrop: 0
    }
])

// 筛选逻辑
const filteredItems = computed(() => {
    if (activeTab.value === '全部') return favorites.value
    if (activeTab.value === '降价') return favorites.value.filter(i => i.status === 'price_drop')
    if (activeTab.value === '失效') return favorites.value.filter(i => i.status === 'invalid')
    return favorites.value
})

const handleItemClick = (item) => {
    if (isEditMode.value) {
        // Toggle selection logic would go here
    } else {
        router.push(`/product/${item.id}`)
    }
}
</script>

<style scoped>
/* Add any custom styles if UnoCSS is not enough, but mostly relying on utility classes */
</style>
