<template>
    <div class="search-shell">
        <div class="search-icon">
            <div class="i-lucide-search text-lg"></div>
        </div>
        <input type="text" :placeholder="placeholder" v-model="searchQuery"
            class="search-input"
            @keyup.enter="handleSearch" />
        <div class="search-shortcut">ENTER</div>
        <button type="button" class="search-submit" @click="handleSearch">搜索</button>
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

<style scoped>
.search-shell {
    display: grid;
    width: 100%;
    grid-template-columns: auto minmax(0, 1fr) auto auto;
    align-items: center;
    gap: 12px;
    border: 1px solid rgba(203, 213, 225, 0.85);
    background: rgba(255, 255, 255, 0.92);
    border-radius: 9999px;
    padding: 8px 10px 8px 14px;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
    transition: all 0.2s ease;
}

.search-shell:focus-within {
    border-color: rgba(11, 138, 97, 0.35);
    box-shadow: 0 16px 36px rgba(0, 135, 90, 0.08);
}

.search-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
}

.search-input {
    width: 100%;
    border: 0;
    background: transparent;
    color: #334155;
    font-size: 14px;
    outline: none;
}

.search-input::placeholder {
    color: #94a3b8;
}

.search-shortcut {
    border-radius: 9999px;
    background: #f8fafc;
    padding: 6px 10px;
    color: #94a3b8;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
}

.search-submit {
    border: 0;
    border-radius: 9999px;
    background: linear-gradient(135deg, #00875A, #0f5b45);
    padding: 9px 18px;
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    box-shadow: 0 10px 22px rgba(0, 135, 90, 0.2);
}

.search-submit:hover {
    transform: translateY(-1px);
}
</style>
