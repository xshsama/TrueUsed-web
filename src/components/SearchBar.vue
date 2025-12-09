<template>
    <div class="w-full relative group flex items-center">
        <input type="text" :placeholder="placeholder" v-model="searchQuery"
            class="w-full bg-gray-100/80 border-none rounded-full h-10 pl-5 pr-12 text-sm text-gray-700 placeholder-gray-400 focus:bg-white focus:ring-1 focus:ring-[#4a8b6e]/30 transition-all outline-none"
            @keyup.enter="handleSearch" />
        <div class="absolute right-1 top-1 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#4a8b6e] cursor-pointer transition-colors"
            @click="handleSearch">
            <div class="i-lucide-search text-lg"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    placeholder: {
        type: String,
        default: '搜“iPhone 15”看看大家卖多少钱...'
    },
    modelValue: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['search', 'update:modelValue']);

const searchQuery = ref(props.modelValue);

watch(() => props.modelValue, (newValue) => {
    searchQuery.value = newValue;
});

watch(searchQuery, (newValue) => {
    emit('update:modelValue', newValue);
});

const handleSearch = () => {
    emit('search', searchQuery.value);
};
</script>
