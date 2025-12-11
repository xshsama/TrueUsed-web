<template>
    <aside class="hidden lg:block lg:col-span-2">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-4 sticky top-24">
            <div class="flex items-center gap-3 mb-6 px-2">
                <div class="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                    <img :src="userAvatar" class="w-full h-full object-cover" />
                </div>
                <div>
                    <div class="font-bold text-sm text-[#2c3e50]">{{ userName }}</div>
                    <div class="text-xs text-gray-400">信用极好</div>
                </div>
            </div>

            <nav class="space-y-1">
                <a v-for="item in menuItems" :key="item.name" href="#"
                    :class="['flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all', activeMenu === item.name ? 'bg-[#4a8b6e]/10 text-[#4a8b6e]' : 'text-gray-600 hover:bg-gray-50']"
                    @click.prevent="handleMenuClick(item)">
                    <component :is="item.iconComponent" :size="18" />
                    {{ item.name }}
                </a>
            </nav>
        </div>
    </aside>
</template>

<script setup>
import { useUserStore } from '@/stores/user';
import {
    Heart,
    History,
    MapPin,
    ShoppingBag
} from 'lucide-vue-next';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
    activeMenu: {
        type: String,
        default: ''
    }
});

const router = useRouter();
const userStore = useUserStore();

const userName = computed(() => userStore.user?.nickname || 'User');
const userAvatar = computed(() => userStore.user?.avatarUrl || 'https://ui-avatars.com/api/?name=User');

const menuItems = [
    { name: '我的订单', iconComponent: ShoppingBag, path: '/orders' },
    { name: '我的收藏', iconComponent: Heart, path: '/favorites' },
    { name: '浏览记录', iconComponent: History, path: '/history' },
    { name: '收货地址', iconComponent: MapPin, path: '/address' },
];

const handleMenuClick = (item) => {
    if (props.activeMenu === item.name) return;
    if (item.path) {
        router.push(item.path);
    }
};
</script>
