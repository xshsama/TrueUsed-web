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

            <div style="padding: 16px;">
                <van-button type="danger" block round @click="logout">退出登录</van-button>
            </div>
        </div>
    </div>
</template>

<script>
import { useUserStore } from '@/stores/user'
import { Dialog, showSuccessToast, showToast } from 'vant'
import { onMounted, ref, watchEffect } from 'vue'

const KEY = 'tu.settings'

export default {
    name: 'Settings',
    setup() {
        const userStore = useUserStore()
        const notify = ref(true)
        const marketing = ref(false)
        const personalized = ref(true)

        const save = () => {
            localStorage.setItem(KEY, JSON.stringify({ notify: notify.value, marketing: marketing.value, personalized: personalized.value }))
        }
        const load = () => {
            try {
                const v = JSON.parse(localStorage.getItem(KEY) || '{}')
                if (typeof v.notify === 'boolean') notify.value = v.notify
                if (typeof v.marketing === 'boolean') marketing.value = v.marketing
                if (typeof v.personalized === 'boolean') personalized.value = v.personalized
            } catch { }
        }
        onMounted(load)

        const toggleTheme = () => showToast('深色模式后续接入')

        const logout = () => {
            Dialog.confirm({ title: '确认退出', message: '确定要退出登录吗？' })
                .then(() => { userStore.logout(); showSuccessToast('已退出'); history.back() })
                .catch(() => { })
        }

        // 持久化
        watchEffect(save)

        return { notify, marketing, personalized, toggleTheme, logout }
    }
}
</script>
