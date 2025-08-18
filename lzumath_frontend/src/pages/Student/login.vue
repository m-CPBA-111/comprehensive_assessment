<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>
    </div>

    <v-container class="fill-height" fluid>
      <v-row justify="center" align="center">
        <v-col cols="12" sm="10" md="8" lg="6" xl="4">
          <!-- 主卡片 -->
          <v-card 
            class="login-card" 
            elevation="24" 
            rounded="xl"
            :loading="isLoading"
          >
            <!-- 卡片头部 -->
            <div class="card-header">
              <div class="header-icon">
                <v-icon size="48" color="primary">mdi-school</v-icon>
              </div>
              <h1 class="page-title">学生综合测评系统</h1>
              <p class="page-subtitle">请使用校园卡号和密码登录系统</p>
            </div>

            <!-- 表单区域 -->
            <v-card-text class="form-section">
              <v-form @submit.prevent="handleLogin" ref="loginForm">
                <!-- 学号输入 -->
                <v-text-field
                  v-model="studentId"
                  label="校园卡号"
                  type="text"
                  required
                  :rules="studentIdRules"
                  prepend-inner-icon="mdi-account"
                  variant="outlined"
                  class="login-field"
                  :disabled="isLoading"
                  @input="clearMessage"
                  @keyup.enter="handleLogin"
                  placeholder="请输入学号"
                  autocomplete="username"
                  :maxlength="20"
                ></v-text-field>

                <!-- 密码输入 -->
                <v-text-field
                  v-model="password"
                  label="密码"
                  :type="showPassword ? 'text' : 'password'"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showPassword = !showPassword"
                  required
                  :rules="passwordRules"
                  prepend-inner-icon="mdi-lock"
                  variant="outlined"
                  class="login-field"
                  :disabled="isLoading"
                  @input="clearMessage"
                  @keyup.enter="handleLogin"
                  placeholder="请输入密码"
                  autocomplete="current-password"
                  :maxlength="50"
                ></v-text-field>

                <!-- 提示信息 -->
                <v-alert
                  v-if="errorMsg"
                  type="error"
                  variant="tonal"
                  class="mt-4"
                  icon="mdi-alert-circle"
                  closable
                  @click:close="clearMessage"
                >
                  {{ errorMsg }}
                </v-alert>

                <!-- 网络状态提示 -->
                <v-alert
                  v-if="!isOnline"
                  type="warning"
                  variant="tonal"
                  class="mt-4"
                  icon="mdi-wifi-off"
                  dense
                >
                  网络连接已断开，请检查网络设置
                </v-alert>
              </v-form>
            </v-card-text>

            <!-- 操作按钮 -->
            <v-card-actions class="action-section">
              <v-btn
                color="primary"
                size="large"
                @click="handleLogin"
                :loading="isLoading"
                :disabled="!canSubmit || !isOnline"
                class="action-btn submit-btn"
                prepend-icon="mdi-login"
                block
              >
                {{ isLoading ? '登录中...' : '登录' }}
              </v-btn>
            </v-card-actions>

            <!-- 系统信息 -->
            <v-card-text class="system-info">
              <div class="info-item">
                <v-icon size="16" color="info">mdi-information</v-icon>
                <span>首次登录将跳转至密码修改页面</span>
              </div>
              <div class="info-item">
                <v-icon size="16" color="success">mdi-shield-check</v-icon>
                <span>系统采用安全加密传输</span>
              </div>
              <div class="info-item">
                <v-icon size="16" color="primary">mdi-keyboard</v-icon>
                <span>支持回车键快速登录</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

// 路由实例
const router = useRouter();

// 表单数据
const studentId = ref('');
const password = ref('');
const errorMsg = ref('');
const isLoading = ref(false);
const isOnline = ref(navigator.onLine);

// 密码可见性控制
const showPassword = ref(false);

// 表单引用
const loginForm = ref(null);

// 网络状态监听
const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine;
  if (!isOnline.value) {
    errorMsg.value = '网络连接已断开，请检查网络设置';
  } else {
    clearMessage();
  }
};

// 表单验证规则
const studentIdRules = [
  v => !!v || '学号不能为空',
  v => v.length >= 6 || '学号长度至少6位',
  v => v.length <= 20 || '学号长度不能超过20位',
  v => /^[0-9]+$/.test(v) || '学号只能包含数字'
];

const passwordRules = [
  v => !!v || '密码不能为空',
  v => v.length >= 1 || '请输入密码',
  v => v.length <= 50 || '密码长度不能超过50位'
];

// 计算属性：是否可以提交
const canSubmit = computed(() => {
  return studentId.value.trim() && password.value.trim() && isOnline.value;
});

// 清除消息
const clearMessage = () => {
  if (errorMsg.value) {
    errorMsg.value = '';
  }
};

// 登录逻辑
const handleLogin = async () => {
  try {
    // 检查网络状态
    if (!isOnline.value) {
      errorMsg.value = '网络连接已断开，请检查网络设置';
      return;
    }

    // 先进行表单验证
    const { valid } = await loginForm.value.validate();
    if (!valid) {
      return;
    }

    // 检查输入内容
    if (!studentId.value.trim() || !password.value.trim()) {
      errorMsg.value = '请填写完整的登录信息';
      return;
    }

    isLoading.value = true;
    clearMessage();

    const res = await axios.post(
      'http://localhost:5000/api/student/login',
      { 
        studentId: studentId.value.trim(), 
        password: password.value.trim() 
      },
      { 
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000 // 10秒超时
      }
    );

    if (res.data.success) {
      // 打印学号用于调试
      console.log('登录成功，学号为:', studentId.value);
      const { name, class: studentClass } = res.data;
      
      // 首次登录跳转至修改密码页，否则进入综测界面
      if (res.data.isFirstLogin) {
        // 使用query传参
        router.push({
          path: `/Student/change-password/${studentId.value}`,
          query: { name, class: studentClass }
        });
      } else {
        // 使用query传参
        router.push({
          path: '/Student/dashboard',
          query: { studentId: studentId.value, name, class: studentClass }
        });
      }
    } else {
      errorMsg.value = res.data.msg || '登录失败，请检查账号密码';
    }
  } catch (err) {
    console.error('登录错误:', err);
    
    if (err.code === 'ECONNABORTED') {
      errorMsg.value = '请求超时，请检查网络连接';
    } else if (err.response) {
      // 服务器返回错误状态码
      const status = err.response.status;
      if (status === 400) {
        errorMsg.value = '请求参数错误，请检查输入';
      } else if (status === 401) {
        errorMsg.value = '学号或密码错误，请重新输入';
      } else if (status === 403) {
        errorMsg.value = '账户已被禁用，请联系管理员';
      } else if (status === 429) {
        errorMsg.value = '登录尝试过于频繁，请稍后重试';
      } else if (status === 500) {
        errorMsg.value = '服务器内部错误，请稍后重试';
      } else if (status === 503) {
        errorMsg.value = '服务暂时不可用，请稍后重试';
      } else {
        errorMsg.value = `请求失败 (${status})，请稍后重试`;
      }
    } else if (err.request) {
      // 网络错误
      errorMsg.value = '网络连接失败，请检查网络设置';
    } else {
      // 其他错误
      errorMsg.value = '发生未知错误，请稍后重试';
    }
  } finally {
    isLoading.value = false;
  }
};

// 生命周期钩子
onMounted(() => {
  // 添加网络状态监听
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // 初始化网络状态
  updateOnlineStatus();
});

onUnmounted(() => {
  // 移除网络状态监听
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
});
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.circle-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
}

.card-header {
  text-align: center;
  padding: 2rem 2rem 1rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 16px 16px 0 0;
}

.header-icon {
  margin-bottom: 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-family: 'Google Sans', sans-serif;
}

.page-subtitle {
  color: #7f8c8d;
  font-size: 1rem;
  margin: 0;
}

.form-section {
  padding: 2rem;
}

.login-field {
  margin-bottom: 1.5rem;
}

.action-section {
  padding: 1.5rem 2rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.action-btn {
  height: 48px;
  font-weight: 600;
  text-transform: none;
  border-radius: 12px;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.system-info {
  padding: 1rem 2rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #6c757d;
}

.info-item:last-child {
  margin-bottom: 0;
}

/* 响应式设计 */
@media (max-width: 600px) {
  .card-header {
    padding: 1.5rem 1rem 1rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .form-section {
    padding: 1.5rem 1rem;
  }
  
  .action-section {
    padding: 1rem;
  }
  
  .system-info {
    padding: 1rem;
  }
}

/* 动画效果 */
.login-card {
  animation: slideIn 0.6s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 表单字段焦点效果 */
.login-field :deep(.v-field--focused) {
  transform: scale(1.02);
  transition: transform 0.2s ease;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

/* 按钮悬停效果 */
.action-btn {
  transition: all 0.3s ease;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

/* 加载状态优化 */
.login-card :deep(.v-card__loader) {
  background: rgba(102, 126, 234, 0.1);
}

/* 输入框优化 */
.login-field :deep(.v-field__input) {
  font-size: 1rem;
}

.login-field :deep(.v-field__outline) {
  border-radius: 8px;
}

/* 响应式优化 */
@media (max-width: 480px) {
  .page-title {
    font-size: 1.25rem;
  }
  
  .page-subtitle {
    font-size: 0.875rem;
  }
  
  .info-item {
    font-size: 0.75rem;
  }
  
  .login-field :deep(.v-field__input) {
    font-size: 0.875rem;
  }
}

/* 无障碍优化 */
.login-field :deep(.v-field__label) {
  font-weight: 500;
}

.login-field :deep(.v-field--focused .v-field__label) {
  color: #667eea;
}

/* 错误状态样式 */
.login-field :deep(.v-field--error) {
  border-color: #dc3545;
}

.login-field :deep(.v-field--error .v-field__label) {
  color: #dc3545;
}
</style>