<template>
    <div class="page">
        <van-nav-bar title="我的发布" left-arrow @click-left="$router.back()" fixed />
        <div class="container" style="padding-top:56px;">
            <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
                <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
                    <template v-if="isInitialLoading">
                        <ProductCardSkeleton v-for="i in 6" :key="i" type="horizontal" />
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
import { deleteProduct, getMyProducts, hideProduct, publishProduct } from '@/api/products';
import ProductCardSkeleton from '@/components/ProductCardSkeleton.vue';
import { showConfirmDialog, showFailToast, showSuccessToast } from 'vant';
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
        const page = ref(0) // Spring Page starts at 0
        const pageSize = 10
        const items = ref([])

        const goToPost = () => {
            router.push('/post/create');
        };

        const loadPage = async (reset = false) => {
            if (reset) {
                page.value = 0;
                finished.value = false;
                items.value = [];
                isInitialLoading.value = true; // Ensure loading state on reset
            }

            try {
                const res = await getMyProducts({
                    page: page.value,
                    size: pageSize,
                    sort: 'created_desc'
                });

                const newItems = res.content.map(p => ({
                    id: p.id,
                    title: p.title,
                    price: p.price,
                    category: p.categoryName,
                    status: p.status === 'AVAILABLE' ? 'on' : 'off',
                    cover: p.images && p.images.length > 0 ? p.images[0].url : ''
                }));

                if (reset) {
                    items.value = newItems;
                } else {
                    items.value = items.value.concat(newItems);
                }

                if (res.last) {
                    finished.value = true;
                } else {
                    page.value += 1;
                }
            } catch (error) {
                console.error(error);
                showFailToast('加载失败');
                finished.value = true;
            } finally {
                loading.value = false;
                isInitialLoading.value = false;
            }
        }

        const onLoad = () => {
            if (refreshing.value) return; // Prevent double loading during refresh
            loading.value = true;
            loadPage();
        }

        const onRefresh = () => {
            refreshing.value = true;
            loadPage(true).then(() => {
                refreshing.value = false;
                showSuccessToast('已刷新');
            });
        }

        const toggle = async (it) => {
            const action = it.status === 'on' ? '下架' : '上架';
            try {
                if (it.status === 'on') {
                    await hideProduct(it.id);
                    it.status = 'off';
                } else {
                    await publishProduct(it.id);
                    it.status = 'on';
                }
                showSuccessToast(`已${action}`);
            } catch (error) {
                showFailToast(`${action}失败`);
            }
        }

        const edit = (it) => {
            // Assuming we have an edit page, let's mock for now as per instructions or check if edit page exists
            // The file list showed 'PostCreate.vue' which likely handles create.
            // We might need 'PostEdit.vue' or pass ID to 'PostCreate'.
            // For now, let's just show toast or navigate if route exists.
            // I'll assume /post/edit/:id or reuse /post/create with query.
            // showToast(`编辑功能开发中: ${it.title}`);
            router.push({ name: 'PostCreate', query: { id: it.id } }); // Reusing PostCreate for edit is common
        }

        const remove = (it) => {
            showConfirmDialog({ title: '删除商品', message: '确定删除该商品吗？' })
                .then(async () => {
                    try {
                        await deleteProduct(it.id);
                        items.value = items.value.filter(x => x.id !== it.id);
                        showSuccessToast('已删除');
                    } catch (error) {
                        showFailToast('删除失败');
                    }
                })
                .catch(() => { });
        }

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
