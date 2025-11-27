<template>
    <div class="page">
        <van-nav-bar title="系统设置" left-arrow @click-left="$router.back()" fixed />
        <div class="container" style="padding-top:56px;">
            <van-cell-group inset title="通知与隐私">
                <van-cell title="消息通知" center>
                    <template #right-icon>
                        <van-switch v-model="notify" size="20" />
                    </template>
                </van-cell>
                <van-cell title="推送营销消息" center>
                    <template #right-icon>
                        <van-switch v-model="marketing" size="20" />
                    </template>
                </van-cell>
                <van-cell title="个性化推荐" center>
                    <template #right-icon>
                        <van-switch v-model="personalized" size="20" />
                    </template>
                </van-cell>
            </van-cell-group>

            <van-cell-group inset title="外观">
                <van-cell title="深色模式（占位）" value="跟随系统" is-link @click="toggleTheme" />
            </van-cell-group>

            <van-cell-group inset title="缓存管理">
                <van-cell title="清除缓存" is-link @click="clearCache">
                    <template #value>
                        <span class="cache-size">{{ cacheSize }}</span>
                    </template>
                </van-cell>
            </van-cell-group>

            <van-cell-group inset title="关于">
                <van-cell title="版本号" :value="appVersion" />
                <van-cell title="用户协议" is-link @click="showToast('用户协议')" />
                <van-cell title="隐私政策" is-link @click="showToast('隐私政策')" />
            </van-cell-group>

            <div style="padding: 24px 16px;">
                <van-button type="danger" block round size="large" :loading="isLoggingOut" @click="handleLogout">
                    退出登录
                </van-button>
            </div>

            <div class="logout-tip">
                退出后将清除本地登录状态
            </div>
        </div>
    </div>
</template>

<script>
import { useUserStore } from '@/stores/user'
import { showConfirmDialog, showSuccessToast, showToast } from 'vant'
import { onMounted, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'

const KEY = 'tu.settings'

export default {
    name: 'Settings',
    setup() {
        const router = useRouter()
        const userStore = useUserStore()
        const notify = ref(true)
        const marketing = ref(false)
        const personalized = ref(true)
        const isLoggingOut = ref(false)
        const cacheSize = ref('计算中...')
        const appVersion = ref('1.0.0')

        const save = () => {
            localStorage.setItem(KEY, JSON.stringify({
                notify: notify.value,
                marketing: marketing.value,
                personalized: personalized.value
            }))
        }

        const load = () => {
            try {
                const v = JSON.parse(localStorage.getItem(KEY) || '{}')
                if (typeof v.notify === 'boolean') notify.value = v.notify
                if (typeof v.marketing === 'boolean') marketing.value = v.marketing
                if (typeof v.personalized === 'boolean') personalized.value = v.personalized
            } catch { }
        }

        const calculateCacheSize = () => {
            try {
                let total = 0
                for (let key in localStorage) {
                    if (localStorage.hasOwnProperty(key)) {
                        total += localStorage.getItem(key).length * 2 // UTF-16 编码
                    }
                }
                if (total < 1024) {
                    cacheSize.value = `${total} B`
                } else if (total < 1024 * 1024) {
                    cacheSize.value = `${(total / 1024).toFixed(1)} KB`
                } else {
                    cacheSize.value = `${(total / 1024 / 1024).toFixed(1)} MB`
                }
            } catch {
                cacheSize.value = '未知'
            }
        }

        const clearCache = async () => {
            try {
                await showConfirmDialog({
                    title: '清除缓存',
                    message: '将清除图片缓存和临时数据，登录状态不受影响',
                })
                // 清除非关键数据
                const keysToKeep = ['token', 'token_expires_at', 'user', KEY]
                const keysToRemove = []
                for (let key in localStorage) {
                    if (localStorage.hasOwnProperty(key) && !keysToKeep.includes(key)) {
                        keysToRemove.push(key)
                    }
                }
                keysToRemove.forEach(key => localStorage.removeItem(key))
                calculateCacheSize()
                showSuccessToast('缓存已清除')
            } catch {
                // 用户取消
            }
        }

        onMounted(() => {
            load()
            calculateCacheSize()
        })

        const toggleTheme = () => showToast('深色模式后续接入')

        const handleLogout = async () => {
            try {
                await showConfirmDialog({
                    title: '确认退出',
                    message: '确定要退出登录吗？',
                    confirmButtonText: '退出',
                    confirmButtonColor: '#ee0a24',
                })

                isLoggingOut.value = true

                // 调用 store 的 logout 方法
                await userStore.logout()

                showSuccessToast('已退出登录')

                // 延迟跳转，让用户看到提示
                setTimeout(() => {
                    router.replace({ name: 'Home' })
                }, 500)

            } catch (error) {
                // 用户点击取消
                if (error !== 'cancel' && error?.message !== 'cancel') {
                    console.error('Logout error:', error)
                }
            } finally {
                isLoggingOut.value = false
            }
        }

        // 持久化设置
        watchEffect(save)

        return {
            notify,
            marketing,
            personalized,
            isLoggingOut,
            cacheSize,
            appVersion,
            toggleTheme,
            clearCache,
            handleLogout,
            showToast
        }
    }
}
</script>

<style scoped>
.cache-size {
    color: #969799;
    font-size: 14px;
}

.logout-tip {
    text-align: center;
    font-size: 12px;
    color: #969799;
    margin-top: -8px;
}

/* 开关未选中状态背景色 */
:deep(.van-switch) {
    background-color: #EEEEEE;
}

:deep(.van-switch--on) {
    background-color: var(--primary-color);
}

/* 页面布局调整 */
.page {
    min-height: 100vh;
    background: var(--bg-page);
}

.container {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    padding-top: 56px !important;
    box-sizing: border-box;
}
</style>
