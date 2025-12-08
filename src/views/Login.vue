<template>
    <div class="login-page">
        <!-- 背景装饰 -->
        <div class="bg-decoration">
            <div class="circle circle-1"></div>
            <div class="circle circle-2"></div>
        </div>

        <div class="page-wrapper">
            <div class="logo-block">
                <div class="logo-icon">
                    <van-icon name="user-o" size="40" color="#764ba2" />
                </div>
                <div class="brand-mark">欢迎回来</div>
                <p class="slogan">登录 TrueUsed，继续您的交易</p>
            </div>

            <div class="login-card">
                <van-form @submit="onSubmit">
                    <div class="input-group">
                        <van-field v-model="form.username" name="username" placeholder="请输入手机号/用户名"
                            :rules="usernameRules" clearable left-icon="user-o" class="custom-field" />
                        <van-field v-model="form.password" :type="showPassword ? 'text' : 'password'" name="password"
                            placeholder="请输入密码" :rules="passwordRules" clearable left-icon="lock" class="custom-field">
                            <template #button>
                                <van-icon :name="showPassword ? 'eye-o' : 'closed-eye'" @click="toggleShowPassword"
                                    class="eye-icon" />
                            </template>
                        </van-field>
                    </div>

                    <div class="submit-wrap">
                        <van-button class="login-btn" block round type="primary" native-type="submit"
                            :loading="submitting" loading-text="登录中...">
                            立即登录
                        </van-button>
                    </div>
                </van-form>
            </div>

            <div class="bottom-section">
                <div class="register-prompt">
                    还没有账号？<span class="link" @click="goRegister">立即注册</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { loginApi } from '@/api/auth';
import { useUserStore } from '@/stores/user';
import { closeToast, showFailToast, showLoadingToast, showSuccessToast } from 'vant';
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default {
    name: 'Login',
    setup() {
        const router = useRouter()
        const route = useRoute()
        const userStore = useUserStore()

        const submitting = ref(false)
        const showPassword = ref(false)

        const form = reactive({
            username: '',
            password: ''
        })

        const usernameRules = [
            { required: true, message: '请输入手机号/用户名' }
        ]

        const passwordRules = [
            { required: true, message: '请输入密码' }
        ]

        const toggleShowPassword = () => { showPassword.value = !showPassword.value }

        onMounted(() => {
            const rememberedPhone = localStorage.getItem('remember_phone')
            if (rememberedPhone) {
                form.username = rememberedPhone
            }
        })

        const onSubmit = async () => {
            submitting.value = true
            showLoadingToast({ message: '登录中...', duration: 0, forbidClick: true, loadingType: 'spinner' })
            try {
                // loginApi 返回 response.data，包含 token 等信息
                const response = await loginApi(form)
                const { token } = response

                if (token) {
                    userStore.setToken(token)
                    await userStore.loadMe()
                    showSuccessToast('登录成功')

                    // 跳转回之前的页面或首页
                    const redirect = route.query.redirect || '/'
                    router.replace(redirect)
                } else {
                    showFailToast('登录失败，未获取到令牌')
                }

            } catch (e) {
                const msg = e?.response?.data?.message || e?.message || '登录失败，请检查账号密码'
                showFailToast(msg)
            } finally {
                submitting.value = false
                closeToast()
            }
        }

        const goRegister = () => router.push('/register')

        return {
            form,
            usernameRules,
            passwordRules,
            submitting,
            showPassword,
            toggleShowPassword,
            onSubmit,
            goRegister
        }
    }
}
</script>

<style scoped>
.login-page {
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

.page-wrapper {
    padding: 80px 24px 40px;
    max-width: 420px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    position: relative;
    z-index: 1;
    justify-content: center;
    /* 垂直居中 */
}

/* Logo 区域 */
.logo-block {
    text-align: center;
    margin-bottom: 30px;
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

/* 登录卡片 */
.login-card {
    background: #fff;
    border-radius: 24px;
    padding: 28px 24px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 16px;
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

/* 提交按钮 */
.submit-wrap {
    margin-top: 30px;
}

.login-btn {
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    box-shadow: 0 8px 24px rgba(118, 75, 162, 0.35);
}

/* 底部区域 */
.bottom-section {
    margin-top: 24px;
    text-align: center;
}

.register-prompt {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
}

.register-prompt .link {
    color: #fff;
    font-weight: 600;
    margin-left: 4px;
    cursor: pointer;
    text-decoration: underline;
}

@media (max-width: 375px) {
    .page-wrapper {
        padding: 60px 20px 30px;
    }

    .logo-icon {
        width: 70px;
        height: 70px;
    }

    .brand-mark {
        font-size: 24px;
    }

    .login-card {
        padding: 24px 20px;
    }
}
</style>
