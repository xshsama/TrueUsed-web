<template>
    <div class="page">
        <van-nav-bar :title="isEdit ? '编辑地址' : '新增地址'" left-arrow @click-left="$router.back()" fixed />
        <div class="container" style="padding-top: 56px;">
            <van-address-edit :address-info="addressInfo" :area-list="areaList" show-postal :show-delete="isEdit"
                show-set-default show-search-result :search-result="searchResult"
                :area-columns-placeholder="['请选择', '请选择', '请选择']" @save="onSave" @delete="onDelete"
                @change-detail="onChangeDetail" />
        </div>
    </div>
</template>

<script>
import { createAddress, deleteAddress, getAddressById, updateAddress } from '@/api/address';
import { areaList } from '@vant/area-data';
import { showFailToast, showSuccessToast } from 'vant';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default {
    name: 'AddressEdit',
    setup() {
        const router = useRouter();
        const route = useRoute();
        const isEdit = ref(false);
        const searchResult = ref([]);
        const addressInfo = ref({});

        const onSave = async (content) => {
            try {
                const addressData = {
                    recipientName: content.name,
                    phone: content.tel,
                    province: content.province,
                    city: content.city,
                    district: content.county,
                    detailedAddress: content.addressDetail,
                    isDefault: content.isDefault,
                    areaCode: content.areaCode,
                };
                if (isEdit.value) {
                    await updateAddress(route.params.id, addressData);
                } else {
                    await createAddress(addressData);
                }
                showSuccessToast('保存成功');
                router.back();
            } catch (error) {
                showFailToast('保存失败');
            }
        };

        const onDelete = async () => {
            try {
                await deleteAddress(route.params.id);
                showSuccessToast('删除成功');
                router.back();
            } catch (error) {
                showFailToast('删除失败');
            }
        };

        const onChangeDetail = (val) => {
            if (val) {
                searchResult.value = [{ name: '杭州市', address: '西湖区' }];
            } else {
                searchResult.value = [];
            }
        };

        onMounted(async () => {
            if (route.params.id) {
                isEdit.value = true;
                const address = await getAddressById(route.params.id);
                addressInfo.value = {
                    name: address.recipientName,
                    tel: address.phone,
                    province: address.province,
                    city: address.city,
                    county: address.district,
                    addressDetail: address.detailedAddress,
                    isDefault: address.isDefault,
                    areaCode: address.areaCode || '', // This will be resolved by the component
                };
            } else {
                // For 'add' mode, provide a minimal object to avoid issues
                addressInfo.value = {
                    name: '',
                    tel: '',
                    province: '',
                    city: '',
                    county: '',
                    addressDetail: '',
                    isDefault: false,
                    areaCode: '',
                };
            }
        });

        return {
            isEdit,
            onSave,
            onDelete,
            areaList,
            searchResult,
            onChangeDetail,
            addressInfo
        };
    },
};
</script>