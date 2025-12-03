<template>
    <div class="message-chat-page">
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
                    <van-button size="small" round plain type="success" class="action-btn">发起砍价</van-button>
                    <van-button size="small" round type="success" class="action-btn">立即购买</van-button>
                </template>
                <template v-else>
                    <van-button size="small" round plain type="warning" class="action-btn">修改价格</van-button>
                    <van-button size="small" round type="warning" class="action-btn">标记已售</van-button>
                </template>
            </div>
        </div>

        <!-- 聊天内容区域 -->
        <div class="chat-content" ref="chatContainer">
            <div class="message-list">
                <!-- 顶部系统消息示例 -->
                <div class="system-message-item">
                    <span>为了资金安全，请勿微信转账</span>
                </div>

                <div v-for="message in messageList" :key="message.id">
                    <!-- 系统消息插值 (Mock logic: if type is system) -->
                    <div v-if="message.type === 'system'" class="system-message-item">
                        <span>{{ message.content }}</span>
                    </div>

                    <!-- 常规消息 -->
                    <div v-else :class="['message-item', message.isSelf ? 'message-self' : 'message-other']">
                        <van-image
                            :src="message.isSelf ? (userStore.user?.avatarUrl || userStore.user?.avatar || defaultAvatar('我')) : userInfo.avatar"
                            class="message-avatar" round fit="cover">
                            <template v-slot:error>
                                <img :src="defaultAvatar(message.isSelf ? '我' : userInfo.name)"
                                    style="width: 100%; height: 100%; object-fit: cover;" />
                            </template>
                        </van-image>
                        <div class="message-content">
                            <div v-if="message.type === 'text'" class="message-bubble">
                                {{ message.content }}
                            </div>
                            <div v-else-if="message.type === 'image'" class="message-image">
                                <van-image :src="message.content" fit="cover" @click="previewImage(message.content)" />
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
            </div>
        </div>

        <!-- 输入区域 -->
        <div class="chat-input-area">
            <!-- 智能短语 Chips (Smart Replies) -->
            <div class="smart-chips">
                <div class="chip" v-for="phrase in smartPhrases" :key="phrase" @click="sendQuickMessage(phrase)">
                    {{ phrase }}
                </div>
            </div>

            <div class="chat-input-bar">
                <van-icon name="smile-o" size="28" color="#666" class="tool-icon" @click="showEmoji" />
                <div class="input-wrapper">
                    <input v-model="inputMessage" type="text" placeholder="输入消息..." @keyup.enter="sendMessage" />
                </div>
                <van-icon name="photo-o" size="28" color="#666" class="tool-icon" @click="selectImage" />
                <div class="send-btn" :class="{ 'active': inputMessage.trim() }" @click="sendMessage">
                    <span v-if="inputMessage.trim()">发送</span>
                    <van-icon v-else name="plus" size="20" color="#fff" />
                </div>
            </div>
        </div>

        <!-- 更多操作面板 -->
        <van-action-sheet v-model:show="showActions" :actions="actionSheetActions" @select="onActionSelect"
            cancel-text="取消" />

        <!-- 图片上传 -->
        <input ref="imageInput" type="file" accept="image/*" style="display: none" @change="onImageSelect" />
    </div>
</template>

<script>
import { useMessageStore } from '@/stores/message'
import { useUserStore } from '@/stores/user'
import { Dialog, ImagePreview, showSuccessToast, showToast } from 'vant'
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
    name: 'MessageChat',
    setup() {
        const router = useRouter()
        const route = useRoute()
        const messageStore = useMessageStore()
        const userStore = useUserStore()
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

        const conversationId = Number(route.params.id)
        const userInfo = ref({})

        // Smart Replies
        const buyerPhrases = ['还在吗？', '可以刀吗？', '什么时候能发货？', '成色怎么样？', '有瑕疵吗？']
        const sellerPhrases = ['不议价哦', '今天能发', '在这个链接拍就行', '看详情页描述', '已经是底价了']

        const smartPhrases = computed(() => isBuyer.value ? buyerPhrases : sellerPhrases)

        const actionSheetActions = reactive([
            { name: '切换角色(演示用)', value: 'switchRole' },
            { name: '发送商品', value: 'product' },
            { name: '举报用户', value: 'report' },
            { name: '删除聊天', value: 'delete', color: '#ee0a24' }
        ])

        const messageList = computed(() => {
            // Injecting mock system messages for demo if needed, or rely on store
            return messageStore.messages
        })

        const defaultAvatar = (name) => {
            return `https://ui-avatars.com/api/?name=${name || 'User'}&background=random&color=fff`
        }

        const scrollToBottom = () => {
            nextTick(() => {
                if (chatContainer.value) {
                    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
                }
            })
        }

        const sendMessage = () => {
            const message = inputMessage.value.trim()
            if (!message) return

            const conversation = messageStore.conversations.find(c => c.id === conversationId)
            if (conversation) {
                if (!conversation.otherUserId) {
                    showToast('无法发送消息：接收者ID缺失')
                    return
                }
                messageStore.sendMessage(conversation.otherUserId, message)
                inputMessage.value = ''
            } else {
                showToast('无法发送消息：找不到会话')
            }
        }

        const sendQuickMessage = (msg) => {
            inputMessage.value = msg;
            sendMessage();
        }

        const selectImage = () => imageInput.value?.click()
        const onImageSelect = (event) => {
            showToast('图片发送功能开发中')
            event.target.value = ''
        }
        const previewImage = (imageUrl) => ImagePreview([imageUrl])
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
                        showSuccessToast('聊天已删除')
                        router.go(-1)
                    })
                    break
            }
            showActions.value = false
        }

        const goToProduct = (productId) => router.push(`/product/${productId}`)

        onMounted(async () => {
            if (!conversationId || conversationId <= 0) {
                showToast('无效的会话')
                router.back()
                return
            }
            if (!userStore.user || !userStore.user.avatarUrl) {
                try { await userStore.loadMe() } catch (e) { console.error(e) }
            }
            messageStore.connect()
            await messageStore.fetchConversations()
            const conversation = messageStore.conversations.find(c => c.id === conversationId)
            if (conversation) {
                userInfo.value = {
                    id: conversation.otherUserId,
                    name: conversation.otherUserName,
                    avatar: conversation.otherUserAvatar || defaultAvatar(conversation.otherUserName)
                }
            }
            await messageStore.fetchMessages(conversationId)
            scrollToBottom()
        })

        onUnmounted(() => messageStore.clearCurrentConversation())
        watch(() => messageStore.messages.length, () => scrollToBottom())

        return {
            chatContainer, imageInput, inputMessage, messageList, showActions, userInfo,
            productInfo, actionSheetActions, sendMessage, sendQuickMessage, selectImage,
            onImageSelect, previewImage, showEmoji, showMoreActions, onActionSelect,
            goToProduct, defaultAvatar, userStore, smartPhrases, isBuyer
        }
    }
}
</script>

<style scoped>
.message-chat-page {
    position: fixed;
    top: 72px;
    /* Global Navbar Height */
    left: 0;
    right: 0;
    bottom: 0;
    bottom: env(safe-area-inset-bottom);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background-color: #F5F7FA;
    --brand-green: #4FA37F;
    z-index: 100;
    overscroll-behavior: none;
}

.safety-warning,
.sticky-product-card,
.chat-input-area {
    flex-shrink: 0;
    touch-action: none;
}

.nav-title-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1.2;
}

.nav-name {
    font-weight: 600;
    font-size: 16px;
}

.nav-status {
    font-size: 10px;
    color: #10B981;
}

/* Safety Warning */
.safety-warning {
    background: #FFFBE6;
    color: #FAAD14;
    font-size: 12px;
    padding: 8px 16px;
    text-align: center;
    z-index: 100;
}

/* Sticky Product Card */
.sticky-product-card {
    background: #fff;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #f0f0f0;
    z-index: 100;
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
    /* Seller Orange for price highlight */
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
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-y: contain;
}

.message-list {
    padding: 0 16px;
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

/* Message Items */
.message-item {
    display: flex;
    margin-bottom: 20px;
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
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.message-other .message-avatar {
    margin-right: 10px;
}

.message-self .message-avatar {
    margin-left: 10px;
}

.message-content {
    max-width: 75%;
    display: flex;
    flex-direction: column;
}

.message-self .message-content {
    align-items: flex-end;
}

/* Message Bubbles */
.message-bubble {
    padding: 10px 14px;
    font-size: 15px;
    line-height: 1.5;
    word-break: break-word;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    position: relative;
    min-width: 20px;
}

/* Left (Other) Bubble */
.message-other .message-bubble {
    background: #FFFFFF;
    /* White */
    color: #333;
    border-radius: 0 12px 12px 12px;
    border: 1px solid #E5E7EB;
}

/* Right (Self) Bubble */
.message-self .message-bubble {
    background: var(--brand-green);
    /* Brand Green */
    color: #FFFFFF;
    border-radius: 12px 0 12px 12px;
}

.message-image {
    border-radius: 8px;
    overflow: hidden;
    max-width: 200px;
}

.message-product {
    background: #fff;
    border-radius: 8px;
    padding: 10px;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    max-width: 260px;
    border: 1px solid #E5E7EB;
}

/* Input Area */
.chat-input-area {
    background: #fff;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.03);
    padding-bottom: env(safe-area-inset-bottom);
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
    background: #F3F4F6;
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
    background: #E5E7EB;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 4px;
    transition: all 0.2s;
    flex-shrink: 0;
}

.send-btn.active {
    background: var(--brand-green);
    width: auto;
    padding: 0 16px;
    border-radius: 18px;
}

.send-btn span {
    color: #fff;
    font-size: 14px;
    font-weight: 600;
}
</style>
