<template>
    <div class="post-create-page">
        <!-- 顶部导航 -->
        <van-nav-bar title="发布商品" left-text="取消" right-text="发布" left-arrow @click-left="onCancel"
            @click-right="onSubmit" />

        <div class="page-content">
            <van-form @submit="onSubmit">
                <!-- 商品图片 -->
                <div class="form-section">
                    <div class="section-title">商品图片 <span class="required">*</span></div>
                    <van-uploader v-model="fileList" multiple :max-count="9" :preview-size="80" upload-text="点击上传"
                        @delete="onImageDelete" />
                    <div class="form-tip">最多可上传9张图片，第一张为封面图</div>
                </div>

                <!-- 商品信息 -->
                <van-cell-group>
                    <van-field v-model="form.title" label="商品标题" placeholder="请输入商品标题" required
                        :rules="[{ required: true, message: '请输入商品标题' }]" />
                    <van-field v-model="form.price" label="价格" placeholder="请输入价格" type="number" required
                        :rules="[{ required: true, message: '请输入价格' }]">
                        <template #left-icon>
                            <span style="color: #ee0a24;">¥</span>
                        </template>
                    </van-field>
                    <van-field v-model="form.category" label="分类" placeholder="请选择分类" readonly required is-link
                        @click="showCategoryPicker = true" />
                    <van-field v-model="form.condition" label="新旧程度" placeholder="请选择新旧程度" readonly required is-link
                        @click="showConditionPicker = true" />
                </van-cell-group>

                <!-- 商品描述 -->
                <div class="form-section">
                    <van-field v-model="form.description" label="商品描述" type="textarea"
                        placeholder="请详细描述商品的状况、购买时间、使用情况等" rows="4" autosize required
                        :rules="[{ required: true, message: '请输入商品描述' }]" />
                    <div class="form-tip">详细的描述能帮助买家更好地了解商品</div>
                </div>

                <!-- 交易方式 */
        <van-cell-group>
          <van-field label="交易方式">
            <template #input>
              <van-checkbox-group v-model="form.tradeTypes" direction="horizontal">
                <van-checkbox name="meetup">面交</van-checkbox>
                <van-checkbox name="express">快递</van-checkbox>
              </van-checkbox-group>
            </template>
          </van-field>
          <van-field
            v-model="form.location"
            label="所在地区"
            placeholder="请选择所在地区"
            readonly
            is-link
            @click="showLocationPicker = true"
          />
        </van-cell-group>
        
        <!-- 联系方式 -->
                <van-cell-group>
                    <van-field v-model="form.contact" label="联系方式" placeholder="请输入手机号或微信" required
                        :rules="[{ required: true, message: '请输入联系方式' }]" />
                </van-cell-group>
            </van-form>
        </div>

        <!-- 分类选择器 -->
        <van-popup v-model:show="showCategoryPicker" position="bottom">
            <van-picker :columns="categoryColumns" @confirm="onCategoryConfirm" @cancel="showCategoryPicker = false" />
        </van-popup>

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
import { Dialog, Toast } from 'vant'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
    name: 'PostCreate',
    setup() {
        const router = useRouter()

        const fileList = ref([])
        const showCategoryPicker = ref(false)
        const showConditionPicker = ref(false)
        const showLocationPicker = ref(false)

        // 表单数据
        const form = reactive({
            title: '',
            price: '',
            category: '',
            condition: '',
            description: '',
            tradeTypes: ['meetup'],
            location: '',
            contact: ''
        })

        // 分类选项
        const categoryColumns = ref([
            { text: '数码产品', value: 'digital' },
            { text: '服装配饰', value: 'clothing' },
            { text: '家具家电', value: 'furniture' },
            { text: '图书音像', value: 'books' },
            { text: '运动户外', value: 'sports' },
            { text: '其他', value: 'other' }
        ])

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
        const onImageDelete = (file, detail) => {
            console.log('删除图片:', file, detail)
        }

        // 分类选择确认
        const onCategoryConfirm = ({ selectedOptions }) => {
            form.category = selectedOptions[0]?.text || ''
            showCategoryPicker.value = false
        }

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
        const onSubmit = () => {
            // 表单验证
            if (!form.title) {
                Toast('请输入商品标题')
                return
            }
            if (!form.price) {
                Toast('请输入价格')
                return
            }
            if (!form.category) {
                Toast('请选择分类')
                return
            }
            if (!form.condition) {
                Toast('请选择新旧程度')
                return
            }
            if (!form.description) {
                Toast('请输入商品描述')
                return
            }
            if (!form.contact) {
                Toast('请输入联系方式')
                return
            }
            if (fileList.value.length === 0) {
                Toast('请上传商品图片')
                return
            }

            // 模拟提交
            Toast.loading({ message: '发布中...', duration: 0 })

            setTimeout(() => {
                Toast.clear()
                Toast.success('发布成功')
                router.replace('/post')
            }, 2000)
        }

        return {
            fileList,
            showCategoryPicker,
            showConditionPicker,
            showLocationPicker,
            form,
            categoryColumns,
            conditionColumns,
            locationColumns,
            onImageDelete,
            onCategoryConfirm,
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