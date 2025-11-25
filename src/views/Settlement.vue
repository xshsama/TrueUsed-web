<template>
    <div class="page">
        <van-nav-bar title="确认订单" left-arrow @click-left="$router.back()" fixed />
        <div class="container" style="padding-top: 56px;">
            <div class="address-card shadow-soft-lg" @click="handleAddressClick">
                <div v-if="selectedAddress">
                    <div class="recipient">{{ selectedAddress.recipientName }} {{ selectedAddress.phone }}</div>
                    <div class="address-line">{{ selectedAddress.province }} {{ selectedAddress.city }} {{
                        selectedAddress.district }}</div>
                    <div class="address-line">{{ selectedAddress.detailedAddress }}</div>
                </div>
                <div v-else class="add-address-prompt">
                    请选择或添加收货地址
                </div>
            </div>

            <div class="product-card shadow-soft-lg">
                <van-image :src="product.image" width="80" height="80" radius="8" fit="cover" />
                <div class="info">
                    <div class="title">{{ product.title }}</div>
                    <div class="price">￥{{ product.price }}</div>
                </div>
            </div>

            <div class="summary-card shadow-soft-lg">
                <van-cell title="商品总价" :value="`￥${product.price}`" />
                <van-cell title="运费" value="免运费" />
                <div class="total">
                    合计：<span class="amount">￥{{ product.price }}</span>
                </div>
            </div>
        </div>

        <div class="action-bar">
            <div class="total-display">
                合计：<span class="amount">￥{{ product.price }}</span>
            </div>
            <van-button type="danger" @click="handleConfirm" :loading="isSubmitting">提交订单</van-button>
        </div>

        <van-popup v-model:show="showAddressPicker" position="bottom" round>
            <van-address-list v-model="chosenAddressId" :list="addressList" @select="onAddressSelect"
                @add="onAddAddress" />
        </van-popup>

        <!-- 收银台弹窗 -->
        <van-action-sheet v-model:show="showPayment" title="确认付款" @closed="onPaymentClose"
            :close-on-click-overlay="false">
            <div class="payment-content">
                <div class="payment-amount">￥{{ product.price }}</div>
                <div class="payment-methods">
                    <van-radio-group v-model="paymentMethod">
                        <van-cell-group inset>
                            <van-cell title="微信支付" clickable @click="paymentMethod = 'wechat'">
                                <template #icon>
                                    <span style="margin-right:8px;font-size:20px;">💚</span>
                                </template>
                                <template #right-icon>
                                    <van-radio name="wechat" />
                                </template>
                            </van-cell>
                            <van-cell title="支付宝" clickable @click="paymentMethod = 'alipay'">
                                <template #icon>
                                    <span style="margin-right:8px;font-size:20px;">💙</span>
                                </template>
                                <template #right-icon>
                                    <van-radio name="alipay" />
                                </template>
                            </van-cell>
                        </van-cell-group>
                    </van-radio-group>
                </div>
                <div class="payment-actions">
                    <van-button type="primary" block round @click="handlePayment">立即支付</van-button>
                </div>
            </div>
        </van-action-sheet>
    </div>
</template>

<script>
import { getAddresses } from '@/api/address';
import { createOrder, payOrder } from '@/api/orders';
import { showFailToast, showSuccessToast, showToast } from 'vant';
import 'vant/es/toast/style';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default {
    name: 'Settlement',
    setup() {
        const route = useRoute();
        const router = useRouter();
        const isSubmitting = ref(false);
        const addresses = ref([]);
        const selectedAddress = ref(null);
        const showAddressPicker = ref(false);
        const chosenAddressId = ref(null);

        // 收银台控制
        const showPayment = ref(false);
        const createdOrderId = ref(null);
        const paymentMethod = ref('wechat');

        const product = ref({
            id: null,
            title: '',
            price: 0,
            image: '',
        });

        const addressList = computed(() => addresses.value.map(a => ({
            id: a.id,
            name: a.recipientName,
            tel: a.phone,
            address: `${a.province}${a.city}${a.district}${a.detailedAddress}`,
            isDefault: a.isDefault,
        })));

        const loadAddresses = async () => {
            try {
                addresses.value = await getAddresses();
                const defaultAddress = addresses.value.find(a => a.isDefault);
                selectedAddress.value = defaultAddress || (addresses.value.length > 0 ? addresses.value : null);
                if (selectedAddress.value) {
                    chosenAddressId.value = selectedAddress.value.id;
                }
            } catch (error) {
                showFailToast('加载地址失败');
            }
        };

        onMounted(() => {
            product.value.id = route.query.productId;
            product.value.title = route.query.title;
            product.value.price = route.query.price;
            product.value.image = route.query.image;
            loadAddresses();
        });

        const handleConfirm = async () => {
            if (!selectedAddress.value) {
                showToast('请选择收货地址');
                return;
            }
            isSubmitting.value = true;
            try {
                const orderRequest = {
                    productId: product.value.id,
                    addressId: selectedAddress.value.id,
                };
                const createdOrder = await createOrder(orderRequest);
                createdOrderId.value = createdOrder.id;
                showSuccessToast('订单已提交');
                // 不跳转，而是打开收银台
                showPayment.value = true;
            } catch (error) {
                showToast('下单失败');
            } finally {
                isSubmitting.value = false;
            }
        };

        const handlePayment = async () => {
            if (!createdOrderId.value) return;
            try {
                await payOrder(createdOrderId.value);
                showSuccessToast('支付成功');
                // 支付成功，跳转到详情页（状态已变为已支付）
                router.replace({ name: 'OrderDetail', params: { id: createdOrderId.value } });
            } catch (error) {
                showFailToast('支付失败');
            }
        };

        const onPaymentClose = () => {
            // 用户关闭收银台，跳转到详情页（状态为待支付）
            if (createdOrderId.value) {
                router.replace({ name: 'OrderDetail', params: { id: createdOrderId.value } });
            }
        };

        const onAddressSelect = (item) => {
            selectedAddress.value = addresses.value.find(a => a.id === item.id);
            showAddressPicker.value = false;
        };

        const onAddAddress = () => {
            router.push('/address');
        };

        const handleAddressClick = () => {
            if (addresses.value.length === 0) {
                router.push('/address');
            } else {
                showAddressPicker.value = true;
            }
        };

        return {
            product,
            isSubmitting,
            handleConfirm,
            addresses,
            selectedAddress,
            showAddressPicker,
            addressList,
            chosenAddressId,
            onAddressSelect,
            onAddAddress,
            handleAddressClick,
            showPayment,
            paymentMethod,
            handlePayment,
            onPaymentClose
        };
    },
};
</script>

<style scoped>
@import '@/styles/order-card.css';

.address-card {
    background: #fff;
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 10px;
    cursor: pointer;
}

.recipient {
    font-weight: 600;
    font-size: 16px;
    margin-bottom: 8px;
}

.address-line {
    font-size: 14px;
    color: #646566;
    line-height: 1.5;
}

.add-address-prompt {
    text-align: center;
    color: #1989fa;
    padding: 16px 0;
}

.product-card {
    display: flex;
    align-items: center;
    gap: 12px;
}

.price {
    color: #ee0a24;
    margin-top: 8px;
}

.summary-card {
    background: #fff;
    border-radius: 16px;
    margin: 10px 0;
    overflow: hidden;
}

.total {
    text-align: right;
    padding: 12px;
    font-size: 14px;
}

.amount {
    font-weight: 600;
    font-size: 16px;
    color: #ee0a24;
}

.action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    border-top: 1px solid #ebedf0;
    padding: 8px 16px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
}

.payment-content {
    padding: 24px 16px;
    padding-bottom: 40px;
}

.payment-amount {
    text-align: center;
    font-size: 32px;
    font-weight: 700;
    color: #333;
    margin-bottom: 24px;
}

.payment-methods {
    margin-bottom: 32px;
}

.payment-actions {
    padding: 0 16px;
}
</style>
