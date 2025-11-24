<template>
    <div class="post-create-page">
        <!-- 顶部导航 -->
        <van-nav-bar title="发布商品" left-text="取消" left-arrow @click-left="onCancel">
            <template #right>
                <van-button size="small" type="primary" class="btn-primary" :loading="isSubmitting"
                    :disabled="isSubmitting" @click="onSubmit">发布</van-button>
            </template>
        </van-nav-bar>

        <div class="page-content">
            <van-form ref="formRef" @submit="onSubmit">
                <!-- 商品图片 -->
                <div class="form-group">
                    <div class="group-header">
                        <span class="title">商品图片</span>
                        <span class="required">*</span>
                    </div>
                    <ImageUpload v-model="form.imageUrls" :max-images="9" />
                    <div class="form-tip">首张图将作为封面，支持 JPG/PNG，单张 ≤ 5MB</div>
                </div>

                <!-- 基本信息 -->
                <div class="form-group">
                    <div class="group-header">
                        <span class="title">基本信息</span>
                    </div>
                    <van-cell-group :border="false">
                        <van-field v-model="form.title" label="标题" placeholder="品牌型号，宝贝特点" required maxlength="30"
                            show-word-limit :rules="[{ required: true, message: '请输入标题' }]" />

                        <van-field v-model="form.description" label="描述" type="textarea"
                            placeholder="描述一下宝贝的转手原因、入手渠道和使用感受吧~" rows="4" autosize required maxlength="1000"
                            show-word-limit :rules="[{ required: true, message: '请输入描述' }]" />
                    </van-cell-group>
                </div>

                <!-- 价格与分类 -->
                <div class="form-group">
                    <div class="group-header">
                        <span class="title">价格与属性</span>
                    </div>
                    <van-cell-group :border="false">
                        <van-field v-model="form.price" label="价格" placeholder="￥0.00" type="number" input-align="right"
                            required
                            :rules="[{ required: true, message: '请输入价格' }, { validator: validators.pricePositive, message: '价格需大于 0' }]">
                            <template #left-icon>
                                <van-icon name="gold-coin-o" color="#ff9f0a" size="18" />
                            </template>
                        </van-field>

                        <CategorySelect v-model="form.categoryId" label="分类" />

                        <van-field v-model="form.condition" label="成色" placeholder="请选择" readonly required is-link
                            @click="showConditionPicker = true">
                            <template #left-icon>
                                <van-icon name="gem-o" color="#7232dd" size="18" />
                            </template>
                        </van-field>
                    </van-cell-group>
                </div>

                <!-- 交易信息 -->
                <div class="form-group">
                    <div class="group-header">
                        <span class="title">交易信息</span>
                    </div>
                    <van-cell-group :border="false">
                        <van-field label="交易方式">
                            <template #left-icon>
                                <van-icon name="logistics" color="#1989fa" size="18" />
                            </template>
                            <template #input>
                                <van-checkbox-group v-model="form.tradeTypes" direction="horizontal">
                                    <van-checkbox name="meetup" shape="square">面交</van-checkbox>
                                    <van-checkbox name="express" shape="square">快递</van-checkbox>
                                </van-checkbox-group>
                            </template>
                        </van-field>

                        <van-field v-model="form.location" label="所在地区" placeholder="选择地区" readonly is-link
                            @click="showLocationPicker = true">
                            <template #left-icon>
                                <van-icon name="location-o" color="#07c160" size="18" />
                            </template>
                        </van-field>

                        <van-field v-model="form.contact" label="联系方式" placeholder="手机号 / 微信号" required
                            :rules="[{ required: true, message: '请输入联系方式' }]">
                            <template #left-icon>
                                <van-icon name="phone-o" color="#ee0a24" size="18" />
                            </template>
                        </van-field>
                    </van-cell-group>
                </div>

                <div style="height: 40px;"></div>
            </van-form>
        </div>

        <!-- 分类选择器 已替换为 CategorySelect 组件 -->

        <!-- 新旧程度选择器 -->
        <van-popup v-model:show="showConditionPicker" position="bottom">
            <van-picker :columns="conditionColumns" @confirm="onConditionConfirm"
                @cancel="showConditionPicker = false" />
        </van-popup>

        <!-- 地区选择器 -->
        <van-popup v-model:show="showLocationPicker" position="bottom">
            <van-picker :columns="locationColumns" @confirm="onLocationConfirm" @cancel="showLocationPicker = false" />
        </van-popup>
    </div>
</template>

<script>
import { createProduct } from '@/api/products'
import CategorySelect from '@/components/CategorySelect.vue'
import ImageUpload from '@/components/ImageUpload.vue'
import { closeToast, showConfirmDialog, showFailToast, showLoadingToast, showSuccessToast, showToast } from 'vant'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
    name: 'PostCreate',
    components: {
        CategorySelect,
        ImageUpload
    },
    setup() {
        const router = useRouter()

        const formRef = ref(null)
        const showCategoryPicker = ref(false)
        const showConditionPicker = ref(false)
        const showLocationPicker = ref(false)
        const isSubmitting = ref(false)

        // 表单数据
        const form = reactive({
            title: '',
            price: '',
            categoryId: null,
            condition: '',
            description: '',
            tradeTypes: ['meetup'],
            location: '',
            contact: '',
            imageUrls: []
        })

        // 分类选项由 CategorySelect 动态加载

        // 新旧程度选项
        const conditionColumns = ref([
            { text: '全新', value: 'new' },
            { text: '几乎全新', value: 'like_new' },
            { text: '轻微使用痕迹', value: 'excellent' },
            { text: '明显使用痕迹', value: 'good' },
            { text: '重度使用痕迹', value: 'fair' }
        ])

        // 地区选项
        const locationColumns = ref([
            { text: '北京市', value: 'beijing' },
            { text: '上海市', value: 'shanghai' },
            { text: '广州市', value: 'guangzhou' },
            { text: '深圳市', value: 'shenzhen' },
            { text: '杭州市', value: 'hangzhou' },
            { text: '其他', value: 'other' }
        ])

        // 图片删除

        // 分类选择确认由 CategorySelect 直接回填 v-model 实现

        // 新旧程度选择确认
        const onConditionConfirm = ({ selectedOptions }) => {
            form.condition = selectedOptions[0]?.text || ''
            showConditionPicker.value = false
        }

        // 地区选择确认
        const onLocationConfirm = ({ selectedOptions }) => {
            form.location = selectedOptions[0]?.text || ''
            showLocationPicker.value = false
        }

        // 取消发布
        const onCancel = () => {
            showConfirmDialog({
                title: '确认取消',
                message: '取消后已填写的内容将不会保存',
            }).then(() => {
                router.go(-1)
            }).catch(() => {
                console.log('取消操作')
            })
        }

        // 提交表单
        const validators = {
            pricePositive: (val) => Number(val) > 0,
            contact: (val) => {
                if (!val) return false
                const isPhone = /^1[3-9]\d{9}$/.test(val)
                const isWeChat = /^[a-zA-Z][-_a-zA-Z0-9]{5,19}$/.test(val)
                return isPhone || isWeChat
            }
        }

        const onSubmit = async () => {
            if (isSubmitting.value) return
            // 表单验证
            try {
                await formRef.value?.validate()
            } catch (e) {
                showToast('请完善表单信息')
                return
            }
            if (!form.categoryId) {
                showToast('请选择分类')
                return
            }
            if (form.imageUrls.length === 0) {
                showToast('请上传商品图片')
                return
            }

            isSubmitting.value = true
            showLoadingToast({ message: '发布中...', duration: 0, forbidClick: true })
            try {
                const payload = {
                    title: form.title,
                    description: form.description,
                    price: Number(form.price),
                    currency: 'CNY',
                    // 将中文成色映射为后端枚举
                    condition: mapCondition(form.condition),
                    categoryId: form.categoryId,
                    locationText: form.location || undefined,
                    imageUrls: form.imageUrls,
                }
                await createProduct(payload)
                closeToast()
                showSuccessToast('发布成功')
                router.replace('/post')
            } catch (e) {
                closeToast()
                showFailToast('发布失败')
            } finally {
                isSubmitting.value = false
            }
        }

        const mapCondition = (text) => {
            const map = {
                '全新': 'NEW',
                '几乎全新': 'LIKE_NEW',
                '轻微使用痕迹': 'GOOD',
                '明显使用痕迹': 'FAIR',
                '重度使用痕迹': 'POOR',
            }
            // 若直接传英文也支持透传
            return map[text] || text || null
        }

        return {
            formRef,
            showCategoryPicker,
            showConditionPicker,
            showLocationPicker,
            isSubmitting,
            form,
            // categoryColumns,
            conditionColumns,
            locationColumns,
            // onCategoryConfirm,
            validators,
            onConditionConfirm,
            onLocationConfirm,
            onCancel,
            onSubmit
        }
    }
}
</script>

<style scoped>
.post-create-page {
    background-color: #f7f8fa;
    min-height: 100vh;
}

.page-content {
    padding: 60px 16px 20px;
    max-width: 800px;
    margin: 0 auto;
}

.form-group {
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.group-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    padding-left: 4px;
}

.group-header .title {
    font-size: 16px;
    font-weight: 600;
    color: #323233;
    margin-right: 4px;
}

.required {
    color: #ee0a24;
    font-size: 16px;
    font-weight: bold;
}

.form-tip {
    font-size: 12px;
    color: #969799;
    margin-top: 8px;
    padding-left: 4px;
}

/* 覆盖 Vant 默认样式以适应卡片风格 */
:deep(.van-cell-group) {
    margin: 0;
}

:deep(.van-cell) {
    padding-left: 0;
    padding-right: 0;
}

:deep(.van-cell::after) {
    left: 0;
    right: 0;
}

:deep(.van-field__label) {
    width: 5em;
    color: #646566;
}

/* 调整复选框 */
:deep(.van-checkbox-group--horizontal .van-checkbox) {
    margin-right: 16px;
}
</style>
