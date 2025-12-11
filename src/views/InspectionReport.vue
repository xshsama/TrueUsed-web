<template>
    <div class="min-h-screen bg-[#f7f9fa] pb-12 font-sans text-[#2c3e50]">

        <!-- --- Top Navigation --- -->
        <nav class="bg-white sticky top-0 z-50 border-b border-gray-100">
            <div class="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between gap-4">
                <div class="flex items-center gap-10">
                    <div class="flex items-center gap-1.5 cursor-pointer" @click="router.push('/')">
                        <div
                            class="w-9 h-9 bg-[#4a8b6e] rounded-lg flex items-center justify-center text-white font-bold text-xl italic shadow-sm">
                            T</div>
                        <span class="text-2xl font-bold text-[#2c3e50] tracking-tight">TrueUsed<span
                                class="text-[#4a8b6e]">.</span></span>
                    </div>
                    <div class="hidden md:flex items-center gap-8 text-[15px] font-medium text-gray-500">
                        <a href="#" class="hover:text-[#4a8b6e] transition-colors"
                            @click.prevent="router.push('/my-products')">卖家中心</a>
                        <a href="#" class="text-[#4a8b6e] font-bold">验货报告</a>
                    </div>
                </div>

                <div class="flex items-center gap-4">
                    <div class="w-9 h-9 rounded-full bg-gray-200 overflow-hidden border border-gray-100 cursor-pointer"
                        @click="router.push('/profile')">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
                            class="w-full h-full object-cover" />
                    </div>
                </div>
            </div>
        </nav>

        <main class="max-w-7xl mx-auto px-6 py-8">

            <!-- Header -->
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 class="text-2xl font-bold text-[#2c3e50]">验货报告档案</h1>
                    <p class="text-sm text-gray-400 mt-1">共 {{ totalCount }} 份报告 · 官方质检工程部出具</p>
                </div>

                <div class="flex items-center gap-3">
                    <div class="relative w-full md:w-64">
                        <input type="text" v-model="searchQuery" placeholder="输入商品名称 / 报告编号"
                            class="w-full bg-white border border-gray-200 rounded-full py-2 pl-10 pr-4 text-sm focus:border-[#4a8b6e] focus:ring-4 focus:ring-[#4a8b6e]/10 outline-none transition-all" />
                        <div class="i-lucide-search absolute left-3.5 top-2.5 text-gray-400 w-4 h-4"></div>
                    </div>
                    <button
                        class="bg-[#2c3e50] text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-[#1a252f] transition-colors border-none cursor-pointer">
                        <div class="i-lucide-filter w-4 h-4"></div> 筛选
                    </button>
                </div>
            </div>

            <!-- Stats Overview (Optional) -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                    <div
                        class="w-10 h-10 rounded-full bg-[#4a8b6e]/10 text-[#4a8b6e] flex items-center justify-center font-bold">
                        S</div>
                    <div>
                        <div class="text-xs text-gray-400">S级 (完美)</div>
                        <div class="text-xl font-bold text-[#2c3e50]">12</div>
                    </div>
                </div>
                <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                    <div
                        class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        A</div>
                    <div>
                        <div class="text-xs text-gray-400">A级 (优秀)</div>
                        <div class="text-xl font-bold text-[#2c3e50]">45</div>
                    </div>
                </div>
                <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                    <div
                        class="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                        B</div>
                    <div>
                        <div class="text-xs text-gray-400">B级 (良好)</div>
                        <div class="text-xl font-bold text-[#2c3e50]">8</div>
                    </div>
                </div>
                <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                    <div
                        class="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold">
                        X</div>
                    <div>
                        <div class="text-xs text-gray-400">不通过</div>
                        <div class="text-xl font-bold text-[#2c3e50]">2</div>
                    </div>
                </div>
            </div>

            <!-- Tabs -->
            <div class="flex gap-2 mb-6 border-b border-gray-100 pb-1">
                <button v-for="tab in tabs" :key="tab" @click="activeTab = tab"
                    :class="['px-4 py-2 text-sm font-bold transition-all relative bg-transparent border-none cursor-pointer', activeTab === tab ? 'text-[#4a8b6e]' : 'text-gray-500 hover:text-gray-700']">
                    {{ tab }}
                    <div v-if="activeTab === tab"
                        class="absolute bottom-0 left-0 w-full h-0.5 bg-[#4a8b6e] rounded-t-full"></div>
                </button>
            </div>

            <!-- Report List -->
            <div class="space-y-4">

                <div v-for="report in filteredReports" :key="report.id"
                    class="bg-white rounded-2xl border border-gray-100 p-1 shadow-sm hover:shadow-md hover:border-[#4a8b6e]/30 transition-all group flex flex-col md:flex-row">
                    <!-- Left: Grade & Image -->
                    <div
                        class="relative w-full md:w-64 h-48 md:h-auto bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 m-1">
                        <img :src="report.image"
                            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                        <!-- Grade Badge -->
                        <div class="absolute top-0 left-0 p-3">
                            <div
                                :class="['w-10 h-12 flex flex-col items-center justify-center rounded shadow-lg text-white font-bold', getGradeColor(report.grade)]">
                                <span class="text-lg leading-none">{{ report.grade }}</span>
                                <span class="text-[8px] opacity-80 mt-0.5">级</span>
                            </div>
                        </div>

                        <!-- Status Overlay -->
                        <div
                            class="absolute bottom-0 w-full bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-2 flex justify-between items-center box-border">
                            <span>{{ report.inspectDate }}</span>
                            <span class="font-mono opacity-80">{{ report.reportId }}</span>
                        </div>
                    </div>

                    <!-- Middle: Info -->
                    <div class="flex-1 p-5 flex flex-col justify-between">
                        <div>
                            <div class="flex justify-between items-start mb-2">
                                <h2
                                    class="text-lg font-bold text-[#2c3e50] group-hover:text-[#4a8b6e] transition-colors cursor-pointer">
                                    {{ report.title }}</h2>
                                <span v-if="report.status === '通过'"
                                    class="text-[#4a8b6e] bg-[#4a8b6e]/10 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                    <div class="i-lucide-check-circle-2 w-3 h-3"></div> 验货通过
                                </span>
                                <span v-else
                                    class="text-red-500 bg-red-50 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                    <div class="i-lucide-x-circle w-3 h-3"></div> 验货驳回
                                </span>
                            </div>

                            <div class="text-sm text-gray-500 mb-4">{{ report.category }} · {{ report.spec }}</div>

                            <!-- Key Findings (Tags) -->
                            <div class="space-y-2">
                                <div class="text-xs font-bold text-gray-400 uppercase tracking-wider">关键检测项</div>
                                <div class="flex flex-wrap gap-2">
                                    <span v-for="item in report.highlights" :key="item.label"
                                        :class="['px-2 py-1 rounded text-xs border flex items-center gap-1.5', item.pass ? 'bg-gray-50 border-gray-100 text-gray-600' : 'bg-orange-50 border-orange-100 text-orange-700']">
                                        <div
                                            :class="[item.pass ? 'i-lucide-check' : 'i-lucide-alert-circle', 'w-2.5 h-2.5']">
                                        </div>
                                        {{ item.label }}
                                        <span v-if="item.value" class="font-bold ml-1">{{ item.value }}</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Inspector Info -->
                        <div class="mt-6 pt-4 border-t border-gray-50 flex items-center gap-2 text-xs text-gray-400">
                            <div class="i-lucide-user-check w-3.5 h-3.5"></div>
                            <span>质检工程师：{{ report.inspector }}</span>
                            <div class="w-px h-3 bg-gray-200 mx-1"></div>
                            <span>{{ report.location }}验货中心</span>
                        </div>
                    </div>

                    <!-- Right: Actions -->
                    <div class="p-5 md:w-48 md:border-l border-gray-50 flex flex-col justify-center gap-3">
                        <button
                            class="w-full bg-[#2c3e50] text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-[#1a252f] transition-all active:scale-95 flex items-center justify-center gap-2 border-none cursor-pointer">
                            <div class="i-lucide-eye w-4 h-4"></div> 查看详情
                        </button>
                        <button
                            class="w-full bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-lg text-sm font-bold hover:border-[#4a8b6e] hover:text-[#4a8b6e] transition-colors flex items-center justify-center gap-2 cursor-pointer">
                            <div class="i-lucide-download w-4 h-4"></div> 下载 PDF
                        </button>
                        <a href="#"
                            class="text-center text-xs text-gray-400 hover:text-gray-600 mt-1 hover:underline">分享报告</a>
                    </div>
                </div>

            </div>

            <!-- Empty State -->
            <div v-if="filteredReports.length === 0" class="py-20 text-center">
                <div
                    class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <div class="i-lucide-file-x w-8 h-8"></div>
                </div>
                <p class="text-gray-400 text-sm">暂无相关报告</p>
            </div>

        </main>

    </div>
</template>

<script setup>
import { getMyInspections } from '@/api/inspection';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const searchQuery = ref('');
const activeTab = ref('全部');
const tabs = ['全部', '已通过', '未通过', '30天内'];

const reports = ref([]);

const fetchReports = async () => {
    try {
        const res = await getMyInspections();
        reports.value = (res || []).map(item => ({
            id: item.inspectionId,
            reportId: `R-${new Date(item.createdAt).getFullYear()}${String(new Date(item.createdAt).getMonth() + 1).padStart(2, '0')}-${String(item.inspectionId).padStart(3, '0')}`,
            title: item.productTitle || '未知商品',
            image: item.productImage || 'https://images.unsplash.com/photo-1512054502232-10a0a035d672?auto=format&fit=crop&q=80&w=300',
            grade: item.grade || 'A',
            status: item.status === 'COMPLETED' ? '通过' : (item.status === 'FAILED' ? '驳回' : '检测中'),
            category: item.categoryName || '通用',
            spec: '标准规格', // Placeholder
            inspectDate: new Date(item.updatedAt || item.createdAt).toLocaleString(),
            inspector: '工号' + (100 + Math.floor(Math.random() * 50)), // Placeholder
            location: '上海', // Placeholder
            highlights: (item.items || []).slice(0, 4).map(i => ({
                label: i.itemName,
                pass: i.status === 'PASSED',
                value: i.notes
            }))
        }));
    } catch (e) {
        console.error('Failed to fetch inspections', e);
    }
};

onMounted(() => {
    fetchReports();
});

const totalCount = computed(() => reports.value.length);

const filteredReports = computed(() => {
    let result = reports.value;
    if (activeTab.value === '已通过') result = result.filter(r => r.status === '通过');
    else if (activeTab.value === '未通过') result = result.filter(r => r.status === '驳回');

    if (searchQuery.value) {
        result = result.filter(r =>
            r.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            r.reportId.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
    }
    return result;
});

const getGradeColor = (grade) => {
    switch (grade) {
        case 'S': return 'bg-gradient-to-b from-yellow-400 to-yellow-600';
        case 'A': return 'bg-gradient-to-b from-blue-400 to-blue-600';
        case 'B': return 'bg-gradient-to-b from-orange-400 to-orange-600';
        case 'X': return 'bg-gray-500';
        default: return 'bg-gray-400';
    }
};
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

/* 盖章动画 */
.stamp-mark {
    mask-image: url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Check_green_icon.svg/2048px-Check_green_icon.svg.png');
    -webkit-mask-image: url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Check_green_icon.svg/2048px-Check_green_icon.svg.png');
    mask-size: contain;
    mask-repeat: no-repeat;
}
</style>
