<template>
    <div class="register-page">
        <van-nav-bar title="注册" fixed left-arrow @click-left="$router.go(-1)" />
        <div class="page-wrapper">
            <div class="logo-block">
                <div class="brand-mark">TrueUsed</div>
                <p class="slogan">创建你的真实二手账户</p>
            </div>

            <div class="register-card">
                <van-form @submit="onSubmit">
                    <van-cell-group inset>
                        <van-field v-model="form.phone" name="phone" type="tel" label="手机号" placeholder="请输入手机号"
                            :rules="phoneRules" clearable />
                        <van-field v-model="form.password" :type="showPassword ? 'text' : 'password'" name="password"
                            label="密码" placeholder="设置登录密码" :rules="passwordRules" clearable>
                            <template #button>
                                <van-icon :name="showPassword ? 'eye-o' : 'closed-eye'" @click="toggleShowPassword" />
                            </template>
                        </van-field>
                        <van-field v-model="form.confirm" :type="showConfirm ? 'text' : 'password'" name="confirm"
                            label="确认密码" placeholder="再次输入密码" :rules="confirmRules" clearable>
                            <template #button>
                                <van-icon :name="showConfirm ? 'eye-o' : 'closed-eye'" @click="toggleShowConfirm" />
                            </template>
                        </van-field>
                    </van-cell-group>

                    <div class="agreements-check" @click="toggleAgree">
                        <van-icon :name="agreed ? 'checked' : 'circle'" />
                        <span>我已阅读并同意 <span class="link" @click.stop="openAgreement('user')">《用户协议》</span> 与 <span
                                class="link" @click.stop="openAgreement('privacy')">《隐私政策》</span></span>
                    </div>

                    <div class="submit-wrap">
                        <van-button class="gradient-btn" block round type="primary" native-type="submit"
                            :loading="submitting" :disabled="!agreed">{{ submitting ? '创建中...' : '立即注册' }}</van-button>
                    </div>
                </van-form>

                <div class="to-login">已有账号？<span class="link" @click="goLogin">去登录</span></div>
            </div>
        </div>
    </div>
</template>

<script>
import { Toast } from 'vant';
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
            phone: '',
            password: '',
            confirm: ''
        })

        const phoneRules = [
            { required: true, message: '请输入手机号' },
            { validator: v => /^1[3-9]\d{9}$/.test(v), message: '手机号格式不正确' }
        ]

        const passwordRules = [
            { required: true, message: '请输入密码' },
            { validator: v => v.length >= 6, message: '密码至少 6 位' }
        ]

        const confirmRules = [
            { required: true, message: '请再次输入密码' },
            { validator: v => v === form.password, message: '两次输入不一致' }
        ]

        const valid = computed(() => /^1[3-9]\d{9}$/.test(form.phone) && form.password.length >= 6 && form.password === form.confirm && agreed.value)

        const toggleShowPassword = () => { showPassword.value = !showPassword.value }
        const toggleShowConfirm = () => { showConfirm.value = !showConfirm.value }
        const toggleAgree = () => { agreed.value = !agreed.value }

        const openAgreement = (type) => {
            Toast(type === 'user' ? '用户协议（占位）' : '隐私政策（占位）')
        }

        const simulateRegister = () => new Promise(resolve => setTimeout(resolve, 1400))

        const onSubmit = async () => {
            if (!valid.value) {
                Toast('请完整填写信息并同意协议')
                return
            }
            submitting.value = true
            Toast.loading({ message: '创建账号...', duration: 0, forbidClick: true })
            try {
                await simulateRegister()
                Toast.success('注册成功')
                router.replace('/login')
            } catch (e) {
                Toast.fail('注册失败，请稍后再试')
            } finally {
                submitting.value = false
                Toast.clear()
            }
        }

        const goLogin = () => router.push('/login')

        return {
            form,
            phoneRules,
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
    background: #f5f7fa;
}

.page-wrapper {
    padding: 70px 20px 40px;
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

.register-card {
    background: #fff;
    border-radius: 22px;
    padding: 26px 24px 32px;
    box-shadow: 0 6px 22px -8px rgba(0, 0, 0, .12);
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.agreements-check {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    font-size: 12px;
    line-height: 1.5;
    color: #555;
    cursor: pointer;
}

.agreements-check .link {
    color: #007aff;
}

.submit-wrap {
    margin-top: 4px;
}

.gradient-btn {
    background: linear-gradient(135deg, #007AFF, #3296ff);
    border: none;
}

.to-login {
    text-align: center;
    font-size: 13px;
    color: #666;
}

.to-login .link {
    color: #007aff;
    cursor: pointer;
}

:deep(.van-field__label) {
    width: 70px;
}

:deep(.van-cell-group--inset) {
    margin: 0;
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 2px 10px -4px rgba(0, 0, 0, .08);
}

@media (max-width:420px) {
    .brand-mark {
        font-size: 34px;
    }

    .register-card {
        padding: 22px 18px 28px;
    }
}
</style>
