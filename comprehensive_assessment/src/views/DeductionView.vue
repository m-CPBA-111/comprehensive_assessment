<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon start icon="mdi-minus-circle"></v-icon>
      扣除分录入
    </v-card-title>
    
    <v-card-text>
      <v-form @submit.prevent="submitDeduction">
        <v-row>
          <v-col cols="12" md="6">
            <v-select
              v-model="selectedStudent"
              :items="studentOptions"
              item-title="label"
              item-value="value"
              label="选择学生"
              variant="outlined"
              required
              :loading="studentsLoading"
            ></v-select>
          </v-col>
          
          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="deductionScore"
              label="扣除分数"
              type="number"
              variant="outlined"
              min="0"
              max="4"
              step="0.1"
              required
              suffix="分"
              :rules="[v => v >= 0 && v <= 4 || '扣分范围为0-4分']"
            ></v-text-field>
          </v-col>
          
          <v-col cols="12">
            <v-textarea
              v-model="deductionReason"
              label="扣分理由"
              variant="outlined"
              rows="3"
              required
              placeholder="请详细描述扣分原因..."
            ></v-textarea>
          </v-col>
          
          <v-col cols="12">
            <v-btn
              type="submit"
              color="primary"
              size="large"
              :loading="submitting"
              :disabled="!canSubmit"
            >
              <v-icon start>mdi-send</v-icon>
              提交扣分记录
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>

    <!-- 已提交的扣分记录 -->
    <v-divider></v-divider>
    <v-card-title>已提交的扣分记录</v-card-title>
    <v-data-table
      :headers="recordHeaders"
      :items="submittedRecords"
      :loading="recordsLoading"
      class="elevation-0"
    >
      <template v-slot:item.status="{ item }">
        <v-chip
          :color="getStatusColor(item.raw.status)"
          size="small"
        >
          {{ getStatusText(item.raw.status) }}
        </v-chip>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { databaseService } from '@/services/api';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

// 表单数据
const selectedStudent = ref(null);
const deductionScore = ref(null);
const deductionReason = ref('');

// 状态
const studentsLoading = ref(true);
const submitting = ref(false);
const recordsLoading = ref(true);

// 学生列表和已提交记录
const students = ref([]);
const submittedRecords = ref([]);

// 表头
const recordHeaders = ref([
  { title: '学号', key: 'studentId', align: 'start' },
  { title: '姓名', key: 'studentName', align: 'start' },
  { title: '扣分', key: 'score', align: 'center' },
  { title: '理由', key: 'reason', align: 'start' },
  { title: '提交日期', key: 'submittedAt', align: 'center' },
  { title: '状态', key: 'status', align: 'center' },
]);

// 学生选项（按首字母排序）
const studentOptions = computed(() => {
  return students.value.map(student => ({
    label: `${student.name} (${student.id})`,
    value: student.id
  }));
});

// 是否可以提交
const canSubmit = computed(() => {
  return selectedStudent.value && 
         deductionScore.value >= 0 && 
         deductionScore.value <= 4 &&
         deductionReason.value.trim().length > 0;
});

// 加载学生列表
const loadStudents = async () => {
  studentsLoading.value = true;
  try {
    students.value = await databaseService.getStudents();
  } catch (error) {
    console.error('加载学生列表失败:', error);
  }
  studentsLoading.value = false;
};

// 加载已提交的扣分记录
const loadSubmittedRecords = async () => {
  recordsLoading.value = true;
  try {
    const result = await databaseService.getDeductionRecords({
      operatorId: userStore.user?.campusId
    });
    
    if (result.success) {
      submittedRecords.value = result.data;
    } else {
      console.error('加载扣分记录失败:', result.message);
      submittedRecords.value = [];
    }
  } catch (error) {
    console.error('加载扣分记录失败:', error);
    submittedRecords.value = [];
  }
  recordsLoading.value = false;
};

// 提交扣分记录
const submitDeduction = async () => {
  if (!canSubmit.value) return;

  submitting.value = true;
  try {
    const selectedStudentInfo = students.value.find(s => s.id === selectedStudent.value);
    
    const deductionData = {
      studentId: selectedStudent.value,
      score: deductionScore.value,
      reason: deductionReason.value
    };

    const result = await databaseService.submitDeduction(deductionData);
    
    if (result.success) {
      // 重置表单
      selectedStudent.value = null;
      deductionScore.value = null;
      deductionReason.value = '';
      
      // 重新加载记录
      await loadSubmittedRecords();
      
      alert('扣分记录提交成功！');
    } else {
      alert(result.message || '提交失败，请重试');
    }
  } catch (error) {
    console.error('提交失败:', error);
    alert('提交失败，请重试');
  }
  submitting.value = false;
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
  loadStudents();
  loadSubmittedRecords();
});
</script>
