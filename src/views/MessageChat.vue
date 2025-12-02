<template>
    <div class="message-chat-page">
        <!-- 顶部导航 -->
        <van-nav-bar :title="userInfo.name" left-arrow @click-left="$router.go(-1)">
            <template #right>
                <van-icon name="more-o" @click="showMoreActions" />
            </template>
        </van-nav-bar>

        <!-- 聊天内容区域 -->
        <div class="chat-content" ref="chatContainer">
            <div class="message-list">
                <div v-for="message in messageList" :key="message.id"
                    :class="['message-item', message.isSelf ? 'message-self' : 'message-other']">
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

            <!-- 商品卡片 -->
            <div v-if="productInfo" class="product-card" @click="goToProduct(productInfo.id)">
                <van-image :src="productInfo.image" class="card-image" fit="cover" />
                <div class="card-content">
                    <div class="card-title">{{ productInfo.title }}</div>
                    <div class="card-price">¥{{ productInfo.price }}</div>
                </div>
                <van-button type="primary" size="small">查看详情</van-button>
            </div>
        </div>

        <!-- 输入区域 -->
        <div class="chat-input">
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
        const productInfo = ref(null)

        const conversationId = Number(route.params.id)
        const userInfo = ref({}) // Need to fetch conversation details to get user info

        // 操作面板选项
        const actionSheetActions = reactive([
            { name: '发送商品', value: 'product' },
            { name: '举报用户', value: 'report' },
            { name: '删除聊天', value: 'delete', color: '#ee0a24' }
        ])

        const messageList = computed(() => messageStore.messages)

        // 默认头像
        const defaultAvatar = (name) => {
            return `https://ui-avatars.com/api/?name=${name || 'User'}&background=random&color=fff`
        }

        // 滚动到底部
        const scrollToBottom = () => {
            nextTick(() => {
                if (chatContainer.value) {
                    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
                }
            })
        }

        // 发送消息
        const sendMessage = () => {
            const message = inputMessage.value.trim()
            if (!message) return

            console.log('Attempting to send message. Conversation ID:', conversationId)
            console.log('Available conversations:', messageStore.conversations)

            const conversation = messageStore.conversations.find(c => c.id === conversationId)
            if (conversation) {
                console.log('Found conversation:', conversation)
                console.log('Receiver ID (otherUserId):', conversation.otherUserId)
                if (!conversation.otherUserId) {
                    console.error('otherUserId is missing in conversation object!')
                    showToast('无法发送消息：接收者ID缺失')
                    return
                }
                messageStore.sendMessage(conversation.otherUserId, message)
                inputMessage.value = ''
            } else {
                console.warn('Conversation not found in store')
                // If conversation not in list (maybe new or not loaded), we have a problem.
                // We should ensure conversations are loaded.
                showToast('无法发送消息：找不到会话')
            }
        }

        // 选择图片
        const selectImage = () => {
            imageInput.value?.click()
        }

        // 图片选择回调
        const onImageSelect = (event) => {
            showToast('图片发送功能开发中')
            event.target.value = ''
        }

        // 预览图片
        const previewImage = (imageUrl) => {
            ImagePreview([imageUrl])
        }

        // 显示表情
        const showEmoji = () => showToast('表情功能开发中')

        // 显示更多操作
        const showMoreActions = () => {
            showActions.value = true
        }

        // 操作面板选择
        const onActionSelect = (action) => {
            switch (action.value) {
                case 'product':
                    showToast('发送商品功能开发中')
                    break
                case 'report':
                    showToast('举报功能开发中')
                    break
                case 'delete':
                    Dialog.confirm({
                        title: '确认删除',
                        message: '删除后聊天记录将无法恢复',
                    }).then(() => {
                        showSuccessToast('聊天已删除')
                        router.go(-1)
                    })
                    break
            }
            showActions.value = false
        }

        // 跳转到商品详情
        const goToProduct = (productId) => {
            router.push(`/product/${productId}`)
        }

        onMounted(async () => {
            if (!conversationId || conversationId <= 0) {
                showToast('无效的会话')
                router.back()
                return
            }

            // 确保用户信息是最新的
            if (!userStore.user || !userStore.user.avatarUrl) {
                try {
                    await userStore.loadMe()
                } catch (e) {
                    console.error('Failed to load user info', e)
                }
            }

            messageStore.connect()

            // Always fetch conversations to ensure we have the latest data (especially for new chats)
            await messageStore.fetchConversations()

            const conversation = messageStore.conversations.find(c => c.id === conversationId)
            if (conversation) {
                userInfo.value = {
                    id: conversation.otherUserId,
                    name: conversation.otherUserName,
                    avatar: conversation.otherUserAvatar || defaultAvatar(conversation.otherUserName)
                }
            } else {
                console.warn('Conversation not found after fetch:', conversationId)
            }

            await messageStore.fetchMessages(conversationId)
            scrollToBottom()
        })

        onUnmounted(() => {
            messageStore.clearCurrentConversation()
        })

        watch(() => messageStore.messages.length, (newLen) => {
            console.log('Message list length changed:', newLen)
            scrollToBottom()
        })

        return {
            chatContainer,
            imageInput,
            inputMessage,
            messageList,
            showActions,
            userInfo,
            productInfo,
            actionSheetActions,
            sendMessage,
            selectImage,
            onImageSelect,
            previewImage,
            showEmoji,
            showMoreActions,
            onActionSelect,
            goToProduct,
            defaultAvatar,
            userStore
        }
    }
}
</script>

<style scoped>
.message-chat-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #F5F5F5;
}

.chat-content {
    flex: 1;
    overflow-y: auto;
    padding: 46px 0 70px 0;
}

.message-list {
    padding: 16px;
}

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
}

.message-other .message-avatar {
    margin-right: 10px;
}

.message-self .message-avatar {
    margin-left: 10px;
}

.message-content {
    max-width: 70%;
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

.chat-input {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.05);
    z-index: 100;
    padding-bottom: calc(10px + env(safe-area-inset-bottom));
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
</style>