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
import { Dialog, ImagePreview, Toast } from 'vant'
import { nextTick, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
    name: 'MessageChat',
    setup() {
        const router = useRouter()
        const route = useRoute()
        const chatContainer = ref(null)
        const imageInput = ref(null)

        const inputMessage = ref('')
        const messageList = ref([])
        const showActions = ref(false)
        const userInfo = ref({})
        const productInfo = ref(null)

        // 操作面板选项
        const actionSheetActions = reactive([
            { name: '发送商品', value: 'product' },
            { name: '举报用户', value: 'report' },
            { name: '删除聊天', value: 'delete', color: '#ee0a24' }
        ])

        // 模拟用户信息
        userInfo.value = {
            id: route.params.id,
            name: '张小明',
            avatar: 'https://via.placeholder.com/40x40/4CAF50/ffffff?text=张'
        }

        // 模拟商品信息（可选）
        productInfo.value = {
            id: 1,
            title: 'iPhone 14 Pro 256GB 深空黑色',
            price: '6888',
            image: 'https://via.placeholder.com/80x80/333333/ffffff?text=iPhone'
        }

        // 模拟消息列表
        const mockMessages = [
            {
                id: 1,
                type: 'text',
                content: '你好，请问这个iPhone还在吗？',
                isSelf: false,
                timestamp: Date.now() - 300000
            },
            {
                id: 2,
                type: 'text',
                content: '在的，9成新，原装正品',
                isSelf: true,
                timestamp: Date.now() - 240000
            },
            {
                id: 3,
                type: 'text',
                content: '可以面交吗？我在浦东新区',
                isSelf: false,
                timestamp: Date.now() - 180000
            },
            {
                id: 4,
                type: 'product',
                content: 'iPhone 14 Pro商品卡片',
                productId: 1,
                productTitle: 'iPhone 14 Pro 256GB',
                productPrice: '6888',
                productImage: 'https://via.placeholder.com/60x60/333333/ffffff?text=iPhone',
                isSelf: true,
                timestamp: Date.now() - 120000
            },
            {
                id: 5,
                type: 'text',
                content: '好的，那我们约个时间地点吧',
                isSelf: false,
                timestamp: Date.now() - 60000
            }
        ]

        messageList.value = mockMessages

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

            const newMessage = {
                id: Date.now(),
                type: 'text',
                content: message,
                isSelf: true,
                timestamp: Date.now()
            }

            messageList.value.push(newMessage)
            inputMessage.value = ''
            scrollToBottom()

            // 模拟对方回复
            setTimeout(() => {
                const replyMessage = {
                    id: Date.now() + 1,
                    type: 'text',
                    content: '收到，谢谢！',
                    isSelf: false,
                    timestamp: Date.now()
                }
                messageList.value.push(replyMessage)
                scrollToBottom()
            }, 1000)
        }

        // 选择图片
        const selectImage = () => {
            imageInput.value?.click()
        }

        // 图片选择回调
        const onImageSelect = (event) => {
            const file = event.target.files[0]
            if (!file) return

            // 创建图片预览URL
            const imageUrl = URL.createObjectURL(file)

            const imageMessage = {
                id: Date.now(),
                type: 'image',
                content: imageUrl,
                isSelf: true,
                timestamp: Date.now()
            }

            messageList.value.push(imageMessage)
            scrollToBottom()

            // 清空input
            event.target.value = ''
        }

        // 预览图片
        const previewImage = (imageUrl) => {
            ImagePreview([imageUrl])
        }

        // 显示表情
        const showEmoji = () => {
            Toast('表情功能开发中')
        }

        // 显示更多操作
        const showMoreActions = () => {
            showActions.value = true
        }

        // 操作面板选择
        const onActionSelect = (action) => {
            switch (action.value) {
                case 'product':
                    Toast('发送商品功能开发中')
                    break
                case 'report':
                    Toast('举报功能开发中')
                    break
                case 'delete':
                    Dialog.confirm({
                        title: '确认删除',
                        message: '删除后聊天记录将无法恢复',
                    }).then(() => {
                        Toast.success('聊天已删除')
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

        onMounted(() => {
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