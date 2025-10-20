<template>
    <div class="page">
        <van-nav-bar title="客服中心" left-arrow @click-left="$router.back()" fixed />
        <div class="container" style="padding-top:56px;">
            <van-grid :column-num="3" clickable>
                <van-grid-item icon="chat-o" text="客服消息" @click="goServiceMessages" />
                <van-grid-item icon="phone-o" text="客服电话" @click="call" />
                <van-grid-item icon="service-o" text="在线客服" @click="online" />
            </van-grid>

            <van-collapse v-model="active">
                <van-collapse-item title="订单相关" name="a">
                    <div class="qa">如何修改订单地址？请在发货前联系卖家或客服处理。</div>
                    <div class="qa">如何申请退货退款？在订单详情中选择“售后”。</div>
                </van-collapse-item>
                <van-collapse-item title="商品相关" name="b">
                    <div class="qa">收到商品与描述不符？请拍照取证并联系卖家处理。</div>
                </van-collapse-item>
                <van-collapse-item title="账号相关" name="c">
                    <div class="qa">修改手机号/邮箱：前往“设置-安全设置”操作。</div>
                </van-collapse-item>
            </van-collapse>
        </div>
    </div>
</template>

<script>
import { Toast } from 'vant';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
    name: 'ServiceCenter',
    setup() {
        const router = useRouter()
        const active = ref(['a'])
        const goServiceMessages = () => router.push({ name: 'ServiceMessages' })
        const call = () => Toast('请拨打 400-000-0000')
        const online = () => Toast('马上为您接入在线客服（占位）')
        return { active, goServiceMessages, call, online }
    }
}
</script>

<style scoped>
.qa {
    color: #475569;
    padding: 6px 0;
}
</style>
