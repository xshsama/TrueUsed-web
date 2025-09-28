<template>
    <div class="login-page">
        <div class="login-header">
            <van-nav-bar title="登录" left-arrow @click-left="$router.go(-1)" />
        </div>

        <div class="login-content">
            <div class="logo-section">
                <div class="app-logo">TrueUsed</div>
                <div class="app-desc">二手交易，真实可靠</div>
            </div>

            <van-form @submit="onSubmit">
                <van-cell-group>
                    <van-field v-model="form.phone" name="phone" label="手机号" placeholder="请输入手机号"
                        :rules="[{ required: true, message: '请输入手机号' }]" />
                    <van-field v-model="form.code" name="code" label="验证码" placeholder="请输入验证码"
                        :rules="[{ required: true, message: '请输入验证码' }]">
                        <template #button>
                            <van-button size="small" type="primary" @click="sendCode">
                                发送验证码
                            </van-button>
                        </template>
                    </van-field>
                </van-cell-group>

                <div class="login-btn">
                    <van-button type="primary" size="large" block native-type="submit">
                        登录
                    </van-button>
                </div>
            </van-form>

            <div class="login-tips">
                <p>登录即表示同意<span class="link">《用户协议》</span>和<span class="link">《隐私政策》</span></p>
            </div>
        </div>
    </div>
</template>

<script>
import { useUserStore } from '@/stores/user'
import { Toast } from 'vant'
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

export default {
    name: 'Login',
    setup() {
        const router = useRouter()
        const userStore = useUserStore()

        const form = reactive({
            phone: '',
            code: ''
        })

        const sendCode = () => {
            if (!form.phone) {
                Toast('请输入手机号')
                return
            }
            Toast.success('验证码已发送')
        }

        const onSubmit = () => {
            // 模拟登录
            Toast.loading({ message: '登录中...', duration: 0 })

            setTimeout(() => {
                Toast.clear()

                // 设置用户信息
                userStore.setUser({
                    id: 1,
                    name: '用户昵称',
                    phone: form.phone,
                    avatar: 'https://via.placeholder.com/80x80/4CAF50/ffffff?text=用户'
                })
                userStore.setToken('mock-token-123456')

                Toast.success('登录成功')

                // 跳转回之前的页面或首页
                router.back() || router.push('/home')
            }, 2000)
        }

        return {
            form,
            sendCode,
            onSubmit
        }
    }
}
</script>

<style scoped>
.login-page {
    min-height: 100vh;
    background-color: #f7f8fa;
}

.login-content {
    padding: 40px 20px;
}

.logo-section {
    text-align: center;
    margin-bottom: 60px;
}

.app-logo {
    font-size: 36px;
    font-weight: bold;
    color: #1989fa;
    margin-bottom: 8px;
}

.app-desc {
    font-size: 14px;
    color: #969799;
}

.login-btn {
    margin-top: 40px;
}

.login-tips {
    margin-top: 20px;
    text-align: center;
}

.login-tips p {
    font-size: 12px;
    color: #969799;
    line-height: 1.5;
}

.link {
    color: #1989fa;
}
</style>