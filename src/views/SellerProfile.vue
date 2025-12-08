<template>
    <div class="min-h-screen bg-[#f7f9fa] pb-10">
        <!-- 顶部导航 -->
        <van-nav-bar title="卖家主页" left-arrow @click-left="$router.back()" fixed placeholder class="!bg-transparent"
            :border="false" />

        <!-- 卖家信息卡片 -->
        <div class="relative bg-white -mt-[46px] pt-[60px] pb-6 px-4 mb-2">
            <div class="flex items-center gap-4">
                <div class="relative">
                    <van-image :src="seller.avatar" width="70" height="70" round fit="cover"
                        class="border-2 border-white shadow-md" />
                    <div
                        class="absolute -bottom-1 -right-1 bg-[#4a8b6e] text-white text-[10px] px-1.5 py-0.5 rounded-full border border-white">
                        实名
                    </div>
                </div>
                <div class="flex-1">
                    <h1 class="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                        {{ seller.nickname }}
                        <van-tag type="primary" color="#4a8b6e" plain size="mini">信用极好</van-tag>
                    </h1>
                    <div class="text-xs text-gray-500 flex gap-3">
                        <span>在售 {{ seller.sellingCount }}</span>
                        <span>已售 {{ seller.soldCount }}</span>
                        <span>加入时间 {{ seller.joinDate }}</span>
                    </div>
                </div>
                <van-button type="primary" size="small" round color="#4a8b6e" icon="plus"
                    @click="handleFollow">关注</van-button>
            </div>

            <div class="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg leading-relaxed">
                {{ seller.bio || '这位卖家很懒，什么都没写~' }}
            </div>
        </div>

        <!-- 商品与评价 -->
        <van-tabs v-model:active="activeTab" sticky offset-top="46" swipeable animated color="#4a8b6e">
            <!-- 在售商品 -->
            <van-tab title="在售商品" name="selling">
                <div class="p-3 grid grid-cols-2 gap-3">
                    <ProductCard v-for="item in sellingList" :key="item.id" :product="item"
                        @click="$router.push(`/product/${item.id}`)" />
                </div>
                <van-empty v-if="sellingList.length === 0" description="暂无在售商品" />
            </van-tab>

            <!-- 历史评价 -->
            <van-tab :title="`评价 (${reviews.length})`" name="reviews">
                <div class="p-4 space-y-4">
                    <div v-for="review in reviews" :key="review.id" class="bg-white p-4 rounded-xl shadow-sm">
                        <div class="flex items-center justify-between mb-2">
                            <div class="flex items-center gap-2">
                                <van-image :src="review.avatar" width="24" height="24" round />
                                <span class="text-xs text-gray-600">{{ review.username }}</span>
                            </div>
                            <span class="text-xs text-gray-400">{{ review.date }}</span>
                        </div>
                        <p class="text-sm text-gray-800 mb-2">{{ review.content }}</p>
                        <div class="flex items-center gap-2 bg-gray-50 p-2 rounded text-xs text-gray-500">
                            <van-image :src="review.productImage" width="20" height="20" radius="4" />
                            <span class="truncate max-w-[200px]">购买了 {{ review.productName }}</span>
                        </div>
                    </div>
                    <van-empty v-if="reviews.length === 0" description="暂无评价" />
                </div>
            </van-tab>
        </van-tabs>
    </div>
</template>

<script setup>
import { getSellerReviews } from '@/api/reviews';
import ProductCard from '@/components/ProductCard.vue';
import request from '@/utils/request';
import { showFailToast, showSuccessToast } from 'vant';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const sellerId = route.params.id;

const activeTab = ref('selling');
const seller = ref({
    nickname: '加载中...',
    avatar: '',
    sellingCount: 0,
    soldCount: 0,
    joinDate: '',
    bio: ''
});

const sellingList = ref([]);
const reviews = ref([]);
const loading = ref(false);

const loadSellerInfo = async () => {
    loading.value = true;
    try {
        // 1. 获取卖家基本信息
        const profileRes = await request.get(`/users/${sellerId}/public-profile`);
        seller.value = {
            nickname: profileRes.nickname || profileRes.username || '未知用户',
            avatar: profileRes.avatarUrl || 'https://via.placeholder.com/100',
            sellingCount: profileRes.sellingCount || 0,
            soldCount: profileRes.soldCount || 0,
            joinDate: profileRes.createdAt ? new Date(profileRes.createdAt).toLocaleDateString() : '未知',
            bio: profileRes.bio || '这位卖家很懒，什么都没写~'
        };

        // 2. 获取在售商品
        const productsRes = await request.get('/products', {
            params: { sellerId: sellerId, status: 'AVAILABLE', page: 0, size: 20 }
        });
        sellingList.value = productsRes.content || [];

        // 3. 获取评价列表
        const reviewsRes = await getSellerReviews(sellerId, { page: 0, size: 20 });
        reviews.value = (reviewsRes.content || []).map(r => ({
            id: r.id,
            username: r.isAnonymous ? '匿名用户' : (r.buyer?.nickname || r.buyer?.username || '买家'),
            avatar: r.isAnonymous ? 'https://via.placeholder.com/50' : (r.buyer?.avatarUrl || 'https://via.placeholder.com/50'),
            content: r.content,
            date: new Date(r.createdAt).toLocaleDateString(),
            productName: r.product?.title || '未知商品',
            productImage: (r.product?.images && r.product.images.length > 0) ? r.product.images[0].url : '',
            rating: r.rating
        }));

    } catch (e) {
        console.error(e);
        showFailToast('加载卖家信息失败');
    } finally {
        loading.value = false;
    }
};

const handleFollow = () => {
    showSuccessToast('关注成功');
};

onMounted(() => {
    loadSellerInfo();
});
</script>

<style scoped>
:deep(.van-nav-bar__content) {
    background: transparent;
}

:deep(.van-hairline--bottom:after) {
    border-bottom-width: 0;
}
</style>
