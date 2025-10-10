<template>
    <div class="login-page">
        <van-nav-bar title="登录" fixed left-arrow @click-left="$router.go(-1)" />
        <div class="page-wrapper">
            <div class="logo-block">
                <div class="brand-mark">TrueUsed</div>
                <p class="slogan">二手交易 · 真实可靠</p>
            </div>

            <div class="login-card">
                <van-form @submit="onSubmit">
                    <van-cell-group inset>
                        <van-field v-model="form.phone" name="phone" type="tel" label="手机号" placeholder="请输入手机号"
                            :rules="phoneRules" clearable />
                        <van-field v-model="form.password" :type="showPassword ? 'text' : 'password'" name="password"
                            label="密码" placeholder="请输入密码" :rules="passwordRules" clearable>
                            <template #button>
                                <van-icon :name="showPassword ? 'eye-o' : 'closed-eye'" @click="toggleShowPassword" />
                            </template>
                        </van-field>
                    </van-cell-group>

                    <div class="form-extra between">
                        <div class="remember" @click="toggleRemember">
                            <van-icon :name="remember ? 'checked' : 'circle'" />
                            <span class="remember-text">记住我</span>
                        </div>
                        <div class="switch-login link" @click="forgotPassword">找回密码</div>
                    </div>

                    <div class="submit-wrap">
                        <van-button class="gradient-btn" block round type="primary" native-type="submit"
                            :loading="submitting">
                            {{ submitting ? '登录中...' : '登录' }}
                        </van-button>
                    </div>
                </van-form>

                <div class="agreements">
                    登录即表示同意 <span class="link" @click="openAgreement('user')">《用户协议》</span> 与 <span class="link"
                        @click="openAgreement('privacy')">《隐私政策》</span>
                </div>
            </div>

            <div class="bottom-links">
                <span class="link" @click="goRegister">注册账号</span>
                <span class="divider">|</span>
                <span class="link" @click="goHelp">遇到问题</span>
            </div>
        </div>
    </div>
</template>

<script>
import { loginApi } from '@/api/auth'
import { useUserStore } from '@/stores/user'
import { closeToast, showFailToast, showLoadingToast, showSuccessToast, showToast } from 'vant'
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
    name: 'Login',
    setup() {
        const router = useRouter()
        const userStore = useUserStore()

        const submitting = ref(false)
        const showPassword = ref(false)
        const remember = ref(true)

        const form = reactive({
            phone: '',
            password: ''
        })

        // 读取记住的手机号（可扩展为 localStorage 存密码哈希，这里仅手机号）
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

        // API 已通过静态导入

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
                // 后端定义 LoginRequest: { username, password }
                const payload = { username: form.phone, password: form.password }
                const res = await loginApi(payload)
                // res 结构: { userId, username, token, expiresInMs, roles }
                if (!res || !res.token) throw new Error('登录返回异常')

                // 记住手机号
                if (remember.value) {
                    localStorage.setItem('remember_phone', form.phone)
                } else {
                    localStorage.removeItem('remember_phone')
                }

                userStore.setToken(res.token)
                userStore.setUser({
                    id: res.userId,
                    name: res.username,
                    phone: form.phone,
                    roles: res.roles || [],
                })

                showSuccessToast('登录成功')

                const redirect = router.currentRoute.value.query?.redirect
                if (redirect) {
                    router.replace(redirect)
                } else {
                    router.back() || router.push('/home')
                }
            } catch (e) {
                const msg = e?.response?.data?.message || e?.message || '登录失败，请稍后再试'
                showFailToast(msg)
            } finally {
                submitting.value = false
                closeToast()
            }
        }

        const openAgreement = (type) => {
            showToast(type === 'user' ? '用户协议（占位）' : '隐私政策（占位）')
        }
        const forgotPassword = () => showToast('找回密码（占位）')
        const goRegister = () => router.push('/register')
        const goHelp = () => showToast('帮助中心（占位）')

        onBeforeUnmount(() => {
            // 清理可能的计时器（虽然当前无倒计时，留作扩展安全）
        })

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
            goHelp
        }
    }
}
</script>

<style scoped>
.login-page {
    min-height: 100vh;
    background: #f5f7fa;
}

.page-wrapper {
    padding: 70px 20px 40px;
    /* 预留 NavBar 高度 */
    max-width: 520px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 26px;
}

.logo-block {
    text-align: center;
    margin-top: 10px;
}

.brand-mark {
    font-size: 40px;
    font-weight: 800;
    background: linear-gradient(120deg, #007AFF, #3296ff);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    letter-spacing: 1px;
}

.slogan {
    font-size: 14px;
    color: #6b7075;
    margin-top: 6px;
}

.login-card {
    background: #fff;
    border-radius: 22px;
    padding: 26px 24px 32px;
    box-shadow: 0 6px 22px -8px rgba(0, 0, 0, .12);
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.form-extra {
    margin-top: 4px;
    display: flex;
    justify-content: flex-end;
    font-size: 12px;
    color: #666;
}

.form-extra.between {
    justify-content: space-between;
    align-items: center;
}

.remember {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    color: #444;
}

.remember-text {
    font-size: 12px;
}

.switch-login {
    cursor: pointer;
    color: #007aff;
}

.submit-wrap {
    margin-top: 8px;
}

.gradient-btn {
    background: linear-gradient(135deg, #007AFF, #3296ff);
    border: none;
}

.agreements {
    font-size: 12px;
    color: #888;
    line-height: 1.6;
    text-align: center;
    margin-top: 4px;
}

.agreements .link {
    color: #007aff;
}

.bottom-links {
    text-align: center;
    font-size: 13px;
    color: #666;
}

.bottom-links .link {
    color: #007aff;
    cursor: pointer;
}

.bottom-links .divider {
    margin: 0 10px;
    color: #bbb;
}

/* 优化表单内元素 */
:deep(.van-field__label) {
    width: 60px;
}

:deep(.van-cell-group--inset) {
    margin: 0;
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 2px 10px -4px rgba(0, 0, 0, .08);
}

:deep(.van-field) {
    background: #fff;
}

:deep(.van-button[disabled]) {
    opacity: .6;
}

@media (max-width: 420px) {
    .brand-mark {
        font-size: 34px;
    }

    .login-card {
        padding: 22px 18px 28px;
    }
}
</style>