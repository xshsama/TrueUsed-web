<template>
    <div class="min-h-screen pb-28 bg-[#f7f9fa] font-sans text-[#2c3e50]">
        <TopNavbar mode="seller" />

        <main class="max-w-3xl mx-auto px-4 py-8 space-y-6">
            <!-- Banner -->
            <section
                class="bg-gradient-to-r from-[#2c3e50] to-[#34495e] rounded-2xl p-6 text-white shadow-lg flex justify-between items-center relative overflow-hidden">
                <div class="relative z-10">
                    <h2 class="font-bold text-lg mb-1">寄售全流程</h2>
                    <p class="text-xs text-gray-300">发货入仓 -> 官方验货 -> 自动上架 -> 极速售出</p>
                </div>
                <div class="flex items-center gap-2 text-xs relative z-10">
                    <div class="flex flex-col items-center gap-1 opacity-100">
                        <div class="w-6 h-6 rounded-full bg-[#4a8b6e] flex items-center justify-center font-bold">1
                        </div>
                        <span>填写</span>
                    </div>
                    <div class="w-8 h-px bg-gray-500"></div>
                    <div class="flex flex-col items-center gap-1 opacity-50">
                        <div class="w-6 h-6 rounded-full border border-gray-400 flex items-center justify-center">2
                        </div>
                        <span>寄送</span>
                    </div>
                    <div class="w-8 h-px bg-gray-500"></div>
                    <div class="flex flex-col items-center gap-1 opacity-50">
                        <div class="w-6 h-6 rounded-full border border-gray-400 flex items-center justify-center">3
                        </div>
                        <span>收款</span>
                    </div>
                </div>
                <PackageCheck class="absolute -right-4 -bottom-4 text-white/5 w-32 h-32" />
            </section>

            <!-- Product Info -->
            <section class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100/50 space-y-6">
                <div class="flex justify-between items-center mb-2">
                    <h2 class="font-bold text-lg text-[#2c3e50]">商品信息</h2>
                </div>

                <div class="grid grid-cols-4 sm:grid-cols-5 gap-4">
                    <div v-for="(img, idx) in form.images" :key="idx"
                        class="aspect-square rounded-xl overflow-hidden relative group border border-gray-200">
                        <img :src="img" class="w-full h-full object-cover" />
                        <button @click="removeImage(idx)"
                            class="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all">
                            <X :size="12" />
                        </button>
                    </div>
                    <div v-if="form.images.length < 9" @click="handleAddImage"
                        class="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-[#4a8b6e] hover:bg-[#4a8b6e]/5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-gray-400 hover:text-[#4a8b6e]">
                        <Camera :size="20" />
                        <span class="text-xs font-medium">添加</span>
                    </div>
                </div>

                <div class="space-y-4">
                    <input type="text" v-model="form.title" placeholder="品牌型号，宝贝特点"
                        class="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#4a8b6e]/20 outline-none font-bold" />

                    <!-- Category Selector (Added) -->
                    <div @click="showCategoryPicker = true"
                        class="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                        <span class="font-medium text-gray-500 text-sm">{{ form.categoryName || '选择分类' }}</span>
                        <ChevronRight :size="16" class="text-gray-400" />
                    </div>

                    <textarea v-model="form.description" placeholder="描述一下宝贝的使用情况、瑕疵点..."
                        class="w-full h-24 bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#4a8b6e]/20 outline-none resize-none text-sm"></textarea>
                </div>
            </section>

            <!-- Price -->
            <section class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100/50 space-y-6">
                <h2 class="font-bold text-lg text-[#2c3e50]">价格设置</h2>
                <div class="space-y-2">
                    <label class="text-sm font-bold text-gray-600">期望售价</label>
                    <div class="relative">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">¥</span>
                        <input type="number" v-model.number="form.price" placeholder="0.00"
                            class="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-none font-bold text-2xl text-[#2c3e50] focus:ring-2 focus:ring-[#4a8b6e]/20 outline-none" />
                    </div>
                </div>
                <div class="bg-gray-50 rounded-xl p-4 text-sm space-y-2 border border-gray-100">
                    <div class="flex justify-between text-gray-500">
                        <span>技术服务费 (3%)</span>
                        <span>- ¥{{ (form.price * 0.03).toFixed(2) }}</span>
                    </div>
                    <div class="flex justify-between text-gray-500">
                        <span>验货费 (活动减免)</span>
                        <span class="text-[#4a8b6e] line-through decoration-gray-400">¥ 29.00</span>
                    </div>
                    <div class="border-t border-gray-200 pt-2 flex justify-between items-center">
                        <span class="font-bold text-gray-700">预计到手</span>
                        <span class="font-bold text-xl text-[#ff5e57]">¥{{ (form.price * 0.97).toFixed(2) }}</span>
                    </div>
                </div>
            </section>

            <!-- Shipping -->
            <section class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100/50 space-y-4">
                <h2 class="font-bold text-lg text-[#2c3e50] flex items-center gap-2">
                    寄送方式
                    <span class="text-xs font-normal bg-[#4a8b6e]/10 text-[#4a8b6e] px-2 py-0.5 rounded">发往 TrueUsed
                        上海仓</span>
                </h2>

                <div class="grid grid-cols-2 gap-4">
                    <div @click="shippingMethod = 'pickup'"
                        :class="['p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col gap-2', shippingMethod === 'pickup' ? 'option-selected' : 'border-gray-100 text-gray-500 hover:border-gray-200']">
                        <div class="flex items-center gap-2">
                            <Truck :size="20" />
                            <span class="font-bold text-sm">预约顺丰上门</span>
                        </div>
                        <p class="text-xs opacity-70">运费到付，验货通过后由买家承担</p>
                    </div>

                    <div @click="shippingMethod = 'self'"
                        :class="['p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col gap-2', shippingMethod === 'self' ? 'option-selected' : 'border-gray-100 text-gray-500 hover:border-gray-200']">
                        <div class="flex items-center gap-2">
                            <Package :size="20" />
                            <span class="font-bold text-sm">自行寄送</span>
                        </div>
                        <p class="text-xs opacity-70">提交后获得仓库地址及入仓码</p>
                    </div>
                </div>

                <div v-if="shippingMethod === 'pickup'"
                    class="mt-4 bg-[#4a8b6e]/5 p-4 rounded-xl flex items-center justify-between border border-[#4a8b6e]/10">
                    <div class="flex items-center gap-3">
                        <div class="bg-white p-2 rounded-full text-[#4a8b6e] shadow-sm">
                            <MapPin :size="16" />
                        </div>
                        <div>
                            <div class="text-xs text-gray-500 mb-0.5">取件地址</div>
                            <div class="text-sm font-bold text-[#2c3e50]">上海市 徐汇区 漕河泾...</div>
                        </div>
                    </div>
                    <button
                        class="text-xs font-bold text-[#4a8b6e] px-3 py-1.5 bg-white rounded-lg shadow-sm border border-[#4a8b6e]/20">修改</button>
                </div>
            </section>

        </main>

        <div
            class="fixed bottom-0 w-full bg-white border-t border-gray-100 p-4 pb-8 z-40 shadow-[-10px_0_30px_rgba(0,0,0,0.05)]">
            <div class="max-w-3xl mx-auto flex items-center justify-between gap-4">
                <div class="flex flex-col">
                    <div class="flex items-center gap-2 text-xs text-gray-400 mb-0.5">
                        <CheckCircle2 class="text-[#4a8b6e]" :size="12" />
                        <span>同意《寄售服务协议》</span>
                    </div>
                </div>
                <button @click="submitConsignment" :disabled="isSubmitting"
                    class="bg-[#4a8b6e] hover:bg-[#3b755b] text-white px-8 py-3 rounded-full font-bold text-base shadow-lg shadow-[#4a8b6e]/20 transition-all transform active:scale-95 flex-1 md:flex-none md:w-64 disabled:opacity-50 disabled:cursor-not-allowed">
                    {{ isSubmitting ? '提交中...' : '提交并获取入仓号' }}
                </button>
            </div>
        </div>

        <!-- Hidden File Input -->
        <input type="file" ref="fileInput" @change="handleFileChange" multiple accept="image/*" class="hidden" />

        <!-- Popups -->
        <van-popup v-model:show="showCategoryPicker" round position="bottom">
            <van-cascader v-model="form.categoryId" title="选择分类" :options="categoryOptions"
                :field-names="{ text: 'text', value: 'value', children: 'children' }"
                @close="showCategoryPicker = false" @finish="onCategoryFinish" />
        </van-popup>
    </div>
</template>

<script setup>
import { listCategories } from '@/api/categories';
import { getCloudinarySignature } from '@/api/cloudinary';
import { createProduct } from '@/api/products';
import TopNavbar from '@/components/TopNavbar.vue';
import axios from 'axios';
import { Camera, CheckCircle2, ChevronRight, MapPin, Package, PackageCheck, Truck, X } from 'lucide-vue-next';
import { closeToast, showFailToast, showLoadingToast, showSuccessToast, showToast } from 'vant';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const form = ref({
    title: '',
    description: '',
    price: '',
    images: [],
    categoryId: null,
    categoryName: '',
    condition: '99新'
})

const shippingMethod = ref('pickup')
const fileInput = ref(null)
const isUploading = ref(false)
const isSubmitting = ref(false)

// --- Image Upload ---
const handleAddImage = () => {
    if (form.value.images.length < 9) {
        fileInput.value.click();
    }
};

const removeImage = (index) => {
    form.value.images.splice(index, 1);
};

const handleFileChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const remainingSlots = 9 - form.value.images.length;
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
        form.value.images.push(...uploadedUrls);
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

// --- Category Selection ---
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
    form.value.categoryId = lastOption.value;
    form.value.categoryName = selectedOptions.map(o => o.text).join(' / ');
    showCategoryPicker.value = false;
};

// --- Submit ---
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

const submitConsignment = async () => {
    if (isSubmitting.value) return;

    if (form.value.images.length === 0) {
        showToast('请至少上传一张图片');
        return;
    }
    if (!form.value.title) {
        showToast('请输入标题');
        return;
    }
    if (!form.value.price) {
        showToast('请输入价格');
        return;
    }
    // Category is technically required by backend usually, but UI didn't have it. 
    // I'll add a hidden default or check if user selected it.
    if (!form.value.categoryId) {
        showToast('请选择分类');
        return;
    }

    isSubmitting.value = true;
    showLoadingToast({ message: '提交中...', duration: 0, forbidClick: true });

    try {
        const payload = {
            title: form.value.title,
            description: form.value.description + `\n\n[寄售模式: ${shippingMethod.value === 'pickup' ? '预约上门' : '自行寄送'}]`,
            price: Number(form.value.price),
            currency: 'CNY',
            condition: mapCondition(form.value.condition),
            categoryId: form.value.categoryId,
            locationText: '上海仓', // Default for consignment
            imageUrls: form.value.images,
            tradeTypes: ['express'] // Consignment implies shipping
        };

        await createProduct(payload);
        closeToast();
        showSuccessToast('提交成功，请等待验货');
        router.replace('/my-products?status=audit'); // Redirect to "Audit" tab
    } catch (e) {
        closeToast();
        showFailToast('提交失败');
        console.error(e);
    } finally {
        isSubmitting.value = false;
    }
}

onMounted(() => {
    loadCategories();
});
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

.option-selected {
    border-color: #4a8b6e;
    background-color: rgba(74, 139, 110, 0.05);
    color: #4a8b6e;
}
</style>
