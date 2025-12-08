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
import ProductCard from '@/components/ProductCard.vue';
import { showSuccessToast } from 'vant';
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
    joinDate: '2023-01-01',
    bio: ''
});

const sellingList = ref([]);
const reviews = ref([]);

// Mock Data Load
const loadSellerInfo = async () => {
    // 模拟数据，后续替换为真实 API
    // const res = await getSellerInfo(sellerId);
    setTimeout(() => {
        seller.value = {
            nickname: '数码达人_Alex',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
            sellingCount: 12,
            soldCount: 45,
            joinDate: '2023-05-12',
            bio: '专注二手苹果设备，原装正品，诚信交易！'
        };

        sellingList.value = [
            { id: 1, title: 'iPhone 14 Pro Max 256G 暗夜紫', price: 6800, image: 'https://images.unsplash.com/photo-1678685888221-c48879df0d69?w=400', condition: '99新' },
            { id: 2, title: 'AirPods Pro 2', price: 1200, image: 'https://images.unsplash.com/photo-1603351154351-5cfb3e19ef0f?w=400', condition: '95新' },
            { id: 3, title: 'iPad Air 5 64G', price: 3200, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400', condition: '9成新' },
        ];

        reviews.value = [
            { id: 101, username: '买家小王', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', content: '成色很新，发货快，老板人不错！', date: '2023-10-20', productName: 'iPhone 13', productImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100' },
            { id: 102, username: 'Alice', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', content: '交易愉快，推荐推荐。', date: '2023-09-15', productName: 'MacBook Air M1', productImage: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100' },
        ];
    }, 500);
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
