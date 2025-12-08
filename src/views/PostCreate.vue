<script setup>
import { listCategories } from '@/api/categories';
import { getCloudinarySignature } from '@/api/cloudinary';
import { createProduct } from '@/api/products';
import axios from 'axios';
import {
    Camera,
    ChevronRight,
    Info,
    MapPin,
    Sparkles,
    Truck,
    Users,
    X
} from 'lucide-vue-next';
import { closeToast, showConfirmDialog, showFailToast, showLoadingToast, showSuccessToast, showToast } from 'vant';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// --- 状态管理 ---
const images = ref([]);
const title = ref('');
const description = ref('');
const price = ref('');
const originalPrice = ref('');
const condition = ref('99新');
const deliveryMethods = ref(['express']); // express, meetup
const categoryId = ref(null);
const categoryName = ref('');
const location = ref('上海市');

// --- 图片上传 ---
const fileInput = ref(null);
const isUploading = ref(false);

const handleAddImage = () => {
    if (images.value.length < 9) {
        fileInput.value.click();
    }
};

const removeImage = (index) => {
    images.value.splice(index, 1);
};

const handleFileChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const remainingSlots = 9 - images.value.length;
    const filesToUpload = files.slice(0, remainingSlots);

    if (!filesToUpload.length) return;

    isUploading.value = true;
    showLoadingToast({ message: '上传中...', forbidClick: true });

    try {
        const rawSignature = await getCloudinarySignature();
        const signatureData = rawSignature && rawSignature.data ? rawSignature.data : rawSignature;
        const apiKey = signatureData?.api_key || signatureData?.apiKey;
        const timestamp = signatureData?.timestamp;
        const signature = signatureData?.signature;
        const uploadPreset = signatureData?.upload_preset || signatureData?.uploadPreset;

        if (!apiKey || !timestamp || !signature) {
            throw new Error('签名数据缺失');
        }

        const uploadPromises = filesToUpload.map((file) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', apiKey);
            formData.append('timestamp', timestamp);
            formData.append('signature', signature);
            if (uploadPreset) {
                formData.append('upload_preset', uploadPreset);
            }
            return axios.post(
                `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
                formData
            );
        });

        const results = await Promise.all(uploadPromises);
        const uploadedUrls = results.map(res => res.data.secure_url);
        images.value.push(...uploadedUrls);
        closeToast();
    } catch (err) {
        console.error('Upload failed:', err);
        closeToast();
        showFailToast('图片上传失败');
    } finally {
        isUploading.value = false;
        if (fileInput.value) fileInput.value.value = '';
    }
};

// --- 分类选择 ---
const showCategoryPicker = ref(false);
const categoryOptions = ref([]);

const buildTree = (flat) => {
    const nodes = new Map();
    flat.forEach((c) => {
        const id = String(c.id);
        const parentId = c.parentId ? String(c.parentId) : null;
        nodes.set(id, { text: c.name, value: c.id, parentId, children: [] });
    });

    const roots = [];
    nodes.forEach((node) => {
        if (node.parentId && nodes.has(node.parentId)) {
            nodes.get(node.parentId).children.push(node);
        } else {
            roots.push(node);
        }
    });
    return roots;
};

const loadCategories = async () => {
    try {
        const res = await listCategories();
        categoryOptions.value = buildTree(res);
    } catch (e) {
        console.error(e);
    }
};

const onCategoryFinish = ({ selectedOptions }) => {
    const lastOption = selectedOptions[selectedOptions.length - 1];
    categoryId.value = lastOption.value;
    categoryName.value = selectedOptions.map(o => o.text).join(' / ');
    showCategoryPicker.value = false;
};

// --- 地区选择 ---
const showLocationPicker = ref(false);
const locationColumns = [
    { text: '北京市', value: 'beijing' },
    { text: '上海市', value: 'shanghai' },
    { text: '广州市', value: 'guangzhou' },
    { text: '深圳市', value: 'shenzhen' },
    { text: '杭州市', value: 'hangzhou' },
    { text: '其他', value: 'other' }
];

const onLocationConfirm = ({ selectedOptions }) => {
    location.value = selectedOptions[0].text;
    showLocationPicker.value = false;
};

// --- 提交逻辑 ---
const isSubmitting = ref(false);

const mapCondition = (text) => {
    const map = {
        '全新': 'NEW',
        '99新': 'LIKE_NEW',
        '95新': 'LIKE_NEW',
        '9成新': 'GOOD',
        '8成新': 'FAIR',
        '战损版': 'POOR',
    };
    return map[text] || 'GOOD';
};

const onSubmit = async () => {
    if (isSubmitting.value) return;

    if (images.value.length === 0) {
        showToast('请至少上传一张图片');
        return;
    }
    if (!title.value) {
        showToast('请输入标题');
        return;
    }
    if (!description.value) {
        showToast('请输入描述');
        return;
    }
    if (!price.value) {
        showToast('请输入价格');
        return;
    }
    if (!categoryId.value) {
        showToast('请选择分类');
        return;
    }

    isSubmitting.value = true;
    showLoadingToast({ message: '发布中...', duration: 0, forbidClick: true });

    try {
        const payload = {
            title: title.value,
            description: description.value,
            price: Number(price.value),
            originalPrice: originalPrice.value ? Number(originalPrice.value) : undefined,
            currency: 'CNY',
            condition: mapCondition(condition.value),
            categoryId: categoryId.value,
            locationText: location.value,
            imageUrls: images.value,
            tradeTypes: deliveryMethods.value
        };

        await createProduct(payload);
        closeToast();
        showSuccessToast('发布成功');
        router.replace('/post');
    } catch (e) {
        closeToast();
        showFailToast('发布失败');
        console.error(e);
    } finally {
        isSubmitting.value = false;
    }
};

const onCancel = () => {
    showConfirmDialog({
        title: '确认取消',
        message: '取消后已填写的内容将不会保存',
    }).then(() => {
        router.back();
    }).catch(() => { });
};

const onSaveDraft = () => {
    showToast('草稿功能开发中');
};

// --- 辅助方法 ---
const toggleDeliveryMethod = (method) => {
    if (deliveryMethods.value.includes(method)) {
        deliveryMethods.value = deliveryMethods.value.filter(m => m !== method);
    } else {
        deliveryMethods.value.push(method);
    }
};

const conditions = ['全新', '99新', '95新', '9成新', '8成新', '战损版'];

onMounted(() => {
    loadCategories();
});
</script>

<template>
    <div class="min-h-screen bg-[#f7f9fa] font-sans text-[#2c3e50] pb-24">

        <!-- --- Top Navigation --- -->
        <nav class="bg-white sticky top-0 z-50 border-b border-gray-100">
            <div class="max-w-4xl mx-auto px-4 h-[56px] flex items-center justify-between gap-4">
                <div class="flex items-center gap-10">
                    <div class="flex items-center gap-1.5 cursor-pointer" @click="router.push('/')">
                        <div
                            class="w-8 h-8 bg-[#4a8b6e] rounded-lg flex items-center justify-center text-white font-bold text-lg italic shadow-sm">
                            T</div>
                        <span class="text-xl font-bold text-[#2c3e50] tracking-tight">TrueUsed<span
                                class="text-[#4a8b6e]">.</span></span>
                    </div>
                </div>
                <div class="flex items-center gap-5">
                    <button @click="onCancel" class="text-gray-500 hover:text-[#4a8b6e] font-medium text-sm">取消</button>
                    <button @click="onSaveDraft" class="text-[#4a8b6e] font-bold text-sm">存草稿</button>
                </div>
            </div>
        </nav>

        <!-- --- Main Content --- -->
        <main class="max-w-4xl mx-auto px-4 py-6 space-y-6">

            <h1 class="text-2xl font-bold text-[#2c3e50] px-1">发布闲置</h1>

            <!-- 1. Image Upload Section -->
            <section class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="font-bold text-lg flex items-center gap-2">
                        商品图片
                        <span class="text-xs font-normal text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">最多9张</span>
                    </h2>
                    <button
                        class="text-xs text-[#4a8b6e] flex items-center gap-1 hover:bg-[#4a8b6e]/10 px-2 py-1 rounded transition-colors">
                        <Sparkles :size="12" /> AI 智能修图
                    </button>
                </div>

                <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    <div v-for="(img, idx) in images" :key="idx"
                        class="aspect-square rounded-xl overflow-hidden relative group border border-gray-100">
                        <img :src="img" alt="upload" class="w-full h-full object-cover" />
                        <button @click="removeImage(idx)"
                            class="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X :size="12" />
                        </button>
                        <div v-if="idx === 0"
                            class="absolute bottom-0 left-0 right-0 bg-[#4a8b6e]/90 text-white text-[10px] text-center py-0.5">
                            封面图</div>
                    </div>

                    <button v-if="images.length < 9" @click="handleAddImage"
                        class="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#4a8b6e] hover:text-[#4a8b6e] hover:bg-[#4a8b6e]/5 transition-all group">
                        <div class="bg-gray-100 p-3 rounded-full group-hover:bg-[#4a8b6e]/20 transition-colors">
                            <Camera :size="24" />
                        </div>
                        <span class="text-xs font-medium">添加图片</span>
                    </button>
                </div>
                <p class="text-xs text-gray-400 mt-4 flex items-center gap-1">
                    <Info :size="12" /> 首张图将作为封面，清晰的图片能让浏览量提升 40%
                </p>
            </section>

            <!-- 2. Basic Info Section -->
            <section class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50 space-y-6">

                <!-- Title -->
                <div class="space-y-2">
                    <div class="flex justify-between">
                        <label class="font-bold text-gray-700">标题</label>
                        <span class="text-xs text-gray-400">{{ title.length }}/30</span>
                    </div>
                    <input type="text" v-model="title" maxlength="30" placeholder="品牌型号，宝贝特点（例如：99新 iPhone 13 128G 国行）"
                        class="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#4a8b6e]/20 focus:bg-white transition-all font-medium outline-none" />
                </div>

                <!-- Description -->
                <div class="space-y-2">
                    <div class="flex justify-between">
                        <label class="font-bold text-gray-700">描述</label>
                        <button class="text-xs text-[#4a8b6e] flex items-center gap-1">
                            <Sparkles :size="12" /> 帮我润色
                        </button>
                    </div>
                    <textarea v-model="description" placeholder="描述一下宝贝的转手原因、入手渠道和使用感受吧~ (支持 #话题)"
                        class="w-full h-32 bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#4a8b6e]/20 focus:bg-white transition-all resize-none outline-none"></textarea>
                </div>
            </section>

            <!-- 3. Price & Attributes -->
            <section class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50 space-y-6">
                <h2 class="font-bold text-lg">价格与属性</h2>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Price Input -->
                    <div class="relative">
                        <label class="text-xs text-gray-500 mb-1 block">出售价格</label>
                        <div class="relative">
                            <span
                                class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">¥</span>
                            <input type="number" v-model="price" placeholder="0.00"
                                class="w-full pl-8 pr-4 py-3 bg-gray-50 rounded-xl border-none font-bold text-xl text-[#ff5e57] focus:ring-2 focus:ring-[#4a8b6e]/20 focus:bg-white outline-none" />
                        </div>
                    </div>

                    <!-- Original Price -->
                    <div class="relative">
                        <label class="text-xs text-gray-500 mb-1 block">入手原价 (选填)</label>
                        <div class="relative">
                            <span
                                class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">¥</span>
                            <input type="number" v-model="originalPrice" placeholder="0.00"
                                class="w-full pl-8 pr-4 py-3 bg-gray-50 rounded-xl border-none font-bold text-gray-600 focus:ring-2 focus:ring-[#4a8b6e]/20 focus:bg-white outline-none" />
                        </div>
                    </div>
                </div>

                <div class="border-t border-gray-50 pt-4 space-y-4">
                    <!-- Category -->
                    <div @click="showCategoryPicker = true"
                        class="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                        <span class="font-medium text-gray-700">分类</span>
                        <div class="flex items-center gap-2 text-gray-400 text-sm">
                            <span :class="{ 'text-gray-800': categoryName }">{{ categoryName || '请选择分类' }}</span>
                            <ChevronRight :size="16" />
                        </div>
                    </div>

                    <!-- Condition - Chips Style -->
                    <div>
                        <label class="text-sm font-medium text-gray-700 mb-2 block">成色</label>
                        <div class="flex flex-wrap gap-2">
                            <button v-for="c in conditions" :key="c" @click="condition = c" :class="[
                                'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
                                condition === c
                                    ? 'bg-[#4a8b6e] text-white shadow-md shadow-[#4a8b6e]/20'
                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                            ]">
                                {{ c }}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 4. Transaction Info -->
            <section class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50 space-y-4">
                <h2 class="font-bold text-lg">交易信息</h2>

                <!-- Delivery Methods - Big Cards -->
                <div class="grid grid-cols-2 gap-4">
                    <button @click="toggleDeliveryMethod('meetup')" :class="[
                        'p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all',
                        deliveryMethods.includes('meetup')
                            ? 'border-[#4a8b6e] bg-[#4a8b6e]/5 text-[#4a8b6e]'
                            : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                    ]">
                        <Users :size="24" />
                        <span class="font-bold text-sm">支持面交</span>
                    </button>

                    <button @click="toggleDeliveryMethod('express')" :class="[
                        'p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all',
                        deliveryMethods.includes('express')
                            ? 'border-[#4a8b6e] bg-[#4a8b6e]/5 text-[#4a8b6e]'
                            : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                    ]">
                        <Truck :size="24" />
                        <span class="font-bold text-sm">邮寄/快递</span>
                    </button>
                </div>

                <!-- Location -->
                <div class="flex items-center gap-3 text-sm text-gray-500 mt-2 bg-gray-50 p-3 rounded-xl w-fit">
                    <MapPin :size="16" class="text-[#4a8b6e]" />
                    <span>发货地：</span>
                    <span class="font-bold text-gray-800">{{ location }}</span>
                    <span class="text-xs text-[#4a8b6e] cursor-pointer" @click="showLocationPicker = true">修改</span>
                </div>
            </section>

        </main>

        <!-- --- Sticky Bottom Bar --- -->
        <div
            class="fixed bottom-0 w-full bg-white border-t border-gray-100 p-4 pb-8 z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
            <div class="max-w-4xl mx-auto flex items-center justify-between gap-4">
                <div class="flex flex-col">
                    <span class="text-xs text-gray-400">预估收入</span>
                    <span class="text-xl font-bold text-[#ff5e57]">¥{{ price || '0.00' }}</span>
                </div>
                <button @click="onSubmit" :disabled="isSubmitting"
                    class="bg-[#4a8b6e] hover:bg-[#3b755b] text-white px-12 py-3 rounded-full font-bold text-lg shadow-lg shadow-[#4a8b6e]/20 transition-all transform active:scale-95 flex-1 md:flex-none disabled:opacity-50 disabled:cursor-not-allowed">
                    {{ isSubmitting ? '发布中...' : '立即发布' }}
                </button>
            </div>
        </div>

        <!-- Hidden File Input -->
        <input type="file" ref="fileInput" @change="handleFileChange" multiple accept="image/*" class="hidden" />

        <!-- Popups -->
        <van-popup v-model:show="showCategoryPicker" round position="bottom">
            <van-cascader v-model="categoryId" title="选择分类" :options="categoryOptions"
                :field-names="{ text: 'text', value: 'value', children: 'children' }"
                @close="showCategoryPicker = false" @finish="onCategoryFinish" />
        </van-popup>

        <van-popup v-model:show="showLocationPicker" position="bottom">
            <van-picker :columns="locationColumns" @confirm="onLocationConfirm" @cancel="showLocationPicker = false" />
        </van-popup>

    </div>
</template>

<style scoped>
.hidden {
    display: none;
}
</style>
