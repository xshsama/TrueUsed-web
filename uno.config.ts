import { defineConfig, presetAttributify, presetIcons, presetUno } from 'unocss'

// 主题：蓝色主色，提供常用渐变与阴影工具类
export default defineConfig({
    presets: [presetUno(), presetAttributify(), presetIcons()],
    theme: {
        colors: {
            primary: '#007AFF',
            primaryLight: '#66A6FF',
            success: '#22C55E',
            warning: '#F59E0B',
            danger: '#EF4444',
        },
    },
    shortcuts: [
        // 卡片统一风格
        ['card', 'rounded-2xl bg-white shadow-[0_8px_28px_-10px_rgba(0,0,0,0.15)] p-4 md:p-5'],
        // 渐变主按钮
        ['btn-primary', 'text-white rounded-xl px-4 py-2 bg-gradient-to-r from-[#007AFF] to-[#66A6FF] hover:opacity-95 active:opacity-90'],
        // 次按钮
        ['btn-ghost', 'rounded-xl px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50'],
        // 蓝色渐变封面（顶部大条）
        ['cover-blue', 'bg-gradient-to-r from-[#0ea5e9] via-[#3b82f6] to-[#60a5fa]'],
        // 玻璃拟态卡片
        ['glass-card', 'rounded-2xl bg-[rgba(255,255,255,0.72)] backdrop-blur-md backdrop-saturate-125 border border-[rgba(255,255,255,0.35)] shadow-[0_8px_28px_-12px_rgba(0,0,0,0.25)]'],
        // 头像渐变描边容器
        ['avatar-ring', 'p-0.5 rounded-full bg-gradient-to-r from-[#66A6FF] to-[#007AFF]'],
        // 渐变色片（图标背景）
        ['chip', 'inline-flex items-center justify-center rounded-xl text-white w-10 h-10 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)]'],
        ['chip-blue', 'bg-gradient-to-br from-[#3b82f6] to-[#60a5fa]'],
        ['chip-purple', 'bg-gradient-to-br from-[#6C5CE7] to-[#A66BFF]'],
        ['chip-green', 'bg-gradient-to-br from-[#22C55E] to-[#86EFAC]'],
        ['chip-orange', 'bg-gradient-to-br from-[#f59e0b] to-[#fbbf24]'],
        ['chip-pink', 'bg-gradient-to-br from-[#ec4899] to-[#f472b6]'],
        ['chip-cyan', 'bg-gradient-to-br from-[#06b6d4] to-[#67e8f9]'],
        // 矩形渐变色片（替代圆形，避免大圈套小圈）
        ['chip-rect', 'inline-flex items-center justify-center rounded-lg text-white w-9 h-9 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)]'],
        ['chip-rect-blue', 'bg-gradient-to-br from-[#3b82f6] to-[#60a5fa]'],
        ['chip-rect-purple', 'bg-gradient-to-br from-[#6C5CE7] to-[#A66BFF]'],
        ['chip-rect-green', 'bg-gradient-to-br from-[#22C55E] to-[#86EFAC]'],
        ['chip-rect-orange', 'bg-gradient-to-br from-[#f59e0b] to-[#fbbf24]'],
        ['chip-rect-pink', 'bg-gradient-to-br from-[#ec4899] to-[#f472b6]'],
        ['chip-rect-cyan', 'bg-gradient-to-br from-[#06b6d4] to-[#67e8f9]'],
    ],
})
