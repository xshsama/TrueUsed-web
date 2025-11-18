<template>
    <div class="image-uploader">
        <div class="image-preview-list">
            <div v-for="(image, index) in previewImages" :key="index" class="image-preview">
                <img :src="image.url" :alt="image.file.name" />
                <button @click="removeImage(index)" class="remove-btn">&times;</button>
            </div>
            <div class="upload-placeholder" @click="triggerFileInput" v-if="canUploadMore">
                <span class="plus-icon">+</span>
                <span class="upload-text">添加图片</span>
            </div>
        </div>
        <input type="file" ref="fileInput" @change="handleFileChange" multiple accept="image/*" style="display: none" />
        <div v-if="isUploading" class="upload-loading">正在上传...</div>
        <div v-if="error" class="upload-error">{{ error }}</div>
    </div>
</template>

<script setup>
import { getCloudinarySignature } from '@/api/cloudinary';
import axios from 'axios';
import { computed, ref } from 'vue';

const props = defineProps({
    maxImages: {
        type: Number,
        default: 9,
    },
    modelValue: {
        type: Array,
        default: () => [],
    },
});

const emit = defineEmits(['update:modelValue']);

const previewImages = ref([]);
const isUploading = ref(false);
const error = ref(null);
const fileInput = ref(null);

const canUploadMore = computed(() => previewImages.value.length < props.maxImages);

const triggerFileInput = () => {
    fileInput.value.click();
};

const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    const filesToUpload = files.slice(0, props.maxImages - previewImages.value.length);

    isUploading.value = true;
    error.value = null;

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

        const newImages = filesToUpload.map((file, index) => ({
            file,
            url: uploadedUrls[index]
        }));

        previewImages.value.push(...newImages);

        const allUrls = previewImages.value.map(img => img.url);
        emit('update:modelValue', allUrls);

    } catch (err) {
        console.error('Upload failed:', err);
        error.value = '图片上传失败，请稍后重试。';
    } finally {
        isUploading.value = false;
        // 清空 input 的值，以便可以再次选择相同的文件
        if (fileInput.value) {
            fileInput.value.value = '';
        }
    }
};

const removeImage = (index) => {
    previewImages.value.splice(index, 1);
    const allUrls = previewImages.value.map(img => img.url);
    emit('update:modelValue', allUrls);
};

</script>

<style scoped>
.image-uploader {
    width: 100%;
}

.image-preview-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.image-preview {
    position: relative;
    width: 100px;
    height: 100px;
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
}

.image-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.remove-btn {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 20px;
    height: 20px;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    line-height: 1;
}

.upload-placeholder {
    width: 100px;
    height: 100px;
    border: 2px dashed #ccc;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #888;
}

.upload-placeholder:hover {
    border-color: #aaa;
    color: #666;
}

.plus-icon {
    font-size: 28px;
    line-height: 1;
}

.upload-text {
    font-size: 12px;
    margin-top: 5px;
}

.upload-loading,
.upload-error {
    margin-top: 10px;
    font-size: 14px;
}

.upload-error {
    color: red;
}
</style>