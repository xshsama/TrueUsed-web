<template>
    <div class="product-card-wrapper tu-card">
        <div class="media">
            <van-skeleton-image />
        </div>
        <div class="info">
            <van-skeleton-paragraph :row="2" />
            <div class="meta-row-skeleton">
                <van-skeleton-paragraph :row="1" style="width: 40%;" />
                <van-skeleton-paragraph :row="1" style="width: 20%;" />
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ProductCardSkeleton',
};
</script>

<style scoped>
.product-card-wrapper {
    border-radius: var(--card-radius);
    display: flex;
    flex-direction: column;
}

.media {
    aspect-ratio: 4/3;
}

.media .van-skeleton-image {
    width: 100%;
    height: 100%;
}

.info {
    padding: 14px 16px 16px;
    display: flex;
    flex-direction: column;
    flex: 1;
}

.meta-row-skeleton {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
}

@media (max-width: 720px) {
    .info {
        padding: 12px 12px 14px;
    }
}
</style>