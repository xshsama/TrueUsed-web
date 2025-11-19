<template>
    <div class="page">
        <van-nav-bar title="地址管理" left-arrow @click-left="$router.back()" fixed />
        <div class="container" style="padding-top:56px;">
            <template v-if="list.length === 0">
                <van-empty description="还没有地址，去新增一个吧" />
            </template>
            <div v-else>
                <van-swipe-cell v-for="addr in list" :key="addr.id" class="addr-item">
                    <div class="addr-card shadow-soft-lg" @click="edit(addr)">
                        <div class="row">
                            <div class="name">{{ addr.name }} <span class="phone">{{ addr.phone }}</span></div>
                            <van-tag v-if="addr.isDefault" type="success" size="mini" round>默认</van-tag>
                        </div>
                        <div class="detail">{{ addr.region }} {{ addr.detail }}</div>
                        <div class="ops">
                            <van-switch v-model="addr.isDefault" size="20" @change="setDefault(addr)" />
                            <van-button size="mini" plain round @click.stop="edit(addr)">编辑</van-button>
                            <van-button size="mini" type="danger" round plain @click.stop="remove(addr)">删除</van-button>
                        </div>
                    </div>
                    <template #right>
                        <van-button square type="danger" text="删除" class="delete-button" @click="remove(addr)" />
                    </template>
                </van-swipe-cell>
            </div>

            <div style="margin-top:16px;">
                <van-button type="primary" class="btn-primary" block round @click="add">新增地址</van-button>
            </div>

            <van-popup v-model:show="show" round position="bottom">
                <div class="panel">
                    <div class="panel-title">{{ current?.id ? '编辑地址' : '新增地址' }}</div>
                    <van-form @submit="onSubmit" ref="formRef">
                        <van-cell-group inset>
                            <van-field v-model="form.name" name="name" label="收货人" placeholder="姓名"
                                :rules="[{ required: true, message: '请填写收货人' }]" />
                            <van-field v-model="form.phone" name="phone" label="手机号" placeholder="11位手机号"
                                :rules="[{ pattern: /^1\d{10}$/, message: '请输入正确手机号' }]" />
                            <van-field v-model="form.region" name="region" label="地区" placeholder="省市区"
                                :rules="[{ required: true, message: '请选择地区' }]" />
                            <van-field v-model="form.detail" name="detail" label="详细地址" type="textarea" rows="2"
                                maxlength="120" show-word-limit placeholder="街道、小区、门牌号"
                                :rules="[{ required: true, message: '请填写详细地址' }]" />
                        </van-cell-group>
                        <div style="padding:12px 16px; display:flex; gap:12px;">
                            <van-button native-type="button" block round @click="show = false">取消</van-button>
                            <van-button type="primary" native-type="submit" block round>保存</van-button>
                        </div>
                    </van-form>
                </div>
            </van-popup>
        </div>
    </div>
</template>

<script>
import { Dialog, showSuccessToast } from 'vant';
import { onMounted, ref } from 'vue';

const KEY = 'tu.address.list'

export default {
    name: 'Address',
    setup() {
        const list = ref([])
        const show = ref(false)
        const formRef = ref(null)
        const current = ref(null)
        const form = ref({ id: null, name: '', phone: '', region: '', detail: '', isDefault: false })

        const load = () => {
            try { list.value = JSON.parse(localStorage.getItem(KEY) || '[]') } catch { list.value = [] }
        }
        const save = () => { localStorage.setItem(KEY, JSON.stringify(list.value)) }

        const add = () => { current.value = null; form.value = { id: null, name: '', phone: '', region: '', detail: '', isDefault: list.value.length === 0 }; show.value = true }
        const edit = (addr) => { current.value = addr; form.value = { ...addr }; show.value = true }
        const remove = (addr) => {
            Dialog.confirm({ title: '删除地址', message: '确定删除该地址吗？' })
                .then(() => {
                    list.value = list.value.filter(i => i.id !== addr.id)
                    if (list.value.length && !list.value.some(i => i.isDefault)) list.value[0].isDefault = true
                    save(); showSuccessToast('已删除')
                })
                .catch(() => { })
        }
        const setDefault = (addr) => {
            list.value.forEach(i => { i.isDefault = i.id === addr.id })
            save(); showSuccessToast('已设为默认')
        }
        const onSubmit = () => {
            if (!form.value.id) {
                form.value.id = Date.now()
                list.value.unshift({ ...form.value })
            } else {
                const idx = list.value.findIndex(i => i.id === form.value.id)
                if (idx > -1) list.value[idx] = { ...form.value }
            }
            if (form.value.isDefault) list.value.forEach(i => { if (i.id !== form.value.id) i.isDefault = false })
            save(); showSuccessToast('保存成功'); show.value = false
        }

        onMounted(() => load())

        return { list, show, formRef, form, current, add, edit, remove, onSubmit, setDefault }
    }
}
</script>

<style scoped>
.addr-item {
    margin: 10px 0;
}

.addr-card {
    background: #fff;
    border-radius: 16px;
    padding: 12px;
}

.addr-card .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
}

.addr-card .name {
    font-weight: 600;
    color: #111827;
}

.addr-card .phone {
    color: #6b7280;
    font-weight: 500;
    margin-left: 6px;
}

.addr-card .detail {
    color: #475569;
    font-size: 13px;
}

.addr-card .ops {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-top: 8px;
    justify-content: flex-end;
}

.delete-button {
    height: 100%;
}

.panel {
    padding: 12px 12px 4px;
}

.panel-title {
    text-align: center;
    font-weight: 700;
    padding: 8px 0;
}
</style>
