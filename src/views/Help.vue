<template>
    <div class="page">
        <van-nav-bar title="帮助中心" left-arrow @click-left="$router.back()" fixed />
        <div class="container" style="padding-top:56px;">
            <van-search v-model="kw" placeholder="搜索问题，如 发货、退款" shape="round" />
            <van-collapse v-model="activeNames">
                <van-collapse-item v-for="(q, idx) in filtered" :key="idx" :title="q.q" :name="idx">
                    <div class="answer" v-html="q.a"></div>
                </van-collapse-item>
            </van-collapse>
            <template v-if="filtered.length === 0">
                <van-empty description="未找到相关问题" />
            </template>
        </div>
    </div>
</template>

<script>
import { computed, ref } from 'vue';

export default {
    name: 'Help',
    setup() {
        const kw = ref('')
        const activeNames = ref([])
        const faqs = ref([
            { q: '如何发布商品？', a: '进入“卖家中心”-“发布商品”，填写标题、价格、分类和图片后提交即可。' },
            { q: '如何修改收货地址？', a: '在“我的”-“地址管理”中新增或编辑地址，并设置默认地址。' },
            { q: '如何申请售后？', a: '在“我的订单”中选择对应订单，点击“售后”或联系卖家沟通处理。' },
            { q: '支付失败怎么办？', a: '请检查网络或更换付款方式，若仍失败可联系客服处理。' },
            { q: '如何联系客服？', a: '进入“客服中心”，或在订单详情页点击联系卖家/客服消息。' },
        ])
        const filtered = computed(() => {
            if (!kw.value) return faqs.value
            const k = kw.value.toLowerCase()
            return faqs.value.filter(i => i.q.toLowerCase().includes(k) || String(i.a).toLowerCase().includes(k))
        })
        return { kw, activeNames, filtered }
    }
}
</script>

<style scoped>
.answer {
    color: #374151;
    line-height: 1.6;
}
</style>
