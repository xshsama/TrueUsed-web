<template>
    <div class="notifications-page">
        <van-nav-bar title="消息通知" left-arrow @click-left="$router.back()" fixed placeholder>
            <template #right>
                <span class="read-all-btn" @click="handleMarkAllRead">全部已读</span>
            </template>
        </van-nav-bar>

        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
            <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
                <template v-if="notifications.length === 0 && !loading">
                    <van-empty description="暂无消息" />
                </template>
                <div v-for="item in notifications" :key="item.id" class="notification-item"
                    :class="{ 'unread': !item.read }" @click="handleItemClick(item)">
                    <div class="notification-icon">
                        <van-icon :name="getIcon(item.type)" :color="getIconColor(item.type)" size="24" />
                    </div>
                    <div class="notification-content">
                        <div class="notification-header">
                            <span class="notification-title">{{ item.title }}</span>
                            <span class="notification-time">{{ formatTime(item.createdAt) }}</span>
                        </div>
                        <div class="notification-body">{{ item.content }}</div>
                    </div>
                    <div class="unread-dot" v-if="!item.read"></div>
                </div>
            </van-list>
        </van-pull-refresh>
    </div>
</template>

<script setup>
import { getNotifications, markAllAsRead, markAsRead } from '@/api/notifications';
import { showSuccessToast, showToast } from 'vant';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const notifications = ref([]);
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const page = ref(0);
const size = 20;

const onLoad = async () => {
    if (refreshing.value) {
        notifications.value = [];
        refreshing.value = false;
    }

    try {
        const res = await getNotifications({ page: page.value, size });
        const list = res.content || [];
        notifications.value.push(...list);

        page.value++;
        if (list.length < size) {
            finished.value = true;
        }
    } catch (error) {
        finished.value = true;
        console.error(error);
    } finally {
        loading.value = false;
    }
};

const onRefresh = () => {
    finished.value = false;
    loading.value = true;
    page.value = 0;
    onLoad();
};

const handleMarkAllRead = async () => {
    try {
        await markAllAsRead();
        showSuccessToast('已全部标记为已读');
        notifications.value.forEach(n => n.read = true);
    } catch (error) {
        showToast('操作失败');
    }
};

const handleItemClick = async (item) => {
    if (!item.read) {
        try {
            await markAsRead(item.id);
            item.read = true;
        } catch (e) {
            console.error(e);
        }
    }

    // 根据类型跳转
    if (item.type.startsWith('ORDER_')) {
        router.push(`/order/${item.relatedId}`);
    } else if (item.type.startsWith('REFUND_')) {
        router.push(`/order/${item.relatedId}/refund-detail`);
    }
};

const getIcon = (type) => {
    if (type.includes('ORDER')) return 'orders-o';
    if (type.includes('REFUND')) return 'refund-o';
    return 'bell';
};

const getIconColor = (type) => {
    if (type.includes('ORDER')) return '#1989fa';
    if (type.includes('REFUND')) return '#ee0a24';
    return '#ff976a';
};

const formatTime = (time) => {
    if (!time) return '';
    const date = new Date(time);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
    return date.toLocaleDateString();
};
</script>

<style scoped>
.notifications-page {
    min-height: 100vh;
    background: #f7f8fa;
}

.read-all-btn {
    font-size: 14px;
    color: #1989fa;
    cursor: pointer;
}

.notification-item {
    display: flex;
    padding: 16px;
    background: #fff;
    margin-bottom: 1px;
    position: relative;
    transition: background 0.2s;
}

.notification-item:active {
    background: #f5f5f5;
}

.notification-item.unread {
    background: #fff;
}

.notification-icon {
    margin-right: 12px;
    display: flex;
    align-items: flex-start;
    padding-top: 2px;
}

.notification-content {
    flex: 1;
    min-width: 0;
}

.notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
}

.notification-title {
    font-size: 15px;
    font-weight: 500;
    color: #323233;
}

.notification-time {
    font-size: 12px;
    color: #969799;
}

.notification-body {
    font-size: 13px;
    color: #646566;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.unread-dot {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 8px;
    height: 8px;
    background: #ee0a24;
    border-radius: 50%;
}
</style>
