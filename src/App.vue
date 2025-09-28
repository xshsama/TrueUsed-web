<template>
    <div id="app">
        <router-view />

        <!-- 底部导航栏 -->
        <van-tabbar v-model="active" @change="onTabChange" fixed placeholder>
            <van-tabbar-item icon="home-o" to="/home">首页</van-tabbar-item>
            <van-tabbar-item icon="star-o" to="/favorites">收藏</van-tabbar-item>
            <van-tabbar-item icon="plus" to="/post">卖出</van-tabbar-item>
            <van-tabbar-item icon="chat-o" to="/messages" :badge="unreadCount || null">消息</van-tabbar-item>
            <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
        </van-tabbar>
    </div>
</template>

<script>
import { computed, ref } from 'vue'
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

        // 监听路由变化
        router.beforeEach(() => {
            updateActiveTab()
        })

        updateActiveTab()

        return {
            active,
            unreadCount,
            onTabChange
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

/* 隐藏某些页面的底部导航栏 */
.hide-tabbar .van-tabbar {
    display: none !important;
}
</style>