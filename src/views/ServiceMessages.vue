<template>
    <div class="page">
        <van-nav-bar title="客服消息" left-arrow @click-left="$router.back()" fixed />
        <div class="container" style="padding-top:56px;">
            <van-cell-group>
                <van-cell v-for="c in chats" :key="c.id" :title="c.title" :label="c.last" is-link @click="open(c)">
                    <template #icon>
                        <van-badge :content="c.unread > 0 ? c.unread : ''">
                            <van-image :src="c.avatar" width="40" height="40" round fit="cover" />
                        </van-badge>
                    </template>
                </van-cell>
            </van-cell-group>
            <template v-if="chats.length === 0">
                <van-empty description="暂无客服消息" />
            </template>
        </div>
    </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
    name: 'ServiceMessages',
    setup() {
        const router = useRouter()
        const chats = ref([
            { id: 1, title: '在线客服-小真', last: '您好，有什么可以帮您？', unread: 2, avatar: 'https://placehold.co/80x80/4F46E5/fff?text=K' },
            { id: 2, title: '商家客服-二手优品店', last: '售后申请已收到，我们会尽快处理。', unread: 0, avatar: 'https://placehold.co/80x80/0EA5E9/fff?text=S' },
        ])
        const open = (c) => router.push({ name: 'Messages' })
        return { chats, open }
    }
}
</script>
