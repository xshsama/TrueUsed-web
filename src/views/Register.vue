<template>
    <div class="register-page">
        <!-- 背景装饰 -->
        <div class="bg-decoration">
            <div class="circle circle-1"></div>
            <div class="circle circle-2"></div>
        </div>

        <van-nav-bar title="" fixed :border="false" left-arrow @click-left="$router.go(-1)" class="transparent-nav" />

        <div class="page-wrapper">
            <div class="logo-block">
                <div class="logo-icon">
                    <van-icon name="user-o" size="40" color="#764ba2" />
                </div>
                <div class="brand-mark">创建账号</div>
                <p class="slogan">加入 TrueUsed，开始交易之旅</p>
            </div>

            <div class="register-card">
                <van-form @submit="onSubmit">
                    <div class="input-group">
                        <van-field v-model="form.phone" name="phone" type="tel" placeholder="请输入手机号" :rules="phoneRules"
                            clearable left-icon="phone-o" class="custom-field" />
                        <van-field v-model="form.email" name="email" type="text" placeholder="请输入邮箱" :rules="emailRules"
                            clearable left-icon="envelop-o" class="custom-field" />
                        <van-field v-model="form.password" :type="showPassword ? 'text' : 'password'" name="password"
                            placeholder="设置登录密码（至少6位）" :rules="passwordRules" clearable left-icon="lock"
                            class="custom-field">
                            <template #button>
                                <van-icon :name="showPassword ? 'eye-o' : 'closed-eye'" @click="toggleShowPassword"
                                    class="eye-icon" />
                            </template>
                        </van-field>
                        <van-field v-model="form.confirm" :type="showConfirm ? 'text' : 'password'" name="confirm"
                            placeholder="确认密码" :rules="confirmRules" clearable left-icon="lock" class="custom-field">
                            <template #button>
                                <van-icon :name="showConfirm ? 'eye-o' : 'closed-eye'" @click="toggleShowConfirm"
                                    class="eye-icon" />
                            </template>
                        </van-field>
                    </div>

                    <div class="agreements-check" @click="toggleAgree">
                        <van-checkbox v-model="agreed" icon-size="16px">
                            <span class="agree-text">
                                我已阅读并同意
                                <span class="link" @click.stop="openAgreement('user')">《用户协议》</span> 与
                                <span class="link" @click.stop="openAgreement('privacy')">《隐私政策》</span>
                            </span>
                        </van-checkbox>
                    </div>

                    <div class="submit-wrap">
                        <van-button class="register-btn" block round type="primary" native-type="submit"
                            :loading="submitting" :disabled="!agreed" loading-text="创建中...">
                            立即注册
                        </van-button>
                    </div>
                </van-form>
            </div>

            <div class="bottom-section">
                <div class="login-prompt">
                    已有账号？<span class="link" @click="goLogin">立即登录</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { registerApi } from '@/api/auth';
import { closeToast, showFailToast, showLoadingToast, showSuccessToast, showToast } from 'vant';
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
    name: 'Register',
    setup() {
        const router = useRouter()

        const submitting = ref(false)
        const showPassword = ref(false)
        const showConfirm = ref(false)
        const agreed = ref(false)

        const form = reactive({
            phone: '', // 作为后端 username 使用
            email: '',
            password: '',
            confirm: ''
        })

        const phoneRules = [
            { required: true, message: '请输入手机号' },
            { validator: v => /^1[3-9]\d{9}$/.test(v), message: '手机号格式不正确' }
        ]

        const emailRules = [
            { required: true, message: '请输入邮箱' },
            { validator: v => /\S+@\S+\.\S+/.test(v), message: '邮箱格式不正确' }
        ]

        const passwordRules = [
            { required: true, message: '请输入密码' },
            { validator: v => v.length >= 6 && v.length <= 100, message: '密码长度需在 6-100 位' }
        ]

        const confirmRules = [
            { required: true, message: '请再次输入密码' },
            { validator: v => v === form.password, message: '两次输入不一致' }
        ]

        const valid = computed(() =>
            /^1[3-9]\d{9}$/.test(form.phone) &&
            /\S+@\S+\.\S+/.test(form.email) &&
            form.password.length >= 6 && form.password.length <= 100 &&
            form.password === form.confirm &&
            agreed.value
        )

        const toggleShowPassword = () => { showPassword.value = !showPassword.value }
        const toggleShowConfirm = () => { showConfirm.value = !showConfirm.value }
        const toggleAgree = () => { agreed.value = !agreed.value }

        const openAgreement = (type) => {
            showToast(type === 'user' ? '用户协议（占位）' : '隐私政策（占位）')
        }

        const onSubmit = async () => {
            if (!valid.value) {
                showToast('请完整填写信息并同意协议')
                return
            }
            submitting.value = true
            showLoadingToast({ message: '创建账号...', duration: 0, forbidClick: true, loadingType: 'spinner' })
            try {
                // 后端 RegisterRequest: { username, email, password }
                const payload = { username: form.phone, email: form.email, password: form.password }
                await registerApi(payload)
                showSuccessToast('注册成功，请登录')
                // 便捷：将手机号记住，登录页可直接使用
                localStorage.setItem('remember_phone', form.phone)
                router.replace({ name: 'Login' })
            } catch (e) {
                const msg = e?.response?.data?.message || e?.message || '注册失败，请稍后再试'
                showFailToast(msg)
            } finally {
                submitting.value = false
                closeToast()
            }
        }

        const goLogin = () => router.push('/login')

        return {
            form,
            phoneRules,
            emailRules,
            passwordRules,
            confirmRules,
            submitting,
            showPassword,
            showConfirm,
            toggleShowPassword,
            toggleShowConfirm,
            agreed,
            toggleAgree,
            openAgreement,
            onSubmit,
            goLogin
        }
    }
}
</script>

<style scoped>
.register-page {
    min-height: 100vh;
    width: 100vw;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow-y: auto;
    overflow-x: hidden;
}

/* 背景装饰 */
.bg-decoration {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    overflow: hidden;
}

.circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
}

.circle-1 {
    width: 300px;
    height: 300px;
    top: -100px;
    right: -80px;
}

.circle-2 {
    width: 200px;
    height: 200px;
    bottom: 10%;
    left: -60px;
}

/* 透明导航栏 */
.transparent-nav {
    background: transparent !important;
}

:deep(.transparent-nav .van-nav-bar__content) {
    background: transparent;
}

:deep(.transparent-nav .van-nav-bar__left .van-icon) {
    color: #fff;
}

.page-wrapper {
    padding: 80px 24px 40px;
    max-width: 420px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    position: relative;
    z-index: 1;
}

/* Logo 区域 */
.logo-block {
    text-align: center;
    margin-bottom: 20px;
}

.logo-icon {
    width: 80px;
    height: 80px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.brand-mark {
    font-size: 28px;
    font-weight: 700;
    color: #fff;
    letter-spacing: 1px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.slogan {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.85);
    margin-top: 8px;
}

/* 注册卡片 */
.register-card {
    background: #fff;
    border-radius: 24px;
    padding: 28px 24px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.custom-field {
    background: #f8f9fa;
    border-radius: 12px;
    overflow: hidden;
}

:deep(.custom-field .van-cell) {
    padding: 14px 16px;
    background: transparent;
    align-items: center;
}

:deep(.custom-field .van-field__body) {
    align-items: center;
}

:deep(.custom-field .van-field__left-icon) {
    margin-right: 12px;
    color: #764ba2;
    display: flex;
    align-items: center;
}

:deep(.custom-field .van-field__left-icon .van-icon) {
    font-size: 20px;
}

:deep(.custom-field .van-field__control) {
    font-size: 15px;
    line-height: 1.5;
}

:deep(.custom-field::after) {
    display: none;
}

.eye-icon {
    color: #999;
    font-size: 20px;
    cursor: pointer;
}

/* 协议勾选 */
.agreements-check {
    margin-top: 16px;
    padding: 0 4px;
}

.agree-text {
    font-size: 12px;
    color: #666;
    line-height: 1.5;
}

.agree-text .link {
    color: #764ba2;
}

/* 提交按钮 */
.submit-wrap {
    margin-top: 24px;
}

.register-btn {
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    box-shadow: 0 8px 24px rgba(118, 75, 162, 0.35);
}

.register-btn:disabled {
    background: #ccc;
    box-shadow: none;
}

/* 底部区域 */
.bottom-section {
    margin-top: 24px;
    text-align: center;
}

.login-prompt {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
}

.login-prompt .link {
    color: #fff;
    font-weight: 600;
    margin-left: 4px;
    cursor: pointer;
    text-decoration: underline;
}

/* Checkbox 样式 */
:deep(.van-checkbox__icon--checked .van-icon) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-color: #764ba2;
}

@media (max-width: 375px) {
    .page-wrapper {
        padding: 70px 20px 30px;
    }

    .logo-icon {
        width: 70px;
        height: 70px;
    }

    .brand-mark {
        font-size: 24px;
    }

    .register-card {
        padding: 24px 20px;
    }
}
</style>
