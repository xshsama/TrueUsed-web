<template>
    <div class="review-create-page">
        <van-nav-bar title="发表评价" left-text="返回" left-arrow @click-left="$router.back()" />

        <div class="content" v-if="order">
            <div class="product-info">
                <van-card :price="order.price" :title="order.product.title"
                    :thumb="order.product.image || order.product.images?.[0]?.url" />
            </div>

            <van-form @submit="onSubmit">
                <van-cell-group inset title="评价内容">
                    <van-field name="rating" label="评分">
                        <template #input>
                            <van-rate v-model="form.rating" :size="25" color="#ffd21e" void-icon="star"
                                void-color="#eee" />
                        </template>
                    </van-field>

                    <van-field v-model="form.content" name="content" label="评价详情" type="textarea"
                        placeholder="说说你的使用体验，分享给想买的朋友吧" rows="4" autosize maxlength="200" show-word-limit />

                    <van-field name="isAnonymous" label="匿名评价">
                        <template #input>
                            <van-switch v-model="form.isAnonymous" size="20" />
                        </template>
                    </van-field>
                </van-cell-group>

                <div style="margin: 16px;">
                    <van-button round block type="primary" native-type="submit">
                        提交评价
                    </van-button>
                </div>
            </van-form>
        </div>
    </div>
</template>

<script setup>
import { getOrderById } from '@/api/orders';
import { createReview } from '@/api/reviews';
import { showSuccessToast, showToast } from 'vant';
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const orderId = route.query.orderId;
const order = ref(null);

const form = reactive({
    rating: 5,
    content: '',
    isAnonymous: false
});

onMounted(async () => {
    if (!orderId) {
        showToast('参数错误');
        return;
    }
    try {
        const res = await getOrderById(orderId);
        order.value = res;
    } catch (error) {
        showToast('获取订单信息失败');
    }
});

const onSubmit = async () => {
    if (!form.content.trim()) {
        showToast('请输入评价内容');
        return;
    }
    try {
        await createReview({
            orderId: orderId,
            rating: form.rating,
            content: form.content,
            isAnonymous: form.isAnonymous
        });
        showSuccessToast('评价成功');
        router.replace(`/order/${orderId}`);
    } catch (error) {
        showToast(error.response?.data?.message || '提交失败');
    }
};
</script>

<style scoped>
.review-create-page {
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
