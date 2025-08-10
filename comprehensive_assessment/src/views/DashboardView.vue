<template>
  <div class="dashboard-container">
    <!-- 顶部欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1 class="welcome-title">数学基地班综合素质测评管理平台</h1>
        <p class="welcome-subtitle">高效管理学生综合评价，助力教育质量提升</p>
      </div>
      <div class="welcome-decoration">
        <div class="decoration-circle circle-1"></div>
        <div class="decoration-circle circle-2"></div>
        <div class="decoration-circle circle-3"></div>
      </div>
    </div>

    <!-- 功能卡片区域 -->
    <div class="cards-section">
      <v-row class="no-gutters">
        <v-col v-for="link in quickLinks" :key="link.title" cols="12" sm="6" md="4" lg="3">
          <div class="card-wrapper">
            <v-card
              :to="link.to"
              hover
              class="function-card"
              :class="`card-${link.color}`"
              elevation="0"
            >
              <div class="card-header">
                <div class="icon-container" :class="`bg-${link.color}`">
                  <v-icon :icon="link.icon" size="28" color="white"></v-icon>
                </div>
              </div>
              
              <v-card-text class="card-content">
                <h3 class="card-title">{{ link.title }}</h3>
                <p class="card-description">{{ link.subtitle }}</p>
              </v-card-text>
              
              <v-card-actions class="card-actions">
                <v-btn 
                  variant="text" 
                  :color="link.color"
                  append-icon="mdi-arrow-right"
                  class="action-btn"
                >
                  前往
                </v-btn>
              </v-card-actions>
            </v-card>
          </div>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const quickLinks = ref([
    { title: '设置综测成绩占比', subtitle: '调整各项评分在最终综测成绩中的权重', to: '/score-settings', icon: 'mdi-cog', color: 'indigo' },
    { title: '学业成绩管理', subtitle: '录入和管理学生学业成绩', to: '/academic-score', icon: 'mdi-school-outline', color: 'blue' },
    { title: '第二课堂分数管理', subtitle: '直接录入第二课堂分数', to: '/second-class', icon: 'mdi-school', color: 'green' },
    { title: '综合评价分数管理', subtitle: '直接录入综合评价分数', to: '/group-evaluation', icon: 'mdi-account-group', color: 'purple' },
    { title: '扣除分审核', subtitle: '审核已提交的违纪扣分项', to: '/deduction-review', icon: 'mdi-shield-check', color: 'orange' },
    { title: '奖励分审核', subtitle: '审核学生的奖励分申请材料', to: '/bonus-review', icon: 'mdi-star-check', color: 'teal' },
    { title: '申诉处理', subtitle: '查看并处理学生的成绩申诉', to: '/appeals', icon: 'mdi-message-alert', color: 'red' },
    { title: '扣分录入', subtitle: '录入学生违纪扣分记录', to: '/deduction', icon: 'mdi-minus-circle', color: 'deep-orange' },
]);
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0;
  margin: 0;
}

/* 欢迎区域 */
.welcome-section {
  position: relative;
  background: linear-gradient(135deg, #1E4B8C 0%, #4a90e2 50%, #667eea 100%);
  padding: 60px 40px;
  margin-bottom: 40px;
  overflow: hidden;
}

.welcome-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: white;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.5px;
}

.welcome-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 300;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
}

/* 装饰元素 */
.welcome-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: -100px;
  right: -100px;
  animation: float 6s ease-in-out infinite;
}

.circle-2 {
  width: 150px;
  height: 150px;
  bottom: -75px;
  left: -75px;
  animation: float 8s ease-in-out infinite reverse;
}

.circle-3 {
  width: 100px;
  height: 100px;
  top: 50%;
  right: 10%;
  animation: float 10s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

/* 卡片区域 */
.cards-section {
  padding: 0 40px 60px;
}

.card-wrapper {
  padding: 12px;
}

.function-card {
  background: white;
  border-radius: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.function-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.function-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--card-color), var(--card-color-light));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.function-card:hover::before {
  opacity: 1;
}

/* 卡片头部 */
.card-header {
  padding: 24px 24px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.icon-container {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.function-card:hover .icon-container {
  transform: scale(1.1);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

/* 卡片内容 */
.card-content {
  padding: 0 24px 16px !important;
  flex-grow: 1;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.card-description {
  font-size: 0.9rem;
  color: #64748b;
  line-height: 1.5;
  margin: 0;
}

/* 卡片操作区 */
.card-actions {
  padding: 16px 24px 24px !important;
  justify-content: flex-end;
}

.action-btn {
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
}

/* 颜色主题 */
.bg-indigo { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.bg-blue { background: linear-gradient(135deg, #2196F3 0%, #21CBF3 100%); }
.bg-green { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); }
.bg-purple { background: linear-gradient(135deg, #9C27B0 0%, #673AB7 100%); }
.bg-orange { background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); }
.bg-teal { background: linear-gradient(135deg, #009688 0%, #00695C 100%); }
.bg-red { background: linear-gradient(135deg, #F44336 0%, #D32F2F 100%); }
.bg-deep-orange { background: linear-gradient(135deg, #FF5722 0%, #E64A19 100%); }

.card-indigo { --card-color: #667eea; --card-color-light: #764ba2; }
.card-blue { --card-color: #2196F3; --card-color-light: #21CBF3; }
.card-green { --card-color: #4CAF50; --card-color-light: #45a049; }
.card-purple { --card-color: #9C27B0; --card-color-light: #673AB7; }
.card-orange { --card-color: #FF9800; --card-color-light: #F57C00; }
.card-teal { --card-color: #009688; --card-color-light: #00695C; }
.card-red { --card-color: #F44336; --card-color-light: #D32F2F; }
.card-deep-orange { --card-color: #FF5722; --card-color-light: #E64A19; }

/* 响应式设计 */
@media (max-width: 960px) {
  .welcome-section {
    padding: 40px 20px;
  }
  
  .welcome-title {
    font-size: 2rem;
  }
  
  .welcome-subtitle {
    font-size: 1rem;
  }
  
  .cards-section {
    padding: 0 20px 40px;
  }
}

@media (max-width: 600px) {
  .welcome-title {
    font-size: 1.5rem;
  }
  
  .card-wrapper {
    padding: 8px;
  }
  
  .card-header {
    padding: 20px 20px 12px;
  }
  
  .icon-container {
    width: 50px;
    height: 50px;
  }
  
  .card-content {
    padding: 0 20px 12px !important;
  }
  
  .card-actions {
    padding: 12px 20px 20px !important;
  }
}
</style>