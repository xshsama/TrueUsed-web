<template>
    <div id="app">
        <!-- 全局顶部导航 -->
        <TopNavbar mode="buyer" v-if="!route.meta.hideNavbar" />

        <main class="app-main">
            <router-view v-slot="{ Component }">
                <transition name="page-fade" mode="out-in">
                    <component :is="Component" />
                </transition>
            </router-view>
        </main>

        <!-- 底部导航栏 (移动端) -->
        <van-tabbar route class="mobile-tabbar" v-if="!route.meta.hideNavbar" active-color="#4CAF50" v-model="active">
            <van-tabbar-item replace to="/home">
                <span>首页</span>
                <template #icon="{ active }">
                    <van-icon :name="active ? 'wap-home' : 'wap-home-o'" />
                </template>
            </van-tabbar-item>
            <van-tabbar-item replace to="/messages" :badge="unreadCount || null">
                <span>消息</span>
                <template #icon="{ active }">
                    <van-icon :name="active ? 'chat' : 'chat-o'" />
                </template>
            </van-tabbar-item>
            <van-tabbar-item replace to="/favorites">
                <span>收藏</span>
                <template #icon="{ active }">
                    <van-icon :name="active ? 'like' : 'like-o'" />
                </template>
            </van-tabbar-item>
            <van-tabbar-item replace to="/profile">
                <span>我的</span>
                <template #icon="{ active }">
                    <van-icon :name="active ? 'user' : 'user-o'" />
                </template>
            </van-tabbar-item>
        </van-tabbar>

    </div>
</template>

<script>
import TopNavbar from '@/components/TopNavbar.vue';
import { useFavoritesStore } from '@/stores/favorites';
import { useMessageStore } from '@/stores/message';
import { useUserStore } from '@/stores/user';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default {
    name: 'App',
    components: { TopNavbar },
    setup() {
        const router = useRouter()
        const route = useRoute()
        const messageStore = useMessageStore()
        const favoritesStore = useFavoritesStore()
        const userStore = useUserStore()

        const active = ref(0)
        const unreadCount = computed(() => messageStore.unreadCount)

        // 根据当前路由设置active值
        const updateActiveTab = () => {
            const path = route.path
            if (path.startsWith('/home') || path === '/') {
                active.value = 0
            } else if (path.startsWith('/messages')) {
                active.value = 1
            } else if (path.startsWith('/favorites')) {
                active.value = 2
            } else if (path.startsWith('/profile')) {
                active.value = 3
            }
        }

        // 监听路由变化（确保直接跳转也更新）
        watch(() => route.path, () => {
            updateActiveTab()
        })

        // 初始化
        updateActiveTab()

        onMounted(() => {
            favoritesStore.fetchFavorites()
            messageStore.fetchUnreadCount()
            if (userStore.isLoggedIn) {
                userStore.loadMe().catch(() => { })
            }
        })

        return {
            active,
            unreadCount,
            route,
            userStore
        }
    }
}
</script>

<style>
#app {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: var(--bg-page);
    color: var(--text-primary);
}

/* 页面切换动画 */
.page-fade-enter-active,
.page-fade-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
    opacity: 0;
    transform: translateY(5px);
}

/* 底部导航栏 */
.mobile-tabbar {
    display: none !important;
}

@media (max-width: 768px) {
    .mobile-tabbar {
        display: flex !important;
        border-top: 1px solid #eee;
        z-index: 1000;
    }

    /* 调整容器底部间距，防止被导航栏遮挡 */
    .app-main {
        padding-bottom: 80px;
    }
}
</style>
