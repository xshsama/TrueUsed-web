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

  return {
    unreadCount,
    messages,
    setUnreadCount,
    addMessage,
    clearUnreadCount,
  }
})
