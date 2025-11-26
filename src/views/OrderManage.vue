<template>
    <div class="page">
        <van-nav-bar title="订单管理" left-arrow @click-left="$router.back()" fixed />
        <div class="container">
            <!-- 订单状态 Tab -->
            <van-tabs v-model:active="activeTab" sticky offset-top="56" @change="onTabChange">
                <van-tab v-for="tab in tabs" :key="tab.key + '-' + tab.count" :name="tab.key"
                    :badge="tab.count > 0 ? tab.count : null">
                    <template #title>
                        <span>{{ tab.label }}</span>
                    </template>
                </van-tab>
            </van-tabs>

            <!-- 订单统计卡片 -->
            <div class="stats-card">
                <div class="stat-item">
                    <div class="stat-value">{{ stats.total }}</div>
                    <div class="stat-label">总订单</div>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                    <div class="stat-value">{{ stats.pendingShip }}</div>
                    <div class="stat-label">待发货</div>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                    <div class="stat-value">￥{{ stats.totalAmount }}</div>
                    <div class="stat-label">总收入</div>
                </div>
            </div>

            <!-- 订单列表 -->
            <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
                <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="loadOrders">
                    <template v-if="isInitialLoading">
                        <div v-for="i in 3" :key="i" class="order-skeleton">
                            <van-skeleton avatar :row="3" />
                        </div>
                    </template>
                    <template v-else-if="filteredOrders.length === 0">
                        <van-empty :description="emptyText" />
                    </template>
                    <template v-else>
                        <transition-group name="order-list" tag="div">
                            <div v-for="order in filteredOrders" :key="order.id" class="seller-order-card">
                                <!-- 订单头部 -->
                                <div class="order-header">
                                    <div class="buyer-info">
                                        <van-image :src="order.buyer?.avatarUrl || defaultAvatar" width="28" height="28"
                                            round fit="cover" />
                                        <span class="buyer-name">{{ order.buyer?.username || '买家' }}</span>
                                    </div>
                                    <div class="order-status" :class="'status-' + order.status.toLowerCase()">
                                        {{ statusText(order.status) }}
                                    </div>
                                </div>

                                <!-- 商品信息 -->
                                <div class="order-product" @click="viewOrderDetail(order)">
                                    <van-image :src="getProductImage(order.product)" width="80" height="80" radius="10"
                                        fit="cover" />
                                    <div class="product-info">
                                        <div class="product-title">{{ order.product?.title }}</div>
                                        <div class="product-price">￥{{ order.price }}</div>
                                    </div>
                                    <van-icon name="arrow" class="arrow-icon" />
                                </div>

                                <!-- 收货地址（待发货时显示） -->
                                <div v-if="order.status === 'PAID' && order.address" class="shipping-info">
                                    <div class="shipping-title">
                                        <van-icon name="location-o" />
                                        <span>收货信息</span>
                                    </div>
                                    <div class="shipping-detail">
                                        <div class="recipient">{{ order.address.recipientName }} {{
                                            order.address.phone }}</div>
                                        <div class="address">{{ order.address.province }} {{ order.address.city }} {{
                                            order.address.district }} {{ order.address.detailedAddress }}</div>
                                    </div>
                                </div>

                                <!-- 订单信息 -->
                                <div class="order-meta">
                                    <span class="order-time">{{ formatTime(order.createdAt) }}</span>
                                    <span class="order-id">订单号: {{ order.id }}</span>
                                </div>

                                <!-- 操作按钮 -->
                                <div class="order-actions">
                                    <van-button v-if="order.status === 'PAID'" size="small" type="primary" round
                                        @click="handleShip(order)">
                                        <van-icon name="logistics" />
                                        确认发货
                                    </van-button>
                                    <van-button v-if="order.status === 'SHIPPED'" size="small" plain round disabled>
                                        等待收货
                                    </van-button>
                                    <van-button v-if="order.status === 'PENDING'" size="small" plain round disabled>
                                        等待付款
                                    </van-button>
                                    <van-button size="small" plain round @click="contactBuyer(order)">
                                        <van-icon name="chat-o" />
                                        联系买家
                                    </van-button>
                                    <van-button size="small" plain round @click="viewOrderDetail(order)">
                                        查看详情
                                    </van-button>
                                </div>
                            </div>
                        </transition-group>
                    </template>
                </van-list>
            </van-pull-refresh>
        </div>

        <!-- 发货弹窗 -->
        <van-dialog v-model:show="showShipDialog" title="确认发货" show-cancel-button @confirm="confirmShip"
            :before-close="beforeShipClose" confirm-button-text="立即发货">
            <div class="ship-dialog-content">
                <!-- 商品信息 -->
                <div class="ship-product-info" v-if="currentOrder">
                    <van-image :src="getProductImage(currentOrder.product)" width="60" height="60" radius="8"
                        fit="cover" />
                    <div class="ship-product-detail">
                        <div class="ship-product-title">{{ currentOrder.product?.title }}</div>
                        <div class="ship-buyer">买家: {{ currentOrder.buyer?.username }}</div>
                    </div>
                </div>

                <!-- 收货地址显示 -->
                <div class="receiver-address" v-if="currentOrder?.address">
                    <div class="address-label">
                        <van-icon name="location-o" />
                        <span>收货地址</span>
                    </div>
                    <div class="address-content">
                        <div class="recipient">{{ currentOrder.address.recipientName }} {{ currentOrder.address.phone }}
                        </div>
                        <div class="address-text">{{ currentOrder.address.province }} {{ currentOrder.address.city }} {{
                            currentOrder.address.district }}</div>
                    </div>
                </div>

                <van-divider>选择快递</van-divider>

                <!-- 快递公司选择 - 优化为网格选择 -->
                <div class="express-grid">
                    <div v-for="company in expressCompanies" :key="company" class="express-item"
                        :class="{ active: shipForm.trackingCompany === company }"
                        @click="shipForm.trackingCompany = company">
                        <van-icon :name="getExpressIcon(company)" size="20" />
                        <span>{{ company }}</span>
                    </div>
                </div>

                <!-- 发货城市 - 使用地区选择器 -->
                <div class="sender-city-section">
                    <van-field v-model="shipForm.senderCityText" label="发货地址" placeholder="请选择发货城市" left-icon="shop-o"
                        readonly is-link @click="showAreaPicker = true" input-align="right" />
                </div>

                <!-- 提示信息 -->
                <div class="ship-tips">
                    <div class="tip-item">
                        <van-icon name="info-o" color="#1989fa" />
                        <span>快递单号将由系统自动生成</span>
                    </div>
                    <div class="tip-item">
                        <van-icon name="clock-o" color="#07c160" />
                        <span>物流轨迹将自动更新推送</span>
                    </div>
                </div>
            </div>
        </van-dialog>

        <!-- 快递公司选择器 - 保留作为备用 -->
        <van-popup v-model:show="showCompanyPicker" position="bottom" round>
            <van-picker :columns="expressCompanies" @confirm="onCompanyConfirm" @cancel="showCompanyPicker = false"
                show-toolbar title="选择快递公司" />
        </van-popup>

        <!-- 地区选择器 -->
        <van-popup v-model:show="showAreaPicker" position="bottom" round>
            <van-area :area-list="areaList" title="选择发货地址" @confirm="onAreaConfirm" @cancel="showAreaPicker = false"
                :columns-num="2" />
        </van-popup>
    </div>
</template>

<script>
import { getSoldOrders, shipOrder } from '@/api/orders';
import { areaList } from '@vant/area-data';
import { showFailToast, showSuccessToast } from 'vant';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default {
    name: 'OrderManage',
    setup() {
        const router = useRouter();
        const route = useRoute();
        const loading = ref(false);
        const refreshing = ref(false);
        const finished = ref(false);
        const isInitialLoading = ref(true);
        const orders = ref([]);
        const activeTab = ref('all');
        const defaultAvatar = '';

        // 发货相关
        const showShipDialog = ref(false);
        const showCompanyPicker = ref(false);
        const showAreaPicker = ref(false);
        const currentOrder = ref(null);
        const shipForm = ref({
            trackingCompany: '',
            senderCity: '',
            senderCityText: '',
        });

        // 快递公司列表（与后端匹配）
        const expressCompanies = [
            '顺丰速运', '中通快递', '圆通速递', '韵达快递',
            '申通快递', '极兔速递', '邮政EMS', '京东物流'
        ];

        // 获取快递公司图标
        const getExpressIcon = (company) => {
            const iconMap = {
                '顺丰速运': 'tosend',
                '中通快递': 'logistics',
                '圆通速递': 'send-gift-o',
                '韵达快递': 'gift-o',
                '申通快递': 'gift-card-o',
                '极兔速递': 'label-o',
                '邮政EMS': 'envelop-o',
                '京东物流': 'shopping-cart-o',
            };
            return iconMap[company] || 'logistics';
        };

        // 获取商品图片
        const getProductImage = (product) => {
            if (!product) return '';
            // images 可能是数组或单个对象
            if (Array.isArray(product.images) && product.images.length > 0) {
                return product.images[0]?.url || '';
            }
            if (product.images?.url) {
                return product.images.url;
            }
            return '';
        };

        const tabs = computed(() => [
            { key: 'all', label: '全部', count: orders.value.length },
            { key: 'PENDING', label: '待付款', count: orders.value.filter(o => o.status === 'PENDING').length },
            { key: 'PAID', label: '待发货', count: orders.value.filter(o => o.status === 'PAID').length },
            { key: 'SHIPPED', label: '已发货', count: orders.value.filter(o => o.status === 'SHIPPED').length },
            { key: 'COMPLETED', label: '已完成', count: orders.value.filter(o => o.status === 'COMPLETED').length },
        ]);

        const stats = computed(() => ({
            total: orders.value.length,
            pendingShip: orders.value.filter(o => o.status === 'PAID').length,
            totalAmount: orders.value
                .filter(o => ['PAID', 'SHIPPED', 'COMPLETED'].includes(o.status))
                .reduce((sum, o) => sum + (o.price || 0), 0)
                .toFixed(2),
        }));

        const filteredOrders = computed(() => {
            if (activeTab.value === 'all') return orders.value;
            return orders.value.filter(o => o.status === activeTab.value);
        });

        const emptyText = computed(() => {
            const texts = {
                all: '暂无订单',
                PENDING: '暂无待付款订单',
                PAID: '暂无待发货订单',
                SHIPPED: '暂无已发货订单',
                COMPLETED: '暂无已完成订单',
            };
            return texts[activeTab.value] || '暂无订单';
        });

        const statusMap = {
            PENDING: '待付款',
            PAID: '待发货',
            SHIPPED: '待收货',
            COMPLETED: '已完成',
            CANCELLED: '已取消',
        };

        const statusText = (status) => statusMap[status] || status;

        const formatTime = (time) => {
            if (!time) return '';
            const date = new Date(time);
            const now = new Date();
            const diff = now - date;
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(diff / 3600000);
            const days = Math.floor(diff / 86400000);

            if (minutes < 1) return '刚刚';
            if (minutes < 60) return `${minutes}分钟前`;
            if (hours < 24) return `${hours}小时前`;
            if (days < 7) return `${days}天前`;
            return date.toLocaleDateString();
        };

        const loadOrders = async () => {
            if (isInitialLoading.value) {
                loading.value = true;
            }
            try {
                const res = await getSoldOrders();
                orders.value = Array.isArray(res) ? res : (res.content || []);
                finished.value = true;
            } catch (error) {
                showFailToast('加载订单失败');
                finished.value = true;
            } finally {
                loading.value = false;
                isInitialLoading.value = false;
            }
        };

        const onRefresh = async () => {
            isInitialLoading.value = false;
            await loadOrders();
            refreshing.value = false;
            showSuccessToast('已刷新');
        };

        const onTabChange = () => {
            // Tab 切换时不需要重新加载，只需过滤
        };

        const viewOrderDetail = (order) => {
            router.push({ name: 'OrderDetail', params: { id: order.id } });
        };

        const contactBuyer = (order) => {
            router.push(`/messages/chat/${order.buyer?.id}`);
        };

        const handleShip = (order) => {
            currentOrder.value = order;
            // 简化表单，只需要快递公司和发货城市
            shipForm.value = {
                trackingCompany: '顺丰速运', // 默认选中顺丰
                senderCity: '',
                senderCityText: '',
            };
            showShipDialog.value = true;
        };

        // 地区选择确认
        const onAreaConfirm = ({ selectedOptions }) => {
            // 获取省份和城市
            const province = selectedOptions[0]?.text || '';
            const city = selectedOptions[1]?.text || '';
            shipForm.value.senderCityText = `${province} ${city}`;
            shipForm.value.senderCity = city || province; // 发给后端的是城市名
            showAreaPicker.value = false;
        };

        const onCompanyConfirm = ({ selectedOptions }) => {
            shipForm.value.trackingCompany = selectedOptions[0]?.text || selectedOptions[0];
            showCompanyPicker.value = false;
        };

        const beforeShipClose = (action) => {
            if (action === 'confirm') {
                return confirmShip();
            }
            return true;
        };

        const confirmShip = async () => {
            if (!currentOrder.value) return false;

            // 验证快递公司
            if (!shipForm.value.trackingCompany) {
                showFailToast('请选择快递公司');
                return false;
            }

            // 验证发货城市
            if (!shipForm.value.senderCity) {
                showFailToast('请选择发货城市');
                return false;
            }

            try {
                // 简化参数：快递单号由后端自动生成
                const shipData = {
                    expressCompany: shipForm.value.trackingCompany,
                    senderCity: shipForm.value.senderCity,
                };
                const updatedOrder = await shipOrder(currentOrder.value.id, shipData);
                showSuccessToast('发货成功');

                // 更新本地订单状态和物流信息
                const index = orders.value.findIndex(o => o.id === currentOrder.value.id);
                if (index !== -1) {
                    orders.value[index] = { ...orders.value[index], ...updatedOrder };
                }
                showShipDialog.value = false;
                return true;
            } catch (error) {
                showFailToast('发货失败');
                return false;
            }
        };

        // 从路由参数初始化 Tab
        onMounted(() => {
            const status = route.query.status;
            if (status && ['PENDING', 'PAID', 'SHIPPED', 'COMPLETED'].includes(status.toUpperCase())) {
                activeTab.value = status.toUpperCase();
            }
            loadOrders();
        });

        watch(() => route.query.status, (newStatus) => {
            if (newStatus) {
                activeTab.value = newStatus.toUpperCase();
            }
        });

        return {
            loading,
            refreshing,
            finished,
            isInitialLoading,
            orders,
            filteredOrders,
            activeTab,
            tabs,
            stats,
            defaultAvatar,
            emptyText,
            showShipDialog,
            showCompanyPicker,
            showAreaPicker,
            currentOrder,
            shipForm,
            expressCompanies,
            areaList,
            statusText,
            formatTime,
            loadOrders,
            onRefresh,
            onTabChange,
            viewOrderDetail,
            contactBuyer,
            handleShip,
            onCompanyConfirm,
            onAreaConfirm,
            beforeShipClose,
            confirmShip,
            getExpressIcon,
            getProductImage,
        };
    },
};
</script>

<style scoped>
/* 页面基础样式 */
.page {
    min-height: 100vh;
    background: var(--bg-page);
    width: 100%;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.page .container {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    padding-top: 56px !important;
    box-sizing: border-box;
}

/* 统计卡片 */
.stats-card {
    display: flex;
    align-items: center;
    justify-content: space-around;
    background: var(--bg-card);
    margin: 12px;
    padding: 16px;
    border-radius: var(--radius-lg);
    color: var(--text-primary);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color);
}

.stat-item {
    text-align: center;
    flex: 1;
}

.stat-value {
    font-size: 20px;
    font-weight: 700;
    color: var(--primary-color);
}

.stat-label {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 4px;
}

.stat-divider {
    width: 1px;
    height: 30px;
    background: var(--border-color);
}

/* 订单卡片 */
.seller-order-card {
    background: var(--bg-card);
    margin: 12px;
    border-radius: var(--radius-lg);
    padding: 16px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color);
}

.order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.buyer-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.buyer-name {
    font-size: 14px;
    color: var(--text-primary);
    font-weight: 500;
}

.order-status {
    font-size: 12px;
    font-weight: 500;
    padding: 4px 10px;
    border-radius: var(--radius-full);
}

.status-pending {
    background: var(--warning-light);
    color: var(--warning-color);
}

.status-paid {
    background: #fff7ed;
    color: #ea580c;
}

.status-shipped {
    background: var(--success-light);
    color: var(--success-color);
}

.status-completed {
    background: var(--bg-input);
    color: var(--text-secondary);
}

.status-cancelled {
    background: var(--danger-light);
    color: var(--danger-color);
}

/* 商品信息 */
.order-product {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--bg-input);
    border-radius: var(--radius-md);
    cursor: pointer;
}

.product-info {
    flex: 1;
    min-width: 0;
}

.product-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.product-price {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
    margin-top: 6px;
}

.arrow-icon {
    color: var(--text-tertiary);
    font-size: 16px;
}

/* 收货信息 */
.shipping-info {
    margin-top: 12px;
    padding: 12px;
    background: #fff7ed;
    border-radius: var(--radius-md);
    border: 1px dashed #fdba74;
}

.shipping-title {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    font-weight: 500;
    color: #c2410c;
    margin-bottom: 8px;
}

.shipping-detail {
    font-size: 13px;
    color: #9a3412;
}

.recipient {
    font-weight: 500;
    margin-bottom: 4px;
}

.address {
    line-height: 1.5;
}

/* 订单元信息 */
.order-meta {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--text-tertiary);
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--border-color);
}

/* 操作按钮 */
.order-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 12px;
    flex-wrap: wrap;
}

.order-actions .van-button {
    font-size: 12px;
}

/* 骨架屏 */
.order-skeleton {
    background: var(--bg-card);
    margin: 12px;
    padding: 16px;
    border-radius: var(--radius-lg);
}

/* 列表动画 */
.order-list-enter-active,
.order-list-leave-active {
    transition: all 0.3s ease;
}

.order-list-enter-from,
.order-list-leave-to {
    opacity: 0;
    transform: translateY(20px);
}

/* 发货弹窗 */
.ship-dialog-content {
    padding: 16px;
}

.ship-product-info {
    display: flex;
    gap: 12px;
    padding: 12px;
    background: var(--bg-input);
    border-radius: var(--radius-md);
    margin-bottom: 12px;
}

.ship-product-detail {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.ship-product-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.ship-buyer {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 4px;
}

.receiver-address {
    background: var(--success-light);
    border-radius: var(--radius-md);
    padding: 12px;
    margin-bottom: 8px;
}

.receiver-address .address-label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    font-weight: 600;
    color: var(--success-color);
    margin-bottom: 6px;
}

.receiver-address .address-content {
    font-size: 13px;
    color: #14532d;
}

.receiver-address .recipient {
    font-weight: 500;
    margin-bottom: 2px;
}

.receiver-address .address-text {
    opacity: 0.9;
}

/* 快递公司网格选择 */
.express-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-bottom: 16px;
}

.express-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px 4px;
    background: var(--bg-input);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all 0.2s;
    border: 2px solid transparent;
}

.express-item span {
    font-size: 11px;
    color: var(--text-secondary);
    margin-top: 4px;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
}

.express-item:active {
    transform: scale(0.95);
}

.express-item.active {
    background: var(--info-light);
    border-color: var(--primary-color);
}

.express-item.active span {
    color: var(--primary-color);
    font-weight: 500;
}

/* 发货城市选择 */
.sender-city-section {
    margin-bottom: 8px;
}

.sender-city-section :deep(.van-field) {
    background: var(--bg-input);
    border-radius: var(--radius-md);
    padding: 8px 12px;
}

.sender-city-section :deep(.van-field__label) {
    width: 70px;
}

.sender-city-section :deep(.van-field__control) {
    text-align: right;
}

/* 提示信息 */
.ship-tips {
    background: var(--info-light);
    border-radius: var(--radius-md);
    padding: 12px;
    margin-top: 8px;
}

.ship-tips .tip-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--text-secondary);
    margin-bottom: 6px;
}

.ship-tips .tip-item:last-child {
    margin-bottom: 0;
}

.ship-tip {
    font-size: 12px;
    color: var(--warning-color);
    margin-top: 12px;
    padding: 10px;
    background: var(--warning-light);
    border-radius: var(--radius-md);
}
</style>
