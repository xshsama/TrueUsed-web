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
                    <van-image v-if="!message.isSelf" :src="userInfo.avatar" class="message-avatar" round fit="cover" />
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
                    <van-image v-if="message.isSelf" :src="'https://via.placeholder.com/40x40/FF6B6B/ffffff?text=我'"
                        class="message-avatar" round fit="cover" />
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
            <van-field v-model="inputMessage" placeholder="输入消息..." center @keyup.enter="sendMessage">
                <template #left-icon>
                    <van-icon name="smile-o" @click="showEmoji" />
                </template>
                <template #extra>
                    <van-icon name="photo-o" @click="selectImage" style="margin-right: 8px;" />
                    <van-button type="primary" size="small" @click="sendMessage" :disabled="!inputMessage.trim()">
                        发送
                    </van-button>
                </template>
            </van-field>
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
import { Dialog, ImagePreview, showSuccessToast, showToast } from 'vant'
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
    name: 'MessageChat',
    setup() {
        const router = useRouter()
        const route = useRoute()
        const messageStore = useMessageStore()
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

            messageStore.connect()

            // Always fetch conversations to ensure we have the latest data (especially for new chats)
            await messageStore.fetchConversations()

            const conversation = messageStore.conversations.find(c => c.id === conversationId)
            if (conversation) {
                userInfo.value = {
                    id: conversation.otherUserId,
                    name: conversation.otherUserName,
                    avatar: conversation.otherUserAvatar || 'https://via.placeholder.com/40x40/4CAF50/ffffff?text=' + conversation.otherUserName.charAt(0)
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
            goToProduct
        }
    }
}
</script>

<style scoped>
.message-chat-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #f0f0f0;
}

.chat-content {
    flex: 1;
    overflow-y: auto;
    padding: 46px 0 60px 0;
}

.message-list {
    padding: 16px;
}

.message-item {
    display: flex;
    margin-bottom: 16px;
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

.message-content {
    max-width: 70%;
}

.message-bubble {
    background: #fff;
    padding: 12px 16px;
    border-radius: 18px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    word-break: break-word;
}

.message-self .message-bubble {
    background: #1989fa;
    color: #fff;
}

.message-image {
    border-radius: 8px;
    overflow: hidden;
    max-width: 200px;
}

.message-image .van-image {
    width: 100%;
    height: auto;
}

.message-product {
    background: #fff;
    border-radius: 8px;
    padding: 12px;
    display: flex;
    align-items: center;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    max-width: 250px;
}

.product-image {
    width: 60px;
    height: 60px;
    border-radius: 4px;
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
    font-size: 16px;
    font-weight: 600;
    color: #ee0a24;
}

.product-card {
    margin: 0 16px 16px;
    background: #fff;
    border-radius: 8px;
    padding: 12px;
    display: flex;
    align-items: center;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.card-image {
    width: 80px;
    height: 80px;
    border-radius: 4px;
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

.chat-input {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    border-top: 1px solid #ebedf0;
    padding: 8px;
    z-index: 100;
}
</style>