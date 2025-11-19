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
                <div class="form-section">
                    <div class="section-title">商品图片 <span class="required">*</span></div>
                    <ImageUpload v-model="form.imageUrls" :max-images="9" />
                    <div class="form-tip">最多可上传 9 张图片，单张不超过 5MB，第一张为封面图</div>
                </div>

                <!-- 商品信息 -->
                <van-cell-group>
                    <van-field v-model="form.title" label="商品标题" placeholder="请输入商品标题" required maxlength="30"
                        show-word-limit :rules="[
                            { required: true, message: '请输入商品标题' },
                        ]" />
                    <van-field v-model="form.price" label="价格" placeholder="请输入价格" type="digit" input-align="right"
                        required :rules="[
                            { required: true, message: '请输入价格' },
                            { validator: validators.pricePositive, message: '价格需大于 0' }
                        ]">
                        <template #left-icon>
                            <span style="color: #ee0a24;">¥</span>
                        </template>
                    </van-field>
                    <CategorySelect v-model="form.categoryId" label="分类" />
                    <van-field v-model="form.condition" label="新旧程度" placeholder="请选择新旧程度" readonly required is-link
                        @click="showConditionPicker = true" />
                </van-cell-group>

                <!-- 商品描述 -->
                <div class="form-section">
                    <van-field v-model="form.description" label="商品描述" type="textarea"
                        placeholder="请详细描述商品的状况、购买时间、使用情况等" rows="4" autosize required maxlength="1000" show-word-limit
                        :rules="[{ required: true, message: '请输入商品描述' }]" />
                    <div class="form-tip">详细的描述能帮助买家更好地了解商品</div>
                </div>

                <!-- 交易方式 -->
                <van-cell-group>
                    <van-field label="交易方式">
                        <template #input>
                            <van-checkbox-group v-model="form.tradeTypes" direction="horizontal">
                                <van-checkbox name="meetup">面交</van-checkbox>
                                <van-checkbox name="express">快递</van-checkbox>
                            </van-checkbox-group>
                        </template>
                    </van-field>
                    <van-field v-model="form.location" label="所在地区" placeholder="请选择所在地区" readonly is-link
                        @click="showLocationPicker = true" />
                </van-cell-group>

                <!-- 联系方式 -->
                <van-cell-group>
                    <van-field v-model="form.contact" label="联系方式" placeholder="请输入手机号或微信" required :rules="[
                        { required: true, message: '请输入联系方式' },
                        { validator: validators.contact, message: '请输入正确的手机号或微信号' }
                    ]" />
                </van-cell-group>
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
import { closeToast, Dialog, showFailToast, showLoadingToast, showSuccessToast, showToast } from 'vant'
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
            Dialog.confirm({
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
    padding-top: 46px;
    /* 为固定导航栏留出空间 */
}

.form-section {
    background: #fff;
    padding: 16px;
    margin-bottom: 8px;
}

.section-title {
    font-size: 14px;
    font-weight: 500;
    color: #323233;
    margin-bottom: 12px;
}

.required {
    color: #ee0a24;
}

.form-tip {
    font-size: 12px;
    color: #969799;
    margin-top: 8px;
    line-height: 1.4;
}

:deep(.van-cell-group) {
    margin-bottom: 8px;
}

:deep(.van-uploader__wrapper) {
    margin-bottom: 8px;
}

:deep(.van-checkbox-group--horizontal .van-checkbox) {
    margin-right: 12px;
}
</style>