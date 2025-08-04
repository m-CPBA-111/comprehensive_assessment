<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon start icon="mdi-star-check"></v-icon>
      奖励分审核
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        label="搜索学生..."
        prepend-inner-icon="mdi-magnify"
        variant="solo-filled"
        flat
        dense
        hide-details
      ></v-text-field>
    </v-card-title>
    
    <v-data-table
      :headers="headers"
      :items="filteredApplications"
      :loading="loading"
      item-value="id"
      class="elevation-1"
    >
      <template v-slot:item.title="{ item }">
        <div>
          <div class="font-weight-medium">{{ item.raw.title }}</div>
          <div class="text-caption text-grey">{{ item.raw.description }}</div>
        </div>
      </template>

      <template v-slot:item.evidence="{ item }">
        <v-btn
          size="small"
          variant="outlined"
          color="primary"
          @click="viewEvidence(item.raw.evidence)"
        >
          查看材料
        </v-btn>
      </template>

      <template v-slot:item.status="{ item }">
        <v-chip
          :color="getStatusColor(item.raw.status)"
          size="small"
        >
          {{ getStatusText(item.raw.status) }}
        </v-chip>
      </template>

      <template v-slot:item.actions="{ item }">
        <div v-if="item.raw.status === 'pending'" class="d-flex gap-2">
          <v-btn
            color="success"
            size="small"
            @click="approveBonus(item.raw.id)"
            :loading="actionLoading === item.raw.id"
          >
            通过
          </v-btn>
          <v-btn
            color="error"
            size="small"
            @click="rejectBonus(item.raw.id)"
            :loading="actionLoading === item.raw.id"
          >
            拒绝
          </v-btn>
        </div>
        <span v-else class="text-grey">已处理</span>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { databaseService } from '@/services/api';

const search = ref('');
const loading = ref(true);
const actionLoading = ref(null);
const applications = ref([]);

const headers = ref([
  { title: '学号', key: 'studentId', align: 'start', sortable: true },
  { title: '姓名', key: 'studentName', align: 'start', sortable: true },
  { title: '申报内容', key: 'title', align: 'start' },
  { title: '奖励分', key: 'score', align: 'center', sortable: true },
  { title: '证明材料', key: 'evidence', align: 'center' },
  { title: '提交日期', key: 'submittedAt', align: 'center', sortable: true },
  { title: '状态', key: 'status', align: 'center' },
  { title: '操作', key: 'actions', align: 'center', sortable: false },
]);

const filteredApplications = computed(() => {
  if (!search.value) return applications.value;
  return applications.value.filter(a => 
    a.studentName.includes(search.value) || 
    a.studentId.includes(search.value) ||
    a.title.includes(search.value)
  );
});

// 加载奖励分申请
const loadApplications = async () => {
  loading.value = true;
  try {
    // 奖励分申请功能暂时不可用
    applications.value = [];
  } catch (error) {
    console.error('加载奖励分申请失败:', error);
  }
  loading.value = false;
};

// 通过奖励分申请
const approveBonus = async (id) => {
  actionLoading.value = id;
  try {
    // 奖励分申请审核功能暂时不可用
    alert('奖励分申请审核功能暂时不可用');
    if (result.success) {
      await loadApplications(); // 重新加载数据
    }
  } catch (error) {
    console.error('操作失败:', error);
  }
  actionLoading.value = null;
};

// 拒绝奖励分申请
const rejectBonus = async (id) => {
  actionLoading.value = id;
  try {
    // 奖励分申请审核功能暂时不可用
    alert('奖励分申请审核功能暂时不可用');
    if (result.success) {
      await loadApplications(); // 重新加载数据
    }
  } catch (error) {
    console.error('操作失败:', error);
  }
  actionLoading.value = null;
};

// 查看证明材料
const viewEvidence = (evidence) => {
  alert(`查看证明材料: ${evidence}`);
  // 实际应用中这里会打开文件预览或下载
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
  loadApplications();
});
</script>
