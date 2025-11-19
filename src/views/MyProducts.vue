<template>
    <div class="page">
        <van-nav-bar title="我的发布" left-arrow @click-left="$router.back()" fixed />
        <div class="container" style="padding-top:56px;">
            <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
                <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
                    <template v-if="isInitialLoading">
                        <ProductCardSkeleton v-for="i in 6" :key="i" />
                    </template>
                    <template v-else>
                        <template v-if="items.length === 0">
                            <van-empty description="暂无发布">
                                <van-button round type="primary" class="bottom-button" @click="goToPost">
                                    去发布闲置
                                </van-button>
                            </van-empty>
                        </template>
                        <div v-for="it in items" :key="it.id" class="prod-card shadow-soft-lg">
                            <van-image :src="it.cover" width="88" height="88" fit="cover" radius="8" />
                            <div class="info">
                                <div class="title">{{ it.title }}</div>
                                <div class="meta">￥{{ it.price }} · {{ it.category }}</div>
                                <div class="ops">
                                    <van-tag v-if="it.status === 'on'" type="success" plain round>在架</van-tag>
                                    <van-tag v-else type="default" plain round>下架</van-tag>
                                </div>
                            </div>
                            <div class="actions">
                                <van-button size="mini" round plain @click="toggle(it)">{{ it.status === 'on' ? '下架' :
                                    '上架' }}</van-button>
                                <van-button size="mini" round type="primary" @click="edit(it)">编辑</van-button>
                                <van-button size="mini" round type="danger" plain @click="remove(it)">删除</van-button>
                            </div>
                        </div>
                    </template>
                </van-list>
            </van-pull-refresh>
        </div>
    </div>
</template>

<script>
import ProductCardSkeleton from '@/components/ProductCardSkeleton.vue';
import { Dialog, showSuccessToast, showToast } from 'vant';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
    components: {
        ProductCardSkeleton,
    },
    name: 'MyProducts',
    setup() {
        const router = useRouter();
        const loading = ref(false)
        const refreshing = ref(false)
        const finished = ref(false)
        const isInitialLoading = ref(true)
        const page = ref(1)
        const pageSize = 8
        const items = ref([])

        const goToPost = () => {
            router.push('/post/create');
        };

        const allMock = Array.from({ length: 21 }).map((_, i) => ({
            id: i + 1,
            title: `发布商品 ${i + 1}`,
            price: (99 + (i % 7) * 15).toFixed(0),
            category: ['手机', '数码', '家电'][i % 3],
            status: i % 3 === 0 ? 'off' : 'on',
            cover: `https://placehold.co/176x176/F1F5F9/334155?text=P${i + 1}`
        }))

        const loadPage = (reset = false) => {
            if (reset) { page.value = 1; finished.value = false; items.value = [] }
            const start = (page.value - 1) * pageSize
            const end = start + pageSize
            items.value = items.value.concat(allMock.slice(start, end))
            if (end >= allMock.length) finished.value = true
            page.value += 1
        }
        const onLoad = () => { loading.value = true; setTimeout(() => { loadPage(); loading.value = false; isInitialLoading.value = false }, 400) }
        const onRefresh = () => { refreshing.value = true; setTimeout(() => { loadPage(true); refreshing.value = false; showSuccessToast('已刷新') }, 500) }

        const toggle = (it) => { it.status = it.status === 'on' ? 'off' : 'on'; showSuccessToast(it.status === 'on' ? '已上架' : '已下架') }
        const edit = (it) => showToast(`编辑：${it.title}`)
        const remove = (it) => { Dialog.confirm({ title: '删除商品', message: '确定删除该商品吗？' }).then(() => { items.value = items.value.filter(x => x.id !== it.id); showSuccessToast('已删除') }).catch(() => { }) }

        // 初次加载
        onLoad()

        return { loading, refreshing, finished, isInitialLoading, items, onLoad, onRefresh, toggle, edit, remove, goToPost }
    }
}
</script>

<style scoped>
.bottom-button {
    width: 160px;
    height: 40px;
}

.prod-card {
    background: #fff;
    border-radius: 16px;
    padding: 12px;
    margin: 10px 0;
    display: flex;
    gap: 12px;
    align-items: center;
}

.prod-card .info {
    flex: 1;
    min-width: 0;
}

.prod-card .title {
    font-weight: 700;
    color: #111827;
}

.prod-card .meta {
    color: #6b7280;
    font-size: 12px;
    margin-top: 4px;
}

.prod-card .actions {
    display: flex;
    flex-direction: column;
    gap: 6px;
}
</style>
