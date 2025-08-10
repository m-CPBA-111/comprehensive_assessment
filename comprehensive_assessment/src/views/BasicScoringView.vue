<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon start icon="mdi-calculator-variant"></v-icon>
      基本素质打分
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
      :items="filteredStudents"
      :loading="loading"
      item-value="id"
      class="elevation-1"
    >
      <template v-slot:item.score="{ item }">
        <v-text-field
          v-model.number="item.raw.score"
          type="number"
          style="width: 120px;"
          variant="outlined"
          density="compact"
          hide-details
        ></v-text-field>
      </template>

      <template v-slot:bottom>
          <div class="text-center pa-4">
              <v-btn color="primary" size="large" @click="uploadScores" :loading="isUploading">
                  <v-icon left>mdi-upload</v-icon>
                  完成并上传全部评分
              </v-btn>
          </div>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { databaseService } from '@/services/api';

const search = ref('');
const isUploading = ref(false);
const students = ref([]);
const loading = ref(true);

const headers = ref([
  { title: '学号', key: 'id', align: 'start', sortable: true },
  { title: '姓名', key: 'name', align: 'start', sortable: true },
  { title: '班级', key: 'class', align: 'start' },
  { title: '分数', key: 'score', align: 'center', sortable: false },
]);

// 加载学生数据
const loadStudents = async () => {
  loading.value = true;
  try {
    const data = await databaseService.getStudents();
    students.value = data.map(student => ({
      ...student,
      score: student.basicScore
    }));
  } catch (error) {
    console.error('加载学生数据失败:', error);
  }
  loading.value = false;
};

// 组件挂载时加载数据
onMounted(() => {
  loadStudents();
});

const filteredStudents = computed(() => {
  if (!search.value) return students.value;
  return students.value.filter(s => s.name.includes(search.value) || s.id.includes(search.value));
});

const uploadScores = async () => {
    isUploading.value = true;
    // 检查是否有未打分项
    if (students.value.some(s => s.score === null || s.score === '')) {
        alert('还有学生未评分，请检查！');
        isUploading.value = false;
        return;
    }
    
    try {
        const scores = students.value.map(s => ({
            studentId: s.id,
            score: s.score
        }));
        
        // 使用真实API服务保存成绩
        const result = await databaseService.saveBasicScores(scores);
        
        if (result.success) {
            alert('所有学生基本素质分上传成功！');
        } else {
            alert('上传失败，请重试');
        }
    } catch (error) {
        console.error('上传失败:', error);
        alert('上传失败，请重试');
    }
    
    isUploading.value = false;
}
</script>