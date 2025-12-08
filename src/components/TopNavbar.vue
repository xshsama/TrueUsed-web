<template>
    <nav class="bg-white sticky top-0 z-50 border-b border-gray-100 h-[72px] flex items-center">
        <div class="w-full max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between gap-4 h-full">

            <!-- 1. Logo & Links -->
            <div class="flex items-center gap-10">
                <div class="flex items-center gap-1.5 cursor-pointer" @click="goHome">
                    <div
                        class="w-9 h-9 bg-[#4a8b6e] rounded-lg flex items-center justify-center text-white font-bold text-xl italic shadow-sm">
                        T</div>
                    <span class="text-2xl font-bold text-[#2c3e50] tracking-tight">TrueUsed<span
                            class="text-[#4a8b6e]">.</span></span>
                </div>

                <div class="hidden md:flex items-center gap-8 text-[15px] font-medium text-gray-500">
                    <template v-if="mode === 'seller'">
                        <a href="#" class="hover:text-[#4a8b6e] transition-colors">工作台</a>
                        <a href="#" class="hover:text-[#4a8b6e] transition-colors">数据中心</a>
                        <a href="#" class="hover:text-[#4a8b6e] transition-colors">消息通知</a>
                    </template>
                    <template v-else>
                        <router-link to="/home" class="hover:text-[#4a8b6e] transition-colors"
                            :class="{ 'text-[#4a8b6e] font-bold': route.path === '/home' }">首页</router-link>
                        <a href="#" class="hover:text-[#4a8b6e] transition-colors">捡漏榜</a>
                        <a href="#" class="hover:text-[#4a8b6e] transition-colors">附近闲置</a>
                    </template>
                </div>
            </div>

            <!-- 2. Center: Search (Buyer Only) -->
            <div v-if="mode === 'buyer'" class="flex-1 max-w-lg hidden md:flex justify-center mx-4">
                <div class="w-full relative group">
                    <input type="text" placeholder="搜“iPhone 15”看看大家卖多少钱..."
                        class="w-full bg-white border border-gray-200 rounded-full h-11 pl-5 pr-12 text-sm focus:border-[#4a8b6e] focus:ring-4 focus:ring-[#4a8b6e]/10 transition-all outline-none"
                        @keyup.enter="goSearch($event.target.value)" />
                    <div class="absolute right-1 top-1 w-9 h-9 bg-[#064E3B] rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-black transition-colors"
                        @click="(e) => goSearch(e.target.parentElement.querySelector('input').value)">
                        <div class="i-lucide-search text-sm"></div>
                    </div>
                </div>
            </div>

            <!-- 3. Right: Actions -->
            <div class="flex items-center gap-4 md:gap-6">

                <!-- Buyer Icons -->
                <template v-if="mode === 'buyer'">
                    <div class="flex flex-col items-center justify-center text-gray-600 hover:text-[#4a8b6e] cursor-pointer gap-0.5 transition-colors relative"
                        @click="router.push('/messages')">
                        <div class="i-lucide-message-circle text-xl"></div>
                        <span class="text-[10px] font-medium">消息</span>
                        <span v-if="unreadCount > 0"
                            class="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1 rounded-full border border-white">{{
                                unreadCount > 99 ? '99+' : unreadCount }}</span>
                    </div>
                    <div class="flex flex-col items-center justify-center text-gray-600 hover:text-[#4a8b6e] cursor-pointer gap-0.5 transition-colors"
                        @click="router.push('/favorites')">
                        <div class="i-lucide-heart text-xl"></div>
                        <span class="text-[10px] font-medium">收藏</span>
                    </div>
                </template>

                <!-- Seller Actions -->
                <template v-if="mode === 'seller'">
                    <button @click="router.push('/post/create')"
                        class="bg-[#4a8b6e] hover:bg-[#3b755b] text-white px-5 py-2 rounded-full font-bold text-sm shadow-lg shadow-[#4a8b6e]/20 transition-all flex items-center gap-1">
                        <div class="i-lucide-plus w-4 h-4"></div> 发布商品
                    </button>
                </template>

                <!-- Avatar & Dropdown -->
                <div class="relative group z-50">
                    <div class="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-100 cursor-pointer hover:ring-2 hover:ring-[#4a8b6e]/20 transition-all"
                        @click="router.push('/profile')">
                        <img :src="avatarSrc" class="w-full h-full object-cover" />
                    </div>

                    <!-- Dropdown -->
                    <div
                        class="absolute top-full right-0 mt-2 w-36 bg-white rounded-xl shadow-xl border border-gray-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                        <div v-if="!userStore.isLoggedIn"
                            class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer font-medium"
                            @click="router.push('/login')">登录 / 注册</div>
                        <template v-else>
                            <div class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                                @click="router.push('/profile')">个人中心</div>
                            <div class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                                @click="router.push('/orders')">我的订单</div>
                            <div class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                                @click="router.push('/settings')">设置</div>
                            <div class="h-px bg-gray-100 my-1"></div>
                            <div class="px-4 py-2 text-sm text-red-500 hover:bg-red-50 cursor-pointer"
                                @click="handleLogout">退出登录</div>
                        </template>
                    </div>
                </div>

                <!-- Buyer Post Btn -->
                <button v-if="mode === 'buyer'"
                    class="hidden md:flex items-center gap-1 bg-gradient-to-br from-[#00875A] to-[#064E3B] text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-md hover:scale-105 active:scale-95 transition-all"
                    @click="router.push('/post/create')">
                    <div class="i-lucide-plus w-4 h-4"></div> 发布闲置
                </button>

            </div>
        </div>
    </nav>
</template>

<script setup>
import { useMessageStore } from '@/stores/message';
import { useUserStore } from '@/stores/user';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
    mode: {
        type: String,
        default: 'buyer' // 'buyer' | 'seller'
    }
});

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const messageStore = useMessageStore();

const unreadCount = computed(() => messageStore.unreadCount);
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';
const avatarSrc = computed(() => userStore.user?.avatarUrl || defaultAvatar);

const goHome = () => {
    router.push('/');
};

const goSearch = (kw) => {
    if (!kw) return;
    router.push({ path: '/search', query: { q: kw } });
};

const handleLogout = () => {
    userStore.logout();
    router.push('/login');
};
</script>
