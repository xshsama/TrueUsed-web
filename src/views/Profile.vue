<template>
    <div class="min-h-screen bg-[#f7f9fa] font-sans text-[#2c3e50]">



        <!-- --- Main Layout Container --- -->
        <main class="max-w-6xl mx-auto px-4 py-6 space-y-6">

            <!-- --- 2. Profile Card --- -->
            <section
                class="relative w-full overflow-hidden rounded-2xl text-white shadow-xl shadow-[#3e6b56]/10 p-8 md:p-10 transition-colors duration-500"
                :class="isSellerMode ? 'bg-gradient-to-br from-[#2c3e50] via-[#34495e] to-[#4a6b5e]' : 'bg-gradient-to-br from-[#355E4B] via-[#41705A] to-[#5C9E84]'">

                <!-- Decorative Background -->
                <div
                    class="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none">
                </div>

                <div class="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">

                    <!-- Avatar Section -->
                    <div class="relative group shrink-0">
                        <div
                            class="w-24 h-24 rounded-full border-4 border-white/20 overflow-hidden shadow-2xl relative z-10">
                            <img :src="avatarSrc" class="w-full h-full object-cover" @error="onAvatarError" />
                        </div>
                        <div class="absolute bottom-1 right-1 bg-[#2c3e50] p-1.5 rounded-full border border-white/20 z-20 cursor-pointer hover:scale-110 transition-transform"
                            @click="editProfile">
                            <div class="i-lucide-user text-white text-xs"></div>
                        </div>
                    </div>

                    <!-- User Info & Stats -->
                    <div class="flex-1 text-center md:text-left space-y-4">
                        <div class="flex flex-col md:flex-row items-center gap-4">
                            <h1 class="text-3xl font-bold tracking-tight">{{ userInfo.nickname || userInfo.username ||
                                '点击登录' }}</h1>
                            <div class="flex items-center gap-2" v-if="isLoggedIn">
                                <span
                                    class="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10 flex items-center gap-1.5 text-[#A8E6CF]">
                                    <div class="i-lucide-shield-check text-xs fill-[#A8E6CF]"
                                        :class="isSellerMode ? 'text-[#34495e]' : 'text-[#355E4B]'"></div>
                                    实名认证
                                </span>
                                <span
                                    class="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium border border-white/5 text-white/90">
                                    信用极好
                                </span>
                            </div>
                        </div>

                        <!-- Data Grid -->
                        <div class="flex items-center justify-center md:justify-start gap-8 md:gap-12 pt-2">
                            <template v-for="(stat, idx) in currentStats" :key="idx">
                                <div class="text-center md:text-left">
                                    <div class="text-2xl font-bold font-mono">{{ stat.value }}</div>
                                    <div class="text-xs text-[#A8E6CF]/80 font-medium uppercase tracking-wider mt-0.5">
                                        {{ stat.label }}</div>
                                </div>
                                <div v-if="idx < currentStats.length - 1" class="w-px h-8 bg-white/10"></div>
                            </template>
                        </div>
                    </div>

                    <!-- Toggle Switch (Seller/Buyer) -->
                    <div
                        class="bg-black/20 p-1 rounded-full flex gap-1 shadow-inner border border-white/5 backdrop-blur-sm self-center md:self-start">
                        <button @click="isSellerMode = false"
                            class="px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 border-none cursor-pointer"
                            :class="!isSellerMode ? 'bg-white text-[#355E4B] shadow-md' : 'bg-transparent text-white/60 hover:text-white'">
                            买家版
                        </button>
                        <button @click="isSellerMode = true"
                            class="px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 border-none cursor-pointer"
                            :class="isSellerMode ? 'bg-white text-[#2c3e50] shadow-md' : 'bg-transparent text-white/60 hover:text-white'">
                            卖家版
                        </button>
                    </div>
                </div>
            </section>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <!-- --- 3. Left Column (主要功能区) --- -->
                <div class="lg:col-span-2 space-y-6">

                    <!-- Orders Section -->
                    <section class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50">
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-lg font-bold text-[#2c3e50]">
                                {{ isSellerMode ? '我卖出的' : '我的订单' }}
                            </h2>
                            <a href="#"
                                class="text-xs text-gray-400 flex items-center hover:text-[#4a8b6e] transition-colors group"
                                @click.prevent="router.push(isSellerMode ? '/order-manage' : '/orders')">
                                全部订单 <div
                                    class="i-lucide-chevron-right text-sm group-hover:translate-x-0.5 transition-transform">
                                </div>
                            </a>
                        </div>

                        <div class="grid grid-cols-4 gap-2">
                            <div v-for="(item, idx) in currentOrderMenu" :key="idx"
                                class="flex flex-col items-center gap-3 relative cursor-pointer group p-2 rounded-xl hover:bg-gray-50 transition-colors"
                                @click="handleOrderClick(item)">
                                <div v-if="item.badge > 0"
                                    class="absolute top-1 right-2 md:right-8 bg-[#e74c3c] text-white text-[10px] min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full border border-white font-bold shadow-sm z-10">
                                    {{ item.badge }}
                                </div>
                                <div
                                    :class="[isSellerMode ? 'text-[#34495e]' : 'text-[#4a8b6e]', 'group-hover:scale-110 transition-transform duration-300']">
                                    <div :class="[item.icon, 'text-[28px] stroke-[1.5]']"></div>
                                </div>
                                <span class="text-xs text-gray-600 font-medium">{{ item.label }}</span>
                            </div>
                        </div>
                    </section>

                    <!-- Recent Viewed / Recommendations -->
                    <section>
                        <div class="flex items-center gap-2 mb-4 px-1">
                            <div class="w-1.5 h-5 rounded-full" :class="isSellerMode ? 'bg-[#34495e]' : 'bg-[#4a8b6e]'">
                            </div>
                            <h2 class="font-bold text-[#2c3e50]">
                                {{ isSellerMode ? '数据概览 & 建议' : '最近浏览 & 推荐' }}
                            </h2>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <!-- Buyer Mode: Real History -->
                            <template v-if="!isSellerMode">
                                <div v-for="item in recentHistory" :key="item.id"
                                    @click="router.push(`/product/${item.id}`)"
                                    class="bg-white rounded-xl p-3 shadow-sm hover:shadow-md border border-gray-100 hover:border-[#4a8b6e]/30 transition-all cursor-pointer group">
                                    <div class="aspect-[4/3] bg-gray-100 rounded-lg mb-3 relative overflow-hidden">
                                        <img :src="item.image"
                                            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div
                                            class="absolute bottom-2 right-2 bg-black/50 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full">
                                            刚刚看过</div>
                                    </div>
                                    <h3
                                        class="text-sm font-bold text-[#2c3e50] line-clamp-1 group-hover:text-[#4a8b6e] transition-colors">
                                        {{ item.title }}</h3>
                                    <div class="flex items-center justify-between mt-2">
                                        <span class="text-[#e74c3c] font-bold text-base">¥{{ item.price }}</span>
                                        <span
                                            class="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">降价提醒</span>
                                    </div>
                                </div>
                                <div v-if="recentHistory.length === 0"
                                    class="col-span-2 text-center py-8 text-gray-400 text-sm">
                                    暂无浏览记录
                                </div>
                            </template>

                            <!-- Seller Mode: Mock Data -->
                            <template v-else>
                                <div v-for="item in [1, 2]" :key="item"
                                    class="bg-white rounded-xl p-3 shadow-sm hover:shadow-md border border-gray-100 hover:border-[#4a8b6e]/30 transition-all cursor-pointer group">
                                    <div class="aspect-[4/3] bg-gray-100 rounded-lg mb-3 relative overflow-hidden">
                                        <img :src="`https://images.unsplash.com/photo-${item === 1 ? '1517336714731-489689fd1ca4' : '1516035069371-29a1b244cc32'}?auto=format&fit=crop&q=80&w=400`"
                                            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div
                                            class="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full">
                                            32人浏览</div>
                                    </div>
                                    <h3
                                        class="text-sm font-bold text-[#2c3e50] line-clamp-1 group-hover:text-[#4a8b6e] transition-colors">
                                        99新 MacBook Pro M1 / 个人自用</h3>
                                    <div class="flex items-center justify-between mt-2">
                                        <span class="text-[#e74c3c] font-bold text-base">¥8,500</span>
                                        <span
                                            class="text-[10px] text-[#4a8b6e] bg-[#f0fdf7] px-1.5 py-0.5 rounded">曝光率高</span>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </section>

                </div>

                <!-- --- 4. Right Column (工具栏 & 资产) --- -->
                <div class="space-y-6">

                    <!-- My Assets -->
                    <section class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50">
                        <h2 class="text-lg font-bold text-[#2c3e50] mb-6">我的资产</h2>
                        <div class="space-y-1">
                            <div v-for="(item, idx) in currentAssets" :key="idx"
                                class="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer group transition-colors">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-full flex items-center justify-center group-hover:text-white transition-colors"
                                        :class="isSellerMode ? 'bg-[#f0f9ff] text-[#34495e] group-hover:bg-[#34495e]' : 'bg-[#f0fdf7] text-[#4a8b6e] group-hover:bg-[#4a8b6e]'">
                                        <div :class="[item.icon, 'text-lg']"></div>
                                    </div>
                                    <span class="text-sm font-medium text-gray-600">{{ item.label }}</span>
                                </div>
                                <span class="text-sm font-bold text-[#2c3e50]">{{ item.value }}</span>
                            </div>
                        </div>
                    </section>

                    <!-- Services Grid -->
                    <section class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50">
                        <h2 class="text-lg font-bold text-[#2c3e50] mb-4">常用服务</h2>
                        <div class="grid grid-cols-3 gap-y-4">
                            <div v-for="(item, idx) in currentServices" :key="idx"
                                class="flex flex-col items-center gap-2 cursor-pointer group"
                                @click="handleServiceClick(item)">
                                <div class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 transition-colors"
                                    :class="isSellerMode ? 'group-hover:bg-[#34495e]/10 group-hover:text-[#34495e]' : 'group-hover:bg-[#4a8b6e]/10 group-hover:text-[#4a8b6e]'">
                                    <div :class="[item.icon, 'text-[20px] stroke-[1.5]']"></div>
                                </div>
                                <span class="text-xs text-gray-500 scale-90">{{ item.label }}</span>
                            </div>
                        </div>
                    </section>

                </div>

            </div>

        </main>

        <!-- Edit Profile Dialog (Reused from original) -->
        <van-dialog v-model:show="showEdit" title="编辑资料" :show-confirm-button="false" :show-cancel-button="false"
            class="edit-dialog">
            <div class="p-4">
                <div class="flex flex-col items-center mb-4">
                    <div class="relative w-20 h-20 mb-2">
                        <ImageUpload v-model="avatarList" :max-images="1" :size="80" :round="true" hint=""
                            :show-count="false" />
                        <div
                            class="absolute bottom-0 right-0 bg-gray-800 text-white p-1 rounded-full pointer-events-none">
                            <div class="i-lucide-camera text-xs"></div>
                        </div>
                    </div>
                    <span class="text-xs text-gray-500">点击更换头像</span>
                </div>
                <van-field v-model="form.nickname" label="昵称" placeholder="请输入昵称" :error-message="errors.nickname"
                    class="mb-2" />
                <van-field v-model="form.phone" label="手机号" placeholder="可选" :error-message="errors.phone"
                    class="mb-2" />
                <van-field v-model="form.bio" label="签名" type="textarea" rows="2" maxlength="80" show-word-limit
                    placeholder="介绍一下自己吧" />

                <div class="flex gap-3 mt-6">
                    <van-button block plain @click="showEdit = false">取消</van-button>
                    <van-button block type="primary" color="#4a8b6e" :loading="saving"
                        @click="handleSave">保存</van-button>
                </div>
            </div>
        </van-dialog>
    </div>
</template>

<script setup>
import { getBrowsingHistory } from '@/api/history'
import defaultAvatarUrl from '@/assets/icons/user.svg'
import ImageUpload from '@/components/ImageUpload.vue'
import { useUserStore } from '@/stores/user'
import { showFailToast, showSuccessToast, showToast } from 'vant'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isSellerMode = ref(false)
const isLoggedIn = computed(() => userStore.isLoggedIn)
const userInfo = computed(() => userStore.user || {})
const avatarSrc = ref(defaultAvatarUrl)
const recentHistory = ref([])

// --- Data Definitions ---

// 1. Stats
const buyerStats = [
    { label: '累计节省', value: '¥2,450', sub: '击败90%用户' },
    { label: '我的闲置', value: '12', sub: '去变现' },
    { label: '可用优惠券', value: '8', sub: '即将过期' }
]
const sellerStats = [
    { label: '累计收益', value: '¥12,850', sub: '本月+12%' },
    { label: '在售商品', value: '5', sub: '库存正常' },
    { label: '今日访客', value: '128', sub: '新增关注+2' }
]
const currentStats = computed(() => isSellerMode.value ? sellerStats : buyerStats)

// 2. Order Menu
const buyerOrderMenu = [
    { label: '待付款', icon: 'i-lucide-credit-card', badge: 1, key: 'unpaid' },
    { label: '待发货', icon: 'i-lucide-package', badge: 0, key: 'toship' },
    { label: '待收货', icon: 'i-lucide-truck', badge: 2, key: 'toreceive' },
    { label: '退款/售后', icon: 'i-lucide-rotate-ccw', badge: 0, key: 'afterSale' },
]
const sellerOrderMenu = [
    { label: '待付款', icon: 'i-lucide-clock', badge: 0, key: 'unpaid' },
    { label: '待发货', icon: 'i-lucide-package', badge: 3, key: 'toship' },
    { label: '已发货', icon: 'i-lucide-truck', badge: 5, key: 'shipped' },
    { label: '售后/退款', icon: 'i-lucide-rotate-ccw', badge: 1, key: 'refund' },
]
const currentOrderMenu = computed(() => isSellerMode.value ? sellerOrderMenu : buyerOrderMenu)

// 3. Assets
const currentAssets = computed(() => [
    { label: '我的钱包', value: isSellerMode.value ? '¥12,850' : '¥0.00', icon: 'i-lucide-wallet' },
    { label: isSellerMode.value ? '推广券' : '优惠券', value: isSellerMode.value ? '3张' : '8张', icon: 'i-lucide-ticket' },
    { label: '积分', value: '1,240', icon: 'i-lucide-star' },
])

// 4. Services
const buyerServices = [
    { label: '收货地址', icon: 'i-lucide-map-pin', action: 'address' },
    { label: '我的收藏', icon: 'i-lucide-heart', action: 'favorites' },
    { label: '浏览记录', icon: 'i-lucide-clock', action: 'history' },
    { label: '官方验货', icon: 'i-lucide-shield-check', action: 'check' },
    { label: '帮助中心', icon: 'i-lucide-message-circle', action: 'help' },
    { label: '设置', icon: 'i-lucide-settings', action: 'settings' },
]
const sellerServices = [
    { label: '商品管理', icon: 'i-lucide-archive', action: 'products' },
    { label: '数据中心', icon: 'i-lucide-bar-chart-3', action: 'data' },
    { label: '订单管理', icon: 'i-lucide-clipboard-list', action: 'order-manage' },
    { label: '验货报告', icon: 'i-lucide-shield-check', action: 'check' },
    { label: '帮助中心', icon: 'i-lucide-message-circle', action: 'help' },
    { label: '店铺设置', icon: 'i-lucide-settings', action: 'shop-settings' },
]
const currentServices = computed(() => isSellerMode.value ? sellerServices : buyerServices)


// --- Logic ---

const fetchRecentHistory = async () => {
    if (!isLoggedIn.value) return
    try {
        const res = await getBrowsingHistory({ page: 0, size: 4 })
        recentHistory.value = (res.content || []).map(item => ({
            id: item.product.id,
            title: item.product.title,
            price: item.product.price,
            image: item.product.images?.[0]?.url || '',
            originalPrice: item.product.originalPrice
        }))
    } catch (error) {
        console.error('Failed to fetch history', error)
    }
}

onMounted(async () => {
    if (route.query.tab === 'seller') {
        isSellerMode.value = true
    }
    if (isLoggedIn.value) {
        await userStore.loadMe()
        if (!isSellerMode.value) {
            fetchRecentHistory()
        }
    }
    updateAvatar()
})

watch(() => isSellerMode.value, (newVal) => {
    if (!newVal && isLoggedIn.value) {
        fetchRecentHistory()
    }
})

watch(() => userInfo.value, updateAvatar, { deep: true })

function updateAvatar() {
    avatarSrc.value = (userInfo.value && (userInfo.value.avatarUrl || userInfo.value.avatar)) || defaultAvatarUrl
}

const onAvatarError = () => {
    if (avatarSrc.value !== defaultAvatarUrl) {
        avatarSrc.value = defaultAvatarUrl
    }
}

// Edit Profile Logic
const showEdit = ref(false)
const saving = ref(false)
const form = ref({ nickname: '', avatarUrl: '', bio: '', phone: '' })
const avatarList = ref([])
const errors = ref({ nickname: '', phone: '' })

const editProfile = () => {
    if (!isLoggedIn.value) {
        router.push({ name: 'Login', query: { redirect: '/profile' } })
        return
    }
    form.value = {
        nickname: userInfo.value.nickname || '',
        avatarUrl: userInfo.value.avatarUrl || '',
        bio: userInfo.value.bio || '',
        phone: userInfo.value.phone || ''
    }
    avatarList.value = form.value.avatarUrl ? [form.value.avatarUrl] : []
    showEdit.value = true
}

const handleSave = async () => {
    if (!form.value.nickname) {
        showFailToast('请输入昵称')
        return
    }
    try {
        saving.value = true
        form.value.avatarUrl = avatarList.value[0] || ''
        await userStore.saveMe(form.value)
        showSuccessToast('保存成功')
        showEdit.value = false
    } catch (e) {
        showFailToast('保存失败')
    } finally {
        saving.value = false
    }
}

// Navigation Handlers
const handleOrderClick = (item) => {
    if (isSellerMode.value) {
        router.push({ name: 'OrderManage', query: { status: item.key } })
    } else {
        router.push({ name: 'Orders', query: { status: item.key } })
    }
}

const handleServiceClick = (item) => {
    switch (item.action) {
        case 'address': router.push('/address'); break;
        case 'favorites': router.push('/favorites'); break;
        case 'settings': router.push('/settings'); break;
        case 'products': router.push('/my-products'); break;
        case 'help': router.push('/help'); break;
        case 'check': router.push('/service'); break;
        case 'history': router.push('/history'); break;
        case 'order-manage': router.push('/order-manage'); break;
        case 'shop-settings': router.push('/settings'); break; // Placeholder
        default: showToast('功能开发中');
    }
}

</script>

<style scoped>
/* Custom scrollbar hide if needed */
.no-scrollbar::-webkit-scrollbar {
    display: none;
}

.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
