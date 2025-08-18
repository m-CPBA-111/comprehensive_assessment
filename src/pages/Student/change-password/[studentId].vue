<template>
  <div class="password-change-page">
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
            class="password-card" 
            elevation="24" 
            rounded="xl"
            :loading="isLoading"
          >
            <!-- 卡片头部 -->
            <div class="card-header">
              <div class="header-icon">
                <v-icon size="48" color="primary">mdi-shield-lock</v-icon>
              </div>
              <h1 class="page-title">修改初始密码</h1>
              <p class="page-subtitle">为了账户安全，请设置新的登录密码</p>
            </div>

            <!-- 学生信息展示 -->
            <v-card-text class="student-info-section">
              <v-chip-group>
                <v-chip color="primary" variant="outlined" prepend-icon="mdi-account">
                  {{ name || '学生' }}
                </v-chip>
                <v-chip color="secondary" variant="outlined" prepend-icon="mdi-school">
                  {{ studentClass || '班级' }}
                </v-chip>
                <v-chip color="info" variant="outlined" prepend-icon="mdi-identifier">
                  {{ studentId }}
                </v-chip>
              </v-chip-group>
            </v-card-text>

            <!-- 表单区域 -->
            <v-card-text class="form-section">
              <v-form @submit.prevent="handleChangePassword" ref="passwordForm">
                <!-- 原密码 -->
                <v-text-field
                  v-model="oldPassword"
                  label="原密码"
                  :type="showOldPassword ? 'text' : 'password'"
                  :append-inner-icon="showOldPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showOldPassword = !showOldPassword"
                  required
                  :rules="oldPasswordRules"
                  prepend-inner-icon="mdi-lock-open"
                  variant="outlined"
                  class="password-field"
                  :disabled="isLoading"
                  @input="clearMessage"
                  placeholder="请输入原密码"
                ></v-text-field>

                <!-- 新密码 -->
                <v-text-field
                  v-model="newPassword"
                  label="新密码"
                  :type="showNewPassword ? 'text' : 'password'"
                  :append-inner-icon="showNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showNewPassword = !showNewPassword"
                  required
                  :rules="newPasswordRules"
                  prepend-inner-icon="mdi-lock-plus"
                  variant="outlined"
                  class="password-field"
                  :disabled="isLoading"
                  @input="checkPasswordStrength"
                  placeholder="请输入新密码"
                ></v-text-field>

                <!-- 密码强度指示器 -->
                <div v-if="newPassword" class="password-strength">
                  <div class="strength-label">
                    <span>密码强度：</span>
                    <span :class="strengthClass">{{ strengthText }}</span>
                  </div>
                  <v-progress-linear
                    :model-value="strengthScore"
                    :color="strengthColor"
                    height="8"
                    rounded
                    class="strength-bar"
                  ></v-progress-linear>
                  <div class="strength-tips">
                    <v-icon size="16" :color="hasLength ? 'success' : 'grey'">mdi-check-circle</v-icon>
                    <span>至少6位</span>
                    <v-icon size="16" :color="hasUppercase ? 'success' : 'grey'" class="ml-2">mdi-check-circle</v-icon>
                    <span>包含大写字母</span>
                    <v-icon size="16" :color="hasLowercase ? 'success' : 'grey'" class="ml-2">mdi-check-circle</v-icon>
                    <span>包含小写字母</span>
                    <v-icon size="16" :color="hasNumber ? 'success' : 'grey'" class="ml-2">mdi-check-circle</v-icon>
                    <span>包含数字</span>
                  </div>
                </div>

                <!-- 确认新密码 -->
                <v-text-field
                  v-model="confirmPassword"
                  label="确认新密码"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showConfirmPassword = !showConfirmPassword"
                  required
                  :rules="confirmPasswordRules"
                  prepend-inner-icon="mdi-lock-check"
                  variant="outlined"
                  class="password-field"
                  :disabled="isLoading"
                  @input="clearMessage"
                  placeholder="请再次输入新密码"
                ></v-text-field>

                <!-- 提示信息 -->
                <v-alert
                  v-if="msg"
                  :type="msgType"
                  variant="tonal"
                  class="mt-4"
                  :icon="msgType === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle'"
                  closable
                  @click:close="clearMessage"
                >
                  {{ msg }}
                </v-alert>
              </v-form>
            </v-card-text>

            <!-- 操作按钮 -->
            <v-card-actions class="action-section">
              <v-btn
                color="secondary"
                variant="outlined"
                size="large"
                @click="goBack"
                :disabled="isLoading"
                class="action-btn"
                prepend-icon="mdi-arrow-left"
              >
                返回
              </v-btn>
              <v-btn
                color="primary"
                size="large"
                @click="handleChangePassword"
                :loading="isLoading"
                :disabled="!canSubmit"
                class="action-btn submit-btn"
                prepend-icon="mdi-content-save"
              >
                {{ isLoading ? '修改中...' : '保存修改' }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

// 路由参数与实例
const route = useRoute();
const router = useRouter();
const studentId = String(route.params.studentId);
const name = route.query.name;
const studentClass = route.query.class;

// 表单数据
const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const msg = ref('');
const msgType = ref('info');
const isLoading = ref(false);

// 密码可见性控制
const showOldPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// 表单引用
const passwordForm = ref(null);

// 密码强度相关
const strengthScore = ref(0);
const strengthText = ref('');
const strengthColor = ref('error');
const strengthClass = ref('');

// 密码规则检查
const hasLength = computed(() => newPassword.value.length >= 6);
const hasUppercase = computed(() => /[A-Z]/.test(newPassword.value));
const hasLowercase = computed(() => /[a-z]/.test(newPassword.value));
const hasNumber = computed(() => /\d/.test(newPassword.value));

// 表单验证规则
const oldPasswordRules = [
  v => !!v || '原密码不能为空',
  v => v.length >= 1 || '请输入原密码'
];

const newPasswordRules = [
  v => !!v || '新密码不能为空',
  v => v.length >= 6 || '密码长度至少6位',
  v => /[A-Z]/.test(v) || '密码必须包含大写字母',
  v => /[a-z]/.test(v) || '密码必须包含小写字母',
  v => /\d/.test(v) || '密码必须包含数字'
];

const confirmPasswordRules = [
  v => !!v || '请确认新密码',
  v => v === newPassword.value || '两次输入的密码不一致'
];

// 计算属性：是否可以提交
const canSubmit = computed(() => {
  return oldPassword.value && 
         newPassword.value && 
         confirmPassword.value && 
         newPassword.value === confirmPassword.value &&
         strengthScore.value >= 60;
});

// 检查密码强度
const checkPasswordStrength = () => {
  if (!newPassword.value) {
    strengthScore.value = 0;
    strengthText.value = '';
    return;
  }

  let score = 0;
  const password = newPassword.value;

  // 长度评分
  if (password.length >= 6) score += 20;
  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 10;

  // 字符类型评分
  if (/[A-Z]/.test(password)) score += 20;
  if (/[a-z]/.test(password)) score += 20;
  if (/\d/.test(password)) score += 20;
  if (/[^A-Za-z0-9]/.test(password)) score += 10;

  strengthScore.value = Math.min(score, 100);

  // 设置强度文本和颜色
  if (strengthScore.value < 40) {
    strengthText.value = '弱';
    strengthColor.value = 'error';
    strengthClass.value = 'text-error';
  } else if (strengthScore.value < 70) {
    strengthText.value = '中等';
    strengthColor.value = 'warning';
    strengthClass.value = 'text-warning';
  } else {
    strengthText.value = '强';
    strengthColor.value = 'success';
    strengthClass.value = 'text-success';
  }
};

// 清除消息
const clearMessage = () => {
  if (msg.value) {
    msg.value = '';
  }
};

// 返回上一页
const goBack = () => {
  router.push({ 
    path: '/Student/login'
  });
};

// 密码修改逻辑
const handleChangePassword = async () => {
  try {
    // 先进行表单验证
    const { valid } = await passwordForm.value.validate();
    if (!valid) {
      return;
    }

    // 检查密码是否相同
    if (oldPassword.value === newPassword.value) {
      msg.value = '新密码不能与原密码相同';
      msgType.value = 'warning';
      return;
    }

    isLoading.value = true;
    clearMessage();

    const res = await axios.post(
      'http://localhost:5000/api/student/change-password',
      {
        studentId,
        oldPassword: oldPassword.value,
        newPassword: newPassword.value
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10秒超时
      }
    );

    if (res.data.success) {
      msg.value = '密码修改成功！即将跳转到仪表板...';
      msgType.value = 'success';
      
      // 延迟跳转，让用户看到成功消息
      setTimeout(() => {
        router.push({
          path: '/Student/dashboard',
          query: { 
            studentId, 
            name, 
            class: studentClass 
          }
        });
      }, 2000);
    } else {
      msg.value = res.data.msg || '修改失败，请检查原密码';
      msgType.value = 'error';
    }
  } catch (err) {
    console.error('密码修改错误:', err);
    
    if (err.code === 'ECONNABORTED') {
      msg.value = '请求超时，请检查网络连接';
    } else if (err.response) {
      // 服务器返回错误状态码
      const status = err.response.status;
      if (status === 400) {
        msg.value = '请求参数错误，请检查输入';
      } else if (status === 401) {
        msg.value = '原密码错误，请重新输入';
      } else if (status === 500) {
        msg.value = '服务器内部错误，请稍后重试';
      } else {
        msg.value = `请求失败 (${status})，请稍后重试`;
      }
    } else if (err.request) {
      // 网络错误
      msg.value = '网络连接失败，请检查网络设置';
    } else {
      // 其他错误
      msg.value = '发生未知错误，请稍后重试';
    }
    
    msgType.value = 'error';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.password-change-page {
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

.password-card {
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

.student-info-section {
  padding: 1rem 2rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.form-section {
  padding: 2rem;
}

.password-field {
  margin-bottom: 1.5rem;
}

.password-strength {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.strength-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.strength-bar {
  margin-bottom: 0.5rem;
}

.strength-tips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.875rem;
  color: #6c757d;
}

.action-section {
  padding: 1.5rem 2rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.action-btn {
  flex: 1;
  height: 48px;
  font-weight: 600;
  text-transform: none;
  border-radius: 12px;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
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
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
  
  .strength-tips {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* 动画效果 */
.password-card {
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
.password-field :deep(.v-field--focused) {
  transform: scale(1.02);
  transition: transform 0.2s ease;
}

/* 按钮悬停效果 */
.action-btn {
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
}

/* 成功状态样式 */
.text-success {
  color: #28a745 !important;
}

.text-warning {
  color: #ffc107 !important;
}

.text-error {
  color: #dc3545 !important;
}

/* 密码强度提示样式优化 */
.strength-tips .v-icon {
  margin-right: 4px;
}

.strength-tips span {
  margin-right: 12px;
  white-space: nowrap;
}

/* 表单字段焦点效果增强 */
.password-field :deep(.v-field--focused) {
  transform: scale(1.02);
  transition: transform 0.2s ease;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

/* 加载状态优化 */
.password-card :deep(.v-card__loader) {
  background: rgba(102, 126, 234, 0.1);
}

/* 响应式优化 */
@media (max-width: 480px) {
  .page-title {
    font-size: 1.25rem;
  }
  
  .page-subtitle {
    font-size: 0.875rem;
  }
  
  .strength-tips {
    font-size: 0.75rem;
  }
}
</style>