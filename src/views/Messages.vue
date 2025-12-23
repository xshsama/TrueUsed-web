<template>
    <div class="flex h-[calc(100vh-64px)] bg-gray-50 font-sans">
        <!-- Sidebar -->
        <div class="w-80 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
            <!-- Header -->
            <div class="p-4 border-b border-gray-50 flex justify-between items-center sticky top-0 bg-white z-10">
                <h1 class="text-xl font-bold text-gray-800">消息</h1>
                <div class="flex gap-3">
                    <button
                        class="p-2 hover:bg-gray-50 rounded-full transition-colors relative group border-none bg-transparent cursor-pointer">
                        <div class="i-lucide-bell w-5 h-5 text-gray-600"></div>
                        <span
                            class="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                    <button
                        class="p-2 hover:bg-gray-50 rounded-full transition-colors border-none bg-transparent cursor-pointer">
                        <div class="i-lucide-plus w-5 h-5 text-gray-600"></div>
                    </button>
                </div>
            </div>

            <!-- Search -->
            <div class="px-4 py-3">
                <div class="relative group">
                    <div
                        class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4a8b6e] transition-colors">
                        <div class="i-lucide-search w-4 h-4"></div>
                    </div>
                    <input type="text" placeholder="搜索联系人/聊天记录"
                        class="w-full bg-gray-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-700 focus:ring-2 focus:ring-[#4a8b6e]/20 focus:bg-white transition-all outline-none placeholder:text-gray-400" />
                </div>
            </div>

            <!-- Chat List -->
            <div class="flex-1 overflow-y-auto">
                <div v-for="chat in chatList" :key="chat.id" @click="switchChat(chat)"
                    class="px-4 py-3 flex gap-3 cursor-pointer transition-all border-l-4 hover:bg-gray-50"
                    :class="activeChatId === chat.id ? 'bg-[#4a8b6e]/5 border-[#4a8b6e]' : 'border-transparent'">

                    <div class="relative flex-shrink-0">
                        <img :src="chat.avatar" class="w-12 h-12 rounded-full object-cover border border-gray-100" />
                        <span v-if="chat.online"
                            class="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>

                    <div class="flex-1 min-w-0 flex flex-col justify-center">
                        <div class="flex justify-between items-baseline mb-1">
                            <h3 class="font-bold text-gray-800 truncate text-sm"
                                :class="activeChatId === chat.id ? 'text-[#4a8b6e]' : ''">
                                {{ chat.name }}
                            </h3>
                            <span class="text-[10px] text-gray-400 flex-shrink-0">{{ chat.time }}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <p class="text-xs text-gray-500 truncate max-w-[140px]"
                                :class="chat.unread ? 'font-medium text-gray-700' : ''">
                                {{ chat.lastMessage }}
                            </p>
                            <span v-if="chat.unread"
                                class="min-w-[18px] h-[18px] flex items-center justify-center bg-[#ff4d4f] text-white text-[10px] font-bold rounded-full px-1">
                                {{ chat.unread }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Chat Area -->
        <main class="flex-1 flex flex-col bg-white relative min-w-0">
            <div v-if="!activeChatId" class="flex-1 flex flex-col items-center justify-center text-gray-400">
                <div class="i-lucide-message-square w-16 h-16 mb-4 opacity-20"></div>
                <p>选择一个联系人开始聊天</p>
            </div>

            <div v-else class="flex flex-col h-full">
                <!-- Chat Header -->
                <div
                    class="h-16 px-6 border-b border-gray-50 flex justify-between items-center bg-white/80 backdrop-blur-sm sticky top-0 z-20">
                    <div class="flex items-center gap-3">
                        <div class="relative">
                            <img :src="activeChat?.avatar"
                                class="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm" />
                            <span v-if="activeChat?.online"
                                class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <h2 class="font-bold text-gray-800">{{ activeChat?.name }}</h2>
                                <span
                                    class="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded flex items-center gap-1">
                                    <div class="i-lucide-shield w-3 h-3"></div>
                                    信用极好
                                </span>
                            </div>
                            <div v-if="activeChat?.online" class="text-xs text-green-600 flex items-center gap-1">
                                <div class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                在线
                            </div>
                            <div v-else class="text-xs text-gray-400 flex items-center gap-1">
                                <div class="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                                离线
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-4">
                        <button
                            class="p-2 text-gray-400 hover:text-[#4a8b6e] hover:bg-[#4a8b6e]/5 rounded-full transition-colors border-none bg-transparent cursor-pointer">
                            <div class="i-lucide-phone w-5 h-5"></div>
                        </button>
                        <button
                            class="p-2 text-gray-400 hover:text-[#4a8b6e] hover:bg-[#4a8b6e]/5 rounded-full transition-colors border-none bg-transparent cursor-pointer">
                            <div class="i-lucide-more-horizontal w-5 h-5"></div>
                        </button>
                    </div>
                </div>

                <!-- Product Context Card -->
                <div v-if="relatedProduct"
                    class="bg-white border-b border-gray-50 p-3 px-6 flex items-center justify-between gap-4 shadow-sm z-10">
                    <div class="flex items-center gap-3">
                        <img :src="relatedProduct.image" class="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                        <div>
                            <div class="text-sm font-bold text-gray-800">¥{{ relatedProduct.price }}</div>
                            <div class="text-xs text-gray-500 line-clamp-1 w-48">正在交易：{{ relatedProduct.title }}</div>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button
                            class="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-[#4a8b6e] hover:text-[#4a8b6e] transition-colors bg-transparent cursor-pointer">
                            发起砍价
                        </button>
                        <button
                            class="text-xs px-3 py-1.5 rounded-full bg-[#4a8b6e] text-white hover:bg-[#3b755b] transition-colors border-none cursor-pointer">
                            立即购买
                        </button>
                    </div>
                </div>

                <!-- Messages Area -->
                <div class="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f9fafb]" ref="messagesContainer">
                    <template v-for="msg in messages" :key="msg.id">
                        <!-- System Message -->
                        <div v-if="msg.type === 'system'" class="flex justify-center mb-4">
                            <div
                                class="bg-[#fefce8] text-[#854d0e] text-xs px-4 py-2 rounded-full flex items-center gap-2 border border-[#fef08a] shadow-sm max-w-lg text-center">
                                <div class="i-lucide-shield-alert w-3.5 h-3.5 flex-shrink-0"></div>
                                {{ msg.content }}
                            </div>
                        </div>

                        <!-- User Message -->
                        <div v-else class="flex gap-3 group" :class="msg.type === 'me' ? 'flex-row-reverse' : ''">
                            <img :src="msg.type === 'me' ? currentUser.avatar : activeChat?.avatar"
                                class="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-white shadow-sm mt-1" />

                            <div class="max-w-[70%] space-y-1"
                                :class="msg.type === 'me' ? 'items-end flex flex-col' : ''">
                                <div class="px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm relative" :class="msg.type === 'me'
                                    ? 'bg-[#4a8b6e] text-white rounded-tr-none'
                                    : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'">
                                    {{ msg.content }}
                                </div>
                                <div
                                    class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity px-1">
                                    <span class="text-[10px] text-gray-300">{{ msg.time }}</span>
                                    <span v-if="msg.type === 'me'"
                                        class="text-[10px] text-[#4a8b6e] font-medium">已读</span>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>

                <!-- Input Area -->
                <div class="bg-white border-t border-gray-100 p-4">
                    <!-- Quick Replies -->
                    <div class="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
                        <button v-for="text in quickReplies" :key="text" @click="handleQuickReply(text)"
                            class="whitespace-nowrap px-3 py-1 bg-gray-50 text-gray-500 text-xs rounded-full border border-gray-100 hover:bg-[#4a8b6e]/10 hover:text-[#4a8b6e] hover:border-[#4a8b6e]/20 transition-all cursor-pointer">
                            {{ text }}
                        </button>
                    </div>

                    <div class="flex items-center gap-3">
                        <button
                            class="p-2 text-gray-400 hover:text-[#4a8b6e] hover:bg-gray-50 rounded-full transition-colors border-none bg-transparent cursor-pointer">
                            <div class="i-lucide-image w-[22px] h-[22px]"></div>
                        </button>
                        <button
                            class="p-2 text-gray-400 hover:text-[#4a8b6e] hover:bg-gray-50 rounded-full transition-colors border-none bg-transparent cursor-pointer">
                            <div class="i-lucide-smile w-[22px] h-[22px]"></div>
                        </button>

                        <div class="flex-1 relative">
                            <input type="text" v-model="inputText" @keydown.enter="handleSend" placeholder="输入消息..."
                                class="w-full bg-gray-100 border-none rounded-full py-2.5 pl-4 pr-10 text-sm focus:ring-2 focus:ring-[#4a8b6e]/20 focus:bg-white transition-all outline-none" />
                        </div>

                        <button @click="handleSend"
                            class="p-2.5 rounded-full transition-all border-none cursor-pointer flex items-center justify-center"
                            :class="inputText.trim() ? 'bg-[#4a8b6e] text-white shadow-lg shadow-[#4a8b6e]/30' : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
                            :disabled="!inputText.trim()">
                            <div class="i-lucide-send w-5 h-5" :class="inputText.trim() ? 'translate-x-0.5' : ''"></div>
                        </button>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup>
import { useMessageStore } from '@/stores/message'
import { useUserStore } from '@/stores/user'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const messageStore = useMessageStore()
const userStore = useUserStore()

const inputText = ref('')
const messagesContainer = ref(null)

// Current User
const currentUser = computed(() => {
    const u = userStore.user
    return {
        id: u?.id || 'me',
        avatar: u?.avatarUrl || 'https://via.placeholder.com/100'
    }
})

// Chat List from Store
const chatList = computed(() => messageStore.conversations.map(c => ({
    id: c.id,
    name: c.otherUserName || '未知用户',
    avatar: c.otherUserAvatar || 'https://via.placeholder.com/100',
    lastMessage: c.lastMessage,
    time: formatTime(c.lastMessageTime),
    unread: c.unreadCount,
    otherUserId: c.otherUserId,
    online: messageStore.onlineUsers.has(c.otherUserId)
})))

// Messages from Store
const messages = computed(() => messageStore.messages.map(m => ({
    id: m.id,
    type: m.isSelf ? 'me' : 'other',
    content: m.content,
    time: formatTime(m.timestamp)
})))

const activeChatId = ref(null)
const activeChat = computed(() => {
    if (!activeChatId.value) return null
    return chatList.value.find(c => c.id === activeChatId.value) || {
        name: '未知用户',
        avatar: 'https://via.placeholder.com/100',
        online: false
    }
})

// Related product (Mock for now)
const relatedProduct = ref(null)

const quickReplies = ['还在吗？', '可以刀吗？', '什么时候能发货？', '成色怎么样？', '有瑕疵吗？']

function formatTime(timestamp) {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    if (diff < 86400000) { // Less than 24h
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString()
}

const scrollToBottom = () => {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
    })
}

const handleSend = async () => {
    if (!inputText.value.trim() || !activeChatId.value) return

    const chat = chatList.value.find(c => c.id === activeChatId.value)
    if (!chat || !chat.otherUserId) return

    await messageStore.sendMessage(chat.otherUserId, inputText.value)
    inputText.value = ''
    scrollToBottom()
}

const handleQuickReply = (text) => {
    inputText.value = text
    handleSend()
}

const switchChat = async (chat) => {
    if (activeChatId.value === chat.id) return
    activeChatId.value = chat.id

    messageStore.markConversationAsRead(chat.id)

    await messageStore.fetchMessages(chat.id)
    scrollToBottom()

    router.replace(`/messages/chat/${chat.id}`)
}

watch(() => messageStore.messages.length, () => {
    scrollToBottom()
})

onMounted(async () => {
    messageStore.connect()
    await messageStore.fetchConversations()

    const paramId = route.params.id ? parseInt(route.params.id) : null
    if (paramId) {
        const chat = chatList.value.find(c => c.id === paramId)
        if (chat) {
            switchChat(chat)
        } else {
            activeChatId.value = paramId
            await messageStore.fetchMessages(paramId)
        }
    }
})

onUnmounted(() => {
    messageStore.clearCurrentConversation()
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
