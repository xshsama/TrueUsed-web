<template>
    <div class="min-h-screen bg-[#f7f9fa] font-sans text-[#2c3e50] flex flex-col">

        <!-- --- Main Chat Layout (Two Columns) --- -->
        <main class="max-w-[1280px] mx-auto w-full flex-1 px-6 py-6 flex h-[calc(100vh-72px)] gap-4">

            <!-- Left Sidebar: Chat List -->
            <aside
                class="w-80 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden flex-shrink-0">
                <!-- Sidebar Header -->
                <div class="p-4 border-b border-gray-50 flex items-center justify-between">
                    <h2 class="text-lg font-bold text-gray-800">消息列表</h2>
                    <div
                        class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 cursor-pointer transition-colors">
                        <div class="i-lucide-plus text-lg"></div>
                    </div>
                </div>

                <!-- Search (Optional) -->
                <div class="px-4 py-3">
                    <div class="relative">
                        <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <div class="i-lucide-search text-sm"></div>
                        </div>
                        <input type="text" placeholder="搜索联系人"
                            class="w-full bg-gray-50 border-none rounded-lg py-2 pl-9 pr-4 text-xs focus:ring-1 focus:ring-[#4a8b6e]/30 outline-none transition-all" />
                    </div>
                </div>

                <!-- Chat List -->
                <div class="flex-1 overflow-y-auto">
                    <div v-for="chat in chatList" :key="chat.id" @click="switchChat(chat)"
                        class="flex items-center gap-3 p-4 cursor-pointer transition-all hover:bg-gray-50 relative group"
                        :class="activeChatId === chat.id ? 'bg-emerald-50/40' : ''">

                        <!-- Avatar -->
                        <div class="relative flex-shrink-0">
                            <img :src="chat.avatar"
                                class="w-12 h-12 rounded-full object-cover border border-gray-100 group-hover:scale-105 transition-transform" />
                            <div v-if="chat.unread > 0"
                                class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                {{ chat.unread }}
                            </div>
                        </div>

                        <!-- Info -->
                        <div class="flex-1 min-w-0">
                            <div class="flex justify-between items-baseline mb-1">
                                <h3 class="font-bold text-gray-800 truncate text-[14px]"
                                    :class="activeChatId === chat.id ? 'text-[#4a8b6e]' : ''">{{ chat.name }}</h3>
                                <span class="text-[10px] text-gray-400 flex-shrink-0">{{ chat.time }}</span>
                            </div>
                            <p class="text-xs text-gray-500 truncate group-hover:text-gray-700 transition-colors">{{
                                chat.lastMessage }}</p>
                        </div>

                        <!-- Active Indicator -->
                        <div v-if="activeChatId === chat.id"
                            class="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-[#4a8b6e] rounded-r-full"></div>
                    </div>
                </div>
            </aside>

            <!-- Right Chat Window -->
            <div
                class="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden relative">

                <!-- Chat Header -->
                <header
                    class="h-16 border-b border-gray-50 flex items-center justify-between px-6 flex-shrink-0 bg-white z-20">
                    <div class="flex items-center gap-3">
                        <div class="relative">
                            <img :src="currentChatUser.avatar" class="w-10 h-10 rounded-full object-cover" />
                            <div
                                class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full">
                            </div>
                        </div>
                        <div>
                            <div class="font-bold text-gray-800 flex items-center gap-2">
                                {{ currentChatUser.name }}
                                <span v-if="currentChatUser.credit"
                                    class="bg-gray-100 text-gray-400 text-[10px] px-1.5 py-0.5 rounded font-normal">芝麻信用{{
                                        currentChatUser.credit }}</span>
                            </div>
                            <div class="text-xs text-gray-400">活跃于 刚刚</div>
                        </div>
                    </div>

                    <!-- Header Actions -->
                    <div class="flex items-center gap-3">
                        <button
                            class="w-8 h-8 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-400 transition-colors border-none bg-transparent cursor-pointer">
                            <div class="i-lucide-phone text-lg"></div>
                        </button>
                        <button
                            class="w-8 h-8 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-400 transition-colors border-none bg-transparent cursor-pointer">
                            <div class="i-lucide-more-vertical text-lg"></div>
                        </button>
                    </div>
                </header>

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
                <div class="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f9fafb]" ref="messagesContainer">

                    <template v-for="msg in messages" :key="msg.id">
                        <div v-if="msg.type === 'system'" class="flex justify-center mb-4">
                            <div
                                class="bg-[#fefce8] text-[#854d0e] text-xs px-4 py-2 rounded-full flex items-center gap-2 border border-[#fef08a] shadow-sm max-w-lg text-center">
                                <div class="i-lucide-shield-alert text-sm flex-shrink-0"></div>
                                {{ msg.content }}
                            </div>
                        </div>

                        <div v-else class="flex gap-3" :class="msg.type === 'me' ? 'flex-row-reverse' : ''">
                            <img :src="msg.type === 'me' ? currentUser.avatar : currentChatUser.avatar"
                                class="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-white shadow-sm" />
                            <div class="max-w-[70%] space-y-1"
                                :class="msg.type === 'me' ? 'items-end flex flex-col' : ''">
                                <div class="px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm relative group"
                                    :class="msg.type === 'me'
                                        ? 'bg-[#4a8b6e] text-white rounded-tr-none'
                                        : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'">
                                    {{ msg.content }}
                                </div>
                                <span class="text-[10px] text-gray-300 px-1">{{ msg.time }}</span>
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
                            <div class="i-lucide-image text-[22px]"></div>
                        </button>
                        <button
                            class="p-2 text-gray-400 hover:text-[#4a8b6e] hover:bg-gray-50 rounded-full transition-colors border-none bg-transparent cursor-pointer">
                            <div class="i-lucide-truck text-[22px]"></div>
                        </button>

                        <div class="flex-1 relative">
                            <input type="text" v-model="inputText" @keydown.enter="handleSend" placeholder="输入消息..."
                                class="w-full bg-gray-100 border-none rounded-full py-2.5 pl-4 pr-10 text-sm focus:ring-2 focus:ring-[#4a8b6e]/20 focus:bg-white transition-all outline-none" />
                        </div>

                        <button @click="handleSend"
                            class="p-2.5 rounded-full transition-all border-none cursor-pointer flex items-center justify-center"
                            :class="inputText.trim() ? 'bg-[#4a8b6e] text-white shadow-lg shadow-[#4a8b6e]/30' : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
                            :disabled="!inputText.trim()">
                            <div class="i-lucide-send text-xl" :class="inputText.trim() ? 'translate-x-0.5' : ''"></div>
                        </button>
                    </div>
                </div>

            </div>
        </main>
    </div>
</template>

<script setup>
import { nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const inputText = ref('')
const messagesContainer = ref(null)

// 模拟当前用户
const currentUser = {
    id: 'me',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'
}

// 聊天列表数据
const chatList = ref([
    {
        id: 1,
        name: '摄影师阿杰',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100',
        lastMessage: '什么时候方便发货？',
        time: '昨天',
        unread: 2,
        credit: '极好',
        type: 'user'
    },
    {
        id: 2,
        name: '系统通知',
        avatar: 'https://ui-avatars.com/api/?name=System&background=ef4444&color=fff',
        lastMessage: '您的订单已发货，点击查看物流详情',
        time: '星期一',
        unread: 0,
        credit: '',
        type: 'system'
    },
    {
        id: 3,
        name: 'Geek_Tom',
        avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=100',
        lastMessage: '好的，那我拍下了',
        time: '12/05',
        unread: 0,
        credit: '优秀',
        type: 'user'
    }
])

const activeChatId = ref(1)
const currentChatUser = reactive({ ...chatList.value[0] })

// 关联商品信息
const relatedProduct = ref({
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=100',
    title: 'Kindle Paperwhite 5',
    price: '650'
})

// 模拟当前对话内容
const messages = ref([
    { id: 1, type: 'system', content: '为了资金安全，请勿脱离平台私下转账，谨防诈骗。' },
    { id: 2, type: 'other', content: '你好，还在吗？', time: '14:50' },
    { id: 3, type: 'me', content: '在的，请问对这个 Kindle 感兴趣吗？', time: '14:51' },
    { id: 4, type: 'other', content: '成色怎么样？屏幕有划痕吗？', time: '14:52' },
    { id: 5, type: 'me', content: '箱说全，屏幕完美，一直贴膜用的。', time: '14:52' },
    { id: 6, type: 'other', content: '可以刀吗？600包邮出不出？', time: '14:53' },
])

const quickReplies = ['还在吗？', '可以刀吗？', '什么时候能发货？', '成色怎么样？', '有瑕疵吗？']

const scrollToBottom = () => {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
    })
}

const handleSend = () => {
    if (!inputText.value.trim()) return
    messages.value.push({
        id: Date.now(),
        type: 'me',
        content: inputText.value,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    inputText.value = ''
    scrollToBottom()
}

const handleQuickReply = (text) => {
    messages.value.push({
        id: Date.now(),
        type: 'me',
        content: text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()
}

const switchChat = (chat) => {
    activeChatId.value = chat.id
    Object.assign(currentChatUser, chat)

    // 模拟切换聊天内容
    if (chat.type === 'system') {
        messages.value = [
            { id: 1, type: 'system', content: '系统通知：您的订单 238492384 已发货。' },
            { id: 2, type: 'other', content: '点击查看物流详情', time: '09:00' }
        ]
        relatedProduct.value = null
    } else {
        // Reset to demo conversation
        messages.value = [
            { id: 1, type: 'system', content: '为了资金安全，请勿脱离平台私下转账，谨防诈骗。' },
            { id: 2, type: 'other', content: '你好，还在吗？', time: '14:50' },
            { id: 3, type: 'me', content: '在的，请问对这个 Kindle 感兴趣吗？', time: '14:51' },
        ]
        relatedProduct.value = {
            image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=100',
            title: 'Kindle Paperwhite 5',
            price: '650'
        }
    }
    scrollToBottom()

    // Update URL without reloading
    router.replace(`/messages/chat/${chat.id}`)
}

// Watch for route changes to update active chat
watch(() => route.params.id, (newId) => {
    if (newId) {
        const id = parseInt(newId)
        if (id !== activeChatId.value) {
            const chat = chatList.value.find(c => c.id === id)
            if (chat) {
                switchChat(chat)
            }
        }
    }
})

onMounted(() => {
    if (route.params.id) {
        const id = parseInt(route.params.id)
        const chat = chatList.value.find(c => c.id === id)
        if (chat) {
            switchChat(chat)
        }
    }
    scrollToBottom()
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
