<template>
    <div class="min-h-screen bg-[#F9FAFB] pb-[60px]">
        <div class="max-w-[1200px] mx-auto p-4">
            <!-- 1. Hero Banner (官方验货) - REDESIGNED -->
            <section
                class="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-[#143d2d] via-[#1B4032] to-[#2a5e4b] text-white shadow-2xl shadow-emerald-900/20 mb-6">

                <!-- Background Decorative Elements (Trust Symbols) -->
                <div
                    class="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none">
                </div>
                <div
                    class="i-lucide-shield-check absolute -right-12 -bottom-24 w-96 h-96 text-white/[0.03] rotate-12 pointer-events-none">
                </div>

                <div
                    class="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-12 lg:p-16 min-h-[360px]">

                    <!-- Left Content -->
                    <div class="max-w-xl space-y-6 text-center md:text-left">
                        <div
                            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/40 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wider shadow-inner uppercase">
                            <div class="i-lucide-check-circle-2 text-sm text-emerald-400"></div>
                            <span>Official Check · 官方全检</span>
                        </div>

                        <h1
                            class="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight drop-shadow-sm">
                            怕踩雷？<br />
                            <span
                                class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-white">先验货</span>，再发货。
                        </h1>

                        <p
                            class="text-emerald-100/80 text-base md:text-lg max-w-md mx-auto md:mx-0 font-light leading-relaxed">
                            TrueUsed 官方质检工程师为您层层把关，杜绝假货与隐形故障。
                            <span class="block mt-1 text-emerald-300/60 text-sm">已累计为 12,403 位用户拦截翻新机</span>
                        </p>

                        <div class="pt-4 flex justify-center md:justify-start">
                            <button @click="router.push('/search?q=验货')"
                                class="group bg-white text-[#1B4032] hover:bg-emerald-50 px-8 py-3.5 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] flex items-center gap-2 text-sm md:text-base cursor-pointer border-none">
                                浏览验货商品
                                <div
                                    class="i-lucide-chevron-right text-lg text-emerald-600 group-hover:translate-x-1 transition-transform">
                                </div>
                            </button>
                        </div>
                    </div>

                    <!-- Right Side - CSS Constructed Illustration -->
                    <div class="relative mt-10 md:mt-0 w-full max-w-sm flex justify-center [perspective:1000px]">
                        <!-- Podium -->
                        <div class="relative w-64 h-64">
                            <!-- Glowing Platform -->
                            <div
                                class="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-white/10 to-transparent rounded-[100%] blur-xl">
                            </div>
                            <div class="absolute inset-x-10 bottom-8 h-4 bg-emerald-400/20 rounded-[100%] blur-md">
                            </div>

                            <!-- Floating Elements (Composition) -->
                            <div
                                class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-tr from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/10 rotate-3 shadow-2xl flex flex-col items-center justify-center gap-4 group hover:-translate-y-2 transition-transform duration-500">
                                <div class="p-4 bg-emerald-900/50 rounded-full text-emerald-300 shadow-inner">
                                    <div class="i-lucide-shield-check text-5xl"></div>
                                </div>
                                <div class="text-center">
                                    <div class="text-2xl font-bold text-white">100%</div>
                                    <div class="text-xs text-emerald-200 uppercase tracking-widest">Authentic</div>
                                </div>

                                <!-- Decorative dots -->
                                <div class="absolute top-3 right-3 w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse">
                                </div>
                            </div>

                            <!-- Floating Icons representing products -->
                            <div
                                class="absolute -left-4 top-10 p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg animate-bounce [animation-duration:3s]">
                                <div class="i-lucide-headphones text-white text-2xl"></div>
                            </div>
                            <div
                                class="absolute -right-4 bottom-10 p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg animate-bounce [animation-duration:4s]">
                                <div class="i-lucide-mouse text-white text-2xl"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 2. 急出捡漏 (Urgent Deals) -->
            <div class="bg-white rounded-2xl p-5 mb-6 shadow-sm">
                <div class="flex justify-between items-center mb-4">
                    <div class="flex items-center gap-2">
                        <div
                            class="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-xl text-amber-500">
                            ⚡️</div>
                        <h2 class="text-lg font-bold text-gray-900">急出捡漏</h2>
                        <span class="text-xs text-gray-400">低于行情 20%</span>
                    </div>
                    <div class="text-sm text-gray-500 cursor-pointer flex items-center hover:text-emerald-600 transition-colors"
                        @click="router.push('/search?sort=price_asc')">
                        更多
                        <div class="i-lucide-chevron-right text-base"></div>
                    </div>
                </div>

                <div class="flex flex-col gap-3">
                    <div v-for="item in urgentItems" :key="item.id"
                        class="flex items-center gap-4 p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                        @click="router.push(`/product/${item.id}`)">
                        <div class="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img :src="item.image" class="w-full h-full object-cover" />
                        </div>
                        <div class="flex-1">
                            <div class="text-[15px] font-semibold text-gray-800 mb-1">{{ item.title }}</div>
                            <div class="text-xs text-gray-400 flex items-center gap-1">
                                <div class="i-lucide-clock text-xs"></div> {{ item.timeStr }}
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-base font-bold text-red-500">¥{{ item.price }}</div>
                            <div class="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded inline-block">⬇降 ¥{{
                                item.saved }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 3. 分类筛选 (Category Chips) -->
            <div class="flex gap-3 overflow-x-auto pb-4 scrollbar-hide mb-6">
                <div v-for="cat in categories" :key="cat.id"
                    class="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-all hover:border-gray-300 hover:bg-gray-50"
                    :class="{ '!bg-gray-800 !text-white !border-gray-800': activeCategory === cat.id }"
                    @click="activeCategory = cat.id; fetchProducts()">
                    <div :class="cat.icon" class="text-base"></div>
                    {{ cat.name }}
                </div>
                <div
                    class="bg-white border border-gray-200 px-3 py-2 rounded-xl text-gray-700 flex items-center justify-center cursor-pointer hover:bg-gray-50">
                    <div class="i-lucide-more-horizontal text-lg"></div>
                </div>
            </div>

            <!-- 4. 最新上架 (New Arrivals) -->
            <div class="mb-8">
                <div class="flex flex-col md:flex-row justify-between md:items-end mb-5 gap-3">
                    <div class="flex items-baseline gap-2">
                        <h2 class="text-2xl font-extrabold text-gray-900">最新上架</h2>
                        <span class="bg-gray-200 px-2 py-0.5 rounded-full text-xs text-gray-600">{{ totalProducts
                        }}件新商品</span>
                    </div>
                    <div class="flex gap-4">
                        <span class="text-sm text-gray-900 font-semibold cursor-pointer">综合排序</span>
                        <span class="text-sm text-gray-500 cursor-pointer hover:text-gray-900">价格最低</span>
                        <span class="text-sm text-gray-500 cursor-pointer hover:text-gray-900">信用最高</span>
                        <span class="text-sm text-gray-500 cursor-pointer hover:text-gray-900">离我最近</span>
                    </div>
                </div>

                <!-- Product Grid -->
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    <div v-if="loading && page === 0" class="col-span-full text-center py-10">
                        <van-loading size="24px">加载中...</van-loading>
                    </div>
                    <ProductCard v-for="product in productList" :key="product.id" :product="product"
                        @click="router.push(`/product/${product.id}`)" />
                </div>

                <div v-if="productList.length > 0 && hasMore" class="mt-8 text-center">
                    <van-button round block plain type="primary" :loading="loading"
                        @click="fetchProducts">加载更多</van-button>
                </div>
                <div v-if="!hasMore && productList.length > 0" class="text-center text-gray-400 mt-8 text-sm">没有更多了
                </div>
            </div>
        </div>

        <!-- 5. 底部实时动态 (Ticker) -->
        <div
            class="fixed bottom-0 left-0 right-0 h-12 bg-white border-t border-gray-200 flex items-center px-6 z-50 md:bottom-0 bottom-[50px]">
            <div class="flex-1 flex items-center gap-3">
                <span class="text-xs font-bold text-emerald-700 whitespace-nowrap">实时动态</span>
                <span class="text-gray-200">|</span>
                <van-swipe vertical class="h-6 flex-1" :autoplay="3000" :show-indicators="false">
                    <van-swipe-item v-for="(msg, idx) in tickerMessages" :key="idx"
                        class="flex items-center text-xs text-gray-600">
                        <span v-html="msg"></span>
                    </van-swipe-item>
                </van-swipe>
            </div>
            <div class="w-8 h-8 bg-gray-100 rounded flex items-center justify-center cursor-pointer text-gray-500 hover:bg-gray-200 ml-2"
                @click="scrollToTop">
                <div class="i-lucide-arrow-up-to-line text-sm"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { listProducts } from '@/api/products'
import ProductCard from '@/components/ProductCard.vue'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const hasMore = ref(true)
const page = ref(0)
const size = ref(10)
const totalProducts = ref(342) // Mock count

// Categories
const activeCategory = ref(0)
const categories = [
    { id: 0, name: '全部', icon: 'i-lucide-layout-grid' },
    { id: 1, name: '手机数码', icon: 'i-lucide-smartphone' },
    { id: 2, name: '摄影摄像', icon: 'i-lucide-camera' },
    { id: 3, name: '潮牌服饰', icon: 'i-lucide-shopping-bag' },
    { id: 4, name: '家具家居', icon: 'i-lucide-armchair' },
    { id: 5, name: '图书教材', icon: 'i-lucide-book' },
    { id: 6, name: '运动户外', icon: 'i-lucide-medal' },
]

// Urgent Items (Mock)
const urgentItems = ref([
    { id: 101, title: 'MacBook Air M2 13寸', price: 5800, saved: 1200, timeStr: '5分钟前', image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200&h=200&fit=crop' },
    { id: 102, title: 'Ricoh GR3x 街拍神机', price: 6200, saved: 500, timeStr: '12分钟前', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&h=200&fit=crop' },
    { id: 103, title: '始祖鸟 Beta LT 硬壳', price: 2800, saved: 800, timeStr: '刚刚', image: 'https://images.unsplash.com/photo-1544098485-2a2a4b087033?w=200&h=200&fit=crop' },
])

// Products
const productList = ref([])

const fetchProducts = async () => {
    if (loading.value) return
    loading.value = true
    try {
        // Reset if page 0 (category switch)
        if (activeCategory.value !== 0 && page.value === 0) {
            productList.value = []
        }

        const params = {
            page: page.value,
            size: size.value,
            sort: 'created_desc',
            categoryId: activeCategory.value === 0 ? undefined : activeCategory.value
        }
        const res = await listProducts(params)
        if (page.value === 0) productList.value = []

        // Enhance product data for UI
        const newItems = (res.content || []).map(p => ({
            ...p,
            tags: ['实拍图', Math.random() > 0.5 ? '官方已验' : null].filter(Boolean),
            timeAgo: '10分钟前', // Mock
            saved: Math.floor(p.price * 0.3), // Mock
            wantCount: Math.floor(Math.random() * 100),
            seller: p.user || { nickname: 'Seller', avatar: '', credit: '信用极好' }
        }))

        productList.value.push(...newItems)
        hasMore.value = !res.last
        page.value++
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

// Ticker Messages
const tickerMessages = [
    '用户 <b>Jason</b> 1分钟前发布了 <b>MacBook Pro M1</b>',
    '用户 <b>Amy</b> 刚刚卖出了 <b>Lululemon瑜伽裤</b>',
    '用户 <b>Mike</b> 5分钟前 ¥4500 出掉了 <b>iPhone 13</b>'
]

const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
    fetchProducts()
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
