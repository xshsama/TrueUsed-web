<template>
    <div id="app">
        <!-- 全局顶部导航（硬核电商布局） -->
        <header class="global-top-navbar" v-if="!route.meta.hideNavbar">
            <div class="navbar-container">
                <!-- 1. Logo 区域 (Wordmark Design) -->
                <div class="nav-left" @click="goTop('home')" style="display: flex; align-items: center; gap: 8px;">
                    <div
                        style="background: #00875A; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-style: italic; box-shadow: 0 2px 6px rgba(0,135,90,0.2);">
                        T
                    </div>
                    <div style="font-family: 'Poppins', sans-serif; font-size: 24px; line-height: 1;">
                        <span style="font-weight: 800; color: #1F2937;">True</span>
                        <span style="font-weight: 400; color: #00875A;">Used</span>
                    </div>
                </div>

                <!-- 2. 搜索框区域 (C位) -->
                <div class="nav-center">
                    <div class="search-wrapper">
                        <div class="search-category">
                            <span>全部</span>
                            <van-icon name="arrow-down" size="12" style="margin-left: 4px; color: #999;" />
                        </div>
                        <input type="text" placeholder="搜索好物..." @keyup.enter="goSearch($event.target.value)" />
                        <div class="search-btn"
                            @click="(e) => goSearch(e.target.closest('.search-wrapper').querySelector('input').value)">
                            <van-icon name="search" size="20" />
                        </div>
                    </div>
                </div>

                <!-- 3. 右侧功能区 -->
                <div class="nav-right">
                    <!-- 消息 -->
                    <div class="nav-icon-link" @click="goTop('messages')">
                        <div class="icon-box">
                            <van-icon name="chat-o" size="22" />
                            <span v-if="unreadCount" class="g-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
                        </div>
                        <span>消息</span>
                    </div>

                    <!-- 收藏 -->
                    <div class="nav-icon-link" @click="goTop('favorites')">
                        <van-icon name="like-o" size="22" />
                        <span>收藏</span>
                    </div>

                    <!-- 用户头像 / 登录 -->
                    <div class="nav-user-container">
                        <div v-if="userStore.isLoggedIn" class="user-avatar-wrapper" @click="goTop('profile')">
                            <img :src="userStore.user?.avatarUrl || defaultAvatar" class="user-avatar" />
                            <!-- 悬停下拉菜单 -->
                            <div class="user-dropdown">
                                <div class="dropdown-item" @click.stop="router.push('/profile')">个人中心</div>
                                <div class="dropdown-item" @click.stop="router.push('/orders')">我的订单</div>
                                <div class="dropdown-item" @click.stop="router.push('/settings')">设置</div>
                                <div class="dropdown-divider"></div>
                                <div class="dropdown-item danger" @click.stop="handleLogout">退出登录</div>
                            </div>
                        </div>
                        <div v-else class="login-link" @click="router.push('/login')">
                            登录/注册
                        </div>
                    </div>

                    <!-- 发布按钮 -->
                    <button class="post-btn-primary" @click="router.push('/post/create')">
                        发布闲置
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
import { useUserStore } from './stores/user';

export default {
    name: 'App',
    setup() {
        const router = useRouter()
        const route = useRoute()
        const messageStore = useMessageStore()
        const favoritesStore = useFavoritesStore()
        const userStore = useUserStore()

        const active = ref(0)
        const unreadCount = computed(() => messageStore.unreadCount)
        // 顶部导航当前激活
        const topActive = ref('home')

        const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

        const handleLogout = () => {
            userStore.logout()
            router.push('/login')
        }

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
            if (userStore.isLoggedIn) {
                userStore.loadMe().catch(() => { })
            }
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
            goSearch,
            userStore,
            defaultAvatar,
            handleLogout
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

/* 顶部导航（重构版 - 硬核电商风） */
.global-top-navbar {
    position: sticky;
    top: 0;
    z-index: 1000;
    /* Frosted Glass / 毛玻璃效果 */
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.02);
    border-bottom: none;

    height: 72px;
    display: flex;
    align-items: center;
}

.navbar-container {
    width: 100%;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
}

/* 1. Logo 区域 */
.nav-left {
    width: 200px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    cursor: pointer;
}

/* 2. 搜索框区域 (C位) */
.nav-center {
    flex: 1;
    display: flex;
    justify-content: center;
    margin: 0 40px;
    max-width: 680px;
}

.search-wrapper {
    width: 100%;
    /* Capsule Container / 胶囊容器 */
    border: none !important;
    background-color: #F3F4F6;
    /* Unified pale gray background */
    border-radius: 99px;
    height: 48px;
    display: flex;
    align-items: center;
    padding: 4px;
    /* Inner spacing */
    transition: all 0.3s ease;
}

.search-wrapper:focus-within {
    background-color: #FFFFFF;
    transform: translateY(-1px);
    /* Green Glow Shadow */
    box-shadow: 0 4px 20px rgba(0, 135, 90, 0.15);
}

.search-category {
    display: flex;
    align-items: center;
    padding-left: 16px;
    padding-right: 8px;
    height: 100%;
    background: transparent !important;
    /* Transparent to blend with capsule */
    border-right: none;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    cursor: pointer;
    white-space: nowrap;
}

.search-category:hover {
    color: #00875A;
}

.search-wrapper input {
    flex: 1;
    height: 100%;
    border: none;
    outline: none;
    padding: 0 12px;
    font-size: 14px;
    color: #333;
}

.search-btn {
    width: 40px;
    height: 40px;
    margin: 2px;
    /* Floating effect spacing */
    border-radius: 50%;
    background: #1F2937;
    /* Dark button for tool consistency */
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
}

.search-btn:hover {
    transform: scale(1.05);
    background: #000;
}

/* 3. 右侧功能区 */
.nav-right {
    display: flex;
    align-items: center;
    gap: 24px;
    flex-shrink: 0;
}

.nav-icon-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #374151;
    /* Dark Gray */
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    gap: 2px;
    transition: color 0.2s;
    position: relative;
}

.nav-icon-link:hover {
    color: #00875A;
}

.icon-box {
    position: relative;
    display: flex;
    align-items: center;
}

/* 用户头像区域 */
.nav-user-container {
    position: relative;
    margin-left: 8px;
    display: flex;
    align-items: center;
}

.user-avatar-wrapper {
    position: relative;
    cursor: pointer;
    padding: 4px 0;
    /* 增加热区 */
}

.user-avatar {
    width: 40px;
    /* Bigger */
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid #E5E7EB;
    /* Distinct border */
    transition: box-shadow 0.2s;
}

.user-avatar-wrapper:hover .user-avatar {
    box-shadow: 0 0 0 2px rgba(0, 135, 90, 0.2);
}

/* 下拉菜单 */
.user-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    width: 140px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    padding: 8px 0;
    opacity: 0;
    visibility: hidden;
    transform: translateY(10px);
    transition: all 0.2s ease;
    z-index: 1100;
    border: 1px solid #f0f0f0;
}

/* 纯CSS实现悬停显示 */
.user-avatar-wrapper:hover .user-dropdown {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.dropdown-item {
    padding: 10px 16px;
    font-size: 14px;
    color: #333;
    cursor: pointer;
    transition: background 0.2s;
}

.dropdown-item:hover {
    background: #f5f7fa;
    color: #00875A;
}

.dropdown-item.danger {
    color: #ef4444;
}

.dropdown-item.danger:hover {
    background: #fef2f2;
}

.dropdown-divider {
    height: 1px;
    background: #eee;
    margin: 4px 0;
}

.login-link {
    font-size: 14px;
    color: #666;
    cursor: pointer;
    font-weight: 500;
}

.login-link:hover {
    color: #00875A;
}

/* 发布按钮 */
.post-btn-primary {
    /* Liquid Green Button / 液态绿宝石 */
    background: linear-gradient(135deg, #00875A 0%, #064E3B 100%);
    color: #fff;
    border: none;
    padding: 0 20px;
    height: 40px;
    border-radius: 99px;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.5px;

    /* Green Glow Shadow */
    box-shadow: 0 4px 12px rgba(0, 135, 90, 0.3);

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    transition: transform 0.2s;
    margin-left: 12px;
}

.post-btn-primary:hover {
    transform: scale(1.05);
}

.post-btn-primary:active {
    transform: scale(0.95);
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
