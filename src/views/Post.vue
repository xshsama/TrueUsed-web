<template>
    <div class="post-page">
        <!-- 顶部导航 -->
        <van-nav-bar title="卖出" fixed />

        <div class="page-content">
            <!-- 快捷发布入口 -->
            <div class="quick-post">
                <van-button type="primary" size="large" icon="plus" block @click="$router.push('/post/create')">
                    发布商品
                </van-button>
            </div>

            <!-- 统计信息 -->
            <div class="stats-section">
                <van-grid :column-num="4" :border="false">
                    <van-grid-item v-for="stat in stats" :key="stat.key" :text="stat.label">
                        <template #default>
                            <div class="stat-item">
                                <div class="stat-number">{{ stat.value }}</div>
                                <div class="stat-label">{{ stat.label }}</div>
                            </div>
                        </template>
                    </van-grid-item>
                </van-grid>
            </div>

            <!-- 功能菜单 -->
            <div class="menu-section">
                <van-cell-group>
                    <van-cell title="我的发布" is-link icon="goods-collect-o" @click="$router.push('/post/manage')">
                        <template #value>
                            <van-badge :content="publishCount" />
                        </template>
                    </van-cell>
                    <van-cell title="草稿箱" is-link icon="edit" @click="handleDraftClick">
                        <template #value>
                            <van-badge :content="draftCount" />
                        </template>
                    </van-cell>
                    <van-cell title="发布记录" is-link icon="records" @click="handleRecordClick" />
                    <van-cell title="发布规则" is-link icon="info-o" @click="handleRuleClick" />
                </van-cell-group>
            </div>

            <!-- 发布技巧 -->
            <div class="tips-section">
                <van-notice-bar left-icon="volume-o" text="发布技巧：清晰的图片、详细的描述和合理的价格能帮助您的商品更快售出" scrollable />

                <div class="tips-cards">
                    <div v-for="tip in tips" :key="tip.id" class="tip-card" @click="handleTipClick(tip)">
                        <van-icon :name="tip.icon" size="24" color="#1989fa" />
                        <div class="tip-content">
                            <div class="tip-title">{{ tip.title }}</div>
                            <div class="tip-desc">{{ tip.desc }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { Toast } from 'vant'
import { ref } from 'vue'

export default {
    name: 'Post',
    setup() {
        const publishCount = ref(8)
        const draftCount = ref(2)

        // 统计数据
        const stats = ref([
            { key: 'published', label: '已发布', value: '8' },
            { key: 'selling', label: '在售', value: '5' },
            { key: 'sold', label: '已售', value: '3' },
            { key: 'views', label: '浏览', value: '256' }
        ])

        // 发布技巧
        const tips = ref([
            {
                id: 1,
                icon: 'photo-o',
                title: '拍好照片',
                desc: '清晰展示商品细节，提高成交率'
            },
            {
                id: 2,
                icon: 'edit',
                title: '详细描述',
                desc: '说明商品状况，建立买家信任'
            },
            {
                id: 3,
                icon: 'gold-coin-o',
                title: '合理定价',
                desc: '参考市场价格，快速出手'
            },
            {
                id: 4,
                icon: 'chat-o',
                title: '及时回复',
                desc: '快速响应买家询问'
            }
        ])

        const handleDraftClick = () => {
            Toast('草稿箱功能开发中')
        }

        const handleRecordClick = () => {
            Toast('发布记录功能开发中')
        }

        const handleRuleClick = () => {
            Toast('发布规则功能开发中')
        }

        const handleTipClick = (tip) => {
            Toast(`${tip.title}：${tip.desc}`)
        }

        return {
            publishCount,
            draftCount,
            stats,
            tips,
            handleDraftClick,
            handleRecordClick,
            handleRuleClick,
            handleTipClick
        }
    }
}
</script>

<style scoped>
.post-page {
    background-color: #f7f8fa;
    min-height: 100vh;
}

.page-content {
    padding-top: 46px;
    /* 为固定导航栏留出空间 */
}

.quick-post {
    padding: 20px 16px;
    background: #fff;
    margin-bottom: 8px;
}

.stats-section {
    background: #fff;
    padding: 16px 0;
    margin-bottom: 8px;
}

.stat-item {
    text-align: center;
}

.stat-number {
    font-size: 20px;
    font-weight: 600;
    color: #323233;
    margin-bottom: 4px;
}

.stat-label {
    font-size: 12px;
    color: #969799;
}

.menu-section {
    margin-bottom: 8px;
}

.tips-section {
    background: #fff;
    padding: 16px;
}

.tips-cards {
    margin-top: 16px;
}

.tip-card {
    display: flex;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #f2f3f5;
}

.tip-card:last-child {
    border-bottom: none;
}

.tip-content {
    margin-left: 12px;
    flex: 1;
}

.tip-title {
    font-size: 14px;
    font-weight: 500;
    color: #323233;
    margin-bottom: 4px;
}

.tip-desc {
    font-size: 12px;
    color: #969799;
    line-height: 1.4;
}
</style>