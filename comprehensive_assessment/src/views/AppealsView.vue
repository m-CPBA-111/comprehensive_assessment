<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon start icon="mdi-message-alert"></v-icon>
      申诉处理
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        label="搜索申诉..."
        prepend-inner-icon="mdi-magnify"
        variant="solo-filled"
        flat
        dense
        hide-details
      ></v-text-field>
    </v-card-title>
    
    <v-data-table
      :headers="headers"
      :items="filteredAppeals"
      :loading="loading"
      item-value="id"
      class="elevation-1"
    >
      <template v-slot:item.type="{ item }">
        <v-chip
          :color="getTypeColor(item.raw.type)"
          size="small"
        >
          {{ getTypeText(item.raw.type) }}
        </v-chip>
      </template>

      <template v-slot:item.title="{ item }">
        <div>
          <div class="font-weight-medium">{{ item.raw.title }}</div>
          <div class="text-caption text-grey">{{ item.raw.content }}</div>
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
            color="primary"
            size="small"
            @click="openReplyDialog(item.raw)"
          >
            回复
          </v-btn>
        </div>
        <div v-else class="text-grey">
          已回复: {{ item.raw.reply }}
        </div>
      </template>
    </v-data-table>

    <!-- 回复对话框 -->
    <v-dialog v-model="showReplyDialog" max-width="600px">
      <v-card>
        <v-card-title>回复申诉</v-card-title>
        <v-card-text>
          <div class="mb-4">
            <strong>学生:</strong> {{ selectedAppeal?.studentName }}<br>
            <strong>申诉内容:</strong> {{ selectedAppeal?.title }}<br>
            <strong>详细说明:</strong> {{ selectedAppeal?.content }}
          </div>
          <v-textarea
            v-model="replyContent"
            label="回复内容"
            variant="outlined"
            rows="4"
            required
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showReplyDialog = false">取消</v-btn>
          <v-btn 
            color="primary" 
            @click="submitReply"
            :loading="replyLoading"
          >
            发送回复
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { databaseService } from '@/services/api';

const search = ref('');
const loading = ref(true);
const appeals = ref([]);

// 回复相关状态
const showReplyDialog = ref(false);
const selectedAppeal = ref(null);
const replyContent = ref('');
const replyLoading = ref(false);

const headers = ref([
  { title: '学号', key: 'studentId', align: 'start', sortable: true },
  { title: '姓名', key: 'studentName', align: 'start', sortable: true },
  { title: '类别', key: 'type', align: 'center' },
  { title: '申诉内容', key: 'title', align: 'start' },
  { title: '证明材料', key: 'evidence', align: 'center' },
  { title: '提交日期', key: 'submittedAt', align: 'center', sortable: true },
  { title: '状态', key: 'status', align: 'center' },
  { title: '操作', key: 'actions', align: 'center', sortable: false },
]);

const filteredAppeals = computed(() => {
  if (!search.value) return appeals.value;
  return appeals.value.filter(a => 
    a.studentName.includes(search.value) || 
    a.studentId.includes(search.value) ||
    a.title.includes(search.value) ||
    a.content.includes(search.value)
  );
});

// 加载申诉记录
const loadAppeals = async () => {
  loading.value = true;
  try {
    appeals.value = []; // 申诉功能暂时不可用
  } catch (error) {
    console.error('加载申诉记录失败:', error);
  }
  loading.value = false;
};

// 查看证明材料
const viewEvidence = (evidence) => {
  alert(`查看证明材料: ${evidence}`);
  // 实际应用中这里会打开文件预览或下载
};

// 打开回复对话框
const openReplyDialog = (appeal) => {
  selectedAppeal.value = appeal;
  replyContent.value = '';
  showReplyDialog.value = true;
};

// 提交回复
const submitReply = async () => {
  if (!replyContent.value.trim()) {
    alert('请输入回复内容');
    return;
  }

  replyLoading.value = true;
  try {
    alert('申诉回复功能暂时不可用'); // const result = await mockDB.replyAppeal(selectedAppeal.value.id, replyContent.value);
    if (result.success) {
      showReplyDialog.value = false;
      await loadAppeals(); // 重新加载数据
    }
  } catch (error) {
    console.error('回复失败:', error);
  }
  replyLoading.value = false;
};

// 获取类别颜色
const getTypeColor = (type) => {
  switch (type) {
    case 'deduction': return 'orange';
    case 'bonus': return 'green';
    case 'basic': return 'blue';
    default: return 'grey';
  }
};

// 获取类别文本
const getTypeText = (type) => {
  switch (type) {
    case 'deduction': return '扣分申诉';
    case 'bonus': return '附加分申诉';
    case 'basic': return '基本分申诉';
    default: return '其他';
  }
};

// 获取状态颜色
const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'orange';
    case 'processed': return 'success';
    default: return 'grey';
  }
};

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'pending': return '待处理';
    case 'processed': return '已处理';
    default: return '未知';
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadAppeals();
});
</script>
