<template>
    <div class="login-page">
        <!-- 背景装饰 -->
        <div class="bg-decoration">
            <div class="circle circle-1"></div>
            <div class="circle circle-2"></div>
            <div class="circle circle-3"></div>
        </div>

        <van-nav-bar title="" fixed :border="false" left-arrow @click-left="goBack" class="transparent-nav" />

        <div class="page-wrapper">
            <div class="logo-block">
                <div class="logo-icon">
                    <van-icon name="shop-o" size="48" color="#007AFF" />
                </div>
                <div class="brand-mark">TrueUsed</div>
                <p class="slogan">二手交易 · 真实可靠</p>
            </div>

            <div class="login-card">
                <div class="card-header">
                    <h2 class="card-title">欢迎回来</h2>
                    <p class="card-subtitle">登录你的账号继续</p>
                </div>

                <van-form @submit="onSubmit">
                    <div class="input-group">
                        <van-field v-model="form.phone" name="phone" type="tel" placeholder="请输入手机号" :rules="phoneRules"
                            clearable left-icon="phone-o" class="custom-field" />
                        <van-field v-model="form.password" :type="showPassword ? 'text' : 'password'" name="password"
                            placeholder="请输入密码" :rules="passwordRules" clearable left-icon="lock" class="custom-field">
                            <template #button>
                                <van-icon :name="showPassword ? 'eye-o' : 'closed-eye'" @click="toggleShowPassword"
                                    class="eye-icon" />
                            </template>
                        </van-field>
                    </div>

                    <div class="form-extra">
                        <div class="remember" @click="toggleRemember">
                            <van-checkbox v-model="remember" icon-size="16px">记住我</van-checkbox>
                        </div>
                        <div class="forgot-link" @click="forgotPassword">忘记密码？</div>
                    </div>

                    <div class="submit-wrap">
                        <van-button class="login-btn" block round type="primary" native-type="submit"
                            :loading="submitting" loading-text="登录中...">
                            登 录
                        </van-button>
                    </div>
                </van-form>
            </div>

            <div class="bottom-section">
                <div class="register-prompt">
                    还没有账号？<span class="link" @click="goRegister">立即注册</span>
                </div>
                <div class="agreements">
                    登录即表示同意 <span class="link" @click="openAgreement('user')">《用户协议》</span> 与
                    <span class="link" @click="openAgreement('privacy')">《隐私政策》</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { loginApi } from '@/api/auth'
import { useUserStore } from '@/stores/user'
import { closeToast, showFailToast, showLoadingToast, showSuccessToast, showToast } from 'vant'
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
    name: 'Login',
    setup() {
        const router = useRouter()
        const route = useRoute()
        const userStore = useUserStore()

        const submitting = ref(false)
        const showPassword = ref(false)
        const remember = ref(true)

        const form = reactive({
            phone: '',
            password: ''
        })

        // 读取记住的手机号
        const rememberedPhone = localStorage.getItem('remember_phone')
        if (rememberedPhone) form.phone = rememberedPhone

        const phoneRules = [
            { required: true, message: '请输入手机号' },
            {
                validator: (val) => /^1[3-9]\d{9}$/.test(val),
                message: '手机号格式不正确'
            }
        ]

        const passwordRules = [
            { required: true, message: '请输入密码' },
            {
                validator: (val) => val.length >= 6,
                message: '密码至少 6 位'
            }
        ]

        const validPhone = computed(() => /^1[3-9]\d{9}$/.test(form.phone))

        const toggleShowPassword = () => {
            showPassword.value = !showPassword.value
        }

        const toggleRemember = () => {
            remember.value = !remember.value
        }

        // 返回上一页或首页
        const goBack = () => {
            if (window.history.length > 1) {
                router.back()
            } else {
                router.replace('/home')
            }
        }

        // 安全重定向校验
        const getSafeRedirect = (val) => {
            let target = val
            if (Array.isArray(target)) target = target[0]
            if (typeof target !== 'string') return null
            if (!target.startsWith('/')) return null
            if (target.startsWith('//')) return null
            if (target === '/login' || target.startsWith('/login?')) return null
            const resolved = router.resolve(target)
            if (resolved?.name === 'Login') return null
            return target
        }

        // 已登录则跳转
        onMounted(() => {
            if (userStore?.token) {
                const raw = route.query?.redirect
                const target = getSafeRedirect(raw)
                router.replace(target || '/home')
            }
        })

        const onSubmit = async () => {
            if (!validPhone.value) {
                showToast('手机号无效')
                return
            }
            if (form.password.length < 6) {
                showToast('密码至少 6 位')
                return
            }
            submitting.value = true
            showLoadingToast({ message: '登录中...', duration: 0, forbidClick: true, loadingType: 'spinner' })
            try {
                const payload = { username: form.phone, password: form.password }
                const res = await loginApi(payload)
                if (!res || !res.token) throw new Error('登录返回异常')

                if (remember.value) {
                    localStorage.setItem('remember_phone', form.phone)
                } else {
                    localStorage.removeItem('remember_phone')
                }

                userStore.setToken(res.token)
                if (typeof res.expiresInMs === 'number' && res.expiresInMs > 0) {
                    const expAt = Date.now() + res.expiresInMs
                    localStorage.setItem('token_expires_at', String(expAt))
                } else {
                    localStorage.removeItem('token_expires_at')
                }

                const prev = userStore.user || {}
                userStore.setUser({
                    id: res.userId,
                    username: res.username || prev.username,
                    nickname: prev.nickname,
                    avatarUrl: prev.avatarUrl,
                    phone: form.phone || prev.phone,
                    roles: res.roles || prev.roles || [],
                    email: prev.email,
                    status: prev.status,
                })

                closeToast()
                showSuccessToast('登录成功')

                // 延迟跳转，让用户看到成功提示
                setTimeout(() => {
                    const rawRedirect = route.query?.redirect
                    const target = getSafeRedirect(rawRedirect)
                    if (target) {
                        router.replace(target)
                    } else {
                        router.replace('/home')
                    }
                }, 500)
            } catch (e) {
                closeToast()
                const msg = e?.response?.data?.message || e?.message || '登录失败，请稍后再试'
                showFailToast(msg)
            } finally {
                submitting.value = false
            }
        }

        const openAgreement = (type) => {
            showToast(type === 'user' ? '用户协议（占位）' : '隐私政策（占位）')
        }
        const forgotPassword = () => showToast('找回密码功能开发中')
        const goRegister = () => router.push('/register')

        onBeforeUnmount(() => { })

        return {
            form,
            phoneRules,
            passwordRules,
            submitting,
            showPassword,
            toggleShowPassword,
            remember,
            toggleRemember,
            onSubmit,
            openAgreement,
            forgotPassword,
            goRegister,
            goBack,
            showToast
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

/* 背景装饰圆 */
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
    right: -100px;
}

.circle-2 {
    width: 200px;
    height: 200px;
    bottom: 100px;
    left: -80px;
}

.circle-3 {
    width: 150px;
    height: 150px;
    bottom: -50px;
    right: 50px;
}

/* 透明导航栏 */
.transparent-nav {
    background: transparent !important;
}

.transparent-nav :deep(.van-nav-bar__content) {
    background: transparent;
}

.transparent-nav :deep(.van-icon) {
    color: #fff !important;
}

.page-wrapper {
    padding: 80px 24px 40px;
    max-width: 400px;
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
    margin-bottom: 32px;
}

.logo-icon {
    width: 80px;
    height: 80px;
    background: #fff;
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.brand-mark {
    font-size: 32px;
    font-weight: 800;
    color: #fff;
    letter-spacing: 1px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.slogan {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
    margin-top: 6px;
}

/* 登录卡片 */
.login-card {
    background: #fff;
    border-radius: 24px;
    padding: 32px 24px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.card-header {
    text-align: center;
    margin-bottom: 28px;
}

.card-title {
    font-size: 24px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 6px;
}

.card-subtitle {
    font-size: 14px;
    color: #888;
    margin: 0;
}

/* 输入框组 */
.input-group {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.custom-field {
    background: #f5f7fa;
    border-radius: 12px;
    overflow: hidden;
}

.custom-field :deep(.van-cell) {
    padding: 14px 16px;
    align-items: center;
}

.custom-field :deep(.van-field__body) {
    align-items: center;
}

.custom-field :deep(.van-field__left-icon) {
    margin-right: 12px;
    color: #764ba2;
    display: flex;
    align-items: center;
}

.custom-field :deep(.van-field__left-icon .van-icon) {
    font-size: 20px;
}

.custom-field :deep(.van-field__control) {
    font-size: 15px;
    line-height: 1.5;
}

.eye-icon {
    color: #999;
    font-size: 18px;
}

/* 表单额外选项 */
.form-extra {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    margin-bottom: 24px;
}

.remember :deep(.van-checkbox__label) {
    font-size: 13px;
    color: #666;
}

.forgot-link {
    font-size: 13px;
    color: #007aff;
    cursor: pointer;
}

/* 登录按钮 */
.login-btn {
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
}

/* 底部区域 */
.bottom-section {
    margin-top: auto;
    padding-top: 32px;
    text-align: center;
}

.register-prompt {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 16px;
}

.register-prompt .link {
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    text-decoration: underline;
}

.agreements {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.6;
}

.agreements .link {
    color: rgba(255, 255, 255, 0.9);
}

@media (max-width: 420px) {
    .page-wrapper {
        padding: 70px 20px 30px;
    }

    .brand-mark {
        font-size: 28px;
    }

    .login-card {
        padding: 24px 20px;
    }

    .card-title {
        font-size: 22px;
    }
}
</style>