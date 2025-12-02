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
                <transition name="fade-slide" mode="out-in">
                    <div v-if="currentUser" class="chat-wrapper" :key="selectedId">
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
                                    <van-image
                                        :src="message.isSelf ? (userStore.user?.avatarUrl || userStore.user?.avatar || defaultAvatar('我')) : currentUser.avatar"
                                        class="message-avatar" round fit="cover">
                                        <template v-slot:error>
                                            <img :src="defaultAvatar(message.isSelf ? '我' : currentUser.name)"
                                                style="width: 100%; height: 100%; object-fit: cover;" />
                                        </template>
                                    </van-image>
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
                            <van-icon name="smile-o" size="28" color="#666" class="tool-icon" @click="showEmoji" />
                            <div class="input-wrapper">
                                <input v-model="inputMessage" type="text" placeholder="输入消息..."
                                    @keyup.enter="sendMessage" />
                            </div>
                            <van-icon name="photo-o" size="28" color="#666" class="tool-icon" @click="selectImage" />
                            <div class="send-btn" :class="{ 'active': inputMessage.trim() }" @click="sendMessage">
                                <span v-if="inputMessage.trim()">发送</span>
                                <van-icon v-else name="plus" size="20" color="#fff" />
                            </div>
                        </div>
                    </div>
                    <div v-else class="placeholder-empty" key="empty">
                        <van-icon name="chat-o" size="64" color="rgba(7, 193, 96, 0.15)" />
                        <div>选择左侧会话开始聊天</div>
                    </div>
                </transition>
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
import { useUserStore } from '@/stores/user'
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
        const userStore = useUserStore()

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

        // 默认头像
        const defaultAvatar = (name) => {
            return `https://ui-avatars.com/api/?name=${name || 'User'}&background=random&color=fff`
        }

        const conversationList = computed(() => messageStore.conversations.map(c => ({
            id: c.id,
            name: c.otherUserName,
            avatar: c.otherUserAvatar || defaultAvatar(c.otherUserName),
            lastMessage: c.lastMessage,
            time: c.lastMessageTime ? new Date(c.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
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
            actionSheetActions, showMoreActions, onActionSelect, goToProduct, currentUser,
            // 响应式
            isMobile, activeView, backToList,
            userStore, defaultAvatar
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
    background: #ffffff;
    border-right: 1px solid #eef0f2;
    display: flex;
    flex-direction: column;
    padding: 10px 0;
    box-sizing: border-box;
    position: relative;
}

/* 内部滚动区域整体改为圆角卡片容器视觉 */
.sidebar-scroll {
    background: transparent;
    padding: 0 10px;
}

/* 左侧整体分块（系统通知 + header + list）之间使用间距 */
.system-notice,
.sidebar-header,
.conversation-list {
    margin-bottom: 8px;
}

/* 去掉最后一个 margin */
.conversation-list:last-child {
    margin-bottom: 0;
}

/* 清理原来嵌套里重复的无效选择器（普通 CSS 不支持那样嵌套，这里重写整理） */
.sidebar-header {
    /* border: 1px solid #f1f2f3; */
    background: #fff;
    /* border-radius: 16px; */
    /* box-shadow: 0 2px 4px -2px rgba(0, 0, 0, .06), 0 1px 2px rgba(0, 0, 0, .04); */
    padding: 8px 16px;
    margin: 0 10px 8px 10px;
}

.system-notice {
    /* border: 1px solid #f2f3f5; */
    border-radius: 12px;
    /* box-shadow: 0 2px 4px -2px rgba(0, 0, 0, .06), 0 1px 2px rgba(0, 0, 0, .05); */
    background: #fff;
    transition: background .35s;
    margin: 0 10px 8px 10px;
}

.system-notice:hover {
    background: #f7f8fa;
    /* box-shadow: 0 6px 14px -6px rgba(0, 0, 0, .15); */
    /* transform: translateY(-2px); */
}

/* 会话列表改为 gap 布局容器 */
.conversation-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 2px 0;
}


.sidebar-header {
    padding: 12px 16px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    /* background: var(--blend-surface, #fff); */
    /* border: var(--border-soft, 1px solid #f1f2f3); */
    /* border-radius: var(--radius-md); */
    /* box-shadow: var(--shadow-soft); */
}

.sidebar-scroll {
    flex: 1;
    overflow-y: auto;
    background: transparent;
    /* border-radius: var(--radius-lg); */
    /* padding-right: 4px; */
}

.system-notice {
    display: flex;
    align-items: center;
    /* background: #E8F5E9; */
    padding: 12px 16px;
    cursor: pointer;
    /* border: var(--border-soft, 1px solid #f2f3f5); */
    /* border-radius: var(--radius-md); */
    /* box-shadow: var(--shadow-soft); */
    /* transition: background .35s var(--ease-standard), box-shadow .35s var(--ease-standard), transform .35s var(--ease-standard); */
}

.system-notice:hover {
    background: #f5f7fa;
    /* box-shadow: var(--shadow-medium); */
    /* transform: translateY(-2px); */
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
    gap: 2px;
    padding: 4px 0;
}

.conversation-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    cursor: pointer;
    background: #fff;
    border: none;
    border-radius: 8px;
    /* 胶囊风格 */
    /* box-shadow: 0 2px 4px -2px rgba(0, 0, 0, .05), 0 1px 2px rgba(0, 0, 0, .05); */
    position: relative;
    transition: background .2s;
    margin: 0 4px;
}

.conversation-item::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    /* box-shadow: 0 0 0 0 rgba(47, 129, 247, .35); */
    transition: box-shadow .55s;
}

.conversation-item:hover {
    background: #f5f7fa;
    /* box-shadow: 0 6px 14px -6px rgba(0, 0, 0, .14); */
    /* transform: translateY(-2px); */
}

.conversation-item.active {
    background: #F0F9F2;
    /* 淡绿色背景 */
    /* border-color: #a5d6a7; */
    /* box-shadow: 0 6px 18px -8px rgba(76, 175, 80, .35); */
}

/* 左侧指示条 */
.conversation-item.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 12px;
    bottom: 12px;
    width: 3px;
    background-color: #07c160;
    border-radius: 0 3px 3px 0;
}

.conversation-item.active::after {
    /* box-shadow: 0 0 0 2px rgba(76, 175, 80, .35); */
    display: none;
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
    padding: 0;
    /* 和左侧留白一致 */
    background: #F5F7FA;
}

.chat-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #F5F7FA;
    border: none;
    border-radius: 0;
    /* 与会话卡胶囊风格呼应，稍大 */
    /* box-shadow: 0 4px 12px -6px rgba(0, 0, 0, .12), 0 2px 6px -3px rgba(0, 0, 0, .08); */
    overflow: hidden;
    position: relative;
    /* transition: box-shadow .45s, transform .45s; */
}

.chat-wrapper:hover {
    /* box-shadow: 0 10px 26px -10px rgba(0, 0, 0, .18), 0 4px 10px -6px rgba(0, 0, 0, .12); */
}

.chat-header-desktop {
    height: 60px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    border-bottom: 1px solid #EEEEEE;
    /* backdrop-filter: blur(6px); */
}

.user-block {
    display: flex;
    align-items: center;
    gap: 12px;
}

.user-block .info .name {
    font-size: 18px;
    font-weight: bold;
    color: #333;
}

.user-block .info .sub {
    font-size: 12px;
    color: #999;
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
    padding: 20px 0 80px;
    background: #F5F7FA;
}

.message-list {
    padding: 0 20px;
}

.message-item {
    display: flex;
    margin: 16px 0;
    align-items: flex-start;
    /* 顶部对齐 */
}

.message-self {
    flex-direction: row-reverse;
}

.message-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    flex-shrink: 0;
}

.message-other .message-avatar {
    margin-right: 10px;
}

.message-self .message-avatar {
    margin-left: 10px;
}

/* 聊天内容里的头像也强制圆形 */
.message-avatar :deep(img),
.message-avatar :deep(.van-image__img) {
    border-radius: 50% !important;
    overflow: hidden;
}

.message-content {
    max-width: 60%;
    display: flex;
    flex-direction: column;
}

.message-self .message-content {
    align-items: flex-end;
}

.message-bubble {
    padding: 10px 14px;
    font-size: 15px;
    line-height: 1.5;
    word-break: break-word;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    position: relative;
}

/* 接收方（左侧）气泡 */
.message-other .message-bubble {
    background: #FFFFFF;
    color: #333333;
    border-radius: 16px 16px 16px 4px;
}

/* 发送方（右侧）气泡 */
.message-self .message-bubble {
    background: #5ABD78;
    color: #FFFFFF;
    border-radius: 16px 16px 4px 16px;
}

/* 气泡尾巴：左侧 - 移除 */
.message-other .message-bubble::after {
    display: none;
}

/* 气泡尾巴：右侧 - 移除 */
.message-self .message-bubble::after {
    display: none;
}

/* 长文本优化：在极长连续英文或 URL 情况下仍能断行 */
.message-bubble {
    word-break: break-word;
    overflow-wrap: break-word;
}

.message-image {
    border-radius: 12px;
    overflow: hidden;
    max-width: 200px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.message-image .van-image {
    width: 100%;
    height: auto;
    display: block;
}

.message-product {
    background: #fff;
    border-radius: 12px;
    padding: 12px;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    max-width: 260px;
}

.product-image {
    width: 60px;
    height: 60px;
    border-radius: 6px;
    margin-right: 12px;
    flex-shrink: 0;
}

.product-info {
    flex: 1;
    min-width: 0;
}

.product-title {
    font-size: 14px;
    color: #333;
    margin-bottom: 4px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    line-height: 1.4;
}

.product-price {
    font-size: 16px;
    font-weight: 600;
    color: #ee0a24;
}

.product-card {
    margin: 0 16px 16px;
    background: #fff;
    border-radius: 12px;
    padding: 12px;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-image {
    width: 80px;
    height: 80px;
    border-radius: 6px;
    margin-right: 12px;
}

.card-content {
    flex: 1;
    margin-right: 12px;
}

.card-title {
    font-size: 14px;
    font-weight: 500;
    color: #333;
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
    left: 20px;
    right: 20px;
    bottom: 20px;
    background: #ffffff;
    padding: 8px 12px;
    border: none;
    border-radius: 12px;
    /* pill 风格 */
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
}

.tool-icon {
    padding: 0 8px;
}

.input-wrapper {
    flex: 1;
    margin: 0 8px;
    background: #F5F5F5;
    border-radius: 20px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
}

.input-wrapper input {
    width: 100%;
    border: none;
    background: transparent;
    font-size: 15px;
    padding: 0;
    margin: 0;
    outline: none;
}

.send-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #E0E0E0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 4px;
    transition: all 0.3s;
    flex-shrink: 0;
}

.send-btn.active {
    background: #5ABD78;
    width: auto;
    padding: 0 12px;
    border-radius: 18px;
}

.send-btn span {
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
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

/* 切换动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-slide-enter-from {
    opacity: 0;
    transform: translateX(10px);
}

.fade-slide-leave-to {
    opacity: 0;
    transform: translateX(-10px);
}
</style>