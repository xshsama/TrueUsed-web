<template>
    <div id="app">
        <!-- 全局顶部导航（大气分散布局） -->
        <header class="global-top-navbar elevated" v-if="!route.meta.hideNavbar">
            <div class="navbar-inner">
                <!-- 品牌 / Logo -->
                <div class="brand" @click="goTop('home')">
                    <span class="brand-icon">♻️</span>
                    <span class="brand-text">TrueUsed</span>
                </div>

                <!-- 中部导航 -->
                <nav class="global-nav-links capsule-style">
                    <div :class="['g-nav-item capsule', { active: topActive === 'home' }]" @click="goTop('home')">
                        <van-icon :name="topActive === 'home' ? 'wap-home' : 'wap-home-o'" class="nav-icon" />
                        <span>首页</span>
                    </div>
                    <div :class="['g-nav-item capsule', { active: topActive === 'messages' }]"
                        @click="goTop('messages')">
                        <van-icon :name="topActive === 'messages' ? 'chat' : 'chat-o'" class="nav-icon" />
                        <span>消息</span>
                        <span v-if="unreadCount" class="g-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
                    </div>
                    <div :class="['g-nav-item capsule', { active: topActive === 'favorites' }]"
                        @click="goTop('favorites')">
                        <van-icon :name="topActive === 'favorites' ? 'like' : 'like-o'" class="nav-icon" />
                        <span>收藏</span>
                    </div>
                    <div :class="['g-nav-item capsule', { active: topActive === 'profile' }]" @click="goTop('profile')">
                        <van-icon :name="topActive === 'profile' ? 'user' : 'user-o'" class="nav-icon" />
                        <span>我的</span>
                    </div>
                </nav>

                <!-- 右侧操作区（可放搜索 / 登录 / 主题切换）-->
                <div class="nav-actions">
                    <label class="search-box" v-show="showWide">
                        <van-icon name="search" class="search-icon" />
                        <input type="text" placeholder="搜索好物..." @keyup.enter="goSearch($event.target.value)" />
                    </label>
                    <button class="post-btn" @click="router.push('/post/create')">
                        <van-icon name="plus" /> 发布
                    </button>
                </div>
            </div>
        </header>

        <main class="app-main">
            <router-view v-slot="{ Component }">
                <transition name="page-fade" mode="out-in">
                    <component :is="Component" />
                </transition>
            </router-view>
        </main>

        <!-- 底部导航栏 (移动端) -->
        <van-tabbar route class="mobile-tabbar" v-if="!route.meta.hideNavbar" active-color="#4CAF50">
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
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFavoritesStore } from './stores/favorites';
import { useMessageStore } from './stores/message';

export default {
    name: 'App',
    setup() {
        const router = useRouter()
        const route = useRoute()
        const messageStore = useMessageStore()
        const favoritesStore = useFavoritesStore()

        const active = ref(0)
        const unreadCount = computed(() => messageStore.unreadCount)
        // 顶部导航当前激活
        const topActive = ref('home')

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

        // 初始化与监听路由变化（使用 watch，不注册 beforeEach 以免阻塞导航）
        updateActiveTab()
        syncTopActive()

        // 监听路由变化（确保直接跳转也更新）
        watch(() => route.path, () => {
            updateActiveTab()
            syncTopActive()
        })

        const showWide = computed(() => window.innerWidth > 860) // 简单判定（可后续用响应式方案改进）

        const goSearch = (kw) => {
            if (!kw) return
            router.push({ path: '/search', query: { q: kw } })
        }

        onMounted(() => {
            favoritesStore.fetchFavorites()
            messageStore.fetchUnreadCount()
        })

        return {
            active,
            unreadCount,
            onTabChange,
            topActive,
            goTop,
            route,
            router,
            showWide,
            goSearch
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

/* 顶部导航（重构版） */
.global-top-navbar.elevated {
    position: sticky;
    top: 0;
    z-index: 200;
    background: var(--primary-color);
    /* 改为主题蓝 */
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    border-bottom: none;
    box-shadow: 0 4px 20px rgba(76, 175, 80, 0.2);
    height: 72px;
    width: 100%;
    transition: all 0.3s ease;
}

/* 主内容区域圆角处理 */
.app-main {
    background: var(--bg-page);
    margin-top: -1px;
    /* 消除缝隙 */
    position: relative;
    z-index: 1;
    overflow: hidden;
    /* 确保圆角生效 */
    width: 100%;
    min-height: calc(100vh - 72px);
}

.global-top-navbar .navbar-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: nowrap;
    gap: 16px;
}

.brand {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    font-weight: 800;
    font-size: 24px;
    letter-spacing: -0.5px;
    color: #fff;
    /* 白色文字 */
    cursor: pointer;
    user-select: none;
    text-decoration: none;
    transition: transform 0.2s ease;
}

.brand:active {
    transform: scale(0.95);
}

.brand-icon {
    font-size: 26px;
    margin-right: 10px;
    filter: brightness(0) invert(1);
    /* 图标变白 */
}

.brand-text {
    background: none;
    -webkit-text-fill-color: initial;
    color: #fff;
}

/* 胶囊式导航 */
.global-nav-links.capsule-style {
    flex: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 16px;
    height: 100%;
    margin: 0;
    list-style: none;
    overflow: hidden;
}

.g-nav-item.capsule {
    flex-shrink: 0;
    appearance: none;
    -webkit-appearance: none;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 8px 0;
    /* 移除水平 padding，改用 width 控制 */
    width: 96px;
    /* 固定宽度防止抖动 */
    border-radius: 99px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 15px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.85);
    /* 浅白色 */
    cursor: pointer;
    position: relative;
    transition: all 0.2s ease;
    white-space: nowrap;
    line-height: 1.5;
    outline: none;
    box-sizing: border-box;
    margin: 0;
    font-family: inherit;
}

.g-nav-item.capsule:hover {
    background: rgba(255, 255, 255, 0.1) !important;
    color: #fff;
}

.g-nav-item.capsule:active {
    transform: scale(0.96);
    background: rgba(255, 255, 255, 0.2) !important;
}

.g-nav-item.capsule.active {
    background: #fff !important;
    color: var(--primary-color) !important;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

.nav-icon {
    font-size: 18px;
    display: flex;
    align-items: center;
    margin: 0;
}

/* 右侧操作区 */
.nav-actions {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 16px;
    min-width: 240px;
    justify-content: flex-end;
}

.search-box {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    border-radius: 99px;
    padding: 0 16px;
    width: 220px;
    height: 40px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    cursor: text;
}

.search-icon {
    position: static;
    margin-right: 8px;
    color: var(--primary-color);
    font-size: 16px;
    pointer-events: none;
}

.search-box input {
    background: transparent;
    border: none;
    padding: 0;
    font-size: 14px;
    width: 140px;
    outline: none;
    color: #333;
    box-shadow: none;
}

.search-box:focus-within {
    width: 260px;
    box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.2);
}

.search-box input::placeholder {
    color: #999;
}

/* 发布按钮 */
.post-btn {
    background: #fff;
    color: var(--primary-color);
    border: none;
    padding: 10px 24px;
    border-radius: 99px;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.post-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    background: #f8fafc;
}

.post-btn:active {
    transform: translateY(1px);
}

/* 全局通用小红点 */
.g-badge {
    position: absolute;
    top: 4px;
    right: 4px;
    background: var(--danger-color);
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    line-height: 1;
    padding: 3px 5px;
    border-radius: 10px;
    min-width: 18px;
    text-align: center;
    border: 2px solid #fff;
    z-index: 10;
    box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
}

/* 响应式 */
@media (max-width: 1024px) {
    .global-top-navbar .navbar-inner {
        padding: 0 20px;
    }

    .global-nav-links.capsule-style {
        gap: 4px;
    }

    .g-nav-item.capsule {
        padding: 8px 12px;
        font-size: 14px;
    }

    .g-nav-item.capsule span {
        display: none;
        /* 平板模式下只显示图标 */
    }

    .g-nav-item.capsule .nav-icon {
        font-size: 20px;
        margin: 0;
    }
}

@media (max-width: 768px) {
    .search-box {
        display: none;
    }

    .global-nav-links.capsule-style {
        display: none;
        /* 移动端隐藏顶部导航，使用底部 Tabbar */
    }

    .brand-text {
        display: block;
        /* 移动端显示文字 */
    }

    .post-btn {
        padding: 8px 16px;
    }
}

/* 浮动卖出按钮（全局） */
.global-floating-sell-btn {
    position: fixed;
    right: 24px;
    bottom: 80px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--primary-color);
    box-shadow: var(--shadow-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    z-index: 250;
    border: none;
    transition: transform 0.2s ease, background-color 0.2s ease;
}

.global-floating-sell-btn:hover {
    transform: translateY(-2px);
    background: var(--primary-dark);
}

.global-floating-sell-btn:active {
    transform: scale(0.95);
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
