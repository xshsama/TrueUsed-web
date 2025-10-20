<template>
    <div class="page">
        <van-nav-bar title="已售出" left-arrow @click-left="$router.back()" fixed />
        <div class="container" style="padding-top:56px;">
            <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
                <template v-if="isInitialLoading">
                    <van-skeleton v-for="i in 6" :key="i" title :row="3" style="margin:12px 0" />
                </template>
                <template v-else>
                    <template v-if="items.length === 0">
                        <van-empty description="暂无已售出" />
                    </template>
                    <div v-for="it in items" :key="it.id" class="sold-card shadow-soft-lg">
                        <van-image :src="it.cover" width="72" height="72" radius="8" fit="cover" />
                        <div class="info">
                            <div class="title">{{ it.title }}</div>
                            <div class="meta">成交价 ￥{{ it.price }} · {{ it.date }}</div>
                            <div class="tags">
                                <van-tag v-if="it.afterSale === 'none'" type="success" plain round>已完成</van-tag>
                                <van-tag v-else type="warning" plain round>售后中</van-tag>
                            </div>
                        </div>
                        <div class="actions">
                            <van-button size="mini" round @click="view(it)">查看</van-button>
                        </div>
                    </div>
                </template>
            </van-list>
        </div>
    </div>
</template>

<script>
import { Toast } from 'vant';
import { ref } from 'vue';

export default {
    name: 'SoldProducts',
    setup() {
        const loading = ref(false)
        const finished = ref(false)
        const isInitialLoading = ref(true)
        const page = ref(1)
        const pageSize = 8
        const items = ref([])

        const allMock = Array.from({ length: 15 }).map((_, i) => ({
            id: i + 1,
            title: `已售出 ${i + 1}`,
            price: (199 + (i % 5) * 30).toFixed(0),
            date: `2025-10-${String((i % 28) + 1).padStart(2, '0')}`,
            afterSale: i % 4 === 0 ? 'processing' : 'none',
            cover: `https://placehold.co/160x160/EEF2FF/334155?text=S${i + 1}`
        }))

        const loadPage = () => {
            const start = (page.value - 1) * pageSize
            const end = start + pageSize
            items.value = items.value.concat(allMock.slice(start, end))
            if (end >= allMock.length) finished.value = true
            page.value += 1
        }
        const onLoad = () => { loading.value = true; setTimeout(() => { loadPage(); loading.value = false; isInitialLoading.value = false }, 400) }
        const view = (it) => Toast(`查看 ${it.title}`)

        return { loading, finished, isInitialLoading, items, onLoad, view }
    }
}
</script>

<style scoped>
.sold-card {
    background: #fff;
    border-radius: 16px;
    padding: 12px;
    margin: 10px 0;
    display: flex;
    gap: 12px;
    align-items: center;
}

.sold-card .info {
    flex: 1;
    min-width: 0;
}

.sold-card .title {
    font-weight: 700;
    color: #111827;
}

.sold-card .meta {
    color: #6b7280;
    font-size: 12px;
    margin-top: 4px;
}

.sold-card .tags {
    margin-top: 6px;
    display: flex;
    gap: 6px;
}
</style>
