<template>
    <div class="refund-apply-page">
        <van-nav-bar title="申请退款" left-text="返回" left-arrow @click-left="$router.back()" />

        <div class="content" v-if="order">
            <div class="product-info">
                <van-card :price="order.price" :title="order.product.title"
                    :thumb="order.product.image || order.product.images?.[0]?.url" />
            </div>

            <van-form @submit="onSubmit">
                <van-cell-group inset title="退款信息">
                    <van-field name="refundType" label="退款类型">
                        <template #input>
                            <van-radio-group v-model="form.refundType" direction="horizontal">
                                <van-radio name="REFUND_ONLY">仅退款</van-radio>
                                <van-radio name="RETURN_REFUND">退货退款</van-radio>
                            </van-radio-group>
                        </template>
                    </van-field>

                    <van-field v-model="form.refundAmount" name="refundAmount" label="退款金额" type="number"
                        :placeholder="`最多可退 ¥${order.price}`"
                        :rules="[{ required: true, message: '请输入退款金额' }, { validator: validateAmount, message: '金额超出限制' }]">
                        <template #extra>
                            <span class="currency">¥</span>
                        </template>
                    </van-field>

                    <van-field v-model="form.reason" name="reason" label="退款原因" type="textarea" placeholder="请输入退款原因"
                        rows="3" autosize :rules="[{ required: true, message: '请输入退款原因' }]" />
                </van-cell-group>

                <div style="margin: 16px;">
                    <van-button round block type="primary" native-type="submit">
                        提交申请
                    </van-button>
                </div>
            </van-form>
        </div>
    </div>
</template>

<script setup>
import { getOrderById, requestRefund } from '@/api/orders';
import { showSuccessToast, showToast } from 'vant';
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const orderId = route.params.id;
const order = ref(null);

const form = reactive({
    refundType: 'REFUND_ONLY',
    refundAmount: '',
    reason: ''
});

onMounted(async () => {
    try {
        const res = await getOrderById(orderId);
        order.value = res;
        form.refundAmount = res.price; // Default to full refund
    } catch (error) {
        showToast('获取订单信息失败');
    }
});

const validateAmount = (val) => {
    return parseFloat(val) <= parseFloat(order.value.price) && parseFloat(val) > 0;
};

const onSubmit = async () => {
    try {
        await requestRefund(orderId, {
            ...form,
            refundAmount: parseFloat(form.refundAmount)
        });
        showSuccessToast('申请提交成功');
        router.replace(`/order/${orderId}`);
    } catch (error) {
        showToast(error.response?.data?.message || '提交失败');
    }
};
</script>

<style scoped>
.refund-apply-page {
    background: #f7f8fa;
    min-height: 100vh;
}

.content {
    padding-top: 10px;
}

.product-info {
    margin: 10px 16px;
    border-radius: 8px;
    overflow: hidden;
}
</style>
