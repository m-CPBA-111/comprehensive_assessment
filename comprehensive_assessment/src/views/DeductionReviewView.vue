<template>
  <v-container fluid>
    <!-- 头部区域 -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">扣分审核</h1>
            <p class="text-subtitle-1 text-grey-darken-1 mb-0">管理学生扣分记录和审核流程</p>
          </div>
          <v-avatar size="48" color="primary">
            <v-icon size="28">mdi-shield-check</v-icon>
          </v-avatar>
        </div>
      </v-col>
    </v-row>

    <!-- 筛选和搜索区域 -->
    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          label="搜索学生姓名、学号或扣分理由"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          clearable
          hide-details
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="statusFilter"
          :items="statusOptions"
          label="状态筛选"
          variant="outlined"
          density="comfortable"
          clearable
          hide-details
        />
      </v-col>
      <v-col cols="12" md="2">
        <v-btn
          color="primary"
          size="large"
          @click="loadRecords"
          :loading="loading"
          block
        >
          <v-icon start>mdi-refresh</v-icon>
          刷新
        </v-btn>
      </v-col>
      <v-spacer />
      <v-col cols="12" md="2" class="text-right">
        <v-chip
          :color="getStatsSummary().color"
          size="large"
          variant="elevated"
        >
          <v-icon start>mdi-clipboard-list</v-icon>
          共 {{ filteredRecords.length }} 条记录
        </v-chip>
      </v-col>
    </v-row>

    <!-- 统计卡片 -->
    <v-row class="mb-6">
      <v-col cols="6" md="3">
        <v-card class="pa-4 text-center" color="orange-lighten-5" variant="tonal">
          <v-icon size="32" color="orange" class="mb-2">mdi-clock-outline</v-icon>
          <div class="text-h6 font-weight-bold">{{ getRecordsByStatus('pending').length }}</div>
          <div class="text-caption text-grey-darken-1">待审核</div>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card class="pa-4 text-center" color="green-lighten-5" variant="tonal">
          <v-icon size="32" color="green" class="mb-2">mdi-check-circle</v-icon>
          <div class="text-h6 font-weight-bold">{{ getRecordsByStatus('approved').length }}</div>
          <div class="text-caption text-grey-darken-1">已通过</div>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card class="pa-4 text-center" color="red-lighten-5" variant="tonal">
          <v-icon size="32" color="red" class="mb-2">mdi-close-circle</v-icon>
          <div class="text-h6 font-weight-bold">{{ getRecordsByStatus('rejected').length }}</div>
          <div class="text-caption text-grey-darken-1">已拒绝</div>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card class="pa-4 text-center" color="blue-lighten-5" variant="tonal">
          <v-icon size="32" color="blue" class="mb-2">mdi-format-list-numbered</v-icon>
          <div class="text-h6 font-weight-bold">{{ records.length }}</div>
          <div class="text-caption text-grey-darken-1">总记录数</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 加载状态 -->
    <v-row v-if="loading" class="mb-4">
      <v-col cols="12">
        <v-card class="pa-8 text-center">
          <v-progress-circular
            indeterminate
            color="primary"
            size="48"
            class="mb-4"
          />
          <div class="text-h6">正在加载扣分记录...</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 扣分记录卡片列表 -->
    <v-row v-else>
      <v-col
        v-for="record in filteredRecords"
        :key="record.id"
        cols="12"
        md="6"
        lg="4"
        class="mb-6"
      >
        <v-card
          :class="[
            'deduction-card',
            'h-100',
            'd-flex',
            'flex-column',
            getCardBorderClass(record.status)
          ]"
          elevation="4"
          hover
        >
        <v-card-text class="pa-6 flex-grow-1">
          <!-- 学生信息头部 -->
          <div class="d-flex align-center justify-space-between mb-4">
            <div class="d-flex align-center">
              <v-avatar size="56" :color="getAvatarColor(record.status)" class="mr-4">
                <v-icon color="white" size="28">{{ getStatusIcon(record.status) }}</v-icon>
              </v-avatar>
              <div>
                <div class="student-name mb-1">{{ record.studentName }}</div>
                <div class="student-id">{{ record.studentId }}</div>
              </div>
            </div>
            <v-chip
              :color="getStatusColor(record.status)"
              size="default"
              variant="flat"
              class="font-weight-medium"
            >
              {{ getStatusText(record.status) }}
            </v-chip>
          </div>

          <!-- 扣分信息 -->
          <v-divider class="mb-4" />
          <div class="mb-4">
            <div class="d-flex align-center mb-3">
              <v-icon size="24" color="red" class="mr-3">mdi-minus-circle</v-icon>
              <span class="score-display text-red">-{{ record.score }}分</span>
            </div>
            <div class="reason-section">
              <div class="text-subtitle-1 font-weight-medium mb-2">扣分理由</div>
              <div class="text-body-1">{{ record.reason }}</div>
            </div>
          </div>

          <!-- 时间和操作员信息 -->
          <v-divider class="mb-4" />
          <div class="mb-4">
            <div class="info-item">
              <v-icon size="18" class="mr-2">mdi-calendar</v-icon>
              <span class="text-body-2 text-grey-darken-1">提交时间：{{ record.submittedAt }}</span>
            </div>
            <div v-if="record.operatorName" class="info-item">
              <v-icon size="18" class="mr-2">mdi-account</v-icon>
              <span class="text-body-2 text-grey-darken-1">操作员：{{ record.operatorName }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="d-flex justify-end gap-3 mt-auto">
            <template v-if="record.status === 'pending'">
              <v-btn
                color="success"
                variant="elevated"
                size="default"
                @click="approveDeduction(record.id)"
                :loading="actionLoading === record.id"
                class="action-button success px-6"
              >
                <v-icon start size="20">mdi-check</v-icon>
                通过
              </v-btn>
              <v-btn
                color="error"
                variant="elevated"
                size="default"
                @click="rejectDeduction(record.id)"
                :loading="actionLoading === record.id"
                class="action-button error px-6"
              >
                <v-icon start size="20">mdi-close</v-icon>
                拒绝
              </v-btn>
            </template>
            <v-btn
              v-else
              color="grey"
              variant="tonal"
              size="default"
              disabled
              class="px-6"
            >
              <v-icon start size="20">mdi-check-circle</v-icon>
              已处理
            </v-btn>
          </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 空状态 -->
      <v-col v-if="!loading && filteredRecords.length === 0" cols="12">
        <v-card class="pa-12 text-center">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-clipboard-text-outline</v-icon>
          <div class="text-h6 mb-2">暂无扣分记录</div>
          <div class="text-body-2 text-grey-darken-1 mb-4">
            {{ search || statusFilter ? '没有符合筛选条件的记录' : '还没有提交任何扣分记录' }}
          </div>
          <v-btn
            v-if="search || statusFilter"
            color="primary"
            variant="outlined"
            @click="clearFilters"
          >
            清除筛选条件
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- 页脚信息 -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card class="pa-4" color="grey-lighten-4" variant="flat">
          <div class="d-flex align-center justify-space-between">
            <div class="text-body-2 text-grey-darken-1">
              <v-icon size="18" class="mr-1">mdi-information</v-icon>
              扣分记录会影响学生的综合测评成绩，请谨慎审核
            </div>
            <div class="text-caption text-grey-darken-1">
              最后更新: {{ new Date().toLocaleString() }}
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { databaseService } from '@/services/api';

const search = ref('');
const statusFilter = ref('');
const loading = ref(true);
const actionLoading = ref(null);
const records = ref([]);

// 状态选项
const statusOptions = [
  { title: '待审核', value: 'pending' },
  { title: '已通过', value: 'approved' },
  { title: '已拒绝', value: 'rejected' }
];

// 筛选后的记录
const filteredRecords = computed(() => {
  let filtered = records.value;
  
  // 搜索筛选
  if (search.value) {
    const searchLower = search.value.toLowerCase();
    filtered = filtered.filter(r => 
      r.studentName?.toLowerCase().includes(searchLower) || 
      r.studentId?.toLowerCase().includes(searchLower) ||
      r.reason?.toLowerCase().includes(searchLower)
    );
  }
  
  // 状态筛选
  if (statusFilter.value) {
    filtered = filtered.filter(r => r.status === statusFilter.value);
  }
  
  return filtered;
});

// 获取统计摘要
const getStatsSummary = () => {
  const total = records.value.length;
  const pending = getRecordsByStatus('pending').length;
  
  if (pending > 0) {
    return { color: 'orange', text: `${pending} 条待审核` };
  } else if (total > 0) {
    return { color: 'green', text: '全部已处理' };
  } else {
    return { color: 'grey', text: '暂无记录' };
  }
};

// 根据状态获取记录
const getRecordsByStatus = (status) => {
  return records.value.filter(r => r.status === status);
};

// 获取卡片样式类
const getCardClass = (status) => {
  const baseClass = 'deduction-card';
  switch (status) {
    case 'pending':
      return `${baseClass} pending-card`;
    case 'approved':
      return `${baseClass} approved-card`;
    case 'rejected':
      return `${baseClass} rejected-card`;
    default:
      return baseClass;
  }
};

// 获取头像颜色
const getAvatarColor = (status) => {
  switch (status) {
    case 'pending': return 'orange';
    case 'approved': return 'green';
    case 'rejected': return 'red';
    default: return 'grey';
  }
};

// 获取状态图标
const getStatusIcon = (status) => {
  switch (status) {
    case 'pending': return 'mdi-clock-outline';
    case 'approved': return 'mdi-check-circle';
    case 'rejected': return 'mdi-close-circle';
    default: return 'mdi-help-circle';
  }
};

// 清除筛选条件
const clearFilters = () => {
  search.value = '';
  statusFilter.value = '';
};

// 加载扣分记录
const loadRecords = async () => {
  loading.value = true;
  try {
    const response = await databaseService.getDeductionRecords();
    if (response.success) {
      records.value = response.data || [];
    } else {
      console.error('获取扣分记录失败:', response.message);
      records.value = [];
    }
  } catch (error) {
    console.error('加载扣分记录失败:', error);
    records.value = [];
  }
  loading.value = false;
};

// 通过扣分申请
const approveDeduction = async (id) => {
  actionLoading.value = id;
  try {
    const result = await databaseService.reviewDeduction(id, 'approved');
    if (result.success) {
      await loadRecords(); // 重新加载数据
    } else {
      console.error('审核失败:', result.message);
    }
  } catch (error) {
    console.error('操作失败:', error);
  }
  actionLoading.value = null;
};

// 拒绝扣分申请
const rejectDeduction = async (id) => {
  actionLoading.value = id;
  try {
    const result = await databaseService.reviewDeduction(id, 'rejected');
    if (result.success) {
      await loadRecords(); // 重新加载数据
    } else {
      console.error('审核失败:', result.message);
    }
  } catch (error) {
    console.error('操作失败:', error);
  }
  actionLoading.value = null;
};

// 获取状态颜色
const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'orange';
    case 'approved': return 'success';
    case 'rejected': return 'error';
    default: return 'grey';
  }
};

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'pending': return '待审核';
    case 'approved': return '已通过';
    case 'rejected': return '已拒绝';
    default: return '未知';
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadRecords();
});
</script>

<style scoped>
.deduction-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border-radius: 16px !important;
  border-left: 6px solid transparent;
  min-height: 380px;
  background: #ffffff;
}

.deduction-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
}

.pending-border {
  border-left-color: #FF9800 !important;
  background: linear-gradient(135deg, #FFF8E1 0%, #ffffff 100%) !important;
}

.approved-border {
  border-left-color: #4CAF50 !important;
  background: linear-gradient(135deg, #E8F5E8 0%, #ffffff 100%) !important;
}

.rejected-border {
  border-left-color: #F44336 !important;
  background: linear-gradient(135deg, #FFEBEE 0%, #ffffff 100%) !important;
}

.v-container {
  max-width: 1400px;
}

.text-h4 {
  color: #1976D2;
  font-weight: 700;
}

.text-subtitle-1 {
  line-height: 1.5;
}

.score-display {
  font-size: 2.2rem !important;
  font-weight: 800 !important;
  text-shadow: 2px 2px 4px rgba(244, 67, 54, 0.3);
}

.student-name {
  font-size: 1.4rem !important;
  font-weight: 700 !important;
  color: #2c3e50;
}

.student-id {
  font-size: 1rem !important;
  color: #7f8c8d;
}

.reason-section {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  padding: 20px;
  margin: 16px 0;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 0;
}

.action-button {
  border-radius: 12px !important;
  font-weight: 600 !important;
  text-transform: none !important;
  letter-spacing: 0.5px;
  min-width: 100px !important;
  height: 44px !important;
}

.action-button.success {
  background: linear-gradient(45deg, #4CAF50, #66BB6A) !important;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3) !important;
}

.action-button.error {
  background: linear-gradient(45deg, #F44336, #EF5350) !important;
  box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3) !important;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2) !important;
}

/* 响应式调整 */
@media (max-width: 960px) {
  .deduction-card {
    min-height: 350px;
  }
  
  .text-h4 {
    font-size: 1.5rem !important;
  }
  
  .student-name {
    font-size: 1.2rem !important;
  }
  
  .score-display {
    font-size: 1.8rem !important;
  }
}

@media (max-width: 600px) {
  .v-container {
    padding: 12px;
  }
  
  .deduction-card {
    min-height: 320px;
    margin-bottom: 20px;
  }
  
  .text-h4 {
    font-size: 1.25rem !important;
  }
  
  .student-name {
    font-size: 1.1rem !important;
  }
  
  .score-display {
    font-size: 1.6rem !important;
  }
  
  .action-button {
    min-width: 80px !important;
    height: 40px !important;
  }
}
</style>
