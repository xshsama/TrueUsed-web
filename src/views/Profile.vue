<template>
    <div class="profile-page">
        <!-- 顶部导航 -->
        <van-nav-bar title="我的" fixed />

        <div class="page-content">
            <!-- 用户信息卡片 -->
            <div class="user-card" @click="goToUserProfile">
                <van-image :src="userInfo.avatar" class="user-avatar" round fit="cover" />
                <div class="user-info">
                    <div class="user-name">{{ userInfo.name }}</div>
                    <div class="user-desc">{{ userInfo.desc }}</div>
                </div>
                <div class="user-badge">
                    <van-tag type="primary" size="small">{{ userInfo.level }}</van-tag>
                </div>
                <van-icon name="arrow" color="#c8c9cc" />
            </div>

            <!-- 统计数据 -->
            <div class="stats-section">
                <div class="stats-grid">
                    <div v-for="stat in stats" :key="stat.key" class="stat-item" @click="goToStatDetail(stat.key)">
                        <div class="stat-value">{{ stat.value }}</div>
                        <div class="stat-label">{{ stat.label }}</div>
                    </div>
                </div>
            </div>

            <!-- 订单入口 -->
            <div class="order-section">
                <van-cell-group>
                    <van-cell title="我的订单" is-link @click="goToOrderList">
                        <template #value>
                            <div class="order-types">
                                <div v-for="orderType in orderTypes" :key="orderType.key" class="order-type"
                                    @click.stop="goToOrderList(orderType.key)">
                                    <van-icon :name="orderType.icon" size="20" />
                                    <span class="order-label">{{ orderType.label }}</span>
                                    <van-badge v-if="orderType.count > 0" :content="orderType.count" />
                                </div>
                            </div>
                        </template>
                    </van-cell>
                </van-cell-group>
            </div>

            <!-- 功能菜单 */
      <div class="menu-section">
        <van-cell-group>
          <van-cell
            title="我的钱包"
            is-link
            icon="balance-o"
            @click="goToWallet"
          />
          <van-cell
            title="地址管理"
            is-link
            icon="location-o"
            @click="goToAddress"
          />
          <van-cell
            title="实名认证"
            is-link
            icon="certificate"
            @click="goToVerification"
          />
        </van-cell-group>
        
        <van-cell-group>
          <van-cell
            title="客服中心"
            is-link
            icon="service"
            @click="goToService"
          />
          <van-cell
            title="帮助中心"
            is-link
            icon="question-o"
            @click="goToHelp"
          />
          <van-cell
            title="意见反馈"
            is-link
            icon="comment-o"
            @click="goToFeedback"
          />
        </van-cell-group>
        
        <van-cell-group>
          <van-cell
            title="设置"
            is-link
            icon="setting-o"
            @click="goToSettings"
          />
          <van-cell
            title="关于我们"
            is-link
            icon="info-o"
            @click="goToAbout"
          />
        </van-cell-group>
        
        <!-- 退出登录 -->
            <div class="logout-section">
                <van-button type="default" size="large" block @click="logout">
                    退出登录
                </van-button>
            </div>
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

        // 用户信息
        const userInfo = ref({
            name: '用户昵称',
            desc: '这个人很懒，什么都没留下~',
            avatar: 'https://via.placeholder.com/80x80/4CAF50/ffffff?text=用户',
            level: 'LV.3'
        })

        // 统计数据
        const stats = ref([
            { key: 'following', label: '关注', value: '23' },
            { key: 'followers', label: '粉丝', value: '156' },
            { key: 'likes', label: '获赞', value: '789' },
            { key: 'credits', label: '信用', value: '95' }
        ])

        // 订单类型
        const orderTypes = ref([
            { key: 'pending', label: '待付款', icon: 'pending-payment', count: 1 },
            { key: 'shipping', label: '待收货', icon: 'logistics', count: 2 },
            { key: 'reviewing', label: '待评价', icon: 'comment-o', count: 0 },
            { key: 'after-sale', label: '退款/售后', icon: 'after-sale', count: 0 }
        ])

        // 跳转到用户资料
        const goToUserProfile = () => {
            Toast('用户资料功能开发中')
        }

        // 跳转到统计详情
        const goToStatDetail = (type) => {
            Toast(`${type}详情功能开发中`)
        }

        // 跳转到订单列表
        const goToOrderList = (type = 'all') => {
            Toast(`订单列表功能开发中 - 类型: ${type}`)
        }

        // 跳转到钱包
        const goToWallet = () => {
            Toast('钱包功能开发中')
        }

        // 跳转到地址管理
        const goToAddress = () => {
            Toast('地址管理功能开发中')
        }

        // 跳转到实名认证
        const goToVerification = () => {
            Toast('实名认证功能开发中')
        }

        // 跳转到客服中心
        const goToService = () => {
            Toast('客服中心功能开发中')
        }

        // 跳转到帮助中心
        const goToHelp = () => {
            Toast('帮助中心功能开发中')
        }

        // 跳转到意见反馈
        const goToFeedback = () => {
            Toast('意见反馈功能开发中')
        }

        // 跳转到设置
        const goToSettings = () => {
            Toast('设置功能开发中')
        }

        // 跳转到关于我们
        const goToAbout = () => {
            Toast('关于我们功能开发中')
        }

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
            stats,
            orderTypes,
            goToUserProfile,
            goToStatDetail,
            goToOrderList,
            goToWallet,
            goToAddress,
            goToVerification,
            goToService,
            goToHelp,
            goToFeedback,
            goToSettings,
            goToAbout,
            logout
        }
    }
}
</script>

<style scoped>
.profile-page {
    background-color: #f7f8fa;
    min-height: 100vh;
}

.page-content {
    padding-top: 46px;
}

.user-card {
    display: flex;
    align-items: center;
    background: #fff;
    padding: 20px 16px;
    margin-bottom: 8px;
}

.user-avatar {
    width: 64px;
    height: 64px;
    margin-right: 16px;
}

.user-info {
    flex: 1;
}

.user-name {
    font-size: 18px;
    font-weight: 600;
    color: #323233;
    margin-bottom: 4px;
}

.user-desc {
    font-size: 14px;
    color: #969799;
}

.user-badge {
    margin-right: 8px;
}

.stats-section {
    background: #fff;
    padding: 16px 0;
    margin-bottom: 8px;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
}

.stat-item {
    text-align: center;
    padding: 8px;
}

.stat-value {
    font-size: 18px;
    font-weight: 600;
    color: #323233;
    margin-bottom: 4px;
}

.stat-label {
    font-size: 12px;
    color: #969799;
}

.order-section {
    margin-bottom: 8px;
}

.order-types {
    display: flex;
    gap: 24px;
}

.order-type {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
}

.order-label {
    font-size: 12px;
    color: #646566;
    margin-top: 4px;
}

.order-type .van-badge {
    position: absolute;
    top: -2px;
    right: -8px;
}

.menu-section .van-cell-group {
    margin-bottom: 8px;
}

.logout-section {
    padding: 20px 16px;
}
</style>