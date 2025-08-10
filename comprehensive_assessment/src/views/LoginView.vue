<template>
  <div class="lzu-login-container">
    <!-- 左侧背景图片区域 -->
    <div class="left-section">
      <div class="left-content">
        <!-- 背景建筑图片 -->
        <div class="building-background">
          <img :src="traditionalBuildingImg" alt="兰州大学建筑" class="building-image">
          
          <!-- 兰州大学Logo悬浮在图片上 -->
          <div class="university-header">
            <div class="logo-container">
              <img src="@/assets/lzu-logo.svg" alt="兰州大学" class="lzu-logo">
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 右侧登录表单区域 -->
    <div class="right-section">
      <div class="login-form-container">
        <!-- 系统标题 -->
        <div class="system-header">
          <h2 class="system-title">综测系统</h2>
          <p class="system-subtitle">综合素质测评管理平台</p>
        </div>
        
        <!-- 登录选项卡 -->
        <div class="login-tabs">
          <div class="tab-item active">账号登录</div>
          <div class="tab-item">扫码登录</div>
        </div>
        
        <!-- 登录表单 -->
        <div class="form-section">
          <v-form @submit.prevent="handleLogin" class="login-form">
            <div class="form-group">
              <label class="form-label">学号/职工号/手机号</label>
              <v-text-field
                v-model="campusId"
                variant="outlined"
                hide-details="auto"
                required
                :rules="[v => !!v || '请输入学号/职工号/手机号']"
                class="lzu-input"
                size="large"
                density="comfortable"
              >
                <template v-slot:append-inner>
                  <v-icon>mdi-close-circle</v-icon>
                </template>
              </v-text-field>
            </div>
            
            <div class="form-group">
              <label class="form-label">密码</label>
              <v-text-field
                v-model="password"
                variant="outlined"
                hide-details="auto"
                :type="showPassword ? 'text' : 'password'"
                required
                :rules="[v => !!v || '请输入密码']"
                class="lzu-input"
                size="large"
                density="comfortable"
              >
                <template v-slot:append-inner>
                  <v-icon @click="showPassword = !showPassword">
                    {{ showPassword ? 'mdi-eye-off' : 'mdi-eye' }}
                  </v-icon>
                </template>
              </v-text-field>
            </div>
            
            <div class="form-options">
              <label class="remember-checkbox">
                <input type="checkbox" v-model="rememberMe">
                记住账号
              </label>
              <a href="#" class="forgot-password">忘记密码</a>
            </div>
            
            <v-alert
              v-if="error"
              type="error"
              variant="tonal"
              class="mb-4"
              closable
              @click:close="clearError"
            >
              {{ error }}
            </v-alert>
            
            <v-btn
              :loading="loading"
              :disabled="loading"
              type="submit"
              color="#1E4B8C"
              block
              size="large"
              class="login-btn"
            >
              登录
            </v-btn>
          </v-form>
        </div>
        
        <!-- 底部信息 -->
        <div class="footer-info">
          <p>© 23级数学基地班科研小组版权所有</p>
        </div>
      </div>
    </div>
    
    <!-- 密码修改对话框 -->
    <v-dialog v-model="showPasswordChangeDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="text-h5 text-center">修改密码</v-card-title>
        <v-card-text>
          <p class="mb-4 text-center text-orange">您正在使用默认密码，为了您的账户安全，请及时修改密码。</p>
          <v-form>
            <v-text-field
              v-model="oldPassword"
              label="当前密码"
              type="password"
              variant="outlined"
              required
              :rules="[v => !!v || '请输入当前密码']"
              class="mb-3"
            ></v-text-field>
            <v-text-field
              v-model="newPassword"
              label="新密码"
              type="password"
              variant="outlined"
              required
              :rules="[v => !!v || '请输入新密码', v => v.length >= 6 || '密码长度至少6位']"
              class="mb-3"
            ></v-text-field>
            <v-text-field
              v-model="confirmPassword"
              label="确认新密码"
              type="password"
              variant="outlined"
              required
              :rules="[v => !!v || '请确认新密码', v => v === newPassword || '两次输入的密码不一致']"
              class="mb-3"
            ></v-text-field>
            <v-alert
              v-if="passwordChangeError"
              type="error"
              variant="tonal"
              class="mb-3"
            >
              {{ passwordChangeError }}
            </v-alert>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn
            color="#1E4B8C"
            :loading="passwordChangeLoading"
            @click="handlePasswordChange"
          >
            确认修改
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { databaseService } from '@/services/api';
import traditionalBuildingImg from '@/assets/traditional-building.svg';

const campusId = ref('');
const password = ref('');
const showPassword = ref(false);
const rememberMe = ref(false);
const loading = ref(false);
const error = ref(null);

// 密码修改相关状态
const showPasswordChangeDialog = ref(false);
const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const passwordChangeLoading = ref(false);
const passwordChangeError = ref(null);

const router = useRouter();
const userStore = useUserStore();

const handleLogin = async () => {
  loading.value = true;
  error.value = null;

  try {
    const result = await databaseService.login(campusId.value, password.value);
    
    if (result.success) {
      // 登录成功
      console.log('登录成功', result.user);
      userStore.login(result.user);
      localStorage.setItem('user-token', result.user.token || 'authenticated');

      if (result.user.needPasswordChange) {
        // 密码是默认密码123456，需要修改
        userStore.setPasswordChangeRequired(true);
        showPasswordChangeDialog.value = true;
      } else {
        router.push('/');
      }
    } else {
      error.value = result.message;
      // 错误信息10秒后自动清除
      setTimeout(() => {
        error.value = null;
      }, 10000);
    }
  } catch (err) {
    error.value = '网络错误，请重试';
    // 错误信息10秒后自动清除
    setTimeout(() => {
      error.value = null;
    }, 10000);
  }

  loading.value = false;
};

// 手动清除错误信息
const clearError = () => {
  error.value = null;
};

// 处理密码修改
const handlePasswordChange = async () => {
  passwordChangeLoading.value = true;
  passwordChangeError.value = null;

  // 验证输入
  if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
    passwordChangeError.value = '请填写所有密码字段';
    passwordChangeLoading.value = false;
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    passwordChangeError.value = '两次输入的新密码不一致';
    passwordChangeLoading.value = false;
    return;
  }

  if (newPassword.value.length < 6) {
    passwordChangeError.value = '新密码长度至少6位';
    passwordChangeLoading.value = false;
    return;
  }

  try {
    const result = await databaseService.changePassword(oldPassword.value, newPassword.value);
    
    if (result.success) {
      // 重置状态
      userStore.setPasswordChangeRequired(false);
      showPasswordChangeDialog.value = false;
      
      // 清空表单
      clearPasswordChangeForm();
      
      // 跳转到主页
      router.push('/');
    } else {
      passwordChangeError.value = result.message;
    }
  } catch (err) {
    passwordChangeError.value = '网络错误，请重试';
  }
  
  passwordChangeLoading.value = false;
};

// 清空密码修改表单
const clearPasswordChangeForm = () => {
  oldPassword.value = '';
  newPassword.value = '';
  confirmPassword.value = '';
};
</script>

<style scoped>
.lzu-login-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.left-section {
  flex: 0 0 65%;
  background: linear-gradient(135deg, #4a90e2 0%, #7bb3f0 25%, #a8d0ff 50%, #e8f4f8 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  position: relative;
  height: 100vh;
}

.right-section {
  flex: 0 0 35%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: white;
  height: 100vh;
}

.left-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}

.building-background {
  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.building-image {
  max-width: 85%;
  max-height: 70%;
  object-fit: contain;
  opacity: 0.4;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.2));
}

.university-header {
  position: absolute;
  top: 15%;
  left: 8%;
  z-index: 4;
}

.login-form-container {
  width: 100%;
  max-width: 380px;
  min-height: 480px;
  padding: 35px 30px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 16px;
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.08), 0 6px 20px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.system-header {
  text-align: center;
  margin-bottom: 30px;
}

.system-title {
  font-size: 28px;
  font-weight: 700;
  color: #1E4B8C;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #1E4B8C 0%, #4a90e2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.system-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
  font-weight: 300;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.lzu-logo {
  width: 150px;
  height: 150px;
  filter: drop-shadow(0 4px 12px rgba(255, 255, 255, 0.6));
  transition: all 0.3s ease;
}

.lzu-logo:hover {
  transform: scale(1.05);
  filter: drop-shadow(0 6px 20px rgba(255, 255, 255, 0.8));
}

.login-tabs {
  display: flex;
  margin-bottom: 30px;
  border-bottom: 2px solid #f0f2f5;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  cursor: pointer;
  color: #999;
  font-size: 16px;
  position: relative;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.tab-item:hover {
  color: #1E4B8C;
  background: #f0f2f5;
}

.tab-item.active {
  color: #1E4B8C;
  font-weight: 600;
  background: white;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background: linear-gradient(135deg, #1E4B8C 0%, #4a90e2 100%);
  border-radius: 3px;
}

.form-section {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 600;
}

.lzu-input :deep(.v-field) {
  border-radius: 8px;
  background: #f8f9fa;
  transition: all 0.3s ease;
  min-height: 50px;
}

.lzu-input :deep(.v-field__input) {
  font-size: 14px;
  padding: 12px 16px;
}

.lzu-input :deep(.v-field:hover) {
  background: #f0f2f5;
}

.lzu-input :deep(.v-field--focused) {
  background: white;
  box-shadow: 0 0 0 2px rgba(30, 75, 140, 0.1);
}

.lzu-input :deep(.v-field__outline) {
  color: #ddd;
}

.lzu-input :deep(.v-field--focused .v-field__outline) {
  color: #1E4B8C;
}

/* 增大错误提示文字 */
.lzu-input :deep(.v-messages__message) {
  font-size: 12px !important;
  color: #d32f2f !important;
  font-weight: 500 !important;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.remember-checkbox {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.remember-checkbox input {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  transform: scale(1.2);
}

.forgot-password {
  color: #1E4B8C;
  text-decoration: none;
  font-size: 14px;
}

.forgot-password:hover {
  text-decoration: underline;
}

.login-btn {
  border-radius: 8px;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
  background: linear-gradient(135deg, #1E4B8C 0%, #4a90e2 100%);
  box-shadow: 0 3px 12px rgba(30, 75, 140, 0.3);
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(30, 75, 140, 0.4);
}

.footer-info {
  text-align: center;
  margin-top: 30px;
}

.footer-info p {
  font-size: 12px;
  color: #bbb;
  line-height: 1.5;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .lzu-login-container {
    flex-direction: column;
  }
  
  .left-section {
    flex: 0 0 40%;
    padding: 20px;
  }
  
  .right-section {
    flex: 1;
    padding: 20px;
  }
  
  .login-form-container {
    max-width: 90%;
    padding: 30px 20px;
  }
  
  .university-header {
    top: 20px;
    left: 20px;
  }
  
  .lzu-logo {
    width: 60px;
    height: 60px;
  }
  
  .building-image {
    max-width: 90%;
    max-height: 60%;
  }
}

@media (max-width: 480px) {
  .left-section {
    flex: 0 0 35%;
  }
  
  .university-header {
    top: 15px;
    left: 15px;
  }
  
  .lzu-logo {
    width: 50px;
    height: 50px;
  }
}
</style>