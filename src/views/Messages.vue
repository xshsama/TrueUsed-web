<template>
    <div class="messages-page">
        <!-- 顶部导航 -->
        <van-nav-bar title="消息" fixed />

        <div class="page-content">
            <!-- 系统通知入口 -->
            <div class="system-notice" @click="goToSystemNotice">
                <van-icon name="volume-o" size="20" color="#1989fa" />
                <div class="notice-content">
                    <div class="notice-title">系统通知</div>
                    <div class="notice-desc">您有新的系统消息，点击查看</div>
                </div>
                <van-badge :content="systemNoticeCount" />
                <van-icon name="arrow" color="#c8c9cc" />
            </div>

            <!-- 会话列表 -->
            <div class="conversation-section">
                <div class="section-header">
                    <span class="section-title">聊天</span>
                    <van-button type="primary" size="mini" plain @click="clearAllMessages">
                        清空消息
                    </van-button>
                </div>

                <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
                    <div v-if="conversationList.length > 0" class="conversation-list">
                        <div v-for="conversation in conversationList" :key="conversation.id" class="conversation-item"
                            @click="goToChat(conversation)">
                            <van-image :src="conversation.avatar" :alt="conversation.name" class="user-avatar" round
                                fit="cover" />
                            <div class="conversation-content">
                                <div class="conversation-header">
                                    <span class="user-name">{{ conversation.name }}</span>
                                    <span class="message-time">{{ conversation.time }}</span>
                                </div>
                                <div class="last-message">{{ conversation.lastMessage }}</div>
                            </div>
                            <div class="conversation-meta">
                                <van-badge v-if="conversation.unreadCount > 0" :content="conversation.unreadCount" />
                            </div>
                        </div>
                    </div>

                    <van-empty v-else image="chat-o" description="暂无消息">
                        <van-button type="primary" size="small" @click="$router.push('/home')">
                            去逛逛
                        </van-button>
                    </van-empty>
                </van-pull-refresh>
            </div>
        </div>
    </div>
</template>

<script>
import { useMessageStore } from '@/stores/message'
import { Dialog, Toast } from 'vant'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
    name: 'Messages',
    setup() {
        const router = useRouter()
        const messageStore = useMessageStore()

        const refreshing = ref(false)
        const systemNoticeCount = ref(3)
        const conversationList = ref([])

        // 模拟会话数据
        const mockConversations = [
            {
                id: 1,
                name: '张小明',
                avatar: 'https://via.placeholder.com/40x40/4CAF50/ffffff?text=张',
                lastMessage: '这个iPhone还在吗？可以面交吗？',
                time: '刚刚',
                unreadCount: 2
            },
            {
                id: 2,
                name: '李华',
                avatar: 'https://via.placeholder.com/40x40/2196F3/ffffff?text=李',
                lastMessage: '好的，那我明天下午去取',
                time: '10分钟前',
                unreadCount: 0
            },
            {
                id: 3,
                name: '王小花',
                avatar: 'https://via.placeholder.com/40x40/FF9800/ffffff?text=王',
                lastMessage: '能便宜一点吗？',
                time: '1小时前',
                unreadCount: 1
            },
            {
                id: 4,
                name: '陈大明',
                avatar: 'https://via.placeholder.com/40x40/9C27B0/ffffff?text=陈',
                lastMessage: '谢谢，商品收到了很满意',
                time: '昨天',
                unreadCount: 0
            }
        ]

        // 初始化会话列表
        conversationList.value = mockConversations

        // 计算未读消息总数
        const updateUnreadCount = () => {
            const totalUnread = conversationList.value.reduce((sum, conv) => sum + conv.unreadCount, 0)
            messageStore.setUnreadCount(totalUnread)
        }

        updateUnreadCount()

        // 下拉刷新
        const onRefresh = () => {
            setTimeout(() => {
                conversationList.value = [...mockConversations]
                refreshing.value = false
                Toast.success('刷新成功')
                updateUnreadCount()
            }, 1000)
        }

        // 跳转到系统通知
        const goToSystemNotice = () => {
            Toast('系统通知功能开发中')
            systemNoticeCount.value = 0
        }

        // 跳转到聊天页面
        const goToChat = (conversation) => {
            // 清除未读数
            conversation.unreadCount = 0
            updateUnreadCount()

            router.push(`/messages/chat/${conversation.id}`)
        }

        // 清空所有消息
        const clearAllMessages = () => {
            Dialog.confirm({
                title: '确认清空',
                message: '清空后所有聊天记录将无法恢复',
            }).then(() => {
                conversationList.value = []
                messageStore.clearUnreadCount()
                Toast.success('已清空所有消息')
            }).catch(() => {
                console.log('取消操作')
            })
        }

        return {
            refreshing,
            systemNoticeCount,
            conversationList,
            onRefresh,
            goToSystemNotice,
            goToChat,
            clearAllMessages
        }
    }
}
</script>

<style scoped>
.messages-page {
    background-color: #f7f8fa;
    min-height: 100vh;
}

.page-content {
    padding-top: 46px;
}

.system-notice {
    display: flex;
    align-items: center;
    background: #fff;
    padding: 16px;
    margin-bottom: 8px;
    border-bottom: 1px solid #f2f3f5;
}

.notice-content {
    flex: 1;
    margin-left: 12px;
}

.notice-title {
    font-size: 14px;
    font-weight: 500;
    color: #323233;
    margin-bottom: 4px;
}

.notice-desc {
    font-size: 12px;
    color: #969799;
}

.conversation-section {
    background: #fff;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #f2f3f5;
}

.section-title {
    font-size: 16px;
    font-weight: 500;
    color: #323233;
}

.conversation-item {
    display: flex;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #f2f3f5;
}

.conversation-item:last-child {
    border-bottom: none;
}

.user-avatar {
    width: 48px;
    height: 48px;
    margin-right: 12px;
}

.conversation-content {
    flex: 1;
    min-width: 0;
}

.conversation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
}

.user-name {
    font-size: 14px;
    font-weight: 500;
    color: #323233;
}

.message-time {
    font-size: 12px;
    color: #969799;
}

.last-message {
    font-size: 13px;
    color: #646566;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    overflow: hidden;
}

.conversation-meta {
    margin-left: 8px;
}
</style>