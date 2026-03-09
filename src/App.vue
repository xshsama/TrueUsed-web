<template>
    <div id="app">
        <div class="app-backdrop"></div>

        <div class="app-shell">
            <TopNavbar mode="buyer" v-if="!route.meta.hideNavbar" />

            <main class="app-main" :class="{ 'app-main--framed': !route.meta.hideNavbar }">
                <router-view v-slot="{ Component }">
                    <transition name="page-fade" mode="out-in">
                        <component :is="Component" />
                    </transition>
                </router-view>
            </main>
        </div>
    </div>
</template>

<script>
import TopNavbar from '@/components/TopNavbar.vue';
import { useFavoritesStore } from '@/stores/favorites';
import { useMessageStore } from '@/stores/message';
import { useUserStore } from '@/stores/user';
import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';

export default {
    name: 'App',
    components: { TopNavbar },
    setup() {
        const route = useRoute()
        const messageStore = useMessageStore()
        const favoritesStore = useFavoritesStore()
        const userStore = useUserStore()

        onMounted(() => {
            if (userStore.isLoggedIn) {
                favoritesStore.fetchFavorites()
                messageStore.fetchUnreadCount()
                userStore.loadMe().catch(() => { })
                messageStore.connect()
            }
        })

        // 监听登录状态变化，自动连接/断开 WebSocket
        watch(() => userStore.isLoggedIn, (newVal) => {
            if (newVal) {
                favoritesStore.fetchFavorites()
                messageStore.fetchUnreadCount()
                messageStore.connect()
            } else {
                messageStore.disconnect()
            }
        })

        return {
            route,
            userStore
        }
    }
}
</script>

<style>
#app {
    position: relative;
    min-height: 100vh;
    font-family: var(--font-family);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: var(--text-primary);
    background:
        radial-gradient(circle at top left, rgba(0, 135, 90, 0.08), transparent 30%),
        linear-gradient(180deg, #f7faf8 0%, #f5f7fa 42%, #eef2f7 100%);
}

.app-backdrop {
    position: fixed;
    inset: 0;
    pointer-events: none;
    background:
        linear-gradient(120deg, rgba(255, 255, 255, 0.45), transparent 35%),
        radial-gradient(circle at 85% 10%, rgba(0, 135, 90, 0.09), transparent 18%);
}

.app-shell {
    position: relative;
    z-index: 1;
    min-height: 100vh;
}

.app-main {
    padding: 24px 0 56px;
}

.app-main--framed {
    padding-top: 18px;
}

/* 页面切换动画 */
.page-fade-enter-active,
.page-fade-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
    opacity: 0;
    transform: translateY(8px);
}
</style>
