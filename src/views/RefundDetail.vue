<template>
    <div class="refund-detail-page">
        <van-nav-bar title="退款详情" left-text="返回" left-arrow @click-left="$router.back()" />

        <div class="content" v-if="order">
            <div class="status-card">
                <h3>{{ getStatusText(order.status) }}</h3>
                <p v-if="order.status === 'REFUND_PENDING'">等待卖家处理</p>
                <p v-if="order.status === 'REFUND_APPROVED'">卖家已同意退款</p>
                <p v-if="order.status === 'REFUNDED'">退款已完成</p>
            </div>

            <van-cell-group inset title="退款信息">
                <van-cell title="退款金额" :value="`¥${order.price}`" />
                <van-cell title="退款原因" :label="refundRequest?.reason || '加载中...'" />
                <van-cell title="申请时间" :value="refundRequest?.createdAt" />
            </van-cell-group>

            <div class="actions" v-if="isSeller && order.status === 'REFUND_PENDING'">
                <van-button type="danger" block @click="handleReject">拒绝退款</van-button>
                <div style="height: 10px;"></div>
                <van-button type="primary" block @click="handleApprove">同意退款</van-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { approveRefund, getOrderById, rejectRefund } from '@/api/orders';
import { useUserStore } from '@/stores/user';
import { showConfirmDialog, showSuccessToast, showToast } from 'vant';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const orderId = route.params.id;
const order = ref(null);
const refundRequest = ref(null); // Ideally fetch this from a separate API or included in order

const isSeller = computed(() => {
    return order.value && userStore.userInfo && order.value.seller.id === userStore.userInfo.id;
});

const getStatusText = (status) => {
    const map = {
        'REFUND_PENDING': '退款申请中',
        'REFUND_APPROVED': '退款已同意',
        'REFUNDED': '已退款',
        'RETURN_PENDING': '等待退货'
    };
    return map[status] || status;
};

onMounted(async () => {
    try {
        const res = await getOrderById(orderId);
        order.value = res;
        // TODO: Fetch refund request details. 
        // Since we didn't add an API to get refund request by order ID in the controller yet,
        // we might need to add it or just rely on order status for now.
        // For now, I'll just show order info.
    } catch (error) {
        showToast('获取信息失败');
    }
});

const handleApprove = () => {
    showConfirmDialog({
        title: '同意退款',
        message: '确认同意退款吗？'
    }).then(async () => {
        try {
            await approveRefund(orderId);
            showSuccessToast('已同意');
            // Refresh
            const res = await getOrderById(orderId);
            order.value = res;
        } catch (error) {
            showToast('操作失败');
        }
    });
};

const handleReject = () => {
    showConfirmDialog({
        title: '拒绝退款',
        message: '确认拒绝退款吗？'
    }).then(async () => {
        try {
            await rejectRefund(orderId);
            showSuccessToast('已拒绝');
            // Refresh
            const res = await getOrderById(orderId);
            order.value = res;
        } catch (error) {
            showToast('操作失败');
        }
    });
};
</script>

<style scoped>
.refund-detail-page {
    background: #f7f8fa;
    min-height: 100vh;
}

.content {
    padding: 16px;
}

.status-card {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    margin-bottom: 16px;
}

.status-card h3 {
    margin: 0 0 8px;
    color: #333;
}

.status-card p {
    margin: 0;
    color: #999;
    font-size: 14px;
}

.actions {
    margin-top: 24px;
}
</style>
