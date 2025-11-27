<template>
    <div class="page">
        <van-nav-bar title="我的评价" left-arrow @click-left="$router.back()" fixed />
        <div class="container" style="padding-top: 56px;">
            <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
                <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="loadReviews">
                    <template v-if="reviews.length === 0 && !loading">
                        <van-empty description="暂无评价" />
                    </template>
                    <div v-else class="review-list">
                        <div v-for="review in reviews" :key="review.id" class="review-card">
                            <!-- 商品信息 -->
                            <div class="product-info" @click="$router.push(`/product/${review.productId}`)">
                                <van-image :src="review.productImage" width="60" height="60" radius="8" fit="cover" />
                                <div class="product-detail">
                                    <div class="product-title">{{ review.productName }}</div>
                                    <div class="review-time">{{ formatTime(review.createdAt) }}</div>
                                </div>
                                <van-icon name="arrow" class="arrow-icon" />
                            </div>

                            <!-- 评价内容 -->
                            <div class="review-content-box">
                                <div class="rating-row">
                                    <van-rate v-model="review.rating" readonly size="14px" color="#ffd21e"
                                        void-icon="star" void-color="#eee" />
                                    <span class="rating-text">{{ getRatingText(review.rating) }}</span>
                                </div>
                                <div class="content-text">{{ review.content }}</div>
                            </div>

                            <!-- 卖家回复 -->
                            <div class="seller-reply" v-if="review.replyContent">
                                <div class="reply-title">卖家回复：</div>
                                <div class="reply-content">{{ review.replyContent }}</div>
                            </div>
                        </div>
                    </div>
                </van-list>
            </van-pull-refresh>
        </div>
    </div>
</template>

<script>
import { getMyReviews } from '@/api/reviews';
import { showFailToast } from 'vant';
import { ref } from 'vue';

export default {
    name: 'MyReviews',
    setup() {
        const loading = ref(false);
        const finished = ref(false);
        const refreshing = ref(false);
        const reviews = ref([]);

        const loadReviews = async () => {
            try {
                const res = await getMyReviews();
                if (refreshing.value) {
                    reviews.value = [];
                    refreshing.value = false;
                }
                // 假设后端返回的是 List<ReviewDTO>
                reviews.value = res;
                finished.value = true;
            } catch (error) {
                showFailToast('加载评价失败');
                finished.value = true;
            } finally {
                loading.value = false;
            }
        };

        const onRefresh = () => {
            finished.value = false;
            loading.value = true;
            loadReviews();
        };

        const formatTime = (time) => {
            if (!time) return '';
            return new Date(time).toLocaleDateString();
        };

        const getRatingText = (rating) => {
            const texts = ['极差', '失望', '一般', '满意', '惊喜'];
            return texts[rating - 1] || '';
        };

        return {
            loading,
            finished,
            refreshing,
            reviews,
            loadReviews,
            onRefresh,
            formatTime,
            getRatingText
        };
    }
};
</script>

<style scoped>
.page {
    min-height: 100vh;
    background: #f7f8fa;
}

.review-list {
    padding: 12px;
}

.review-card {
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
}

.product-info {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f5f5f5;
}

.product-detail {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.product-title {
    font-size: 14px;
    color: #333;
    font-weight: 500;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.review-time {
    font-size: 12px;
    color: #999;
}

.arrow-icon {
    color: #ccc;
    align-self: center;
}

.rating-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.rating-text {
    font-size: 12px;
    color: #666;
}

.content-text {
    font-size: 14px;
    color: #333;
    line-height: 1.5;
}

.seller-reply {
    margin-top: 12px;
    background: #f8f9fa;
    padding: 10px;
    border-radius: 8px;
}

.reply-title {
    font-size: 12px;
    color: #999;
    margin-bottom: 4px;
}

.reply-content {
    font-size: 13px;
    color: #666;
    line-height: 1.4;
}
</style>
