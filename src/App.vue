<template>
    <div id="app">
        <!-- 全局顶部导航 -->
        <header class="global-top-navbar" v-if="!route.meta.hideTabbar">
            <nav class="global-nav-links">
                <button :class="['g-nav-item', { active: topActive === 'home' }]" @click="goTop('home')">首页</button>
                <button :class="['g-nav-item', { active: topActive === 'messages' }]" @click="goTop('messages')">
                    消息 <span v-if="unreadCount" class="g-badge">{{ unreadCount }}</span>
                </button>
                <button :class="['g-nav-item', { active: topActive === 'favorites' }]"
                    @click="goTop('favorites')">收藏</button>
                <button :class="['g-nav-item', { active: topActive === 'profile' }]"
                    @click="goTop('profile')">我的</button>
            </nav>
        </header>

        <router-view />

        <!-- 浮动卖出按钮（隐藏 tabbar 的页面不显示） -->
        <button v-if="!route.meta.hideTabbar" class="global-floating-sell-btn" @click="router.push('/post')">卖出</button>
    </div>
</template>

<script>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessageStore } from './stores/message'

export default {
    name: 'App',
    setup() {
        const router = useRouter()
        const route = useRoute()
        const messageStore = useMessageStore()

        const active = ref(0)
        const unreadCount = computed(() => messageStore.unreadCount)
        // 顶部导航当前激活
        const topActive = ref('home')
        const showTabbar = computed(() => !route.meta.hideTabbar) // 与原逻辑保持一致

        // 根据当前路由设置active值
        const updateActiveTab = () => {
            const path = route.path
            if (path.startsWith('/home') || path === '/') {
                active.value = 0
            } else if (path.startsWith('/favorites')) {
                active.value = 1
            } else if (path.startsWith('/post')) {
                active.value = 2
            } else if (path.startsWith('/messages')) {
                active.value = 3
            } else if (path.startsWith('/profile')) {
                active.value = 4
            }
        }

        const onTabChange = (index) => {
            const routes = ['/home', '/favorites', '/post', '/messages', '/profile']
            router.push(routes[index])
        }

        const syncTopActive = () => {
            const p = route.path
            if (p.startsWith('/messages')) topActive.value = 'messages'
            else if (p.startsWith('/favorites')) topActive.value = 'favorites'
            else if (p.startsWith('/profile')) topActive.value = 'profile'
            else topActive.value = 'home'
        }

        const goTop = (key) => {
            const map = { home: '/home', messages: '/messages', favorites: '/favorites', profile: '/profile' }
            router.push(map[key])
        }

        // 监听路由变化
        router.beforeEach(() => {
            updateActiveTab()
            syncTopActive()
        })

        updateActiveTab()
        syncTopActive()

        // 监听路由变化（确保直接跳转也更新）
        watch(() => route.path, () => {
            updateActiveTab()
            syncTopActive()
        })

        return {
            active,
            unreadCount,
            onTabChange,
            topActive,
            goTop,
            route,
            router,
            showTabbar
        }
    }
}
</script>

<style>
#app {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f7f8fa;
}

/* 顶部导航全局样式 */
.global-top-navbar {
    position: sticky;
    top: 0;
    z-index: 200;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid #e5e5e7;
}

.global-nav-links {
    display: flex;
    gap: 6px;
    width: 92%;
    margin: 0 auto;
    padding: 8px 0;
}

.g-nav-item {
    flex: 1;
    background: transparent;
    border: none;
    font-size: 15px;
    font-weight: 500;
    padding: 10px 6px;
    border-radius: 20px !important;
    cursor: pointer;
    color: #444;
    position: relative;
    transition: background 0.25s, color 0.25s;
}

.g-nav-item:hover {
    background: #f2f2f7;
}

.g-nav-item.active {
    background: #007AFF;
    color: #fff;
    font-weight: 600;
}

.g-badge {
    display: inline-block;
    background: #ff3b30;
    color: #fff;
    font-size: 11px;
    line-height: 1;
    padding: 2px 6px;
    border-radius: 10px;
    margin-left: 4px;
}

/* 浮动卖出按钮（全局） */
.global-floating-sell-btn {
    position: fixed;
    right: 26px;
    bottom: 96px;
    /* 与底部 tabbar 保持间距 */
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ff9f0a, #ff3b30);
    box-shadow: 0 8px 24px rgba(255, 59, 48, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    z-index: 250;
    border: none;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.global-floating-sell-btn:hover {
    transform: translateY(-4px) scale(1.03);
    box-shadow: 0 10px 32px rgba(255, 59, 48, 0.55);
}

.global-floating-sell-btn:active {
    transform: scale(0.95);
}

@media (max-width: 768px) {
    .global-floating-sell-btn {
        right: 18px;
        bottom: 88px;
        width: 56px;
        height: 56px;
        font-size: 14px;
    }
}

@media (max-width: 480px) {
    .global-floating-sell-btn {
        right: 14px;
        bottom: 82px;
        width: 54px;
        height: 54px;
    }
}
</style>