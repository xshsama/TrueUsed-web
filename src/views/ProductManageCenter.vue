<template>
    <div class="page">
        <van-nav-bar title="商品管理" left-arrow @click-left="$router.back()" fixed />
        <div class="container" style="padding-top:56px;">
            <section class="kpi shadow-soft-lg">
                <div class="kpi-item">
                    <div class="num">{{ stats.onShelfProducts }}</div>
                    <div class="label">在架商品</div>
                </div>
                <div class="kpi-item">
                    <div class="num">{{ stats.pendingOrders }}</div>
                    <div class="label">待处理</div>
                </div>
                <div class="kpi-item">
                    <div class="num">{{ stats.violationProducts }}</div>
                    <div class="label">违规下架</div>
                </div>
            </section>

            <van-grid :border="false">
                <van-grid-item icon="add-o" text="发布商品" @click="$router.push({ name: 'PostCreate' })" />
                <van-grid-item icon="apps-o" text="我的发布" @click="$router.push({ name: 'MyProducts' })" />
                <van-grid-item icon="orders-o" text="订单管理" @click="$router.push({ name: 'OrderManage' })" />
            </van-grid>
        </div>
    </div>
</template>

<script>
import { fetchMyStats } from '@/api/auth';
import { onMounted, ref } from 'vue';

export default {
    name: 'ProductManageCenter',
    setup() {
        const stats = ref({
            onShelfProducts: 0,
            pendingOrders: 0,
            violationProducts: 0
        });

        const loadStats = async () => {
            try {
                const res = await fetchMyStats();
                stats.value = res;
            } catch (error) {
                console.error('Failed to load stats:', error);
            }
        };

        onMounted(() => {
            loadStats();
        });

        return { stats };
    }
}
</script>

<style scoped>
.kpi {
    background: #fff;
    border-radius: 16px;
    padding: 12px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 12px;
}

.kpi-item {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 10px;
    text-align: center;
}

.num {
    font-weight: 800;
    font-size: 18px;
    color: #111827;
}

.label {
    color: #64748b;
    font-size: 12px;
}
</style>
