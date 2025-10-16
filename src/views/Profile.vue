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
                <button class="tu-seg-btn is-active">用户中心</button>
                <button class="tu-seg-btn" @click="goSeller">卖家中心</button>
            </div>
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
                    <van-button size="small" round type="primary" plain @click="editProfile">编辑资料</van-button>
                    <van-button size="small" round type="default" plain @click="openSecurity">安全设置</van-button>
                </div>
            </section>

            <!-- 用户区：常用入口、订单状态等 -->
            <section class="user-section">
                <div class="tu-list-card shadow-soft-lg">
                    <div class="tu-list-item" @click="viewAllOrders">
                        <div class="tu-list-icon-bubble" style="background:#3b82f6"><van-icon name="orders-o" /></div>
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
                        <div class="tu-list-icon-bubble" style="background:#06b6d4"><van-icon name="location-o" /></div>
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

            <!-- 编辑资料弹窗 -->
            <van-dialog v-model:show="showEdit" title="编辑资料" show-cancel-button @confirm="submitEdit">
                <div class="form-grid">
                    <van-field v-model="form.nickname" label="昵称" maxlength="50" placeholder="请输入昵称" />
                    <van-field v-model="form.avatarUrl" label="头像URL" placeholder="https://..." />
                    <van-field v-model="form.phone" label="手机号" maxlength="20" placeholder="请输入手机号" />
                    <van-field v-model="form.bio" type="textarea" rows="3" maxlength="300" show-word-limit label="简介"
                        placeholder="一句话介绍自己" />
                </div>
            </van-dialog>
        </div>
    </div>
</template>

<script>
import { useUserStore } from '@/stores/user'
import { Dialog, Toast } from 'vant'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
    name: 'Profile',
    setup() {
        const router = useRouter()
        const userStore = useUserStore()
        const defaultAvatar = 'https://placehold.co/80x80/4CAF50/ffffff?text=用户'
        const userInfo = computed(() => userStore.user || {})
        const loading = ref(true)

        // 加载我的资料
        onMounted(async () => {
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
        const editProfile = () => {
            form.value = {
                nickname: userInfo.value.nickname || '',
                avatarUrl: userInfo.value.avatarUrl || '',
                bio: userInfo.value.bio || '',
                phone: userInfo.value.phone || ''
            }
            showEdit.value = true
        }
        const submitEdit = async () => {
            try {
                await userStore.saveMe(form.value)
                Toast.success('已更新资料')
                showEdit.value = false
            } catch (e) {
                Toast.fail('更新失败')
            }
        }
        const openSecurity = () => Toast('安全设置（占位）')

        // 跳转到统计详情
        const goToStatDetail = (type) => {
            Toast(`${type}详情功能开发中`)
        }

        const viewAllOrders = () => Toast('全部订单（占位）')
        const goToOrderStatus = (key) => Toast(`进入状态：${key}`)

        const goSeller = () => router.push('/seller')

        const withdraw = () => Toast('提现（占位）')
        const viewWalletDetail = () => Toast('钱包明细（占位）')

        // 跳转到地址管理
        const goToAddress = () => Toast('地址管理（占位）')

        // 跳转到实名认证
        const goToVerification = () => Toast('实名认证（占位）')

        // 跳转到客服中心
        const goToService = () => Toast('客服中心（占位）')

        // 跳转到帮助中心
        const goToHelp = () => Toast('帮助中心（占位）')

        // 跳转到意见反馈
        const goToFeedback = () => Toast('意见反馈（占位）')

        // 跳转到设置
        const goToSettings = () => Toast('系统设置（占位）')

        // 跳转到关于我们
        const goToAbout = () => Toast('关于我们（占位）')

        // 卖家相关入口
        const createProduct = () => Toast('发布商品（占位）')
        const goToMyProducts = () => Toast('我的发布（占位）')
        const goToSoldProducts = () => Toast('已售出（占位）')

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
            creditStatus,
            orderStatus,
            walletBalance,
            editProfile,
            showEdit,
            form,
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
            iconBg
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