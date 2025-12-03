<template>
    <div class="profile-page" :class="isSellerMode ? 'theme-seller' : 'theme-buyer'">
        <!-- 头部区域 (沉浸式背景) -->
        <div class="profile-header">
            <div class="header-content">
                <!-- 用户信息 & 头像 -->
                <div class="user-identity">
                    <div class="avatar-section" @click="editProfile">
                        <div class="avatar-container">
                            <van-image :src="avatarSrc" class="user-avatar" round fit="cover" @error="onAvatarError" />
                            <div class="edit-badge" v-if="isLoggedIn">
                                <van-icon name="photograph" />
                            </div>
                        </div>
                    </div>

                    <div class="info-section">
                        <div class="nickname-row">
                            <h1 class="nickname">{{ userInfo.nickname || userInfo.username || '点击登录' }}</h1>
                            <van-tag v-if="isLoggedIn" round color="rgba(255,255,255,0.2)" text-color="#fff">
                                {{ isSellerMode ? '个人卖家' : '普通会员' }}
                            </van-tag>
                        </div>

                        <!-- 身份切换 (The Switcher) -->
                        <div class="identity-switcher-wrapper">
                            <div class="identity-switcher">
                                <div class="switcher-track"></div>
                                <div class="switcher-slider" :style="{ left: isSellerMode ? '50%' : '0' }"></div>
                                <div class="switcher-item" :class="{ active: !isSellerMode }"
                                    @click="switchMode(false)">
                                    <span class="text">买家版</span>
                                </div>
                                <div class="switcher-item" :class="{ active: isSellerMode }" @click="switchMode(true)">
                                    <span class="text">卖家版</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 核心数据 (Key Data) - Compact Layout -->
                <div class="header-stats">
                    <div class="stat-item">
                        <div class="stat-value">
                            <span class="symbol">¥</span>
                            <span class="num">{{ isSellerMode ? '12,850.00' : '2,450' }}</span>
                        </div>
                        <div class="stat-label">{{ isSellerMode ? '累计收益' : '累计节省' }}</div>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item">
                        <div class="stat-value">
                            <span class="num">{{ isSellerMode ? '15' : '8' }}</span>
                        </div>
                        <div class="stat-label">{{ isSellerMode ? '在售商品' : '可用券' }}</div>
                    </div>
                </div>
            </div>

            <!-- 装饰背景 -->
            <div class="header-bg-decoration"></div>
        </div>

        <!-- 内容区域 -->
        <div class="page-content">
            <transition name="fade-slide" mode="out-in">

                <!-- 买家中心 (Consumer UX) -->
                <div v-if="!isSellerMode" class="mode-content buyer-content" key="buyer">

                    <!-- 1. 订单追踪 -->
                    <section class="card-section">
                        <div class="card-header" @click="viewAllOrders">
                            <span class="card-title">我的订单</span>
                            <span class="card-more">全部 <van-icon name="arrow" /></span>
                        </div>

                        <div v-if="hasOrders" class="grid-menu">
                            <div class="grid-item" v-for="item in buyerOrderStatus" :key="item.key"
                                @click="goToOrderStatus(item.key)">
                                <div class="icon-box buyer-icon">
                                    <van-icon :name="item.icon" />
                                    <div class="badge" v-if="item.count > 0">{{ item.count }}</div>
                                </div>
                                <span class="label">{{ item.label }}</span>
                            </div>
                        </div>

                        <!-- 空状态 -->
                        <div v-else class="empty-state-card">
                            <van-icon name="shopping-cart-o" class="empty-icon" />
                            <p class="empty-text">您还没有订单，去首页逛逛吧</p>
                            <van-button round type="primary" size="small" color="#4FA37F" to="/">去首页</van-button>
                        </div>
                    </section>

                    <!-- 2. 资产与服务 -->
                    <section class="card-section">
                        <div class="card-header">
                            <span class="card-title">我的资产 & 服务</span>
                        </div>
                        <div class="grid-menu col-4">
                            <div class="grid-item" @click="goToFavorites">
                                <div class="icon-box buyer-icon"><van-icon name="star-o" /></div>
                                <span class="label">我的收藏</span>
                            </div>
                            <div class="grid-item" @click="goToAddress">
                                <div class="icon-box buyer-icon"><van-icon name="location-o" /></div>
                                <span class="label">收货地址</span>
                            </div>
                            <div class="grid-item">
                                <div class="icon-box buyer-icon"><van-icon name="delete-o" /></div>
                                <span class="label">浏览历史</span>
                            </div>
                            <div class="grid-item" @click="goToSettings">
                                <div class="icon-box buyer-icon"><van-icon name="setting-o" /></div>
                                <span class="label">设置</span>
                            </div>
                        </div>
                    </section>

                    <!-- 3. 推荐 (常购/猜你喜欢) -->
                    <section class="recommend-section">
                        <div class="recommend-title">猜你喜欢</div>
                        <div class="recommend-grid">
                            <!-- 占位符: 实际项目中这里应该是商品 Feed 流 -->
                            <div class="recommend-placeholder" v-for="i in 2" :key="i">
                                <div class="ph-img"></div>
                                <div class="ph-txt"></div>
                                <div class="ph-txt short"></div>
                            </div>
                        </div>
                    </section>
                </div>

                <!-- 卖家中心 (Merchant UX) -->
                <div v-else class="mode-content seller-content" key="seller">

                    <!-- 1. 待办事项 (Action Items) -->
                    <section class="card-section">
                        <div class="card-header">
                            <span class="card-title">待办事项</span>
                            <span class="card-more action-urgent">{{ pendingActionsCount }} 个待处理</span>
                        </div>
                        <div class="action-buttons-row">
                            <div class="action-btn-item clickable" @click="handleAction('ship')">
                                <div class="action-btn-content">
                                    <span class="action-num">3</span>
                                    <span class="action-txt">待发货</span>
                                </div>
                                <van-icon name="arrow" class="action-arrow" />
                            </div>
                            <div class="action-btn-item clickable" @click="handleAction('refund')">
                                <div class="action-btn-content">
                                    <span class="action-num">0</span>
                                    <span class="action-txt">处理退款</span>
                                </div>
                                <van-icon name="arrow" class="action-arrow" />
                            </div>
                            <div class="action-btn-item clickable" @click="handleAction('reply')">
                                <div class="action-btn-content">
                                    <span class="action-num">99+</span>
                                    <span class="action-txt">未读消息</span>
                                </div>
                                <van-icon name="arrow" class="action-arrow" />
                            </div>
                        </div>
                    </section>

                    <!-- 2. 生意参谋 (Analytics) -->
                    <section class="card-section">
                        <div class="card-header">
                            <span class="card-title">生意参谋</span>
                            <span class="card-more clickable">近7天数据 <van-icon name="arrow-down" /></span>
                        </div>
                        <div class="analytics-preview">
                            <div class="chart-placeholder">
                                <!-- Smooth Curve (Spline) -->
                                <svg width="100%" height="60" viewBox="0 0 300 60" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" style="stop-color:rgb(232,143,79);stop-opacity:0.2" />
                                            <stop offset="100%" style="stop-color:rgb(232,143,79);stop-opacity:0" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M0,50 C50,45 80,30 150,25 S250,40 300,15" fill="none" stroke="#E88F4F"
                                        stroke-width="2" />
                                    <path d="M0,50 C50,45 80,30 150,25 S250,40 300,15 V60 H0 Z" fill="url(#grad1)"
                                        stroke="none" />
                                    <circle cx="300" cy="15" r="3" fill="#E88F4F" />
                                </svg>
                            </div>
                            <div class="analytics-data-row">
                                <div class="data-point">
                                    <span class="num">1,205</span>
                                    <span class="lbl">浏览量</span>
                                </div>
                                <div class="data-point">
                                    <span class="num">8</span>
                                    <span class="lbl">已卖出</span>
                                </div>
                                <div class="data-point">
                                    <span class="num">¥3,400</span>
                                    <span class="lbl">收益</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- 3. 商品管理 -->
                    <section class="card-section">
                        <div class="card-header">
                            <span class="card-title">常用工具</span>
                        </div>
                        <div class="grid-menu col-4">
                            <div class="grid-item" @click="goToMyPosts">
                                <div class="icon-box seller-icon"><van-icon name="goods-collect-o" /></div>
                                <span class="label">商品管理</span>
                            </div>
                            <div class="grid-item">
                                <div class="icon-box seller-icon"><van-icon name="chart-trending-o" /></div>
                                <span class="label">数据中心</span>
                            </div>
                            <div class="grid-item">
                                <div class="icon-box seller-icon"><van-icon name="logistics" /></div>
                                <span class="label">发货设置</span>
                            </div>
                            <div class="grid-item">
                                <div class="icon-box seller-icon"><van-icon name="shop-o" /></div>
                                <span class="label">店铺设置</span>
                            </div>
                        </div>
                    </section>

                    <!-- 空状态 (无发布/无销售) - 演示用 -->
                    <section v-if="!hasSales" class="empty-state-card mt-4">
                        <div class="empty-illustration-piggy">🐷</div>
                        <p class="empty-text">把闲置变现，第一笔收入在等你</p>
                    </section>

                </div>
            </transition>
        </div>

        <!-- 卖家模式底部悬浮按钮 (Green Button) -->
        <div class="sticky-footer" v-if="isSellerMode">
            <van-button block round color="#4FA37F" class="publish-btn" icon="plus" @click="goToPublish">
                立即发布闲置
            </van-button>
        </div>

        <!-- 底部占位，防止内容被 Tabbar 遮挡 -->
        <div class="bottom-spacer"></div>

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
import { useUserStore } from '@/stores/user'
import { showFailToast, showSuccessToast, showToast } from 'vant'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(true)
const isSellerMode = ref(false)

const isLoggedIn = computed(() => userStore.isLoggedIn)
const userInfo = computed(() => userStore.user || {})
const defaultAvatar = defaultAvatarUrl
const avatarSrc = ref('')

// Mock Data States
const hasOrders = ref(true) // Set to false to see empty state
const hasSales = ref(true)

onMounted(async () => {
    if (route.query.tab === 'seller') {
        isSellerMode.value = true
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

const switchMode = (isSeller) => {
    isSellerMode.value = isSeller;
}

const buyerOrderStatus = ref([
    { key: 'unpaid', label: '待付款', icon: 'credit-pay', count: 1 },
    { key: 'toship', label: '待发货', icon: 'logistics', count: 0 },
    { key: 'toreceive', label: '待收货', icon: 'bag-o', count: 2 },
    { key: 'afterSale', label: '退款/售后', icon: 'refund-o', count: 0 }
])

const pendingActionsCount = ref(3)

// Form Logic
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
    if (!isLoggedIn.value) {
        goLogin()
        return
    }
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

const handleSave = async () => {
    if (!validateAll()) {
        showFailToast('请修正表单错误')
        return
    }
    if (!isDirty.value) {
        showEdit.value = false
        return
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

watch(avatarList, (val) => { form.value.avatarUrl = (val && val[0]) || '' })
watch(() => form.value.nickname, (v) => { errors.value.nickname = validateNickname(v) })
watch(() => form.value.phone, (v) => { errors.value.phone = validatePhone(v) })

// Navigation
const goLogin = () => router.push({ name: 'Login', query: { redirect: '/profile' } })
const viewAllOrders = () => router.push({ name: 'Orders' })
const goToOrderStatus = (key) => {
    router.push({ name: 'Orders', query: { status: key } })
}
const goToAddress = () => router.push({ name: 'Address' })
const goToFavorites = () => router.push({ name: 'Favorites' })
const goToService = () => router.push({ name: 'ServiceCenter' })
const goToSettings = () => router.push({ name: 'Settings' })
const goToMyPosts = () => router.push({ name: 'PostManage' })
const goToPublish = () => router.push({ name: 'PostCreate' })
const handleAction = (action) => {
    if (action === 'ship') router.push({ name: 'OrderManage', query: { status: 'toship' } })
    else showToast('功能开发中')
}
</script>

<style scoped>
/* 
  Theme Variables
*/
.theme-buyer {
    --primary-bg: #4FA37F;
    --primary-text: #ffffff;
    --accent-color: #4FA37F;
    --header-bg: #4FA37F;
    --active-text: #4FA37F;
}

.theme-seller {
    --primary-bg: #E88F4F;
    --primary-text: #ffffff;
    --accent-color: #E88F4F;
    --header-bg: linear-gradient(135deg, #FFB300 0%, #E88F4F 100%);
    --active-text: #E65100;
}

.profile-page {
    --bg-page: #f7f8fa;
    --text-main: #333;
    --text-light: #999;

    min-height: 100vh;
    background: var(--bg-page);
    padding-bottom: 80px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* Header Area */
.profile-header {
    background: var(--header-bg);
    padding: 50px 20px 70px;
    /* Reduced padding */
    color: #fff;
    position: relative;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
    transition: background 0.3s ease;
    overflow: visible;
}

.header-content {
    position: relative;
    z-index: 2;
}

.user-identity {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
}

.avatar-container {
    width: 72px;
    /* Smaller avatar */
    height: 72px;
    border-radius: 50%;
    border: 3px solid rgba(255, 255, 255, 0.4);
    padding: 2px;
    position: relative;
}

.user-avatar {
    width: 100%;
    height: 100%;
}

.edit-badge {
    position: absolute;
    bottom: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    border-radius: 50%;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
}

.nickname-row {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.nickname {
    font-size: 18px;
    font-weight: 700;
    margin: 0;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Switcher (Capsule) */
.identity-switcher-wrapper {
    margin-top: 12px;
    display: flex;
    justify-content: center;
    width: 100%;
}

.identity-switcher {
    width: 180px;
    height: 32px;
    position: relative;
    display: flex;
    align-items: center;
    border-radius: 16px;
    background: rgba(0, 0, 0, 0.1);
    padding: 2px;
    backdrop-filter: blur(4px);
}

.switcher-track {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 16px;
}

.switcher-slider {
    position: absolute;
    top: 2px;
    bottom: 2px;
    width: 50%;
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: left 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
    z-index: 1;
}

.switcher-item {
    flex: 1;
    text-align: center;
    z-index: 2;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    line-height: 28px;
    color: rgba(255, 255, 255, 0.9);
    transition: color 0.3s;
}

.switcher-item.active {
    color: var(--active-text);
    font-weight: 700;
}

/* Stats */
.header-stats {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 40px;
    margin-top: 10px;
}

.stat-item {
    text-align: center;
}

.stat-divider {
    width: 1px;
    height: 20px;
    background: rgba(255, 255, 255, 0.3);
}

.stat-value {
    font-size: 20px;
    font-weight: 800;
    font-family: 'DIN Alternate', sans-serif;
    margin-bottom: 2px;
}

.stat-value .symbol {
    font-size: 12px;
    margin-right: 2px;
}

.stat-label {
    font-size: 11px;
    opacity: 0.9;
}

/* Page Content */
.page-content {
    margin-top: -30px;
    /* Pull up to overlap header */
    padding: 0 16px;
    position: relative;
    z-index: 10;
}

.card-section {
    background: #fff;
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.card-title {
    font-size: 16px;
    font-weight: 700;
    color: #333;
}

.card-more {
    font-size: 12px;
    color: #999;
    display: flex;
    align-items: center;
}

.clickable:active {
    opacity: 0.7;
}

.action-urgent {
    color: #FF5722;
    background: #FFCCBC;
    padding: 2px 6px;
    border-radius: 4px;
}

/* Grid Menu (Orders/Tools) */
.grid-menu {
    display: flex;
    justify-content: space-between;
}

.grid-menu.col-4 {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
}

.grid-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.icon-box {
    font-size: 26px;
    position: relative;
}

.badge {
    position: absolute;
    top: -5px;
    right: -8px;
    background: #ff4d4f;
    color: #fff;
    font-size: 10px;
    padding: 0 4px;
    border-radius: 8px;
    min-width: 16px;
    text-align: center;
    border: 1px solid #fff;
}

.label {
    font-size: 12px;
    color: #555;
}

.buyer-icon {
    color: #4FA37F;
}

.seller-icon {
    color: #E88F4F;
}

/* Action Buttons (Seller) */
.action-buttons-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
}

.action-btn-item {
    background: #f9f9f9;
    border-radius: 8px;
    padding: 12px 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.action-btn-content {
    display: flex;
    flex-direction: column;
}

.action-num {
    font-size: 16px;
    font-weight: 800;
    color: #333;
}

.action-txt {
    font-size: 11px;
    color: #666;
}

.action-arrow {
    font-size: 12px;
    color: #ccc;
}

/* Analytics */
.analytics-preview {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.analytics-data-row {
    display: flex;
    justify-content: space-between;
}

.data-point {
    display: flex;
    flex-direction: column;
}

.data-point .num {
    font-size: 16px;
    font-weight: 700;
    color: #333;
}

.data-point .lbl {
    font-size: 11px;
    color: #999;
}

/* Recommend / Empty State */
.recommend-title {
    font-size: 15px;
    font-weight: 700;
    margin: 20px 0 12px;
    padding-left: 8px;
    border-left: 4px solid var(--accent-color);
}

.recommend-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}

.recommend-placeholder {
    background: #fff;
    border-radius: 8px;
    padding: 10px;
    height: 180px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.ph-img {
    background: #f0f0f0;
    flex: 1;
    border-radius: 4px;
}

.ph-txt {
    height: 12px;
    background: #f0f0f0;
    border-radius: 2px;
}

.ph-txt.short {
    width: 60%;
}

.empty-state-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px 0;
    gap: 12px;
}

.empty-icon {
    font-size: 48px;
    color: #ddd;
}

.empty-illustration-piggy {
    font-size: 64px;
}

.empty-text {
    font-size: 14px;
    color: #999;
}

/* Sticky Footer */
.sticky-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 12px 24px 24px;
    background: #fff;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
    z-index: 100;
}

.bottom-spacer {
    height: 20px;
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(10px);
}
</style>
