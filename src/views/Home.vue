<template>
    <div class="min-h-screen bg-transparent pb-12">
        <div class="mx-auto max-w-[1480px] px-8 py-6">
            <section
                class="relative mb-6 overflow-hidden rounded-[32px] bg-gradient-to-br from-[#143d2d] via-[#1B4032] to-[#2a5e4b] text-white shadow-2xl shadow-emerald-900/20">
                <div
                    class="pointer-events-none absolute right-0 top-0 h-[520px] w-[520px] translate-x-1/4 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl">
                </div>
                <div
                    class="i-lucide-shield-check pointer-events-none absolute -bottom-24 -right-12 h-96 w-96 rotate-12 text-white/[0.03]">
                </div>

                <div class="relative z-10 flex min-h-[360px] items-center justify-between gap-12 p-12 lg:p-16">
                    <div class="max-w-xl space-y-6">
                        <div
                            class="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-900/40 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300 shadow-inner backdrop-blur-md">
                            <div class="i-lucide-check-circle-2 text-sm text-emerald-400"></div>
                            <span>Official Check · 官方全检</span>
                        </div>

                        <h1 class="text-5xl font-bold leading-[1.05] tracking-tight drop-shadow-sm lg:text-6xl">
                            怕踩雷？<br />
                            <span class="bg-gradient-to-r from-emerald-200 to-white bg-clip-text text-transparent">先验货</span>，再发货。
                        </h1>

                        <p class="max-w-md text-base font-light leading-relaxed text-emerald-100/80 lg:text-lg">
                            TrueUsed 官方质检工程师为您层层把关，杜绝假货与隐形故障。
                            <span class="mt-1 block text-sm text-emerald-300/60">已累计为 12,403 位用户拦截翻新机</span>
                        </p>

                        <div class="flex items-center gap-4 pt-4">
                            <button @click="router.push('/search?q=验货')"
                                class="group flex cursor-pointer items-center gap-2 rounded-full border-none bg-white px-8 py-3.5 text-sm font-bold text-[#1B4032] shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:bg-emerald-50 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                                浏览验货商品
                                <div class="i-lucide-chevron-right text-lg text-emerald-600 transition-transform group-hover:translate-x-1"></div>
                            </button>
                            <div class="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
                                <div class="text-[11px] uppercase tracking-[0.18em] text-emerald-200/70">交易模式</div>
                                <div class="mt-1 text-sm font-semibold">自由交易 + 平台验货双模式</div>
                            </div>
                        </div>
                    </div>

                    <div class="relative flex w-full max-w-sm justify-center [perspective:1000px]">
                        <div class="relative h-64 w-64">
                            <div class="absolute inset-x-0 bottom-0 h-16 rounded-[100%] bg-gradient-to-b from-white/10 to-transparent blur-xl"></div>
                            <div class="absolute inset-x-10 bottom-8 h-4 rounded-[100%] bg-emerald-400/20 blur-md"></div>

                            <div
                                class="group absolute left-1/2 top-1/2 flex h-48 w-48 -translate-x-1/2 -translate-y-1/2 rotate-3 flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-tr from-white/10 to-white/5 shadow-2xl backdrop-blur-sm transition-transform duration-500 hover:-translate-y-[54%]">
                                <div class="rounded-full bg-emerald-900/50 p-4 text-emerald-300 shadow-inner">
                                    <div class="i-lucide-shield-check text-5xl"></div>
                                </div>
                                <div class="text-center">
                                    <div class="text-2xl font-bold text-white">100%</div>
                                    <div class="text-xs uppercase tracking-widest text-emerald-200">Authentic</div>
                                </div>
                                <div class="absolute right-3 top-3 h-1.5 w-1.5 animate-pulse rounded-full bg-red-400"></div>
                            </div>

                            <div
                                class="absolute -left-4 top-10 rounded-xl border border-white/20 bg-white/10 p-3 shadow-lg backdrop-blur-md">
                                <div class="i-lucide-headphones text-2xl text-white"></div>
                            </div>
                            <div
                                class="absolute -right-4 bottom-10 rounded-xl border border-white/20 bg-white/10 p-3 shadow-lg backdrop-blur-md">
                                <div class="i-lucide-mouse text-2xl text-white"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="mb-6 grid grid-cols-3 gap-5">
                <div
                    class="rounded-[28px] border border-white/45 bg-white/28 p-5 shadow-[0_20px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                    <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">在售商品</div>
                    <div class="mt-2 text-3xl font-black text-slate-900">{{ totalProducts }}</div>
                </div>
                <div
                    class="rounded-[28px] border border-white/45 bg-white/28 p-5 shadow-[0_20px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                    <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">当前类目</div>
                    <div class="mt-2 text-lg font-bold text-slate-900">{{ currentCategoryName }}</div>
                </div>
                <div
                    class="rounded-[28px] border border-white/45 bg-white/28 p-5 shadow-[0_20px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                    <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">排序策略</div>
                    <div class="mt-2 text-lg font-bold text-slate-900">{{ currentSortLabel }}</div>
                </div>
            </section>

            <div class="mb-6 flex flex-wrap gap-3">
                <div v-for="cat in categories" :key="cat.id"
                    class="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
                    :class="{ '!border-gray-800 !bg-gray-800 !text-white': activeCategory === cat.id }"
                    @click="handleCategoryChange(cat.id)">
                    <div :class="cat.icon" class="text-base"></div>
                    {{ cat.name }}
                </div>
            </div>

            <div class="mb-8">
                <div class="mb-5 flex items-end justify-between gap-3">
                    <div class="flex items-baseline gap-2">
                        <h2 class="text-2xl font-extrabold text-gray-900">最新上架</h2>
                        <span class="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">{{ totalProducts }}件新商品</span>
                    </div>
                    <div class="flex gap-2 rounded-full border border-slate-200 bg-white/90 p-1.5 shadow-sm">
                        <button v-for="option in sortOptions" :key="option.value" type="button"
                            class="rounded-full px-4 py-2 text-sm font-semibold transition-colors"
                            :class="activeSort === option.value ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'"
                            @click="handleSortChange(option.value)">
                            {{ option.label }}
                        </button>
                    </div>
                </div>

                <TransitionGroup name="product-list" tag="div"
                    class="relative grid min-h-[200px] grid-cols-3 gap-6 xl:grid-cols-4 2xl:grid-cols-5">
                    <div v-if="loading && page === 0" key="loading-spinner"
                        class="absolute inset-0 z-10 col-span-full flex items-center justify-center rounded-xl bg-white/50 backdrop-blur-sm">
                        <van-loading vertical color="#10B981">
                            <template #icon>
                                <div class="i-lucide-loader-2 animate-spin text-3xl text-emerald-600"></div>
                            </template>
                            <span class="mt-2 font-medium text-emerald-600">加载好物中...</span>
                        </van-loading>
                    </div>

                    <ProductCard v-for="product in productList" :key="product.id" :product="product"
                        @click="router.push(`/product/${product.id}`)" />
                </TransitionGroup>

                <div v-if="productList.length > 0 && hasMore" class="mt-10 flex justify-center">
                    <button type="button"
                        class="group inline-flex min-w-[320px] items-center justify-between gap-6 rounded-[26px] border border-slate-200 bg-white px-6 py-4 text-left shadow-[0_18px_36px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_20px_40px_rgba(15,23,42,0.08)] disabled:cursor-not-allowed disabled:opacity-70"
                        :disabled="loading" @click="fetchProducts">
                        <div>
                            <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                More Listings
                            </div>
                            <div class="mt-1 text-base font-bold text-slate-900">
                                {{ loading ? '正在加载更多好物...' : '继续浏览更多商品' }}
                            </div>
                            <div class="mt-1 text-sm text-slate-500">
                                {{ loading ? '请稍候，新的商品卡片正在进入列表。' : `已展示 ${productList.length} 件，再展开下一页结果。` }}
                            </div>
                        </div>

                        <div
                            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white shadow-[0_12px_24px_rgba(15,23,42,0.18)] transition-transform group-hover:translate-x-1">
                            <div v-if="loading" class="i-lucide-loader-2 animate-spin text-lg"></div>
                            <div v-else class="i-lucide-arrow-right text-lg"></div>
                        </div>
                    </button>
                </div>
                <div v-if="!hasMore && productList.length > 0" class="mt-8 text-center text-sm text-gray-400">没有更多了</div>
            </div>
        </div>

        <div class="fixed bottom-0 right-0 z-50 p-8">
            <div class="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white shadow-lg transition-all hover:border-emerald-600 hover:text-emerald-600"
                @click="scrollToTop">
                <div class="i-lucide-arrow-up-to-line text-lg"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { listRootCategories } from '@/api/categories'
import { listProducts } from '@/api/products'
import ProductCard from '@/components/ProductCard.vue'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const hasMore = ref(true)
const page = ref(0)
const size = ref(10)
const totalProducts = ref(0)
const activeSort = ref('created_desc')
const sortOptions = [
    { label: '最新上架', value: 'created_desc' },
    { label: '关注最高', value: 'views_desc' },
    { label: '价格最低', value: 'price_asc' },
    { label: '价格最高', value: 'price_desc' }
]

const activeCategory = ref(0)
const categories = ref([
    { id: 0, name: '全部', icon: 'i-lucide-layout-grid' }
])

const currentCategoryName = computed(() => {
    return categories.value.find(cat => cat.id === activeCategory.value)?.name || '全部'
})

const currentSortLabel = computed(() => {
    return sortOptions.find(option => option.value === activeSort.value)?.label || '最新上架'
})

const handleCategoryChange = (id) => {
    if (activeCategory.value === id) return
    activeCategory.value = id
    page.value = 0
    hasMore.value = true
    fetchProducts()
}

const handleSortChange = (sort) => {
    if (activeSort.value === sort) return
    activeSort.value = sort
    page.value = 0
    hasMore.value = true
    fetchProducts()
}

const fetchCategories = async () => {
    try {
        const res = await listRootCategories()
        const getIcon = (id) => {
            const icons = {
                1: 'i-lucide-smartphone',
                2: 'i-lucide-shirt',
                3: 'i-lucide-armchair',
                4: 'i-lucide-book',
                5: 'i-lucide-dumbbell'
            }
            return icons[id] || 'i-lucide-package'
        }

        const fetched = (res || []).map(c => ({
            id: c.id,
            name: c.name,
            icon: getIcon(c.id)
        }))
        categories.value = [{ id: 0, name: '全部', icon: 'i-lucide-layout-grid' }, ...fetched]
    } catch (e) {
        console.error('Failed to fetch categories', e)
    }
}

const productList = ref([])

const fetchProducts = async () => {
    if (loading.value) return
    loading.value = true
    try {
        const params = {
            page: page.value,
            size: size.value,
            sort: activeSort.value,
            categoryId: activeCategory.value === 0 ? undefined : activeCategory.value
        }
        const res = await listProducts(params)
        if (page.value === 0) productList.value = []
        totalProducts.value = res.totalElements || 0

        const newItems = res.content || []
        productList.value.push(...newItems)
        hasMore.value = !res.last
        page.value++
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
    fetchCategories()
    fetchProducts()
})
</script>
