<template>
    <div class="page">
        <van-nav-bar title="地址管理" left-arrow @click-left="$router.back()" fixed />
        <div class="container" style="padding-top: 56px; padding-bottom: 80px;">
            <van-address-list v-model="chosenAddressId" :list="list" default-tag-text="默认" @edit="onEdit"
                @select="onSelect" />
            <div v-if="list.length === 0" class="empty-state">
                <van-empty description="暂无地址" />
            </div>
            <div class="add-address-button-container">
                <van-button type="primary" round block @click="onAdd">新增地址</van-button>
            </div>
        </div>
    </div>
</template>

<script>
import { getAddresses, updateAddress } from '@/api/address';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
    name: 'Address',
    setup() {
        const router = useRouter();
        const chosenAddressId = ref(null);
        const list = ref([]);

        const loadAddresses = async () => {
            const addresses = await getAddresses();
            list.value = addresses.map(addr => ({
                id: addr.id,
                name: addr.recipientName,
                tel: addr.phone,
                address: `${addr.province} ${addr.city} ${addr.district} ${addr.detailedAddress}`,
                isDefault: addr.isDefault,
            }));
            const defaultAddress = list.value.find(item => item.isDefault);
            if (defaultAddress) {
                chosenAddressId.value = defaultAddress.id;
            }
        };

        const onAdd = () => {
            router.push('/address-edit');
        };

        const onEdit = (item) => {
            router.push(`/address-edit/${item.id}`);
        };

        const onSelect = async (item) => {
            const address = list.value.find(i => i.id === item.id);
            if (address && !address.isDefault) {
                await updateAddress(item.id, { ...address, isDefault: true });
                list.value.forEach(i => i.isDefault = i.id === item.id);
            }
        };

        onMounted(loadAddresses);

        return {
            chosenAddressId,
            list,
            onAdd,
            onEdit,
            onSelect,
        };
    },
};
</script>

<style scoped>
.add-address-button-container {
    position: fixed;
    bottom: 20px;
    left: 16px;
    right: 16px;
    z-index: 100;
}

.empty-state {
    margin-top: 40px;
}
</style>
