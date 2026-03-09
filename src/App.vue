<template>
    <div id="app">
        <div class="app-backdrop"></div>

        <div class="app-shell">
            <TopNavbar :mode="navbarMode" v-if="!route.meta.hideNavbar" />

            <main class="app-main" :class="{ 'app-main--framed': !route.meta.hideNavbar }">
                <router-view v-slot="{ Component }">
                    <div class="route-stage">
                        <transition name="page-fade" mode="out-in" appear>
                            <component :is="Component" :key="route.fullPath" class="route-screen" />
                        </transition>
                    </div>
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
import { computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';

export default {
    name: 'App',
    components: { TopNavbar },
    setup() {
        const route = useRoute()
        const messageStore = useMessageStore()
        const favoritesStore = useFavoritesStore()
        const userStore = useUserStore()
        const navbarMode = computed(() => route.meta.navbarMode === 'seller' ? 'seller' : 'buyer')

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
            navbarMode,
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
    position: relative;
    padding: 24px 0 56px;
    overflow-x: clip;
}

.app-main--framed {
    padding-top: 18px;
}

.route-stage {
    position: relative;
}

.route-screen {
    will-change: opacity, transform, filter;
    transform-origin: center top;
}

/* 页面切换动画 */
.page-fade-enter-active {
    transition:
        opacity 0.34s cubic-bezier(0.22, 1, 0.36, 1),
        transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
        filter 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.page-fade-leave-active {
    transition:
        opacity 0.24s ease,
        transform 0.28s ease,
        filter 0.28s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
    opacity: 0;
    filter: blur(10px);
}

.page-fade-enter-from {
    transform: translate3d(0, 22px, 0) scale(0.988);
}

.page-fade-leave-to {
    transform: translate3d(0, -14px, 0) scale(1.012);
}

.page-fade-enter-to,
.page-fade-leave-from {
    opacity: 1;
    filter: blur(0);
    transform: translate3d(0, 0, 0) scale(1);
}
</style>
