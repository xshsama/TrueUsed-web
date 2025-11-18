<template>
    <div class="profile-page">
        <van-nav-bar title="我的" fixed />
        <!-- 顶部封面（浅色柔和渐变） -->
        <div class="top-cover bg-cover-soft"></div>
        <!-- 顶层悬浮头像（置于最上层） -->
        <div class="avatar-top">
            <van-image :src="userInfo.avatarUrl || defaultAvatar" class="avatar" round fit="cover" />
        </div>
        <div class="page-content">
            <!-- 路由化分区：用户中心 | 卖家中心 -->
            <div class="tu-seg shadow-soft-lg">
                <button class="tu-seg-btn" :class="{ 'is-active': activeTab === 'user' }"
                    @click="activeTab = 'user'">用户中心</button>
                <button class="tu-seg-btn" :class="{ 'is-active': activeTab === 'seller' }"
                    @click="goSeller">卖家中心</button>
            </div>

            <!-- 用户中心内容 -->
            <div v-if="activeTab === 'user'">
                <!-- 顶部身份信息区 -->
                <section class="identity-card shadow-soft-lg glass-card">
                    <div class="identity-main" v-if="!loading">
                        <div class="identity-text">
                            <div class="row">
                                <h1 class="nickname">{{ userInfo.nickname || userInfo.username || '游客' }}</h1>
                                <van-tag type="primary" size="small" round>{{ creditStatus.level }}</van-tag>
                            </div>
                            <p class="signature" v-if="userInfo.bio">{{ userInfo.bio }}</p>
                            <div class="auth-badges">
                                <van-tag v-if="userInfo.emailVerified" type="success" size="mini" round>邮箱已验证</van-tag>
                                <van-tag v-if="userInfo.phoneVerified" type="primary" size="mini" round>已绑定手机</van-tag>
                                <van-tag plain type="warning" size="mini" round>信用 {{ creditStatus.score }}</van-tag>
                            </div>
                        </div>
                    </div>
                    <div v-else class="identity-skeleton">
                        <van-skeleton avatar title :row="2" avatar-size="70px" />
                    </div>
                    <div class="identity-actions">
                        <template v-if="isLoggedIn">
                            <van-button size="small" round type="primary" plain @click="editProfile">编辑资料</van-button>
                            <van-button size="small" round type="default" plain @click="openSecurity">安全设置</van-button>
                        </template>
                        <template v-else>
                            <van-button size="small" round type="primary" class="btn-primary"
                                @click="goLogin">立即登录</van-button>
                        </template>
                    </div>
                </section>

                <!-- 用户区：常用入口、订单状态等 -->
                <section class="user-section">
                    <div class="tu-list-card shadow-soft-lg">
                        <div class="tu-list-item" @click="viewAllOrders">
                            <div class="tu-list-icon-bubble" style="background:#3b82f6"><van-icon name="orders-o" />
                            </div>
                            <div>
                                <div class="tu-list-title">我的订单</div>
                                <div class="tu-list-subtitle">查看全部订单记录</div>
                            </div>
                            <div class="tu-list-right">
                                <div class="tu-list-right-bubble"><van-icon name="arrow" /></div>
                            </div>
                        </div>
                        <div class="tu-list-item" @click="goToOrderStatus('favorites')">
                            <div class="tu-list-icon-bubble" style="background:#ef4444"><van-icon name="like-o" /></div>
                            <div>
                                <div class="tu-list-title">我的收藏</div>
                                <div class="tu-list-subtitle">关注的商品与店铺</div>
                            </div>
                            <div class="tu-list-right">
                                <div class="tu-list-right-bubble"><van-icon name="arrow" /></div>
                            </div>
                        </div>
                        <div class="tu-list-item" @click="goToAddress">
                            <div class="tu-list-icon-bubble" style="background:#06b6d4"><van-icon name="location-o" />
                            </div>
                            <div>
                                <div class="tu-list-title">地址管理</div>
                                <div class="tu-list-subtitle">收货地址与常用地址</div>
                            </div>
                            <div class="tu-list-right">
                                <div class="tu-list-right-bubble"><van-icon name="arrow" /></div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <!-- 卖家中心内容 -->
            <SellerCenter v-if="activeTab === 'seller'" />

            <!-- 编辑资料弹窗 -->
            <van-dialog v-model:show="showEdit" title="编辑资料" show-cancel-button @confirm="submitEdit">
                <div class="form-grid">
                    <van-field v-model="form.nickname" label="昵称" maxlength="50" placeholder="请输入昵称" />
                    <div class="avatar-upload-block">
                        <div class="avatar-upload-label">头像</div>
                        <ImageUpload v-model="avatarList" :max-images="1" />
                        <div class="avatar-upload-hint">仅支持单张，上传后自动替换当前头像。</div>
                    </div>
                    <van-field v-model="form.phone" label="手机号" maxlength="20" placeholder="请输入手机号" />
                    <van-field v-model="form.bio" type="textarea" rows="3" maxlength="300" show-word-limit label="简介"
                        placeholder="一句话介绍自己" />
                </div>
            </van-dialog>
        </div>
    </div>
</template>

<script>
import ImageUpload from '@/components/ImageUpload.vue'
import SellerCenter from '@/components/SellerCenter.vue'
import { useUserStore } from '@/stores/user'
import { Dialog, Toast } from 'vant'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
    name: 'Profile',
    components: {
        SellerCenter,
        ImageUpload
    },
    setup() {
        const router = useRouter()
        const route = useRoute()
        const userStore = useUserStore()
        const activeTab = ref('user') // 'user' or 'seller'
        const defaultAvatar = 'https://placehold.co/80x80/4CAF50/ffffff?text=用户'
        const userInfo = computed(() => userStore.user || {})
        const loading = ref(true)
        const isLoggedIn = computed(() => userStore.isLoggedIn)

        // 加载我的资料
        onMounted(async () => {
            if (route.query.tab === 'seller') {
                activeTab.value = 'seller'
            }
            try {
                if (userStore.isLoggedIn) {
                    await userStore.loadMe()
                }
            } finally {
                loading.value = false
            }
        })

        // 认证/信用状态
        const creditStatus = ref({
            level: 'LV.3',
            verified: true,
            phoneBound: true,
            score: 95
        })

        // 订单状态列表数据
        const orderStatus = ref([
            { key: 'unpaid', label: '待付款', icon: 'pending-payment', count: 1 },
            { key: 'toship', label: '待发货', icon: 'logistics', count: 0 },
            { key: 'toreceive', label: '待收货', icon: 'cart-o', count: 2 },
            { key: 'afterSale', label: '退款/售后', icon: 'after-sale', count: 0 }
        ])

        const iconBg = (key) => {
            const map = {
                unpaid: '#38bdf8',
                toship: '#a78bfa',
                toreceive: '#22c55e',
                afterSale: '#f43f5e'
            }
            return `background:${map[key] || '#93c5fd'}`
        }

        // 钱包余额
        const walletBalance = ref(2356.78)

        const showEdit = ref(false)
        const form = ref({ nickname: '', avatarUrl: '', bio: '', phone: '' })
        const avatarList = ref([])
        const editProfile = () => {
            form.value = {
                nickname: userInfo.value.nickname || '',
                avatarUrl: userInfo.value.avatarUrl || '',
                bio: userInfo.value.bio || '',
                phone: userInfo.value.phone || ''
            }
            avatarList.value = form.value.avatarUrl ? [form.value.avatarUrl] : []
            showEdit.value = true
        }
        const submitEdit = async () => {
            try {
                await userStore.saveMe(form.value)
                // 成功分支：已有 Toast.success 方法可用
                if (typeof Toast.success === 'function') {
                    Toast.success('已更新资料')
                } else if (typeof Toast.show === 'function') {
                    Toast.show({ message: '已更新资料', type: 'success' })
                }
                showEdit.value = false
            } catch (e) {
                console.error('保存资料失败:', e)
                // 失败提示统一使用对象式调用，避免把 Toast 当函数执行
                if (typeof Toast.fail === 'function') {
                    Toast.fail('更新失败')
                } else if (typeof Toast.show === 'function') {
                    Toast.show({ message: '更新失败', type: 'fail' })
                } else if (typeof Toast === 'object' && typeof Toast.success === 'function') {
                    // 退化到 success 方法但仍提示失败（视觉不理想，临时兜底）
                    Toast.success('更新失败')
                } else {
                    // 最终兜底：没有可用 UI 方法
                    console.warn('Toast API 不可用，无法显示失败提示')
                }
            }
        }
        watch(avatarList, (val) => {
            form.value.avatarUrl = val[0] || ''
        })
        const openSecurity = () => router.push({ name: 'Settings' })
        const goLogin = () => router.push({ name: 'Login', query: { redirect: '/profile' } })

        // 跳转到统计详情
        const goToStatDetail = (type) => {
            Toast(`${type}详情功能开发中`)
        }

        const viewAllOrders = () => router.push({ name: 'Orders' })
        const goToOrderStatus = (key) => {
            if (key === 'favorites') {
                router.push({ name: 'Favorites' })
            } else {
                router.push({ name: 'Orders', query: { status: key } })
            }
        }

        const goSeller = () => {
            if (!isLoggedIn.value) {
                Toast('请先登录')
                router.push({ name: 'Login', query: { redirect: '/profile?tab=seller' } })
                return
            }
            activeTab.value = 'seller'
        }

        const withdraw = () => router.push({ name: 'Settlement', query: { action: 'withdraw' } })
        const viewWalletDetail = () => router.push({ name: 'Settlement', query: { tab: 'details' } })

        // 跳转到地址管理
        const goToAddress = () => router.push({ name: 'Address' })

        // 跳转到实名认证
        const goToVerification = () => router.push({ name: 'Verification' })

        // 跳转到客服中心
        const goToService = () => router.push({ name: 'ServiceCenter' })

        // 跳转到帮助中心
        const goToHelp = () => router.push({ name: 'Help' })

        // 跳转到意见反馈
        const goToFeedback = () => router.push({ name: 'Feedback' })

        // 跳转到设置
        const goToSettings = () => router.push({ name: 'Settings' })

        // 跳转到关于我们
        const goToAbout = () => router.push({ name: 'About' })

        // 卖家相关入口
        const createProduct = () => router.push({ name: 'PostCreate' })
        const goToMyProducts = () => router.push({ name: 'MyProducts' })
        const goToSoldProducts = () => router.push({ name: 'SoldProducts' })

        // 退出登录
        const logout = () => {
            Dialog.confirm({
                title: '确认退出',
                message: '确定要退出登录吗？',
            }).then(() => {
                userStore.logout()
                Toast.success('已退出登录')
                router.push('/home')
            }).catch(() => {
                console.log('取消退出')
            })
        }

        return {
            userInfo,
            defaultAvatar,
            loading,
            goSeller,
            activeTab,
            creditStatus,
            orderStatus,
            walletBalance,
            editProfile,
            showEdit,
            form,
            avatarList,
            submitEdit,
            openSecurity,
            viewAllOrders,
            goToOrderStatus,
            withdraw,
            viewWalletDetail,
            goToAddress,
            goToVerification,
            goToService,
            goToHelp,
            goToFeedback,
            goToSettings,
            goToAbout,
            createProduct,
            goToMyProducts,
            goToSoldProducts,
            logout,
            iconBg,
            isLoggedIn,
            goLogin
        }
    }
}
</script>

<style scoped>
/* 新版样式 */
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

.avatar-top {
    position: relative;
    margin-top: -48px;
    /* 轻微上移，使头像压住封面底缘 */
    display: flex;
    justify-content: center;
    z-index: 3;
}

.avatar-top .avatar {
    width: 86px;
    height: 86px;
    box-shadow: 0 12px 28px -12px rgba(0, 0, 0, .35);
    border: 4px solid #fff;
}

.page-content {
    padding-top: 0;
    padding-bottom: 40px;
    max-width: 880px;
    /* 统一竖直布局收窄宽度更聚焦 */
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-top: -40px;
    /* 调整卡片与头像的重叠关系 */
    /* 让卡片上移覆盖封面下缘 */
    position: relative;
    z-index: 1;
}

/* 分段控制（用户/卖家） */
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

/* 基础块通用样式 */
.card-block {
    background: #fff;
    border-radius: 20px;
    padding: 18px 20px;
    box-shadow: 0 4px 18px -6px rgba(0, 0, 0, .08);
    display: flex;
    flex-direction: column;
    gap: 16px;
}

/* 标题行（标题 + 操作按钮） */
.block-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
}

/* 区域容器（交易 / 资产）统一为纵向间距布局 */
.trade-section,
.asset-section {
    display: flex;
    flex-direction: column;
    gap: 22px;
}

.block-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: #1d1d1f;
}

/* 身份卡 */
.identity-card {
    background: #fff;
    border-radius: 20px;
    padding: 18px 20px;
    box-shadow: 0 4px 18px -6px rgba(0, 0, 0, .08);
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.identity-main {
    display: flex;
    gap: 16px;
    align-items: center;
}

.identity-main .avatar {
    width: 70px;
    height: 70px;
    border: 3px solid #fff;
    box-shadow: 0 4px 14px -4px rgba(0, 0, 0, .15);
}

.avatar-ring .avatar {
    border: 0;
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
}

.avatar-upload-label {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
}

.avatar-upload-hint {
    font-size: 12px;
    color: #6b7280;
}

/* 旧卖家宫格样式已废弃，保留 tu-list-card 体系 */

/* 旧快捷宫格样式移除，改为 list-card/list-item 全局样式（在 global.css 中） */

/* 订单状态 */
.status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 14px;
}

.status-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 14px 12px;
    background: #f5f7fa;
    border-radius: 16px;
    cursor: pointer;
    position: relative;
    transition: .25s;
}

.status-item:hover {
    background: #eef6ff;
}

.icon-wrap {
    position: relative;
}

.status-item .label {
    font-size: 12px;
    color: #555;
}

.status-item .van-badge {
    position: absolute;
    top: -6px;
    right: -10px;
}



/* 账户管理 */
.manage-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 14px;
}

.manage-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 14px 10px;
    background: #f5f7fa;
    border-radius: 16px;
    cursor: pointer;
    transition: .25s;
    font-size: 12px;
    color: #333;
}

.manage-item:hover {
    background: #eef3ff;
}

.manage-item .van-icon {
    font-size: 22px;
}

.logout-block {
    text-align: center;
}

/* 响应式微调 */

@media (max-width:520px) {
    .nickname {
        font-size: 20px;
    }

    .wallet .amount {
        font-size: 26px;
    }

    .seller-links {
        flex-wrap: wrap;
    }

    .status-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .manage-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>