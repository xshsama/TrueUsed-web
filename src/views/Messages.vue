<template>
    <div class="messages-page two-column only-chat-scroll">
        <!-- 顶部导航（统一） -->
        <van-nav-bar title="消息" fixed class="green-header" />

        <div class="messages-layout">
            <!-- 左侧：联系人 / 会话列表 -->
            <aside class="sidebar" :class="{ hidden: isMobile && activeView === 'chat' }">
                <div class="system-notice" @click="goToSystemNotice">
                    <van-icon name="volume-o" size="20" color="#07c160" />
                    <div class="notice-content">
                        <div class="notice-title">系统通知</div>
                        <div class="notice-desc">您有新的系统消息，点击查看</div>
                    </div>
                    <van-badge :content="systemNoticeCount" />
                    <van-icon name="arrow" color="#c8c9cc" />
                </div>

                <div class="sidebar-header">
                    <span class="section-title">会话</span>
                    <div class="actions">
                        <van-button color="#07c160" size="mini" plain
                            style="border: none; background: transparent; font-weight: 600;"
                            @click="clearAllMessages">清空</van-button>
                    </div>
                </div>

                <van-pull-refresh v-model="refreshing" @refresh="onRefresh" class="sidebar-scroll">
                    <div v-if="conversationList.length" class="conversation-list">
                        <div v-for="conversation in conversationList" :key="conversation.id"
                            :class="['conversation-item', { active: selectedId === conversation.id, unread: conversation.unreadCount > 0 }]"
                            @click="selectConversation(conversation)">
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
                    <van-empty v-else description="暂无消息">
                        <template #image>
                            <div style="display: flex; justify-content: center; margin-top: 90px;">
                                <van-icon name="chat-o" size="60" color="#dcdee0" />
                            </div>
                        </template>
                        <van-button type="primary" size="small" @click="$router.push('/home')">去逛逛</van-button>
                    </van-empty>
                </van-pull-refresh>
            </aside>

            <!-- 右侧：聊天区域 -->
            <section class="chat-pane" :class="{ hidden: isMobile && activeView === 'list' }">
                <div v-if="currentUser" class="chat-wrapper">
                    <div class="chat-header-mobile" v-if="isMobile">
                        <van-icon name="arrow-left" @click="backToList" />
                        <div class="title">{{ currentUser.name }}</div>
                        <van-icon name="more-o" @click="showMoreActions" />
                    </div>

                    <div class="chat-header-desktop" v-else>
                        <div class="user-block">
                            <van-image :src="currentUser.avatar" round width="40" height="40" />
                            <div class="info">
                                <div class="name">{{ currentUser.name }}</div>
                                <div class="sub">最近活跃：刚刚</div>
                            </div>
                        </div>
                        <div class="tools">
                            <van-icon name="more-o" @click="showMoreActions" />
                        </div>
                    </div>

                    <div class="chat-content" ref="chatContainer">
                        <div class="message-list">
                            <div v-for="message in messageList" :key="message.id"
                                :class="['message-item', message.isSelf ? 'message-self' : 'message-other']">
                                <van-image v-if="!message.isSelf" :src="currentUser.avatar" class="message-avatar" round
                                    fit="cover" />
                                <div class="message-content">
                                    <div v-if="message.type === 'text'" class="message-bubble">{{ message.content }}
                                    </div>
                                    <div v-else-if="message.type === 'image'" class="message-image">
                                        <van-image :src="message.content" fit="cover"
                                            @click="previewImage(message.content)" />
                                    </div>
                                    <div v-else-if="message.type === 'product'" class="message-product"
                                        @click="goToProduct(message.productId)">
                                        <van-image :src="message.productImage" class="product-image" fit="cover" />
                                        <div class="product-info">
                                            <div class="product-title">{{ message.productTitle }}</div>
                                            <div class="product-price">¥{{ message.productPrice }}</div>
                                        </div>
                                    </div>
                                </div>
                                <van-image v-if="message.isSelf" :src="selfAvatar" class="message-avatar" round
                                    fit="cover" />
                            </div>
                        </div>
                        <div v-if="productInfo" class="product-card" @click="goToProduct(productInfo.id)">
                            <van-image :src="productInfo.image" class="card-image" fit="cover" />
                            <div class="card-content">
                                <div class="card-title">{{ productInfo.title }}</div>
                                <div class="card-price">¥{{ productInfo.price }}</div>
                            </div>
                            <van-button type="primary" size="small">查看详情</van-button>
                        </div>
                    </div>

                    <div class="chat-input-bar">
                        <van-field v-model="inputMessage" placeholder="输入消息..." center @keyup.enter="sendMessage">
                            <template #left-icon>
                                <van-icon name="smile-o" @click="showEmoji" />
                            </template>
                            <template #extra>
                                <van-icon name="photo-o" @click="selectImage" style="margin-right: 8px;" />
                                <van-button type="primary" size="small" @click="sendMessage"
                                    :disabled="!inputMessage.trim()">发送</van-button>
                            </template>
                        </van-field>
                    </div>
                </div>
                <div v-else class="placeholder-empty">
                    <van-icon name="chat-o" size="64" color="rgba(7, 193, 96, 0.15)" />
                    <div>选择左侧会话开始聊天</div>
                </div>
            </section>
        </div>

        <!-- 更多操作面板 -->
        <van-action-sheet v-model:show="showActions" :actions="actionSheetActions" @select="onActionSelect"
            cancel-text="取消" />
        <input ref="imageInput" type="file" accept="image/*" style="display:none" @change="onImageSelect" />
    </div>
</template>

<script>
import { useMessageStore } from '@/stores/message'
import { useNotificationStore } from '@/stores/notification'
import { Dialog, ImagePreview, showSuccessToast, showToast } from 'vant'
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
    name: 'MessagesTwoColumn',
    setup() {
        const router = useRouter()
        const route = useRoute()
        const messageStore = useMessageStore()
        const notificationStore = useNotificationStore()

        const refreshing = ref(false)
        const systemNoticeCount = computed(() => notificationStore.unreadCount)
        // const conversationList = ref([]) // Use store
        const selectedId = ref(null)

        // 聊天相关
        const chatContainer = ref(null)
        const imageInput = ref(null)
        const inputMessage = ref('')
        // const messageList = ref([]) // Use store
        const showActions = ref(false)
        const productInfo = ref(null)
        const selfAvatar = ref('https://via.placeholder.com/40x40/FF6B6B/ffffff?text=我')

        const conversationList = computed(() => messageStore.conversations.map(c => ({
            id: c.id,
            name: c.otherUserName,
            avatar: c.otherUserAvatar || 'https://via.placeholder.com/40x40/4CAF50/ffffff?text=' + c.otherUserName.charAt(0),
            lastMessage: c.lastMessage,
            time: c.lastMessageTime ? new Date(c.lastMessageTime).toLocaleTimeString() : '',
            unreadCount: c.unreadCount,
            otherUserId: c.otherUserId
        })))

        const currentUser = computed(() => conversationList.value.find(c => c.id === selectedId.value))
        const messageList = computed(() => messageStore.messages)

        const actionSheetActions = reactive([
            { name: '发送商品', value: 'product' },
            { name: '举报用户', value: 'report' },
            { name: '删除聊天', value: 'delete', color: '#ee0a24' }
        ])

        // 响应式判断
        const isMobile = ref(false)
        const activeView = ref('list') // list | chat (仅移动端切换)
        const evaluateMobile = () => {
            isMobile.value = window.innerWidth < 800
            if (!isMobile.value) activeView.value = 'both'
            else if (activeView.value === 'both') activeView.value = 'list'
        }
        evaluateMobile()
        window.addEventListener('resize', evaluateMobile)

        // 选中会话
        const selectConversation = async (conversation) => {
            if (!conversation || !conversation.id) return
            selectedId.value = conversation.id
            // conversation.unreadCount = 0 // Handled by backend/store fetch

            // Load messages
            await messageStore.fetchMessages(conversation.id)

            productInfo.value = null // Reset product info or fetch if needed
            scrollToBottom()
            if (isMobile.value) activeView.value = 'chat'
        }

        // 路由参数回填（如果直接访问 /messages?cid=3 或未来拓展）
        onMounted(async () => {
            messageStore.connect()
            await Promise.all([
                messageStore.fetchConversations(),
                notificationStore.fetchUnreadCount()
            ])

            const cid = route.query.cid || null
            if (cid) {
                const target = conversationList.value.find(c => c.id == cid)
                if (target) selectConversation(target)
            }
        })

        onUnmounted(() => {
            // messageStore.disconnect() // Keep connected? Or disconnect? Usually keep connected in SPA.
            messageStore.clearCurrentConversation()
        })

        // Watch for new messages to scroll
        watch(() => messageStore.messages.length, () => {
            scrollToBottom()
        })

        const backToList = () => {
            activeView.value = 'list'
            selectedId.value = null
            messageStore.clearCurrentConversation()
        }

        // 下拉刷新
        const onRefresh = async () => {
            await Promise.all([
                messageStore.fetchConversations(),
                notificationStore.fetchUnreadCount()
            ])
            refreshing.value = false
            showSuccessToast('刷新成功')
        }

        const goToSystemNotice = () => {
            router.push('/notifications')
        }

        // 消息滚动底部
        const scrollToBottom = () => {
            nextTick(() => {
                if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight
            })
        }

        // 发送消息
        const sendMessage = () => {
            if (!selectedId.value) return showToast('请选择会话')
            const text = inputMessage.value.trim()
            if (!text) return

            const conversation = conversationList.value.find(c => c.id === selectedId.value)
            if (conversation) {
                messageStore.sendMessage(conversation.otherUserId, text)
                inputMessage.value = ''
                // Optimistic update is handled by store or waiting for echo
            }
        }

        const selectImage = () => { imageInput.value?.click() }
        const onImageSelect = (e) => {
            const file = e.target.files[0]
            if (!file) return
            // TODO: Upload image then send URL
            showToast('图片发送功能开发中')
            e.target.value = ''
        }
        const previewImage = (url) => ImagePreview([url])
        const showEmoji = () => showToast('表情功能开发中')
        const showMoreActions = () => showActions.value = true
        const onActionSelect = (action) => {
            switch (action.value) {
                case 'product': showToast('发送商品功能开发中'); break
                case 'report': showToast('举报功能开发中'); break
                case 'delete':
                    Dialog.confirm({ title: '确认删除', message: '删除后聊天记录将无法恢复' }).then(() => {
                        // messageList.value = []
                        showSuccessToast('已删除')
                    })
                    break
            }
            showActions.value = false
        }

        const goToProduct = (id) => router.push(`/product/${id}`)

        const clearAllMessages = () => {
            Dialog.confirm({ title: '确认清空', message: '清空后所有聊天记录将无法恢复' })
                .then(() => {
                    // conversationList.value = []
                    // selectedId.value = null
                    // messageList.value = []
                    // messageStore.clearUnreadCount()
                    showSuccessToast('已清空所有消息')
                })
        }

        return {
            // 列表
            refreshing, systemNoticeCount, conversationList, onRefresh, goToSystemNotice,
            selectedId, selectConversation, clearAllMessages,
            // 聊天
            chatContainer, imageInput, inputMessage, messageList, sendMessage,
            selectImage, onImageSelect, previewImage, showEmoji, productInfo, showActions,
            actionSheetActions, showMoreActions, onActionSelect, goToProduct, selfAvatar, currentUser,
            // 响应式
            isMobile, activeView, backToList
        }
    }
}
</script>

<style scoped>
/* Header Green */
:deep(.van-nav-bar) {
    --van-nav-bar-background: #07c160;
    --van-nav-bar-title-text-color: #fff;
    --van-nav-bar-icon-color: #fff;
}

.messages-page {
    background: #f5f7fa;
    min-height: 100vh;
    position: fixed;
    /* 固定整页 */
    inset: 0;
    /* 填满视口 */
    overflow: hidden;
    /* 禁止外层滚动 */
}

/* 仅聊天区域允许滚动：锁定侧栏 */
.only-chat-scroll .sidebar-scroll {
    overflow: hidden !important;
}

.only-chat-scroll .sidebar-scroll .conversation-list {
    overscroll-behavior: none;
}

/* 防止出现多余滚动条占位 */
.only-chat-scroll .sidebar-scroll::-webkit-scrollbar {
    display: none;
}

.messages-layout {
    padding-top: 46px;
    display: flex;
    height: calc(100vh - 46px);
    overflow: hidden;
}

/* 左侧列表 */
.sidebar {
    width: 320px;
    background: linear-gradient(145deg, #f1f4f8, #ffffff);
    border-right: 1px solid #eef0f2;
    display: flex;
    flex-direction: column;
    padding: 10px 14px 14px 14px;
    /* 加内边距形成留白 */
    box-sizing: border-box;
    position: relative;
}

/* 内部滚动区域整体改为圆角卡片容器视觉 */
.sidebar-scroll {
    background: transparent;
}

/* 左侧整体分块（系统通知 + header + list）之间使用间距 */
.system-notice,
.sidebar-header,
.conversation-list {
    margin-bottom: 12px;
}

/* 去掉最后一个 margin */
.conversation-list:last-child {
    margin-bottom: 0;
}

/* 清理原来嵌套里重复的无效选择器（普通 CSS 不支持那样嵌套，这里重写整理） */
.sidebar-header {
    border: 1px solid #f1f2f3;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 2px 4px -2px rgba(0, 0, 0, .06), 0 1px 2px rgba(0, 0, 0, .04);
    padding: 12px 16px;
}

.system-notice {
    border: 1px solid #f2f3f5;
    border-radius: 18px;
    box-shadow: 0 2px 4px -2px rgba(0, 0, 0, .06), 0 1px 2px rgba(0, 0, 0, .05);
    background: #fff;
    transition: box-shadow .35s, transform .35s, background .35s;
}

.system-notice:hover {
    background: #ffffff;
    box-shadow: 0 6px 14px -6px rgba(0, 0, 0, .15);
    transform: translateY(-2px);
}

/* 会话列表改为 gap 布局容器 */
.conversation-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 2px 2px 4px 2px;
}


.sidebar-header {
    padding: 12px 16px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--blend-surface, #fff);
    border: var(--border-soft, 1px solid #f1f2f3);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-soft);
}

.sidebar-scroll {
    flex: 1;
    overflow-y: auto;
    background: transparent;
    border-radius: var(--radius-lg);
    padding-right: 4px;
}

.system-notice {
    display: flex;
    align-items: center;
    background: #E8F5E9;
    padding: 14px 16px;
    cursor: pointer;
    border: var(--border-soft, 1px solid #f2f3f5);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-soft);
    transition: background .35s var(--ease-standard), box-shadow .35s var(--ease-standard), transform .35s var(--ease-standard);
}

.system-notice:hover {
    background: #e0f2f1;
    box-shadow: var(--shadow-medium);
    transform: translateY(-2px);
}

.notice-content {
    flex: 1;
    margin-left: 12px;
}

.notice-title {
    font-size: 14px;
    font-weight: 600;
    color: #2d3033;
    margin-bottom: 2px;
}

.notice-desc {
    font-size: 12px;
    color: #9aa0a6;
}

.conversation-list {
    min-height: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 4px 4px 12px 2px;
}

.conversation-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px 12px 12px;
    cursor: pointer;
    background: #fff;
    border: 1px solid #eef0f2;
    border-radius: 20px;
    /* 胶囊风格 */
    box-shadow: 0 2px 4px -2px rgba(0, 0, 0, .05), 0 1px 2px rgba(0, 0, 0, .05);
    position: relative;
    transition: background .35s, box-shadow .35s, transform .35s, border-color .35s;
}

.conversation-item::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    box-shadow: 0 0 0 0 rgba(47, 129, 247, .35);
    transition: box-shadow .55s;
}

.conversation-item:hover {
    background: #ffffff;
    box-shadow: 0 6px 14px -6px rgba(0, 0, 0, .14);
    transform: translateY(-2px);
}

.conversation-item.active {
    background: linear-gradient(150deg, #e8f5e9, #ffffff 60%);
    border-color: #a5d6a7;
    box-shadow: 0 6px 18px -8px rgba(76, 175, 80, .35);
}

.conversation-item.active::after {
    box-shadow: 0 0 0 2px rgba(76, 175, 80, .35);
}

/* Unread Styles */
.conversation-item.unread .user-name {
    font-weight: 800;
}

.conversation-item.unread .last-message {
    color: #333;
    font-weight: 500;
}

.user-avatar {
    width: 48px;
    height: 48px;
    margin-right: 12px;
    flex-shrink: 0;
    background: #f1f8e9;
    border: 1px solid #c8e6c9;
    box-sizing: border-box;
}

/* 头像圆形统一修正（避免被外层样式覆盖仍显示成矩形） */
.user-avatar :deep(img),
.user-avatar :deep(.van-image__img),
.user-block :deep(.van-image),
.user-block :deep(.van-image__img),
.chat-header-mobile :deep(.van-image),
.chat-header-mobile :deep(.van-image__img) {
    border-radius: 50% !important;
    overflow: hidden;
}

/* 如果还存在历史缓存或第三方样式干扰，进一步直接匹配含 round 属性的 van-image */
:deep(.van-image--round) {
    border-radius: 50% !important;
}

/* 可选：如果需要所有头像在 hover 时稍微提升视觉反馈，可取消注释
.user-avatar:hover :deep(img),
.message-avatar:hover :deep(img),
.user-block :deep(.van-image):hover img {
    box-shadow: 0 0 0 2px rgba(25,137,250,.15);
}
*/

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
    font-weight: 600;
    color: #303437;
}

.message-time {
    font-size: 12px;
    color: #757575;
}

.last-message {
    font-size: 13px;
    color: #5c636a;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    overflow: hidden;
}

.conversation-meta {
    margin-left: 8px;
}

/* 右侧聊天面板 */
.chat-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    padding: 10px 14px 14px 10px;
    /* 和左侧留白一致 */
    background: linear-gradient(145deg, #f1f4f8, #ffffff);
}

.chat-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #fff;
    border: 1px solid #eef0f2;
    border-radius: 22px;
    /* 与会话卡胶囊风格呼应，稍大 */
    box-shadow: 0 4px 12px -6px rgba(0, 0, 0, .12), 0 2px 6px -3px rgba(0, 0, 0, .08);
    overflow: hidden;
    position: relative;
    transition: box-shadow .45s, transform .45s;
}

.chat-wrapper:hover {
    box-shadow: 0 10px 26px -10px rgba(0, 0, 0, .18), 0 4px 10px -6px rgba(0, 0, 0, .12);
}

.chat-header-desktop {
    height: 60px;
    padding: 12px 22px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(255, 255, 255, 0.85);
    border-bottom: 1px solid rgba(230, 233, 238, .65);
    backdrop-filter: blur(6px);
}

.user-block {
    display: flex;
    align-items: center;
    gap: 12px;
}

.user-block .info .name {
    font-size: 16px;
    font-weight: 600;
}

.user-block .info .sub {
    font-size: 12px;
    color: #9097a1;
    margin-top: 2px;
}

.chat-header-mobile {
    height: 50px;
    display: flex;
    align-items: center;
    padding: 0 14px;
    gap: 12px;
    background: rgba(255, 255, 255, 0.85);
    border-bottom: 1px solid rgba(230, 233, 238, .65);
    backdrop-filter: blur(6px);
}

.chat-header-mobile .title {
    flex: 1;
    font-weight: 600;
}

.chat-content {
    flex: 1;
    overflow-y: auto;
    padding: 14px 0 92px;
    background: radial-gradient(circle at 24% 16%, #f7f9fc, #f1f4f7 78%);
}

.message-list {
    padding: 0 16px 12px;
}

.message-item {
    display: flex;
    margin: 14px 0;
    align-items: flex-end;
}

.message-self {
    flex-direction: row-reverse;
}

.message-avatar {
    width: 40px;
    height: 40px;
    margin: 0 8px;
}

/* 聊天内容里的头像也强制圆形 */
.message-avatar :deep(img),
.message-avatar :deep(.van-image__img) {
    border-radius: 50% !important;
    overflow: hidden;
}

.message-content {
    max-width: 62%;
}

.message-bubble {
    background: #fff;
    padding: 10px 16px 11px;
    border-radius: 28px 28px 28px 10px;
    /* 左侧普通消息更圆润 */
    box-shadow: 0 4px 10px -4px rgba(0, 0, 0, .12), 0 2px 4px -2px rgba(0, 0, 0, .08);
    word-break: break-word;
    font-size: 14px;
    line-height: 1.55;
    position: relative;
    transition: box-shadow .35s var(--ease-standard), transform .35s var(--ease-standard), background .35s var(--ease-standard);
    --bubble-bg: #ffffff;
    background: linear-gradient(145deg, var(--bubble-bg), #f7f9fc);
}

.message-other .message-bubble {
    border: 1px solid #e0e0e0;
}

.message-bubble:hover {
    box-shadow: 0 6px 16px -6px rgba(0, 0, 0, .18);
}

.message-self .message-bubble {
    --bubble-bg: #07c160;
    background: linear-gradient(150deg, #07c160, #06ad56 60%, #05964b);
    color: #fff;
    border-radius: 28px 28px 10px 28px;
    /* 自己消息圆角 */
}

/* 气泡尾巴：左侧 */
.message-other .message-bubble::after {
    content: '';
    position: absolute;
    left: -6px;
    bottom: 8px;
    width: 14px;
    height: 14px;
    background: inherit;
    border-bottom-right-radius: 12px;
    transform: rotate(40deg);
    box-shadow: 2px 2px 4px -2px rgba(0, 0, 0, .12);
}

/* 气泡尾巴：右侧 */
.message-self .message-bubble::after {
    content: '';
    position: absolute;
    right: -6px;
    bottom: 8px;
    width: 14px;
    height: 14px;
    background: inherit;
    border-bottom-left-radius: 12px;
    transform: rotate(-40deg);
    filter: brightness(1.05);
    box-shadow: -2px 2px 4px -2px rgba(0, 0, 0, .18);
}

/* 长文本优化：在极长连续英文或 URL 情况下仍能断行 */
.message-bubble {
    word-break: break-word;
    overflow-wrap: break-word;
}

.message-image {
    border-radius: 14px;
    overflow: hidden;
    max-width: 240px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, .12);
}

.message-image .van-image {
    width: 100%;
    height: auto;
}

.message-product {
    background: var(--blend-surface, #fff);
    border-radius: var(--radius-lg);
    padding: 10px 12px;
    display: flex;
    align-items: center;
    box-shadow: var(--shadow-soft);
    max-width: 280px;
    border: var(--border-soft);
}

.product-image {
    width: 60px;
    height: 60px;
    border-radius: 10px;
    margin-right: 12px;
}

.product-info {
    flex: 1;
}

.product-title {
    font-size: 14px;
    color: #323233;
    margin-bottom: 4px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
}

.product-price {
    font-size: 15px;
    font-weight: 600;
    color: #ee0a24;
}

.product-card {
    margin: 0 16px 16px;
    background: var(--blend-surface, #fff);
    border-radius: var(--radius-lg);
    padding: 12px;
    display: flex;
    align-items: center;
    box-shadow: var(--shadow-soft);
    border: var(--border-soft);
    transition: box-shadow .35s var(--ease-standard), transform .35s var(--ease-standard);
}

.product-card:hover {
    box-shadow: var(--shadow-medium);
    transform: translateY(-2px);
}

.card-image {
    width: 80px;
    height: 80px;
    border-radius: 14px;
    margin-right: 12px;
}

.card-content {
    flex: 1;
    margin-right: 12px;
}

.card-title {
    font-size: 14px;
    font-weight: 500;
    color: #323233;
    margin-bottom: 8px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
}

.card-price {
    font-size: 16px;
    font-weight: 600;
    color: #ee0a24;
}

.chat-input-bar {
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: 12px;
    background: #ffffff;
    padding: 6px 10px 8px;
    border: 1px solid #eef0f2;
    border-radius: 999px;
    /* pill 风格 */
    box-shadow: 0 2px 6px -2px rgba(0, 0, 0, .08), 0 1px 2px rgba(0, 0, 0, .06);
}

.placeholder-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    color: #9aa0a6;
    font-size: 18px;
    gap: 16px;
}

/* 隐藏类（移动端切换） */
.hidden {
    display: none !important;
}

/* 滚动条美化（仅桌面） */
@media (hover:hover) {

    .sidebar-scroll::-webkit-scrollbar,
    .chat-content::-webkit-scrollbar {
        width: 6px;
    }

    .sidebar-scroll::-webkit-scrollbar-track,
    .chat-content::-webkit-scrollbar-track {
        background: transparent;
    }

    .sidebar-scroll::-webkit-scrollbar-thumb,
    .chat-content::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, .15);
        border-radius: 4px;
    }

    .sidebar-scroll::-webkit-scrollbar-thumb:hover,
    .chat-content::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 0, 0, .28);
    }
}

/* 响应式 */
@media (max-width: 1100px) {
    .sidebar {
        width: 280px;
    }
}

@media (max-width: 920px) {
    .sidebar {
        width: 250px;
    }

    .message-content {
        max-width: 68%;
    }
}

@media (max-width: 800px) {
    .messages-layout {
        flex-direction: column;
        padding-top: 46px;
        height: auto;
    }

    .sidebar,
    .chat-pane {
        width: 100%;
        border-right: none;
        padding: 0;
        /* 移动端取消外围留白 */
        background: #f5f7fa;
    }

    .sidebar {
        height: calc(100vh - 46px);
    }

    .chat-pane {
        height: calc(100vh - 46px);
    }

    .chat-wrapper {
        border-radius: 0;
        box-shadow: none;
        border: none;
    }

    .chat-input-bar {
        left: 8px;
        right: 8px;
        bottom: 8px;
    }

    .chat-content {
        padding: 12px 0 78px;
    }
}

@media (max-width: 520px) {
    .message-content {
        max-width: 74%;
    }

    .conversation-item {
        padding: 12px 14px;
    }
}
</style>