<template>
    <div class="page">
        <van-nav-bar title="地址管理" left-arrow @click-left="$router.back()" fixed />
        <div class="container" style="padding-top: 56px; padding-bottom: 80px;">
            <van-address-list v-model="chosenAddressId" :list="list" default-tag-text="默认" add-button-text="新增地址"
                @add="onAdd" @edit="onEdit" @select="onSelect" />
            <div v-if="list.length === 0" class="empty-state">
                <van-empty description="暂无地址" />
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
            try {
                const addresses = await getAddresses();
                console.log('Fetched addresses:', addresses);
                list.value = addresses.map(addr => ({
                    id: addr.id,
                    name: addr.recipientName,
                    tel: addr.phone,
                    address: `${addr.province} ${addr.city} ${addr.district} ${addr.detailedAddress}`,
                    isDefault: addr.isDefault,
                }));
                console.log('Mapped list:', list.value);
                const defaultAddress = list.value.find(item => item.isDefault);
                if (defaultAddress) {
                    chosenAddressId.value = defaultAddress.id;
                } else if (list.value.length > 0) {
                    chosenAddressId.value = list.value.id;
                }
            } catch (error) {
                console.error('Failed to load addresses:', error);
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
                try {
                    console.log('Updating address with:', { ...address, isDefault: true });
                    await updateAddress(item.id, { ...address, isDefault: true });
                    list.value.forEach(i => i.isDefault = i.id === item.id);
                } catch (error) {
                    console.error('Failed to update address:', error);
                }
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

/* 自定义默认标签样式 */
:deep(.van-tag--danger) {
    background-color: #E8F5E9;
    color: var(--primary-color);
}

:deep(.van-button--danger) {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
}

/* 页面布局调整 */
.page {
    min-height: 100vh;
    background: var(--bg-page);
}

.container {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    padding-top: 56px !important;
    padding-bottom: 80px !important;
    box-sizing: border-box;
}
</style>
