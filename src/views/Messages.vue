<template>
    <div class="messages-page two-column only-chat-scroll">
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

                            <div class="avatar-wrapper">
                                <van-image :src="conversation.avatar" :alt="conversation.name" class="user-avatar" round
                                    fit="cover" />
                                <van-image :src="conversation.productThumb" class="mini-product-thumb" fit="cover" />
                            </div>

                            <div class="conversation-content">
                                <div class="conversation-header">
                                    <span class="user-name">{{ conversation.name }}</span>
                                    <div class="time-status-col">
                                        <span class="message-time">{{ conversation.time }}</span>
                                        <span class="status-tag" :style="{ color: conversation.statusColor }">[{{
                                            conversation.status }}]</span>
                                    </div>
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

                        <!-- 聊天头部 -->
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

                        <!-- 安全提示 (Trust & Safety) -->
                        <div class="safety-warning">
                            温馨提示：请勿脱离平台私下转账，谨防诈骗。
                        </div>

                        <!-- 悬浮商品卡片 (Sticky Product Card) -->
                        <div class="sticky-product-card" v-if="productInfo" @click="goToProduct(productInfo.id)">
                            <van-image :src="productInfo.image" class="card-thumb" fit="cover" radius="4" />
                            <div class="card-info">
                                <div class="card-title">{{ productInfo.title }}</div>
                                <div class="card-price">¥{{ productInfo.price }}</div>
                            </div>
                            <div class="card-actions">
                                <template v-if="isBuyer">
                                    <van-button size="small" round plain type="success"
                                        class="action-btn">发起砍价</van-button>
                                    <van-button size="small" round type="success" class="action-btn">立即购买</van-button>
                                </template>
                                <template v-else>
                                    <van-button size="small" round plain type="warning"
                                        class="action-btn">修改价格</van-button>
                                    <van-button size="small" round type="warning" class="action-btn">标记已售</van-button>
                                </template>
                            </div>
                        </div>

                        <!-- 聊天内容 -->
                        <div class="chat-content" ref="chatContainer">
                            <div class="message-list">
                                <!-- 顶部系统消息示例 -->
                                <div class="system-message-item">
                                    <span>为了资金安全，请勿微信转账</span>
                                </div>

                                <div v-for="message in messageList" :key="message.id">
                                    <!-- 系统消息插值 (Mock logic) -->
                                    <div v-if="message.type === 'system'" class="system-message-item">
                                        <span>{{ message.content }}</span>
                                    </div>

                                    <!-- 常规消息 -->
                                    <div v-else
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
                                            <div v-if="message.type === 'text'" class="message-bubble">{{
                                                message.content }}</div>
                                            <div v-else-if="message.type === 'image'" class="message-image">
                                                <van-image :src="message.content" fit="cover"
                                                    @click="previewImage(message.content)" />
                                            </div>
                                            <div v-else-if="message.type === 'product'" class="message-product"
                                                @click="goToProduct(message.productId)">
                                                <van-image :src="message.productImage" class="product-image"
                                                    fit="cover" />
                                                <div class="product-info">
                                                    <div class="product-title">{{ message.productTitle }}</div>
                                                    <div class="product-price">¥{{ message.productPrice }}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 底部输入区 -->
                        <div class="chat-input-area">
                            <!-- 智能短语 Chips (Smart Replies) -->
                            <div class="smart-chips">
                                <div class="chip" v-for="phrase in smartPhrases" :key="phrase"
                                    @click="sendQuickMessage(phrase)">
                                    {{ phrase }}
                                </div>
                            </div>

                            <div class="chat-input-bar">
                                <van-icon name="smile-o" size="28" color="#666" class="tool-icon" @click="showEmoji" />
                                <div class="input-wrapper">
                                    <input v-model="inputMessage" type="text" placeholder="输入消息..."
                                        @keyup.enter="sendMessage" />
                                </div>
                                <van-icon name="photo-o" size="28" color="#666" class="tool-icon"
                                    @click="selectImage" />
                                <div class="send-btn" :class="{ 'active': inputMessage.trim() }" @click="sendMessage">
                                    <span v-if="inputMessage.trim()">发送</span>
                                    <van-icon v-else name="plus" size="20" color="#fff" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 空状态占位 -->
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
        const selectedId = ref(null)

        // 聊天相关
        const chatContainer = ref(null)
        const imageInput = ref(null)
        const inputMessage = ref('')
        const showActions = ref(false)
        const isBuyer = ref(true) // Role toggle for demo

        // Mock Product Info
        const productInfo = ref({
            id: 101,
            title: 'iPhone 13 128G 国行正品 保修期内',
            price: 4500,
            image: 'https://img.yzcdn.cn/vant/apple-1.jpg'
        })

        // Smart Replies
        const buyerPhrases = ['还在吗？', '可以刀吗？', '什么时候能发货？', '成色怎么样？', '有瑕疵吗？']
        const sellerPhrases = ['不议价哦', '今天能发', '在这个链接拍就行', '看详情页描述', '已经是底价了']
        const smartPhrases = computed(() => isBuyer.value ? buyerPhrases : sellerPhrases)

        // 默认头像
        const defaultAvatar = (name) => {
            return `https://ui-avatars.com/api/?name=${name || 'User'}&background=random&color=fff`
        }

        const conversationList = computed(() => messageStore.conversations.map(c => {
            // Mock status logic for demo
            const statuses = [
                { text: '待发货', color: '#ff976a' },
                { text: '已发货', color: '#07c160' },
                { text: '交易关闭', color: '#969799' },
                { text: '求购中', color: '#1989fa' }
            ]
            const mockStatus = statuses[c.id % statuses.length]

            return {
                id: c.id,
                name: c.otherUserName,
                avatar: c.otherUserAvatar || defaultAvatar(c.otherUserName),
                lastMessage: c.lastMessage,
                time: c.lastMessageTime ? new Date(c.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                unreadCount: c.unreadCount,
                otherUserId: c.otherUserId,
                productThumb: 'https://img.yzcdn.cn/vant/apple-1.jpg', // Mock product thumb
                status: mockStatus.text,
                statusColor: mockStatus.color
            }
        }))

        const currentUser = computed(() => conversationList.value.find(c => c.id === selectedId.value))
        const messageList = computed(() => messageStore.messages)

        const actionSheetActions = reactive([
            { name: '切换角色(演示用)', value: 'switchRole' },
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

            await messageStore.fetchMessages(conversation.id)

            // Mock product info reset logic, ideally fetch from backend conversation context
            productInfo.value = {
                id: 101,
                title: 'iPhone 13 128G 国行正品 保修期内',
                price: 4500,
                image: 'https://img.yzcdn.cn/vant/apple-1.jpg'
            }

            scrollToBottom()
            if (isMobile.value) activeView.value = 'chat'
        }

        // 路由参数回填
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
            messageStore.clearCurrentConversation()
        })

        watch(() => messageStore.messages.length, () => {
            scrollToBottom()
        })

        const backToList = () => {
            activeView.value = 'list'
            selectedId.value = null
            messageStore.clearCurrentConversation()
        }

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

        const scrollToBottom = () => {
            nextTick(() => {
                if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight
            })
        }

        const sendMessage = () => {
            if (!selectedId.value) return showToast('请选择会话')
            const text = inputMessage.value.trim()
            if (!text) return

            const conversation = conversationList.value.find(c => c.id === selectedId.value)
            if (conversation) {
                messageStore.sendMessage(conversation.otherUserId, text)
                inputMessage.value = ''
            }
        }

        const sendQuickMessage = (msg) => {
            inputMessage.value = msg;
            sendMessage();
        }

        const selectImage = () => { imageInput.value?.click() }
        const onImageSelect = (e) => {
            const file = e.target.files[0]
            if (!file) return
            showToast('图片发送功能开发中')
            e.target.value = ''
        }
        const previewImage = (url) => ImagePreview([url])
        const showEmoji = () => showToast('表情功能开发中')
        const showMoreActions = () => showActions.value = true
        const onActionSelect = (action) => {
            switch (action.value) {
                case 'switchRole':
                    isBuyer.value = !isBuyer.value;
                    showToast(`已切换为${isBuyer.value ? '买家' : '卖家'}视角`)
                    break
                case 'product': showToast('发送商品功能开发中'); break
                case 'report': showToast('举报功能开发中'); break
                case 'delete':
                    Dialog.confirm({ title: '确认删除', message: '删除后聊天记录将无法恢复' }).then(() => {
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
                    showSuccessToast('已清空所有消息')
                })
        }

        return {
            refreshing, systemNoticeCount, conversationList, onRefresh, goToSystemNotice,
            selectedId, selectConversation, clearAllMessages,
            chatContainer, imageInput, inputMessage, messageList, sendMessage, sendQuickMessage,
            selectImage, onImageSelect, previewImage, showEmoji, productInfo, showActions,
            actionSheetActions, showMoreActions, onActionSelect, goToProduct, currentUser,
            isMobile, activeView, backToList,
            userStore, defaultAvatar, smartPhrases, isBuyer
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
    top: 72px;
    /* Height of Global Navbar */
    left: 0;
    right: 0;
    bottom: 0;
    bottom: env(safe-area-inset-bottom);
    overflow: hidden;
    overscroll-behavior: none;
    /* Prevent bounce */
    --brand-green: #4FA37F;
    z-index: 100;
    display: flex;
    flex-direction: column;
}

/* 仅聊天区域允许滚动：锁定侧栏 */
.only-chat-scroll .sidebar-scroll {
    overflow: hidden !important;
}

.only-chat-scroll .sidebar-scroll .conversation-list {
    overscroll-behavior: none;
}

.only-chat-scroll .sidebar-scroll::-webkit-scrollbar {
    display: none;
}

/* Prevent whole page bounce */
.sidebar-scroll,
.chat-content {
    overscroll-behavior-y: contain;
    -webkit-overflow-scrolling: touch;
}

/* Headers should not trigger scroll */
.green-header,
.chat-header-mobile,
.chat-header-desktop,
.safety-warning,
.sticky-product-card,
.sidebar-header,
.system-notice {
    touch-action: none;
}

.messages-layout {
    display: flex;
    flex: 1;
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

.sidebar-scroll {
    background: transparent;
    padding: 0 10px;
}

.system-notice,
.sidebar-header,
.conversation-list {
    margin-bottom: 8px;
}

.conversation-list:last-child {
    margin-bottom: 0;
}

.sidebar-header {
    background: #fff;
    padding: 8px 16px;
    margin: 0 10px 8px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.system-notice {
    border-radius: 12px;
    background: #fff;
    transition: background .35s;
    margin: 0 10px 8px 10px;
    display: flex;
    align-items: center;
    padding: 12px 16px;
    cursor: pointer;
}

.system-notice:hover {
    background: #f7f8fa;
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
    position: relative;
    transition: background .2s;
    margin: 0 4px;
}

.conversation-item:hover {
    background: #f5f7fa;
}

.conversation-item.active {
    background: #F0FDF4;
}

.conversation-item.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 12px;
    bottom: 12px;
    width: 3px;
    background-color: #00875A;
    border-radius: 0 3px 3px 0;
}

.avatar-wrapper {
    position: relative;
    margin-right: 12px;
}

.user-avatar {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    background: #f1f8e9;
    border: 1px solid #c8e6c9;
    box-sizing: border-box;
    border-radius: 50%;
}

.mini-product-thumb {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: 2px solid #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 2;
}

.conversation-content {
    flex: 1;
    min-width: 0;
}

.conversation-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 4px;
}

.time-status-col {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.user-name {
    font-size: 14px;
    font-weight: 600;
    color: #303437;
}

.message-time {
    font-size: 12px;
    color: #999;
}

.status-tag {
    font-size: 10px;
    margin-top: 2px;
    font-weight: 500;
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

/* Chat Pane */
.chat-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    padding: 0;
    background: #F5F7FA;
}

.chat-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #F5F7FA;
    border: none;
    overflow: hidden;
    position: relative;
}

.chat-header-desktop {
    height: 60px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    border-bottom: 1px solid #EEEEEE;
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

/* Safety Warning */
.safety-warning {
    background: #FFFBE6;
    color: #FAAD14;
    font-size: 12px;
    padding: 8px 16px;
    text-align: center;
    z-index: 10;
}

/* Sticky Product Card */
.sticky-product-card {
    background: #fff;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #f0f0f0;
    z-index: 10;
}

.card-thumb {
    width: 48px;
    height: 48px;
    border-radius: 4px;
    margin-right: 12px;
    border: 1px solid #f5f5f5;
}

.card-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-right: 12px;
    min-width: 0;
}

.card-title {
    font-size: 14px;
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.card-price {
    font-size: 16px;
    font-weight: 700;
    color: #E88F4F;
}

.card-actions {
    display: flex;
    gap: 8px;
}

.action-btn {
    height: 28px;
    padding: 0 12px;
    font-size: 12px;
}

/* Chat Content */
.chat-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px 0;
    background: #F5F7FA;
}

.message-list {
    padding: 0 20px;
}

/* System Message */
.system-message-item {
    text-align: center;
    margin: 16px 0;
}

.system-message-item span {
    background: rgba(0, 0, 0, 0.05);
    color: #999;
    font-size: 12px;
    padding: 4px 12px;
    border-radius: 4px;
}

.message-item {
    display: flex;
    margin: 16px 0;
    align-items: flex-start;
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

/* Left (Other) Bubble */
.message-other .message-bubble {
    background: #FFFFFF;
    color: #333333;
    border-radius: 16px 16px 16px 4px;
}

/* Right (Self) Bubble */
.message-self .message-bubble {
    background: #5ABD78;
    color: #FFFFFF;
    border-radius: 16px 16px 4px 16px;
}

.message-image {
    border-radius: 12px;
    overflow: hidden;
    max-width: 200px;
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

/* Chat Input Area */
.chat-input-area {
    background: #fff;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.03);
    /* Position relative/fixed depends on layout strategy, here inside flex so just background */
    padding-bottom: 10px;
}

.smart-chips {
    display: flex;
    gap: 8px;
    padding: 10px 12px;
    overflow-x: auto;
    background: #F9FAFB;
    border-bottom: 1px solid #F3F4F6;
    scrollbar-width: none;
}

.smart-chips::-webkit-scrollbar {
    display: none;
}

.chip {
    background: #fff;
    border: 1px solid #E5E7EB;
    border-radius: 16px;
    padding: 6px 14px;
    font-size: 13px;
    color: #4B5563;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.2s;
}

.chip:active {
    background: #F3F4F6;
    transform: scale(0.95);
}

.chat-input-bar {
    padding: 10px 12px;
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

.hidden {
    display: none !important;
}

/* Responsive Styles */
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
