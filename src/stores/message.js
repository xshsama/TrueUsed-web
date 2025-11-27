import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMessageStore = defineStore('message', () => {
  const unreadCount = ref(0)
  const messages = ref([])

  const setUnreadCount = (count) => {
    unreadCount.value = count
  }

  const addMessage = (message) => {
    messages.value.unshift(message)
    unreadCount.value++
  }

  const clearUnreadCount = () => {
    unreadCount.value = 0
  }

  // 模拟获取未读数
  const fetchUnreadCount = async () => {
    // 模拟 API 延迟
    return new Promise((resolve) => {
      setTimeout(() => {
        // 假设后端返回 3 条未读
        unreadCount.value = 3
        resolve(3)
      }, 500)
    })
  }

  return {
    unreadCount,
    messages,
    setUnreadCount,
    addMessage,
    clearUnreadCount,
    fetchUnreadCount,
  }
})
