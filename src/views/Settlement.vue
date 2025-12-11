<script setup>
import { getAddresses } from '@/api/address';
import { getMyCoupons } from '@/api/coupon';
import { createOrder } from '@/api/orders';
import { getProduct } from '@/api/products';
import { Check, ChevronRight, FileCheck, MapPin, ShieldCheck } from 'lucide-vue-next';
import { showFailToast, showSuccessToast, showToast } from 'vant';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// --- State ---
const loading = ref(false);
const isSubmitting = ref(false);
const address = ref(null); // Selected address
const addressList = ref([]); // All addresses

const product = ref({
    id: null,
    title: '',
    price: 0,
    image: '',
    tags: [],
});

const seller = ref({
    name: '卖家',
    avatar: 'https://via.placeholder.com/100'
});

const deliveryType = ref('express');
const coupons = ref([]);
const selectedCoupon = ref(null);
const showCouponPopup = ref(false);
const remark = ref('');

// --- Computed ---
const freight = computed(() => deliveryType.value === 'express' ? 0 : 0);

const validCoupons = computed(() => {
    const price = Number(product.value.price) || 0;
    return coupons.value.filter(c => !c.isUsed && c.coupon.minSpend <= price);
});

const finalPrice = computed(() => {
    const p = Number(product.value.price) || 0;
    const f = freight.value;
    const c = selectedCoupon.value ? selectedCoupon.value.coupon.discountAmount : 0;
    const total = p + f - c;
    return total > 0 ? total.toFixed(2) : '0.00';
});

const savedAmount = computed(() => {
    return selectedCoupon.value ? selectedCoupon.value.coupon.discountAmount : 0;
});

// --- Methods ---
const formatPhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

const loadData = async () => {
    loading.value = true;
    try {
        // 1. Load Product & Seller Info
        const productId = route.query.productId;
        if (productId) {
            try {
                const res = await getProduct(productId);
                product.value = {
                    id: res.id,
                    title: res.title,
                    price: res.price,
                    image: res.images?.[0]?.url || route.query.image || '',
                    tags: [res.condition, res.category?.name].filter(Boolean)
                };
                if (res.seller) {
                    seller.value = {
                        name: res.seller.username || res.seller.nickname || '卖家',
                        avatar: res.seller.avatarUrl || 'https://via.placeholder.com/100'
                    };
                }
            } catch (e) {
                // Fallback to query params if API fails
                product.value = {
                    id: route.query.productId,
                    title: route.query.title,
                    price: route.query.price,
                    image: route.query.image,
                    tags: []
                };
            }
        }

        // 2. Load Addresses
        const addresses = await getAddresses();
        addressList.value = addresses;
        const defaultAddress = addresses.find(a => a.isDefault);
        address.value = defaultAddress || (addresses.length > 0 ? addresses[0] : null);

        // 3. Load Coupons
        const myCoupons = await getMyCoupons();
        coupons.value = myCoupons || [];

        // Auto-select best coupon
        const price = Number(product.value.price) || 0;
        const valid = coupons.value.filter(c => !c.isUsed && c.coupon.minSpend <= price);
        if (valid.length > 0) {
            // Sort by discount amount desc
            valid.sort((a, b) => b.coupon.discountAmount - a.coupon.discountAmount);
            selectedCoupon.value = valid[0];
        }

    } catch (error) {
        showFailToast('加载信息失败');
        console.error(error);
    } finally {
        loading.value = false;
    }
};

const handleAddressClick = () => {
    // Simple navigation to address list for now. 
    // In a real app, we might want a picker or pass a "select mode" flag.
    // For simplicity, we just go to address management. 
    // Ideally, Address page should support "selection" mode.
    router.push('/address');
};

const handleSubmit = async () => {
    if (!address.value) {
        showToast('请选择收货地址');
        return;
    }
    isSubmitting.value = true;
    try {
        const orderRequest = {
            productId: product.value.id,
            addressId: address.value.id,
            userCouponId: selectedCoupon.value ? selectedCoupon.value.id : null,
            remark: remark.value // Backend might need to support this field
        };
        const createdOrder = await createOrder(orderRequest);
        showSuccessToast('订单已提交');
        router.replace({ name: 'Payment', params: { id: createdOrder.id } });
    } catch (error) {
        showToast('下单失败');
    } finally {
        isSubmitting.value = false;
    }
};

onMounted(() => {
    loadData();
});
</script>

<template>
    <div class="min-h-screen bg-[#f7f9fa] font-sans text-[#2c3e50] pb-24">

        <!-- --- Top Navigation --- -->
        <nav class="bg-white sticky top-0 z-50 border-b border-gray-100">
            <div class="max-w-4xl mx-auto px-4 h-[72px] flex items-center justify-between gap-4">
                <div class="flex items-center gap-10">
                    <div class="flex items-center gap-1.5 cursor-pointer" @click="router.push('/')">
                        <div
                            class="w-9 h-9 bg-[#4a8b6e] rounded-lg flex items-center justify-center text-white font-bold text-xl italic shadow-sm">
                            T</div>
                        <span class="text-2xl font-bold text-[#2c3e50] tracking-tight">TrueUsed<span
                                class="text-[#4a8b6e]">.</span></span>
                    </div>
                    <div class="hidden md:block text-lg font-bold text-gray-700 pl-4 border-l border-gray-200">
                        确认订单
                    </div>
                </div>

                <div class="flex items-center gap-2 text-sm text-gray-500">
                    <div class="flex items-center gap-1">
                        <ShieldCheck :size="16" class="text-[#4a8b6e]" />
                        <span>担保交易</span>
                    </div>
                    <div class="w-px h-3 bg-gray-300 mx-1"></div>
                    <div class="flex items-center gap-1">
                        <FileCheck :size="16" class="text-[#4a8b6e]" />
                        <span>官方验货</span>
                    </div>
                </div>
            </div>
        </nav>

        <main class="max-w-4xl mx-auto px-4 py-8 space-y-6">

            <!-- 1. Address Card -->
            <section
                class="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden cursor-pointer group hover:border-[#4a8b6e]/30 transition-all relative"
                @click="handleAddressClick">
                <div class="address-stripe"></div>
                <div class="p-6 flex items-center justify-between">
                    <div class="flex items-start gap-4">
                        <div
                            class="w-10 h-10 rounded-full bg-[#4a8b6e]/10 flex items-center justify-center text-[#4a8b6e] flex-shrink-0">
                            <MapPin :size="20" />
                        </div>

                        <div v-if="address">
                            <div class="flex items-center gap-3 mb-1">
                                <span class="text-lg font-bold text-[#2c3e50]">{{ address.recipientName }}</span>
                                <span class="text-base text-gray-500 font-medium">{{ formatPhone(address.phone)
                                    }}</span>
                                <span v-if="address.isDefault"
                                    class="text-[10px] text-[#4a8b6e] bg-[#4a8b6e]/10 px-1.5 py-0.5 rounded border border-[#4a8b6e]/20">默认</span>
                            </div>
                            <div class="text-sm text-gray-600 leading-relaxed">
                                {{ address.province }} {{ address.city }} {{ address.district }} {{
                                    address.detailedAddress }}
                            </div>
                        </div>
                        <div v-else class="py-2">
                            <span class="text-gray-400 font-medium">您还没有收货地址，点击添加</span>
                        </div>
                    </div>

                    <ChevronRight :size="20" class="text-gray-300 group-hover:text-[#4a8b6e] transition-colors" />
                </div>
            </section>

            <!-- 2. Order Items -->
            <section class="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
                <!-- Seller Header -->
                <div class="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                    <img :src="seller.avatar" class="w-6 h-6 rounded-full border border-gray-100 object-cover">
                    <span class="font-bold text-sm text-[#2c3e50]">{{ seller.name }}</span>
                    <ChevronRight :size="14" class="text-gray-300" />
                </div>

                <!-- Product -->
                <div class="p-6 flex gap-4 border-b border-gray-50">
                    <div class="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden border border-gray-100">
                        <img :src="product.image" class="w-full h-full object-cover" />
                    </div>
                    <div class="flex-1 flex flex-col justify-between">
                        <div>
                            <div class="flex justify-between items-start gap-4">
                                <h3 class="font-bold text-[#2c3e50] line-clamp-2">{{ product.title }}</h3>
                                <span class="font-bold text-[#2c3e50]">¥{{ product.price }}</span>
                            </div>
                            <div class="flex flex-wrap gap-2 mt-2">
                                <span v-for="tag in product.tags" :key="tag"
                                    class="text-[10px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                    {{ tag }}
                                </span>
                            </div>
                        </div>
                        <div
                            class="flex items-center gap-1 text-xs text-[#4a8b6e] bg-[#4a8b6e]/5 w-fit px-2 py-1 rounded">
                            <ShieldCheck :size="12" />
                            <span>官方验货 · 正品保证</span>
                        </div>
                    </div>
                </div>

                <!-- Order Options -->
                <div class="px-6 py-4 space-y-6">

                    <!-- Delivery Method -->
                    <div class="flex items-center justify-between">
                        <label class="font-medium text-gray-700">配送方式</label>
                        <div class="flex bg-gray-50 p-1 rounded-lg">
                            <button @click="deliveryType = 'express'"
                                :class="['px-4 py-1.5 rounded-md text-xs font-bold transition-all', deliveryType === 'express' ? 'bg-white text-[#4a8b6e] shadow-sm' : 'text-gray-500 hover:text-gray-700']">
                                快递配送
                            </button>
                            <button @click="deliveryType = 'meetup'"
                                :class="['px-4 py-1.5 rounded-md text-xs font-bold transition-all', deliveryType === 'meetup' ? 'bg-white text-[#4a8b6e] shadow-sm' : 'text-gray-500 hover:text-gray-700']">
                                线下自提
                            </button>
                        </div>
                    </div>

                    <!-- Freight Insurance -->
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="font-medium text-gray-700">运费险</span>
                            <span class="text-[10px] text-[#4a8b6e] border border-[#4a8b6e]/30 px-1 rounded">卖家赠送</span>
                        </div>
                        <span class="text-sm font-bold text-[#2c3e50]">¥0.00</span>
                    </div>

                    <!-- Coupon -->
                    <div class="flex items-center justify-between cursor-pointer group" @click="showCouponPopup = true">
                        <span class="font-medium text-gray-700">优惠券</span>
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-[#ff5e57] bg-[#ff5e57]/10 px-2 py-0.5 rounded font-bold"
                                v-if="selectedCoupon">- ¥{{ selectedCoupon.coupon.discountAmount }}</span>
                            <span class="text-sm text-gray-400 group-hover:text-gray-600 transition-colors" v-else>{{
                                validCoupons.length > 0 ? '有可用优惠券' : '无可用' }}</span>
                            <ChevronRight :size="16" class="text-gray-300" />
                        </div>
                    </div>

                    <!-- Remark -->
                    <div class="flex items-center gap-4">
                        <label class="font-medium text-gray-700 flex-shrink-0">买家留言</label>
                        <input type="text" v-model="remark" placeholder="建议留言前先与卖家沟通确认"
                            class="flex-1 bg-gray-50 border-none rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#4a8b6e] outline-none transition-all placeholder:text-gray-300 text-right" />
                    </div>

                </div>

                <!-- Subtotal -->
                <div class="px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex justify-end gap-1 text-sm">
                    <span class="text-gray-500">共 1 件，</span>
                    <span class="text-gray-900">小计：</span>
                    <span class="font-bold text-[#ff5e57] text-lg leading-none">¥{{ finalPrice }}</span>
                </div>
            </section>

            <!-- 3. Payment Method (Simplified) -->
            <section class="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 space-y-4">
                <h2 class="font-bold text-gray-800 text-sm mb-2">支付方式</h2>

                <div class="flex items-center justify-between cursor-pointer">
                    <div class="flex items-center gap-3">
                        <div class="w-6 h-6 rounded bg-[#1677ff] flex items-center justify-center text-white">
                            <span class="font-bold text-xs">支</span>
                        </div>
                        <span class="text-sm text-gray-700">支付宝</span>
                    </div>
                    <div class="w-5 h-5 rounded-full border-[5px] border-[#4a8b6e] bg-white"></div>
                </div>
            </section>

        </main>

        <!-- --- Bottom Bar --- -->
        <div class="fixed bottom-0 w-full bg-white border-t border-gray-100 p-4 z-50">
            <div class="max-w-4xl mx-auto flex items-center justify-end gap-4">
                <div class="flex flex-col items-end">
                    <div class="flex items-baseline gap-1">
                        <span class="text-sm text-gray-500">合计:</span>
                        <span class="text-2xl font-bold text-[#ff5e57] font-mono">¥{{ finalPrice }}</span>
                    </div>
                    <span class="text-[10px] text-[#4a8b6e] bg-[#4a8b6e]/5 px-1.5 rounded" v-if="savedAmount > 0">已优惠
                        ¥{{ savedAmount }}</span>
                </div>

                <button @click="handleSubmit" :disabled="isSubmitting"
                    class="bg-gradient-to-r from-[#4a8b6e] to-[#3b755b] text-white px-8 py-3 rounded-full font-bold text-base shadow-lg shadow-[#4a8b6e]/20 hover:shadow-xl hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                    {{ isSubmitting ? '提交中...' : '提交订单' }}
                </button>
            </div>
        </div>

        <!-- Coupon Popup -->
        <div v-if="showCouponPopup" class="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
            <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showCouponPopup = false"></div>
            <div
                class="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 relative z-10 max-h-[80vh] flex flex-col">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-bold text-lg">选择优惠券</h3>
                    <button @click="showCouponPopup = false" class="text-gray-400 hover:text-gray-600">关闭</button>
                </div>

                <div class="flex-1 overflow-y-auto space-y-3 min-h-[200px]">
                    <div v-if="validCoupons.length === 0" class="text-center py-10 text-gray-400">
                        暂无可用优惠券
                    </div>
                    <div v-for="c in validCoupons" :key="c.id" @click="selectedCoupon = c; showCouponPopup = false"
                        class="border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all"
                        :class="selectedCoupon?.id === c.id ? 'border-[#4a8b6e] bg-[#4a8b6e]/5' : 'border-gray-100 hover:border-gray-200'">
                        <div>
                            <div class="font-bold text-[#ff5e57] text-lg">¥{{ c.coupon.discountAmount }}</div>
                            <div class="text-sm text-gray-700">{{ c.coupon.title }}</div>
                            <div class="text-xs text-gray-400">满 {{ c.coupon.minSpend }} 可用</div>
                        </div>
                        <div v-if="selectedCoupon?.id === c.id" class="text-[#4a8b6e]">
                            <Check :size="20" />
                        </div>
                    </div>

                    <!-- Don't use coupon option -->
                    <div v-if="validCoupons.length > 0" @click="selectedCoupon = null; showCouponPopup = false"
                        class="border border-gray-100 rounded-xl p-4 text-center text-gray-500 cursor-pointer hover:bg-gray-50">
                        不使用优惠券
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<style scoped>
/* 地址彩条装饰 */
.address-stripe {
    height: 4px;
    background-image: repeating-linear-gradient(-45deg,
            #ff6c6c,
            #ff6c6c 12px,
            transparent 12px,
            transparent 24px,
            #4a8b6e 24px,
            #4a8b6e 36px,
            transparent 36px,
            transparent 48px);
}
</style>
