<script setup>
import { createConversation } from '@/api/chat';
import { getProduct } from '@/api/products';
import { createProductComment, getProductComments } from '@/api/reviews';
import TopNavbar from '@/components/TopNavbar.vue';
import { useAuth } from '@/composables/useAuth';
import { useFavoritesStore } from '@/stores/favorites';
import {
    AlertTriangle,
    Camera,
    ChevronRight,
    FileCheck2,
    Heart,
    ShieldCheck,
    TrendingDown
} from 'lucide-vue-next';
import { ImagePreview, showFailToast, showSuccessToast } from 'vant';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const favoritesStore = useFavoritesStore();
const { requireLogin } = useAuth();

// --- State ---
const currentImageIndex = ref(0);
const loading = ref(true);
const isFavorited = ref(false);
const searchQuery = ref('');
const newComment = ref('');

const product = ref({
    id: null,
    title: '',
    price: '',
    originalPrice: '',
    description: '',
    tags: [],
    images: [],
    viewsCount: 0,
    createdAt: '',
    condition: '',
    category: null,
    address: '上海 · 徐汇区', // Placeholder
    isOfficial: false,
    inspectionFee: 0
});

const seller = ref({
    id: null,
    name: '',
    avatar: '',
    productCount: 0,
    credit: '极好'
});

const reviews = ref([]);
const reviewCount = ref(0);

// --- Computed ---
const displayImages = computed(() => {
    return product.value.images && product.value.images.length > 0
        ? product.value.images
        : ['https://via.placeholder.com/800x800?text=No+Image'];
});

// --- Methods ---
const formatTime = (time) => {
    if (!time) return '';
    const date = new Date(time);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString();
};

const previewImage = (index) => {
    ImagePreview({
        images: displayImages.value,
        startPosition: index,
        onChange: (idx) => {
            currentImageIndex.value = idx;
        }
    });
};

const toggleFavorite = async () => {
    const loggedIn = await requireLogin({ message: '收藏商品需要登录，是否立即登录？' });
    if (!loggedIn) return;

    const productId = product.value.id;
    const prev = isFavorited.value;
    isFavorited.value = !prev; // Optimistic update

    try {
        if (prev) {
            await favoritesStore.remove(productId);
            showSuccessToast('已取消收藏');
        } else {
            await favoritesStore.add(productId);
            showSuccessToast('已收藏');
        }
    } catch (e) {
        isFavorited.value = prev; // Rollback
        showFailToast('操作失败');
    }
};

const handleChat = async () => {
    const loggedIn = await requireLogin({ message: '联系卖家需要登录，是否立即登录？' });
    if (!loggedIn) return;

    if (!seller.value.id) {
        showFailToast('卖家信息加载失败');
        return;
    }

    try {
        const res = await createConversation(seller.value.id);
        if (res && res.id) {
            router.push(`/messages/chat/${res.id}`);
        } else {
            showFailToast('无法启动会话');
        }
    } catch (e) {
        showFailToast('启动会话失败');
    }
};

const handleBuy = async () => {
    const loggedIn = await requireLogin({ message: '购买商品需要登录，是否立即登录？' });
    if (!loggedIn) return;

    router.push({
        name: 'Settlement',
        query: {
            productId: product.value.id,
            title: product.value.title,
            price: product.value.price,
            image: displayImages.value[0] || ''
        }
    });
};

const handleSearch = () => {
    if (searchQuery.value.trim()) {
        router.push({ name: 'Search', query: { q: searchQuery.value } });
    }
};

const handleSendComment = async () => {
    if (!newComment.value.trim()) return;

    const loggedIn = await requireLogin({ message: '留言需要登录，是否立即登录？' });
    if (!loggedIn) return;

    try {
        const newCommentRes = await createProductComment({
            productId: product.value.id,
            content: newComment.value
        });
        showSuccessToast('留言成功');
        // Add to list
        reviews.value.unshift({
            id: newCommentRes.id,
            reviewerName: newCommentRes.user?.nickname || newCommentRes.user?.username || '我',
            reviewerAvatar: newCommentRes.user?.avatarUrl || 'https://via.placeholder.com/50',
            content: newCommentRes.content,
            createdAt: newCommentRes.createdAt,
            isAnonymous: false
        });
        reviewCount.value++;
        newComment.value = '';
    } catch (e) {
        showFailToast('留言失败');
    }
};

const loadData = async () => {
    try {
        loading.value = true;
        const productId = Number(route.params.id);

        // Load favorites status
        await favoritesStore.fetchFavorites();
        isFavorited.value = favoritesStore.isFavorited(productId);

        // Load product details
        const res = await getProduct(productId);

        // Use real tradeModel from backend
        const isOfficial = res.tradeModel === 'OFFICIAL_INSPECTION';

        product.value = {
            id: res.id,
            title: res.title,
            price: res.price,
            originalPrice: res.originalPrice || (res.price * 1.2).toFixed(2),
            description: res.description,
            tags: [res.condition, res.category?.name].filter(Boolean),
            images: (res.images || []).map(img => img.url),
            viewsCount: res.viewsCount || 0,
            createdAt: res.createdAt,
            condition: res.condition,
            category: res.category,
            address: res.locationText || '上海 · 徐汇区',
            isOfficial: isOfficial,
            inspectionFee: isOfficial ? 29 : 0
        };

        if (res.seller) {
            seller.value = {
                id: res.seller.id,
                name: res.seller.username || res.seller.nickname || '卖家',
                avatar: res.seller.avatarUrl || 'https://via.placeholder.com/100',
                productCount: res.seller.productCount || 0,
                credit: '极好'
            };
        }

        // Load comments
        try {
            const commentsData = await getProductComments(productId, { page: 0, size: 5 });
            reviews.value = (commentsData.content || []).map(c => ({
                id: c.id,
                reviewerName: c.user?.nickname || c.user?.username || '匿名用户',
                reviewerAvatar: c.user?.avatarUrl || 'https://via.placeholder.com/50',
                content: c.content,
                createdAt: c.createdAt,
                isAnonymous: false
            }));
            reviewCount.value = commentsData.totalElements || 0;
        } catch (e) {
            console.error('Failed to load comments', e);
        }

    } catch (e) {
        showFailToast('加载商品失败');
        console.error(e);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    loadData();
});
</script>

<template>
    <div class="min-h-screen bg-[#f7f9fa] font-sans text-[#2c3e50] pb-12">

        <!-- --- Top Navigation --- -->
        <TopNavbar mode="buyer" />

        <!-- --- Main Layout --- -->
        <main v-if="!loading" class="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

            <!-- Left Column: Gallery & Details (col-span-8) -->
            <div class="lg:col-span-8 space-y-6">

                <!-- 1. Image Gallery -->
                <div class="bg-white rounded-2xl p-2 shadow-sm border border-gray-100/50">
                    <!-- Main Image -->
                    <div class="relative bg-gray-100 aspect-[4/3] rounded-xl overflow-hidden mb-2 group cursor-zoom-in"
                        @click="previewImage(currentImageIndex)">
                        <img :src="displayImages[currentImageIndex]" class="w-full h-full object-contain" />

                        <!-- Visual Identity: Trust Badges -->
                        <div v-if="product.isOfficial"
                            class="absolute top-4 left-4 flex items-center gap-1.5 bg-[#4a8b6e]/90 backdrop-blur-md text-white px-3 py-1.5 rounded-lg shadow-lg">
                            <ShieldCheck :size="14" />
                            <span class="text-xs font-bold">官方已验货 · 正品保证</span>
                        </div>
                        <div v-else
                            class="absolute top-4 left-4 flex items-center gap-1.5 bg-orange-500/90 backdrop-blur-md text-white px-3 py-1.5 rounded-lg shadow-lg">
                            <Camera :size="14" />
                            <span class="text-xs font-bold">卖家实拍 · 真实生活感</span>
                        </div>
                    </div>

                    <!-- Thumbnails -->
                    <div class="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-hide">
                        <div v-for="(img, idx) in displayImages" :key="idx" @mouseenter="currentImageIndex = idx"
                            :class="['w-20 h-20 rounded-lg overflow-hidden cursor-pointer border-2 transition-all flex-shrink-0', currentImageIndex === idx ? 'border-[#4a8b6e]' : 'border-transparent opacity-70 hover:opacity-100']">
                            <img :src="img" class="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>

                <!-- 2. Product Description -->
                <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100/50">
                    <h2 class="font-bold text-lg mb-4 flex items-center gap-2">
                        <div class="w-1 h-5 bg-[#4a8b6e] rounded-full"></div>
                        商品详情
                    </h2>
                    <p class="text-base text-gray-700 leading-loose whitespace-pre-line">
                        {{ product.description || '暂无详细描述' }}
                    </p>

                    <!-- Safety Tip -->
                    <div class="mt-8 bg-orange-50 text-orange-800 p-4 rounded-xl text-sm flex items-start gap-3">
                        <AlertTriangle :size="18" class="mt-0.5 flex-shrink-0" />
                        <div>
                            <p class="font-bold mb-1">安全提示</p>
                            <p class="opacity-90">为了保障您的权益，请不要脱离平台进行交易。不要轻信任何要求您点击链接进行退款、支付保证金的借口。</p>
                        </div>
                    </div>
                </div>

                <!-- 3. Comments -->
                <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100/50">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="font-bold text-lg flex items-center gap-2">
                            <div class="w-1 h-5 bg-[#4a8b6e] rounded-full"></div>
                            留言 ({{ reviewCount }})
                        </h2>
                    </div>
                    <div class="space-y-6" v-if="reviews.length > 0">
                        <div v-for="(review, index) in reviews" :key="review.id">
                            <div class="flex gap-4">
                                <img :src="review.reviewerAvatar || 'https://via.placeholder.com/50'"
                                    class="w-10 h-10 rounded-full bg-gray-100 object-cover" />
                                <div class="flex-1">
                                    <div class="flex items-baseline justify-between mb-1">
                                        <span class="text-sm font-bold text-gray-800">{{ review.isAnonymous ? '匿名用户' :
                                            review.reviewerName }}</span>
                                        <span class="text-xs text-gray-400">{{ formatTime(review.createdAt) }}</span>
                                    </div>
                                    <p class="text-sm text-gray-600">{{ review.content }}</p>
                                </div>
                            </div>
                            <div v-if="index < reviews.length - 1" class="w-full h-px bg-gray-50 mt-6"></div>
                        </div>
                    </div>
                    <div v-else class="text-center text-gray-400 text-sm py-4">
                        暂无留言，快来抢沙发吧~
                    </div>

                    <!-- Comment Input -->
                    <div class="mt-6 flex gap-3">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
                            class="w-10 h-10 rounded-full bg-gray-100 object-cover" />
                        <div class="flex-1 relative">
                            <input v-model="newComment" @keyup.enter="handleSendComment" type="text"
                                placeholder="看对眼了就留言，问问更多细节~"
                                class="w-full bg-gray-50 border-none rounded-full py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#4a8b6e]/20 focus:bg-white transition-all">
                            <button @click="handleSendComment"
                                class="absolute right-2 top-1.5 text-[#4a8b6e] text-xs font-bold px-3 py-1 hover:bg-[#4a8b6e]/10 rounded-full transition-colors">发送</button>
                        </div>
                    </div>
                </div>

            </div>

            <!-- Right Column: Info & Actions (col-span-4) - Sticky -->
            <div class="lg:col-span-4 space-y-4">

                <!-- 1. Primary Info Card -->
                <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50 sticky top-24">

                    <div class="flex items-center gap-2 mb-4">
                        <span
                            :class="['text-xs px-2 py-0.5 rounded font-bold', product.isOfficial ? 'bg-[#4a8b6e] text-white' : 'bg-orange-500 text-white']">
                            {{ product.isOfficial ? '官方验货' : '自由交易' }}
                        </span>
                        <span class="text-xs text-gray-400">发布于 {{ product.address }}</span>
                    </div>

                    <h1 class="text-xl font-bold text-[#2c3e50] leading-snug mb-4">
                        {{ product.title }}
                    </h1>

                    <!-- Price & Cost Breakdown -->
                    <div class="flex items-baseline gap-2 mb-2">
                        <span class="text-sm text-[#ff5e57] font-bold">¥</span>
                        <span class="text-4xl font-bold text-[#ff5e57] font-mono tracking-tight">{{ product.price
                        }}</span>

                        <!-- Official: Fee Hint -->
                        <span v-if="product.isOfficial"
                            class="text-xs text-[#4a8b6e] bg-[#4a8b6e]/10 px-1.5 py-0.5 rounded">
                            含￥{{ product.inspectionFee }} 验货费
                        </span>

                        <!-- Free Trading: Negotiable -->
                        <span v-else
                            class="text-xs text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">
                            可小刀
                        </span>
                    </div>

                    <!-- Free Trading: Price Advantage -->
                    <div v-if="!product.isOfficial" class="text-xs text-[#4a8b6e] mb-4 flex items-center gap-1">
                        <TrendingDown :size="12" />
                        比官方验货省 ￥{{ (product.price * 0.15).toFixed(0) }}
                    </div>
                    <div v-else class="mb-4">
                        <span class="text-sm text-gray-400 line-through">¥{{ product.originalPrice }}</span>
                    </div>

                    <!-- Tags -->
                    <div class="flex flex-wrap gap-2 mb-6">
                        <div v-for="tag in product.tags" :key="tag"
                            class="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {{ tag }}
                        </div>
                    </div>

                    <!-- Inspection Banner (Official Only) -->
                    <div v-if="product.isOfficial"
                        class="bg-[#2c3e50] rounded-xl p-4 text-white flex items-center justify-between mb-6 cursor-pointer hover:bg-[#34495e] transition-colors">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#4a8b6e]">
                                <FileCheck2 :size="18" />
                            </div>
                            <div>
                                <div class="font-bold text-sm">官方验货报告</div>
                                <div class="text-[10px] text-gray-300">32项检测合格 · 正品无拆修</div>
                            </div>
                        </div>
                        <ChevronRight :size="16" class="text-gray-400" />
                    </div>

                    <!-- Seller Trust (Free Trading - Enhanced) -->
                    <div v-else class="bg-orange-50 rounded-xl p-4 text-orange-900 mb-6">
                        <div class="flex items-center gap-3 mb-2">
                            <div class="w-10 h-10 rounded-full bg-white p-0.5">
                                <img :src="seller.avatar" class="w-full h-full rounded-full object-cover" />
                            </div>
                            <div>
                                <div class="font-bold text-sm">{{ seller.name }}</div>
                                <div class="text-xs opacity-80">芝麻信用 {{ seller.credit }}</div>
                            </div>
                        </div>
                        <div class="flex justify-between text-xs border-t border-orange-200/50 pt-2 mb-3">
                            <span>回复率 100%</span>
                            <span>24h内发货</span>
                            <span>无差评</span>
                        </div>
                        <button @click="router.push(`/seller/${seller.id}`)"
                            class="w-full bg-white border border-orange-200 text-orange-800 text-xs font-bold py-2 rounded-lg hover:bg-orange-100 transition-colors">
                            进入卖家主页
                        </button>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex flex-col gap-3">
                        <button @click="handleBuy"
                            class="w-full bg-gradient-to-r from-[#4a8b6e] to-[#3b755b] text-white font-bold py-3.5 rounded-full text-base shadow-lg shadow-[#4a8b6e]/20 hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2">
                            立即购买
                        </button>
                        <div class="flex gap-3">
                            <button @click="handleChat"
                                class="flex-1 bg-[#4a8b6e]/10 text-[#4a8b6e] font-bold py-3 rounded-full text-sm hover:bg-[#4a8b6e]/20 transition-colors">
                                聊一聊
                            </button>
                            <button @click="toggleFavorite"
                                :class="['flex-1 font-bold py-3 rounded-full text-sm border transition-colors flex items-center justify-center gap-1', isFavorited ? 'border-[#ff5e57] text-[#ff5e57] bg-[#ff5e57]/5' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50']">
                                <Heart :size="16" :fill="isFavorited ? '#ff5e57' : 'none'" />
                                {{ isFavorited ? '已收藏' : '收藏' }}
                            </button>
                        </div>
                    </div>

                    <!-- Seller Mini Profile (Official Mode - Simplified) -->
                    <div v-if="product.isOfficial" class="mt-8 pt-6 border-t border-gray-50">
                        <div class="flex items-center gap-3 mb-3">
                            <div class="relative">
                                <img :src="seller.avatar"
                                    class="w-10 h-10 rounded-full border border-gray-100 object-cover" />
                                <div
                                    class="absolute -bottom-1 -right-1 bg-[#4a8b6e] text-white text-[9px] px-1.5 rounded-full border border-white">
                                    实名</div>
                            </div>
                            <div class="flex-1">
                                <div class="flex items-center gap-2">
                                    <span class="font-bold text-[#2c3e50] text-sm">{{ seller.name }}</span>
                                    <span
                                        class="text-[10px] bg-yellow-50 text-yellow-600 px-1.5 py-0.5 rounded border border-yellow-100">芝麻信用
                                        {{ seller.credit }}</span>
                                </div>
                                <div class="text-xs text-gray-400 mt-0.5">回复快 · 发货快 · 评价优</div>
                            </div>
                        </div>
                        <button @click="router.push(`/seller/${seller.id}`)"
                            class="w-full border border-gray-200 text-gray-600 text-xs font-bold py-2 rounded-lg hover:border-[#4a8b6e] hover:text-[#4a8b6e] transition-colors">
                            进入卖家主页
                        </button>
                    </div>

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
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
