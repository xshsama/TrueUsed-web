<template>
    <div class="profile-page">
        <van-nav-bar title="我的" fixed />
        <div class="page-content">
            <!-- 顶部身份信息区 -->
            <section class="identity-card">
                <div class="identity-main">
                    <van-image :src="userInfo.avatar" class="avatar" round fit="cover" />
                    <div class="identity-text">
                        <div class="row">
                            <h1 class="nickname">{{ userInfo.name }}</h1>
                            <van-tag type="primary" size="small" round>{{ creditStatus.level }}</van-tag>
                        </div>
                        <p class="signature" v-if="userInfo.desc">{{ userInfo.desc }}</p>
                        <div class="auth-badges">
                            <van-tag v-if="creditStatus.verified" type="success" size="mini" round>已实名</van-tag>
                            <van-tag v-if="creditStatus.phoneBound" type="primary" size="mini" round>已绑定手机</van-tag>
                            <van-tag plain type="warning" size="mini" round>信用 {{ creditStatus.score }}</van-tag>
                        </div>
                    </div>
                </div>
                <div class="identity-actions">
                    <van-button size="small" round type="primary" plain @click="editProfile">编辑资料</van-button>
                    <van-button size="small" round type="default" plain @click="openSecurity">安全设置</van-button>
                </div>
            </section>

            <!-- 交易管理区 -->
            <section class="trade-section">
                <div class="seller-manage card-block">
                    <div class="block-head">
                        <h2 class="block-title">卖家管理</h2>
                        <van-button size="mini" type="primary" round plain @click="createProduct">发布商品</van-button>
                    </div>
                    <div class="seller-links">
                        <div class="seller-entry" @click="goToMyProducts">
                            <van-icon name="apps-o" />
                            <span>我的发布</span>
                        </div>
                        <div class="seller-entry" @click="goToSoldProducts">
                            <van-icon name="passed" />
                            <span>已售出</span>
                        </div>
                    </div>
                </div>
                <div class="order-status card-block">
                    <div class="block-head">
                        <h2 class="block-title">订单状态</h2>
                        <van-button size="mini" type="default" round plain @click="viewAllOrders">全部订单</van-button>
                    </div>
                    <div class="status-grid">
                        <div v-for="st in orderStatus" :key="st.key" class="status-item"
                            @click="goToOrderStatus(st.key)">
                            <div class="icon-wrap">
                                <van-icon :name="st.icon" size="24" />
                                <van-badge v-if="st.count > 0" :content="st.count" />
                            </div>
                            <span class="label">{{ st.label }}</span>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 资产与账户区 -->
            <section class="asset-section">
                <div class="wallet card-block">
                    <div class="wallet-main">
                        <div class="amount">¥ {{ walletBalance }}</div>
                        <div class="caption">可用余额</div>
                    </div>
                    <div class="wallet-actions">
                        <van-button size="small" type="primary" round plain @click="withdraw">提现</van-button>
                        <van-button size="small" type="default" round plain @click="viewWalletDetail">明细</van-button>
                    </div>
                </div>
                <div class="account-manage card-block">
                    <div class="manage-grid">
                        <div class="manage-item" @click="goToAddress"><van-icon name="location-o" /><span>地址管理</span>
                        </div>
                        <div class="manage-item" @click="goToVerification"><van-icon
                                name="certificate" /><span>实名认证</span></div>
                        <div class="manage-item" @click="openSecurity"><van-icon name="shield-o" /><span>安全设置</span>
                        </div>
                        <div class="manage-item" @click="goToSettings"><van-icon name="setting-o" /><span>系统设置</span>
                        </div>
                    </div>
                </div>
                <div class="logout-block card-block">
                    <van-button type="danger" block round @click="logout">退出登录</van-button>
                </div>
            </section>
        </div>
    </div>
</template>

<script>
import { useUserStore } from '@/stores/user'
import { Dialog, Toast } from 'vant'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
    name: 'Profile',
    setup() {
        const router = useRouter()
        const userStore = useUserStore()

        // 用户信息（可与 Pinia 结合，这里先用 mock / fallback）
        const userInfo = ref({
            name: '用户昵称',
            desc: '这个人很懒，什么都没留下~',
            avatar: 'https://via.placeholder.com/80x80/4CAF50/ffffff?text=用户'
        })

        // 认证/信用状态
        const creditStatus = ref({
            level: 'LV.3',
            verified: true,
            phoneBound: true,
            score: 95
        })

        // 订单状态宫格数据
        const orderStatus = ref([
            { key: 'unpaid', label: '待付款', icon: 'pending-payment', count: 1 },
            { key: 'toship', label: '待发货', icon: 'logistics', count: 0 },
            { key: 'toreceive', label: '待收货', icon: 'cart-o', count: 2 },
            { key: 'afterSale', label: '退款/售后', icon: 'after-sale', count: 0 }
        ])

        // 钱包余额
        const walletBalance = ref(2356.78)

        const editProfile = () => Toast('编辑资料（占位）')
        const openSecurity = () => Toast('安全设置（占位）')

        // 跳转到统计详情
        const goToStatDetail = (type) => {
            Toast(`${type}详情功能开发中`)
        }

        const viewAllOrders = () => Toast('全部订单（占位）')
        const goToOrderStatus = (key) => Toast(`进入状态：${key}`)

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
            creditStatus,
            orderStatus,
            walletBalance,
            editProfile,
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
            logout
        }
    }
}
</script>

<style scoped>
/* 新版样式 */
.profile-page {
    background: #f5f7fa;
    min-height: 100vh;
}

.page-content {
    padding-top: 46px;
    padding-bottom: 40px;
    max-width: 880px;
    /* 统一竖直布局收窄宽度更聚焦 */
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 24px;
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

/* 卖家管理 */
.seller-links {
    display: flex;
    gap: 18px;
}

.seller-entry {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 14px 18px;
    background: #f5f7fa;
    border-radius: 16px;
    cursor: pointer;
    transition: .25s;
    font-size: 13px;
    color: #333;
}

.seller-entry:hover {
    background: #eef3ff;
}

.seller-entry .van-icon {
    font-size: 22px;
}

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

/* 钱包 */
.wallet {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
}

.wallet-main {
    display: flex;
    flex-direction: column;
}

.wallet .amount {
    font-size: 30px;
    font-weight: 700;
    letter-spacing: 1px;
    background: linear-gradient(120deg, #007AFF, #3296ff);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}

.wallet .caption {
    font-size: 13px;
    color: #868e96;
    margin-top: 4px;
}

.wallet-actions {
    display: flex;
    gap: 10px;
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