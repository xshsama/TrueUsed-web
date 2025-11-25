<template>
    <div class="profile-page">
        <van-nav-bar title="我的" fixed />

        <div class="page-content">
            <section class="identity-card shadow-soft-lg glass-card hero-card">
                <div class="identity-main" v-if="!loading">
                    <div class="hero-avatar" @click="onClickAvatar">
                        <van-image :src="avatarSrc" class="avatar-lg" round fit="cover" @error="onAvatarError" />
                        <div class="avatar-edit" v-if="isLoggedIn"><van-icon name="photo-o" /> 更换</div>
                    </div>
                    <div class="identity-text center">
                        <div class="row center">
                            <h1 class="nickname">{{ userInfo.nickname || userInfo.username || '游客' }}</h1>
                        </div>
                        <p class="signature" v-if="userInfo.bio">{{ userInfo.bio }}</p>
                        <div class="auth-badges">
                            <van-tag v-if="userInfo.emailVerified" type="success" size="mini" round>邮箱已验证</van-tag>
                            <van-tag v-if="userInfo.phoneVerified" type="primary" size="mini" round>已绑定手机</van-tag>
                        </div>
                        <div class="identity-actions center">
                            <template v-if="isLoggedIn">
                                <van-button size="small" round type="primary" plain
                                    @click="editProfile">编辑资料</van-button>
                                <van-button size="small" round type="default" plain
                                    @click="openSecurity">安全设置</van-button>
                            </template>
                            <template v-else>
                                <van-button size="small" round type="primary" class="btn-primary"
                                    @click="goLogin">立即登录</van-button>
                            </template>
                        </div>
                    </div>
                </div>
                <div v-else class="identity-skeleton">
                    <van-skeleton avatar title :row="2" avatar-size="70px" />
                </div>
            </section>

            <div class="tu-seg shadow-soft-lg">
                <button class="tu-seg-btn" :class="{ 'is-active': activeTab === 'user' }"
                    @click="activeTab = 'user'">用户中心</button>
                <button class="tu-seg-btn" :class="{ 'is-active': activeTab === 'seller' }"
                    @click="goSeller">卖家中心</button>
            </div>

            <div v-if="activeTab === 'user'">
                <section class="user-section">
                    <div class="tu-list-card shadow-soft-lg">
                        <div class="tu-list-item" @click="viewAllOrders">
                            <div class="tu-list-icon-bubble" style="background:#3b82f6"><van-icon name="orders-o" />
                            </div>
                            <div>
                                <div class="tu-list-title">我的订单</div>
                                <div class="tu-list-subtitle">全部订单与状态</div>
                            </div>
                            <div class="tu-list-right">
                                <div class="tu-list-right-bubble"><van-icon name="arrow" /></div>
                            </div>
                        </div>
                    </div>

                    <div class="tu-list-card shadow-soft-lg">
                        <div class="tu-list-item" v-for="st in orderStatus" :key="st.key"
                            @click="goToOrderStatus(st.key)">
                            <div class="tu-list-icon-bubble" :style="iconBg(st.key)">
                                <van-icon :name="st.icon" />
                                <span v-if="st.count > 0" class="g-badge" style="top:-4px; right:-4px;">{{ st.count > 99
                                    ? '99+' : st.count }}</span>
                            </div>
                            <div>
                                <div class="tu-list-title">{{ st.label }}</div>
                                <div class="tu-list-subtitle">订单流程状态</div>
                            </div>
                            <div class="tu-list-right">
                                <div class="tu-list-right-bubble"><van-icon name="arrow" /></div>
                            </div>
                        </div>
                    </div>

                    <div class="tu-list-card shadow-soft-lg">
                        <div class="tu-list-item" @click="goToAddress">
                            <div class="tu-list-icon-bubble" style="background:#10b981"><van-icon name="location-o" />
                            </div>
                            <div>
                                <div class="tu-list-title">地址管理</div>
                                <div class="tu-list-subtitle">收货地址与常用地址</div>
                            </div>
                            <div class="tu-list-right">
                                <div class="tu-list-right-bubble"><van-icon name="arrow" /></div>
                            </div>
                        </div>
                        <div class="tu-list-item" @click="goToHelp">
                            <div class="tu-list-icon-bubble" style="background:#f59e0b"><van-icon name="question-o" />
                            </div>
                            <div>
                                <div class="tu-list-title">帮助中心</div>
                                <div class="tu-list-subtitle">常见问题与使用指引</div>
                            </div>
                            <div class="tu-list-right">
                                <div class="tu-list-right-bubble"><van-icon name="arrow" /></div>
                            </div>
                        </div>
                        <div class="tu-list-item" @click="goToSettings">
                            <div class="tu-list-icon-bubble" style="background:#94a3b8"><van-icon name="setting-o" />
                            </div>
                            <div>
                                <div class="tu-list-title">设置</div>
                                <div class="tu-list-subtitle">通知、隐私与安全</div>
                            </div>
                            <div class="tu-list-right">
                                <div class="tu-list-right-bubble"><van-icon name="arrow" /></div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <div v-else>
                <SellerCenter />
            </div>
        </div>

        <van-dialog v-model:show="showEdit" title="编辑资料" show-cancel-button :before-close="handleBeforeClose">
            <div class="form-grid">
                <div class="dialog-saving" v-if="saving">
                    <span class="spinner"></span> 正在保存...
                </div>
                <div class="avatar-upload-block">
                    <div class="avatar-upload-label">头像</div>
                    <ImageUpload v-model="avatarList" :max-images="1" :size="120" :round="true" hint="点击上传头像"
                        :show-count="false" />
                    <div class="avatar-upload-hint">支持 jpg/png/webp，建议 400x400 以上</div>
                </div>
                <van-field v-model="form.nickname" label="昵称" placeholder="请输入昵称" :error-message="errors.nickname" />
                <van-field v-model="form.phone" label="手机号" placeholder="可选" :error-message="errors.phone" />
                <van-field v-model="form.bio" label="签名" type="textarea" rows="2" maxlength="80" show-word-limit
                    placeholder="介绍一下自己吧" />
            </div>
        </van-dialog>
    </div>
</template>

<script setup>
import defaultAvatarUrl from '@/assets/icons/user.svg'
import ImageUpload from '@/components/ImageUpload.vue'
import SellerCenter from '@/components/SellerCenter.vue'
import { useUserStore } from '@/stores/user'
import { showFailToast, showSuccessToast, showToast } from 'vant'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(true)
const activeTab = ref('user')

const isLoggedIn = computed(() => userStore.isLoggedIn)
const userInfo = computed(() => userStore.user || {})
const defaultAvatar = defaultAvatarUrl
const avatarSrc = ref('')

onMounted(async () => {
    if (route.query.tab === 'seller') {
        activeTab.value = 'seller'
    }
    try {
        if (isLoggedIn.value) {
            await userStore.loadMe()
        }
    } finally {
        loading.value = false
    }
    avatarSrc.value = (userInfo.value && (userInfo.value.avatarUrl || userInfo.value.avatar)) || defaultAvatar
})

watch(() => userInfo.value && (userInfo.value.avatarUrl || userInfo.value.avatar), (v) => {
    avatarSrc.value = v || defaultAvatar
})

const onAvatarError = () => {
    if (avatarSrc.value !== defaultAvatar) {
        avatarSrc.value = defaultAvatar
    }
}

const orderStatus = ref([
    { key: 'unpaid', label: '待付款', icon: 'pending-payment', count: 1 },
    { key: 'toship', label: '待发货', icon: 'logistics', count: 0 },
    { key: 'toreceive', label: '待收货', icon: 'cart-o', count: 2 },
    { key: 'afterSale', label: '退款/售后', icon: 'after-sale', count: 0 }
])
const iconBg = (key) => {
    const map = { unpaid: '#38bdf8', toship: '#a78bfa', toreceive: '#22c55e', afterSale: '#f43f5e' }
    return `background:${map[key] || '#93c5fd'}`
}

const showEdit = ref(false)
const saving = ref(false)
const form = ref({ nickname: '', avatarUrl: '', bio: '', phone: '' })
const initialForm = ref({ nickname: '', avatarUrl: '', bio: '', phone: '' })
const avatarList = ref([])
const errors = ref({ nickname: '', phone: '' })

const validateNickname = (val) => {
    if (!val || !val.trim()) return '请输入昵称'
    if (val.trim().length < 2) return '昵称至少 2 个字符'
    return ''
}
const validatePhone = (val) => {
    if (!val) return ''
    const ok = /^[0-9+\-()\s]{6,20}$/.test(String(val).trim())
    return ok ? '' : '手机号格式不正确'
}
const validateAll = () => {
    errors.value.nickname = validateNickname(form.value.nickname)
    errors.value.phone = validatePhone(form.value.phone)
    return !(errors.value.nickname || errors.value.phone)
}
const isDirty = computed(() => JSON.stringify(form.value) !== JSON.stringify(initialForm.value))

const editProfile = () => {
    form.value = {
        nickname: (userInfo.value && userInfo.value.nickname) || '',
        avatarUrl: (userInfo.value && userInfo.value.avatarUrl) || '',
        bio: (userInfo.value && userInfo.value.bio) || '',
        phone: (userInfo.value && userInfo.value.phone) || ''
    }
    initialForm.value = { ...form.value }
    errors.value = { nickname: validateNickname(form.value.nickname), phone: validatePhone(form.value.phone) }
    avatarList.value = form.value.avatarUrl ? [form.value.avatarUrl] : []
    showEdit.value = true
}

const handleBeforeClose = async (action) => {
    // Vant 3/4: 返回 boolean 或 Promise<boolean>
    if (action !== 'confirm') {
        // 取消/关闭时确保遮罩复位
        saving.value = false
        return true
    }
    if (!validateAll()) {
        showFailToast('请修正表单错误')
        return false
    }
    if (!isDirty.value) {
        return true
    }
    try {
        saving.value = true
        await userStore.saveMe(form.value)
        showSuccessToast('已更新资料')
        initialForm.value = { ...form.value }
        saving.value = false
        return true
    } catch (e) {
        console.error('保存资料失败:', e)
        saving.value = false
        showFailToast('更新失败')
        return false
    }
}

watch(avatarList, (val) => { form.value.avatarUrl = (val && val[0]) || '' })
watch(() => form.value.nickname, (v) => { errors.value.nickname = validateNickname(v) })
watch(() => form.value.phone, (v) => { errors.value.phone = validatePhone(v) })

const openSecurity = () => router.push({ name: 'Settings' })
const goLogin = () => router.push({ name: 'Login', query: { redirect: '/profile' } })
const viewAllOrders = () => router.push({ name: 'Orders' })
const goToOrderStatus = (key) => {
    if (key === 'favorites') router.push({ name: 'Favorites' })
    else router.push({ name: 'Orders', query: { status: key } })
}
const goSeller = () => {
    if (!isLoggedIn.value) {
        showToast('请先登录')
        router.push({ name: 'Login', query: { redirect: '/profile?tab=seller' } })
        return
    }
    activeTab.value = 'seller'
}
const goToAddress = () => router.push({ name: 'Address' })
const goToHelp = () => router.push({ name: 'Help' })
const goToSettings = () => router.push({ name: 'Settings' })
const onClickAvatar = () => editProfile()
</script>

<style scoped>
/* 复用并整理现有样式，保持此前设计 */
.profile-page {
    background: #f6f9ff;
    min-height: 100vh;
}

.top-cover {
    position: sticky;
    top: 0;
    height: 180px;
    z-index: 0;
    border-bottom-left-radius: 32px;
    border-bottom-right-radius: 32px;
}

.page-content {
    padding-top: 56px;
    padding-bottom: 40px;
    max-width: 880px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 24px;
    position: relative;
    z-index: 1;
}

.tu-seg {
    background: rgba(255, 255, 255, .6);
    -webkit-backdrop-filter: blur(6px);
    backdrop-filter: blur(6px);
    border: 1px solid rgba(31, 41, 55, 0.06);
    border-radius: 16px;
    padding: 6px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
}

.tu-seg-btn {
    appearance: none;
    border: 0;
    background: transparent;
    padding: 10px 12px;
    border-radius: 12px;
    font-size: 14px;
    color: #475569;
}

.tu-seg-btn.is-active {
    color: #ffffff;
    background-image: linear-gradient(90deg, var(--primary-color), var(--primary-color-2));
    box-shadow: 0 6px 20px -8px rgba(59, 130, 246, .6);
}

.tu-list-icon-bubble {
    position: relative;
    /* 确保 Badge 可以绝对定位 */
}

.card-block,
.identity-card {
    background: #fff;
    border-radius: 20px;
    padding: 18px 20px;
    box-shadow: 0 4px 18px -6px rgba(0, 0, 0, .08);
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.hero-card .identity-main {
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.hero-avatar {
    position: relative;
    width: 120px;
    height: 120px;
}

.hero-avatar .avatar-lg {
    width: 120px;
    height: 120px;
    border: 4px solid #fff;
    box-shadow: 0 8px 24px -12px rgba(0, 0, 0, .28);
}

.hero-avatar .avatar-edit {
    position: absolute;
    right: 6px;
    bottom: 6px;
    background: rgba(0, 0, 0, .6);
    color: #fff;
    font-size: 12px;
    padding: 3px 8px;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    gap: 4px;
}

.identity-text.center {
    align-items: center;
    text-align: center;
}

.identity-text .row.center {
    justify-content: center;
}

.identity-main {
    display: flex;
    gap: 16px;
    align-items: center;
}

.identity-text {
    flex: 1;
    min-width: 0;
}

.identity-text .row {
    display: flex;
    align-items: center;
    gap: 10px;
}

.nickname {
    font-size: 22px;
    font-weight: 700;
    margin: 0;
    line-height: 1.1;
}

.signature {
    margin: 6px 0 8px;
    font-size: 13px;
    color: #6b7075;
    line-height: 1.4;
}

.auth-badges {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}

.identity-actions {
    display: flex;
    gap: 10px;
}

/* 头像上传块 */
.avatar-upload-block {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 6px 0;
    align-items: center;
}

.avatar-upload-label {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    text-align: center;
}

.avatar-upload-hint {
    font-size: 12px;
    color: #6b7280;
    text-align: center;
}

/* 表单网格与遮罩 */
.form-grid {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.dialog-saving {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, .6);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    z-index: 2;
    font-size: 14px;
    color: #334155;
}

.dialog-saving .spinner {
    width: 18px;
    height: 18px;
    border-radius: 9999px;
    border: 2px solid #93c5fd;
    border-top-color: #3b82f6;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* 简化的用户区 */
.user-section {
    display: flex;
    flex-direction: column;
    gap: 18px;
}

/* 响应式 */
@media (max-width:520px) {
    .nickname {
        font-size: 20px;
    }
}
</style>
