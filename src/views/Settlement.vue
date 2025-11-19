<template>
    <div class="page">
        <van-nav-bar title="确认订单" left-arrow @click-left="$router.back()" fixed />
        <div class="container" style="padding-top: 56px;">
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
            <van-button type="danger" @click="handleConfirm" :loading="isSubmitting">确认支付</van-button>
        </div>
    </div>
</template>

<script>
import { createOrder, payOrder } from '@/api/orders';
import { Toast } from 'vant';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default {
    name: 'Settlement',
    setup() {
        const route = useRoute();
        const router = useRouter();
        const isSubmitting = ref(false);

        const product = ref({
            id: null,
            title: '',
            price: 0,
            image: '',
        });

        onMounted(() => {
            product.value.id = route.query.productId;
            product.value.title = route.query.title;
            product.value.price = route.query.price;
            product.value.image = route.query.image;
        });

        const handleConfirm = async () => {
            isSubmitting.value = true;
            try {
                // 1. 创建订单
                const createdOrder = await createOrder(product.value.id);

                // 2. 模拟支付
                await payOrder(createdOrder.id);

                Toast.success('支付成功！');

                // 3. 跳转到订单详情
                router.replace({ name: 'OrderDetail', params: { id: createdOrder.id } });
            } catch (error) {
                Toast('下单失败');
            } finally {
                isSubmitting.value = false;
            }
        };

        return {
            product,
            isSubmitting,
            handleConfirm,
        };
    },
};
</script>

<style scoped>
@import '@/styles/order-card.css';

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
</style>
