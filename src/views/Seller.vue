<template>
    <div class="seller-page">
        <van-nav-bar title="卖家中心" fixed />
        <div class="top-cover bg-cover-soft"></div>
        <div class="page-content">
            <!-- 顶部 KPI + 主CTA -->
            <section class="kpi-card shadow-soft-lg glass-card">
                <div class="kpi-grid">
                    <div class="kpi-item">
                        <div class="kpi-num">1.2k</div>
                        <div class="kpi-label">今日浏览</div>
                    </div>
                    <div class="kpi-item">
                        <div class="kpi-num">87</div>
                        <div class="kpi-label">今日收藏</div>
                    </div>
                    <div class="kpi-item">
                        <div class="kpi-num">14</div>
                        <div class="kpi-label">今日咨询</div>
                    </div>
                    <div class="kpi-item">
                        <div class="kpi-num">3</div>
                        <div class="kpi-label">今日成交</div>
                    </div>
                </div>
                <van-button class="btn-primary" block round @click="createProduct"><van-icon name="add-o" />
                    发布商品</van-button>
            </section>

            <!-- 功能图谱卡：商品管理 / 订单管理 / 资金结算 / 客服消息 -->
            <section class="tu-card shadow-soft-lg" style="padding:16px; border-radius:20px;">
                <div class="tu-overview-grid">
                    <div class="tu-overview-item" @click="goProductManage">
                        <div class="tu-overview-icon tu-bubble-blue"><van-icon name="apps-o" /></div>
                        <div>
                            <div class="tu-overview-title">商品管理</div>
                            <div class="tu-overview-desc">发布、编辑、上下架</div>
                        </div>
                    </div>
                    <div class="tu-overview-item" @click="goOrderManage">
                        <div class="tu-overview-icon tu-bubble-purple"><van-icon name="orders-o" /></div>
                        <div>
                            <div class="tu-overview-title">订单管理</div>
                            <div class="tu-overview-desc">处理发货、售后</div>
                        </div>
                    </div>
                    <div class="tu-overview-item" @click="goSettlement">
                        <div class="tu-overview-icon tu-bubble-orange"><van-icon name="balance-o" /></div>
                        <div>
                            <div class="tu-overview-title">资金结算</div>
                            <div class="tu-overview-desc">提现、帐务明细</div>
                        </div>
                    </div>
                    <div class="tu-overview-item" @click="goServiceMessages">
                        <div class="tu-overview-icon tu-bubble-blue"><van-icon name="chat-o" /></div>
                        <div>
                            <div class="tu-overview-title">客服消息</div>
                            <div class="tu-overview-desc">咨询与回复</div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 卖家管理入口 -->
            <section class="trade-section">
                <div class="tu-list-card shadow-soft-lg">
                    <div class="tu-list-item" @click="goToMyProducts">
                        <div class="tu-list-icon-bubble tu-bubble-blue"><van-icon name="apps-o" /></div>
                        <div>
                            <div class="tu-list-title">我的发布</div>
                            <div class="tu-list-subtitle">查看与管理已发布的商品</div>
                        </div>
                        <div class="tu-list-right">
                            <div class="tu-list-right-bubble"><van-icon name="arrow" /></div>
                        </div>
                    </div>
                    <div class="tu-list-item" @click="goToSoldProducts">
                        <div class="tu-list-icon-bubble tu-bubble-orange"><van-icon name="passed" /></div>
                        <div>
                            <div class="tu-list-title">已售出</div>
                            <div class="tu-list-subtitle">成交记录与售后</div>
                        </div>
                        <div class="tu-list-right">
                            <div class="tu-list-right-bubble"><van-icon name="arrow" /></div>
                        </div>
                    </div>
                </div>

                <div class="tu-list-card shadow-soft-lg">
                    <div class="tu-list-item" v-for="st in orderStatus" :key="st.key" @click="goToOrderStatus(st.key)">
                        <div class="tu-list-icon-bubble" :class="statusBubble(st.key)"><van-icon :name="st.icon" />
                        </div>
                        <div>
                            <div class="tu-list-title">{{ st.label }}</div>
                            <div class="tu-list-subtitle">订单流程状态</div>
                        </div>
                        <div class="tu-list-right">
                            <van-badge v-if="st.count > 0" :content="st.count" />
                            <div class="tu-list-right-bubble"><van-icon name="arrow" /></div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<script>
import { Toast } from 'vant';
import { ref } from 'vue';

export default {
    name: 'Seller',
    setup() {
        const orderStatus = ref([
            { key: 'unpaid', label: '待付款', icon: 'pending-payment', count: 1 },
            { key: 'toship', label: '待发货', icon: 'logistics', count: 0 },
            { key: 'toreceive', label: '待收货', icon: 'cart-o', count: 2 },
            { key: 'afterSale', label: '退款/售后', icon: 'after-sale', count: 0 }
        ])

        const statusBubble = (key) => {
            const map = { unpaid: 'tu-bubble-blue', toship: 'tu-bubble-purple', toreceive: 'tu-bubble-orange', afterSale: 'tu-bubble-blue' }
            return map[key] || 'tu-bubble-blue'
        }

        const createProduct = () => Toast('发布商品（占位）')
        const goToMyProducts = () => Toast('我的发布（占位）')
        const goToSoldProducts = () => Toast('已售出（占位）')
        const goToOrderStatus = (key) => Toast(`进入状态：${key}`)
        const goProductManage = () => Toast('商品管理（占位）')
        const goOrderManage = () => Toast('订单管理（占位）')
        const goSettlement = () => Toast('资金结算（占位）')
        const goServiceMessages = () => Toast('客服消息（占位）')

        return { orderStatus, statusBubble, createProduct, goToMyProducts, goToSoldProducts, goToOrderStatus, goProductManage, goOrderManage, goSettlement, goServiceMessages }
    }
}
</script>

<style scoped>
.seller-page {
    background: #f6f9ff;
    min-height: 100vh;
}

.top-cover {
    position: sticky;
    top: 0;
    height: 160px;
    z-index: 0;
    border-bottom-left-radius: 32px;
    border-bottom-right-radius: 32px;
}

.page-content {
    max-width: 880px;
    margin: 0 auto;
    padding: 16px 0 40px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    margin-top: -40px;
    position: relative;
    z-index: 1;
}

.kpi-card {
    border-radius: 20px;
    padding: 16px;
    background: #fff;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
}

.kpi-item {
    background: linear-gradient(180deg, rgba(59, 130, 246, .1), rgba(59, 130, 246, .05));
    border: 1px solid rgba(59, 130, 246, .15);
    border-radius: 14px;
    padding: 10px;
    text-align: center;
}

.kpi-num {
    font-size: 18px;
    font-weight: 700;
    color: #1d4ed8;
}

.kpi-label {
    font-size: 12px;
    color: #64748b;
}

@media (max-width:520px) {
    .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>
