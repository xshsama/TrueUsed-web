<template>
    <div class="profile-page">
        <!-- 封面图区域 -->
        <div class="profile-cover">
            <div class="cover-pattern"></div>
            <div class="cover-overlay"></div>
        </div>

        <!-- 用户身份卡片 -->
        <div class="page-content">
            <section class="identity-card" v-if="!loading">
                <div class="identity-main">
                    <div class="avatar-wrapper" @click="onClickAvatar">
                        <van-image :src="avatarSrc" class="user-avatar" round fit="cover" @error="onAvatarError" />
                        <div class="avatar-edit-btn" v-if="isLoggedIn">
                            <van-icon name="photograph" />
                        </div>
                    </div>
                    <div class="user-info">
                        <h1 class="user-nickname">{{ userInfo.nickname || userInfo.username || '游客' }}</h1>

                        <!-- 新增：身份信息 -->
                        <div class="user-meta" v-if="isLoggedIn">
                            <span>已加入 128 天</span>
                            <span class="meta-divider">·</span>
                            <span>IP: 上海</span>
                        </div>

                        <div class="user-tags">
                            <!-- 优化：信用徽章 -->
                            <div class="credit-badge">
                                <van-icon name="medal-o" class="credit-icon" />
                                <span>信用极好</span>
                            </div>
                            <span class="tag-verified"
                                v-if="userInfo.emailVerified || userInfo.phoneVerified">已认证</span>
                        </div>
                        <div class="user-stats">
                            <div class="stat-box">
                                <span class="stat-num">12</span>
                                <span class="stat-name">收藏</span>
                            </div>
                            <div class="stat-divider"></div>
                            <div class="stat-box">
                                <span class="stat-num">5</span>
                                <span class="stat-name">关注</span>
                            </div>
                            <div class="stat-divider"></div>
                            <div class="stat-box">
                                <span class="stat-num">108</span>
                                <span class="stat-name">足迹</span>
                            </div>
                        </div>
                        <div class="user-actions">
                            <template v-if="isLoggedIn">
                                <van-button size="small" round class="btn-edit" @click="editProfile">
                                    <van-icon name="edit" /> 编辑资料
                                </van-button>
                            </template>
                            <template v-else>
                                <van-button size="small" round class="btn-login" @click="goLogin">
                                    立即登录
                                </van-button>
                            </template>
                        </div>
                    </div>
                </div>
            </section>
            <section class="identity-card skeleton-card" v-else>
                <van-skeleton avatar title :row="2" avatar-size="80px" />
            </section>

            <!-- 切换标签 -->
            <div class="tab-switcher">
                <button class="tab-btn" :class="{ active: activeTab === 'user' }" @click="activeTab = 'user'">
                    <van-icon name="user-o" /> 用户中心
                </button>
                <button class="tab-btn seller-tab" :class="{ active: activeTab === 'seller' }" @click="goSeller">
                    <van-icon name="shop-o" /> 卖家中心
                </button>
            </div>

            <!-- 用户中心内容 -->
            <div v-if="activeTab === 'user'" class="user-section">
                <!-- 我的订单 -->
                <div class="section-card">
                    <div class="section-header">
                        <span class="section-title">
                            <van-icon name="orders-o" class="section-icon" /> 我的订单
                        </span>
                        <span class="section-link" @click="viewAllOrders">
                            全部订单 <van-icon name="arrow" />
                        </span>
                    </div>
                    <div class="order-status-grid">
                        <div class="order-status-item" v-for="st in orderStatus" :key="st.key"
                            @click="goToOrderStatus(st.key)">
                            <div class="status-icon-wrapper linear-style">
                                <van-icon :name="st.icon" size="28" />
                                <span v-if="st.count > 0" class="status-badge">{{ st.count > 99 ? '99+' : st.count
                                    }}</span>
                            </div>
                            <span class="status-label">{{ st.label }}</span>
                        </div>
                    </div>
                </div>

                <!-- 常用功能 -->
                <div class="section-card">
                    <div class="section-header">
                        <span class="section-title">
                            <van-icon name="apps-o" class="section-icon" /> 常用功能
                        </span>
                    </div>
                    <div class="menu-grid">
                        <div class="menu-grid-item" @click="goToAddress">
                            <van-icon name="location-o" class="menu-grid-icon" />
                            <span class="menu-grid-text">地址管理</span>
                        </div>
                        <div class="menu-grid-item" @click="goToMyPosts">
                            <van-icon name="notes-o" class="menu-grid-icon" />
                            <span class="menu-grid-text">我的发布</span>
                        </div>
                        <div class="menu-grid-item" @click="goToMyReviews">
                            <van-icon name="comment-o" class="menu-grid-icon" />
                            <span class="menu-grid-text">我的评价</span>
                        </div>
                        <div class="menu-grid-item" @click="goToWallet">
                            <van-icon name="balance-o" class="menu-grid-icon" />
                            <span class="menu-grid-text">钱包/余额</span>
                        </div>
                        <div class="menu-grid-item" @click="goToHelp">
                            <van-icon name="question-o" class="menu-grid-icon" />
                            <span class="menu-grid-text">帮助中心</span>
                        </div>
                        <div class="menu-grid-item" @click="goToSettings">
                            <van-icon name="setting-o" class="menu-grid-icon" />
                            <span class="menu-grid-text">设置</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 卖家中心 -->
            <div v-else>
                <SellerCenter />
            </div>
        </div>

        <!-- 编辑资料弹窗 -->
        <van-dialog v-model:show="showEdit" title="编辑资料" :show-confirm-button="false" :show-cancel-button="false"
            class="edit-dialog">
            <div class="form-content">
                <div class="dialog-loading" v-if="saving">
                    <van-loading type="spinner" color="#4CAF50" />
                    <span>正在保存...</span>
                </div>
                <div class="avatar-upload-section">
                    <div class="upload-label">头像</div>
                    <div class="avatar-uploader-wrapper">
                        <ImageUpload v-model="avatarList" :max-images="1" :size="100" :round="true" hint=""
                            :show-count="false" />
                        <div class="camera-icon-overlay">
                            <van-icon name="photograph" />
                        </div>
                    </div>
                    <div class="upload-hint">支持 jpg/png/webp，建议 400x400 以上</div>
                </div>
                <van-field v-model="form.nickname" label="昵称" placeholder="请输入昵称" :error-message="errors.nickname"
                    class="form-field required-field" />
                <van-field v-model="form.phone" label="手机号" placeholder="可选" :error-message="errors.phone"
                    class="form-field" />
                <van-field v-model="form.bio" label="签名" type="textarea" rows="2" maxlength="80" show-word-limit
                    placeholder="介绍一下自己吧" class="form-field" />
            </div>
            <div class="dialog-footer">
                <van-button class="btn-cancel" plain @click="showEdit = false">取消</van-button>
                <van-button class="btn-confirm" type="primary" :loading="saving" @click="handleSave">确认</van-button>
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
    { key: 'unpaid', label: '待付款', icon: 'credit-pay', count: 1 },
    { key: 'toship', label: '待发货', icon: 'logistics', count: 0 },
    { key: 'toreceive', label: '待收货', icon: 'bag-o', count: 2 },
    { key: 'afterSale', label: '退款/售后', icon: 'refund-o', count: 0 }
])

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
    if (action !== 'confirm') {
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
        showEdit.value = false
    } catch (e) {
        console.error('保存资料失败:', e)
        showFailToast('更新失败')
    } finally {
        saving.value = false
    }
}

const handleSave = async () => {
    if (!validateAll()) {
        showFailToast('请修正表单错误')
        return
    }
    if (!isDirty.value) {
        showEdit.value = false
        return
    }
    await handleBeforeClose('confirm')
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
const goToMyPosts = () => router.push({ name: 'PostManage' }) // Assuming route name
const goToMyReviews = () => router.push({ name: 'MyReviews' })
const goToWallet = () => showToast('功能开发中')
const onClickAvatar = () => editProfile()
</script>

<style scoped>
.profile-page {
    min-height: 100vh;
    background: var(--bg-page, #f5f7fa);
}

/* 封面图区域 */
.profile-cover {
    height: 200px;
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    position: relative;
    overflow: hidden;
}

.cover-pattern {
    position: absolute;
    inset: 0;
    background-image:
        radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 10%),
        radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 10%),
        linear-gradient(45deg, rgba(255, 255, 255, 0.05) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.05) 75%, transparent 75%, transparent);
    background-size: 100% 100%, 100% 100%, 20px 20px;
}

.cover-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.05));
}

/* 页面内容 */
.page-content {
    padding: 0 16px 100px;
    margin-top: -60px;
    /* 调整上移距离 */
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

/* 身份卡片 */
.identity-card {
    background: #fff;
    border-radius: 20px;
    padding: 0 20px 24px;
    /* 顶部 padding 去掉，由 avatar margin 处理 */
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    position: relative;
    overflow: visible;
    /* 允许头像溢出 */
}

.skeleton-card {
    min-height: 180px;
    padding: 24px;
}

.identity-main {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.avatar-wrapper {
    position: relative;
    width: 84px;
    height: 84px;
    cursor: pointer;
    margin-top: -42px;
    /* 头像上移一半 */
    margin-bottom: 8px;
    border-radius: 50%;
    background: #fff;
    padding: 2px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-avatar {
    width: 100%;
    height: 100%;
    border: none;
}

.avatar-edit-btn {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 24px;
    height: 24px;
    background: var(--primary-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    border: 2px solid #fff;
}

.user-info {
    text-align: center;
    width: 100%;
}

.user-nickname {
    font-size: 22px;
    font-weight: 800;
    color: #1a1a1a;
    margin: 0 0 4px;
}

/* 新增：用户元数据 */
.user-meta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 12px;
    color: #666;
    margin-bottom: 12px;
}

.meta-divider {
    color: #ddd;
}

.user-tags {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 20px;
}

/* 优化：信用徽章 */
.credit-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    background: #fff;
    border: 1px solid var(--primary-color);
    color: var(--primary-color);
    font-size: 12px;
    padding: 3px 9px;
    border-radius: 12px;
    font-weight: 600;
}

.credit-icon {
    font-size: 14px;
}

.tag-verified {
    background: #dcfce7;
    color: #16a34a;
    font-size: 11px;
    padding: 4px 8px;
    border-radius: 12px;
    font-weight: 500;
    display: flex;
    align-items: center;
}

.user-stats {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 32px;
    /* 增加间距 */
    margin-bottom: 20px;
}

.stat-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
}

.stat-num {
    font-size: 20px;
    /* 放大数字 */
    font-weight: 800;
    /* 加粗 */
    color: #1a1a1a;
    font-family: var(--font-family-number);
}

.stat-name {
    font-size: 12px;
    color: #999;
    font-weight: 500;
}

.stat-divider {
    width: 1px;
    height: 16px;
    background: #eee;
}

.user-actions {
    display: flex;
    justify-content: center;
    gap: 12px;
}

.btn-edit,
.btn-security {
    border: none;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 16px;
    font-size: 13px;
}

.btn-edit {
    background: var(--primary-color);
    color: #fff;
}

.btn-security {
    background: #f5f7fa;
    color: #666;
}

.btn-login {
    background: var(--primary-color);
    color: #fff;
    border: none;
    padding: 10px 32px;
}

/* 标签切换 */
.tab-switcher {
    display: flex;
    background: transparent;
    padding: 0 16px;
    margin-bottom: 16px;
    border-bottom: 1px solid #eee;
}

.tab-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 16px;
    border: none;
    background: transparent;
    font-size: 15px;
    font-weight: 500;
    color: #999;
    transition: all 0.3s ease;
    position: relative;
}

.tab-btn.active {
    color: var(--primary-color);
    font-weight: 600;
    background: transparent;
    box-shadow: none;
}

.tab-btn.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 3px;
    background: var(--primary-color);
    border-radius: 3px;
}

.tab-btn.seller-tab.active {
    color: var(--primary-color);
}

.tab-btn.seller-tab.active::after {
    background: var(--primary-color);
}

/* 用户中心区域 */
.user-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

/* 区块卡片 */
.section-card {
    background: #fff;
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
}

.section-icon {
    color: var(--primary-color);
}

.section-link {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: var(--primary-color);
}

/* 订单状态网格 */
.order-status-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
}

.order-status-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: opacity 0.2s ease;
}

.order-status-item:active {
    opacity: 0.7;
}

.status-icon-wrapper.linear-style {
    position: relative;
    width: 48px;
    height: 48px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-color);
    background: #E8F5E9;
    /* border: 1px solid var(--primary-color); */
}

.status-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    background: #f43f5e;
    border-radius: 8px;
    font-size: 10px;
    font-weight: 600;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
}

.status-label {
    font-size: 12px;
    color: #666;
}

/* 菜单网格 */
.menu-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 32px 12px;
    /* 增加垂直间距 */
}

.menu-grid-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 0;
    background: transparent;
    border-radius: 0;
    cursor: pointer;
    transition: opacity 0.2s ease;
}

.menu-grid-item:active {
    background: transparent;
    opacity: 0.7;
}

.menu-grid-icon {
    font-size: 28px;
    color: var(--primary-color);
    background: #E8F5E9;
    width: 48px;
    height: 48px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.menu-grid-text {
    font-size: 12px;
    font-weight: 500;
    color: #374151;
}

/* 编辑弹窗 */
.edit-dialog :deep(.van-dialog__header) {
    padding-top: 24px;
    padding-bottom: 20px;
    /* 增加标题下方间距 */
    font-weight: 700;
}

.form-content {
    position: relative;
    padding: 0 20px 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.dialog-loading {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    z-index: 10;
    font-size: 14px;
    color: var(--primary-color);
}

.avatar-upload-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
}

.upload-label {
    display: none;
    /* 隐藏多余的标签，头像自说明 */
}

.avatar-uploader-wrapper {
    position: relative;
    width: 100px;
    height: 100px;
}

/* 覆盖 ImageUpload 样式以隐藏默认加号并适配 */
.avatar-uploader-wrapper :deep(.upload-placeholder) {
    border: 2px solid var(--primary-color) !important;
    /* 绿色描边 */
    background: #f9f9f9;
}

.avatar-uploader-wrapper :deep(.plus-icon),
.avatar-uploader-wrapper :deep(.upload-text) {
    display: none;
    /* 隐藏默认的加号和文字 */
}

.camera-icon-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    /* 让点击穿透到上传组件 */
    color: var(--primary-color);
    font-size: 32px;
}

.upload-hint {
    font-size: 12px;
    color: #999;
    /* 浅灰色 */
    font-weight: 400;
}

.form-field {
    background: #f5f7fa;
    border-radius: 12px;
    padding: 12px 16px;
    transition: all 0.3s ease;
    border: 1px solid transparent;
}

/* 输入框焦点状态 */
.form-field:focus-within {
    background: #fff;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.form-field :deep(.van-field__label) {
    color: #666;
    font-weight: 400;
    /* 字体变细 */
    width: 4em;
}

/* 必填项星号颜色 */
.required-field :deep(.van-field__label)::before {
    content: '*';
    color: #FF9800;
    /* 橙色 */
    margin-right: 2px;
}

/* 底部按钮 */
.dialog-footer {
    display: flex;
    gap: 16px;
    padding: 16px 24px 24px;
}

.dialog-footer .van-button {
    flex: 1;
    height: 40px;
    border-radius: 20px;
    font-size: 15px;
}

.btn-cancel {
    color: var(--primary-color) !important;
    border-color: var(--primary-color) !important;
    background: #fff !important;
}

.btn-confirm {
    background: var(--primary-color) !important;
    border-color: var(--primary-color) !important;
    font-weight: 600;
}

/* 响应式 */
@media (max-width: 375px) {
    .order-status-grid {
        gap: 8px;
    }

    .status-icon-wrapper {
        width: 42px;
        height: 42px;
        border-radius: 12px;
    }

    .user-nickname {
        font-size: 20px;
    }
}
</style>
