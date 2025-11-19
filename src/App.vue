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
                <nav class="global-nav-links underline-style large-spread">
                    <button :class="['g-nav-item line', { active: topActive === 'home' }]"
                        @click="goTop('home')">首页</button>
                    <button :class="['g-nav-item line', { active: topActive === 'messages' }]"
                        @click="goTop('messages')">
                        消息 <span v-if="unreadCount" class="g-badge dot">{{ unreadCount }}</span>
                    </button>
                    <button :class="['g-nav-item line', { active: topActive === 'favorites' }]"
                        @click="goTop('favorites')">收藏</button>
                    <button :class="['g-nav-item line', { active: topActive === 'profile' }]"
                        @click="goTop('profile')">我的</button>
                </nav>

                <!-- 右侧操作区（可放搜索 / 登录 / 主题切换）-->
                <div class="nav-actions">
                    <div class="search-box" v-show="showWide">
                        <input type="text" placeholder="搜索商品 / 关键词..." @keyup.enter="goSearch($event.target.value)" />
                    </div>
                </div>
            </div>
        </header>

        <main class="container">
            <router-view />
        </main>

        <!-- 浮动卖出按钮（隐藏 tabbar 的页面不显示） -->
        <button v-if="!route.meta.hideNavbar" class="global-floating-sell-btn" @click="router.push('/post')">卖出</button>
    </div>
</template>

<script>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMessageStore } from './stores/message';

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
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f7f8fa;
}

/* 顶部导航（重构版） */
.global-top-navbar.elevated {
    position: sticky;
    top: 0;
    z-index: 200;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: saturate(180%) blur(14px);
    -webkit-backdrop-filter: saturate(180%) blur(14px);
    border-bottom: 1px solid rgba(230, 233, 238, 0.75);
    box-shadow: 0 4px 16px -4px rgba(0, 0, 0, 0.06);
}

.global-top-navbar .navbar-inner {
    max-width: 1380px;
    margin: 0 auto;
    padding: 10px 48px 6px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 42px;
}

.brand {
    display: flex;
    align-items: center;
    font-weight: 700;
    font-size: 20px;
    letter-spacing: .5px;
    color: #1a1a1a;
    cursor: pointer;
    user-select: none;
    transition: transform .25s ease;
}

.brand:hover {
    transform: translateY(-2px);
}

.brand-icon {
    font-size: 22px;
    margin-right: 6px;
}

.brand-text {
    background: linear-gradient(90deg, #0d47a1, #1976d2 55%, #42a5f5);
    -webkit-background-clip: text;
    background-clip: text;
    /* 标准属性 */
    color: transparent;
}

.brand-text {
    background: linear-gradient(90deg, #0d47a1, #1976d2 55%, #42a5f5);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}

.global-nav-links.underline-style.large-spread {
    flex: 1;
    display: flex;
    justify-content: center;
    gap: clamp(42px, 5.5vw, 88px);
    padding: 0;
}

.nav-actions {
    display: flex;
    align-items: center;
    gap: 18px;
    min-width: 180px;
    justify-content: flex-end;
}

.search-box {
    position: relative;
}

.search-box input {
    background: rgba(255, 255, 255, .6);
    border: 1px solid #d9dde3;
    border-radius: 24px;
    padding: 6px 14px 6px 14px;
    font-size: 13px;
    width: 200px;
    outline: none;
    transition: border-color .25s, background .25s, box-shadow .25s;
}

.search-box input:focus {
    border-color: #2f81f7;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(47, 129, 247, .15);
}

.minimal-action {
    background: linear-gradient(135deg, #2f81f7, #155ed5);
    color: #fff;
    border: none;
    padding: 8px 18px;
    border-radius: 22px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: .5px;
    cursor: pointer;
    box-shadow: 0 4px 14px -4px rgba(47, 129, 247, .55);
    transition: transform .25s ease, box-shadow .25s ease;
}

.minimal-action:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 24px -4px rgba(47, 129, 247, .6);
}

.minimal-action:active {
    transform: scale(.92);
}

/* 导航按钮 */
.g-nav-item.line {
    background: none;
    border: none;
    padding: 14px 4px 18px;
    font-size: 16px;
    font-weight: 500;
    color: #3d4652;
    cursor: pointer;
    position: relative;
    letter-spacing: .5px;
    transition: color .35s, opacity .35s;
}

.g-nav-item.line:hover {
    color: #111;
}

.g-nav-item.line:focus {
    outline: none;
}

/* 下划线动画更平滑更宽阔 */
.g-nav-item.line::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 6px;
    height: 3px;
    width: 0;
    transform: translateX(-50%);
    background: linear-gradient(90deg, #2f81f7, #155ed5 55%, #2f81f7);
    border-radius: 3px;
    box-shadow: 0 2px 6px -2px rgba(21, 94, 213, .55);
    transition: width .45s cubic-bezier(.55, .1, .25, 1);
}

.g-nav-item.line.active {
    color: #0f1f33;
    font-weight: 600;
}

.g-nav-item.line.active::after {
    width: 100%;
}

.g-badge.dot {
    background: #ff3b30;
    color: #fff;
    font-size: 11px;
    line-height: 1;
    padding: 2px 6px;
    border-radius: 10px;
    margin-left: 6px;
    box-shadow: 0 2px 6px rgba(255, 59, 48, .45);
}

/* 响应式 */
@media (max-width: 1180px) {
    .global-top-navbar .navbar-inner {
        padding: 10px 36px 6px;
        gap: 34px;
    }

    .global-nav-links.underline-style.large-spread {
        gap: clamp(34px, 5vw, 70px);
    }
}

@media (max-width: 980px) {
    .search-box {
        display: none;
    }

    .global-top-navbar .navbar-inner {
        padding: 10px 28px 4px;
    }

    .g-nav-item.line {
        font-size: 15px;
        padding: 12px 4px 16px;
    }
}

@media (max-width: 780px) {
    .global-top-navbar .navbar-inner {
        gap: 24px;
    }

    .global-nav-links.underline-style.large-spread {
        gap: clamp(26px, 5vw, 54px);
    }

    .brand-text {
        font-size: 18px;
    }
}

@media (max-width: 660px) {
    .brand-icon {
        margin-right: 4px;
    }

    .brand-text {
        display: none;
    }

    .global-top-navbar .navbar-inner {
        padding: 8px 18px 2px;
    }

    .g-nav-item.line {
        font-size: 14px;
        padding: 10px 2px 14px;
    }
}

@media (max-width: 520px) {
    .global-nav-links.underline-style.large-spread {
        gap: 20px;
    }

    .g-nav-item.line {
        font-size: 13px;
    }

    .minimal-action {
        padding: 6px 14px;
        font-size: 12px;
    }

    .nav-actions {
        gap: 12px;
        min-width: auto;
    }
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