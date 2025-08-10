<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="me-3">mdi-school</v-icon>
            <span class="text-h5">第二课堂分数管理</span>
            <v-spacer></v-spacer>
            <v-btn color="success" @click="saveAllScores" :loading="saving" :disabled="!hasChanges">
              <v-icon start>mdi-content-save</v-icon>
              保存所有分数
            </v-btn>
          </v-card-title>
          
          <v-card-text>
            <v-row class="mb-4">
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="search"
                  label="搜索学生姓名或学号"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="compact"
                  clearable
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-btn color="info" @click="importDialog = true" variant="outlined">
                  <v-icon start>mdi-file-excel</v-icon>
                  批量导入分数
                </v-btn>
              </v-col>
            </v-row>

            <v-data-table
              :headers="headers"
              :items="filteredStudents"
              :loading="loading"
              class="elevation-1"
              :items-per-page="15"
            >
              <template v-slot:item.secondClassScore="{ item }">
                <v-text-field
                  v-model.number="item.secondClassScore"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  variant="outlined"
                  density="compact"
                  hide-details
                  style="width: 100px"
                  @input="markAsChanged(item.id)"
                >
                  <template v-slot:append-inner>
                    <v-icon v-if="changedItems.has(item.id)" color="warning" size="small">
                      mdi-circle
                    </v-icon>
                  </template>
                </v-text-field>
              </template>
              
              <template v-slot:item.grade="{ item }">
                <v-chip :color="getGradeColor(item.secondClassScore)" small>
                  {{ getGradeText(item.secondClassScore) }}
                </v-chip>
              </template>
              
              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon="mdi-content-save"
                  size="small"
                  color="success"
                  @click="saveScore(item)"
                  :disabled="!changedItems.has(item.id)"
                  :loading="savingItems.has(item.id)"
                ></v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 批量导入对话框 -->
    <v-dialog v-model="importDialog" max-width="600px">
      <v-card>
        <v-card-title>批量导入第二课堂分数</v-card-title>
        <v-card-text>
          <v-alert type="info" variant="tonal" class="mb-4">
            <div class="text-subtitle-2 mb-2">导入格式说明：</div>
            <div>• 每行格式：学号,分数</div>
            <div>• 示例：320230901001,85.5</div>
            <div>• 分数范围：0-100</div>
          </v-alert>
          
          <v-textarea
            v-model="importText"
            label="粘贴分数数据"
            variant="outlined"
            rows="8"
            placeholder="320230901001,85.5&#10;320230901002,78.0&#10;320230901003,92.3"
            :rules="[validateImportText]"
          ></v-textarea>
          
          <v-alert v-if="importPreview.length > 0" type="success" variant="tonal" class="mt-3">
            <div class="text-subtitle-2 mb-2">预览导入结果：</div>
            <div v-for="item in importPreview.slice(0, 3)" :key="item.studentId" class="text-body-2">
              {{ item.studentName }}: {{ item.score }}分
            </div>
            <div v-if="importPreview.length > 3" class="text-body-2">
              ... 还有 {{ importPreview.length - 3 }} 条记录
            </div>
          </v-alert>
          
          <v-alert v-if="importErrors.length > 0" type="error" variant="tonal" class="mt-3">
            <div class="text-subtitle-2 mb-2">导入错误：</div>
            <div v-for="error in importErrors.slice(0, 3)" :key="error" class="text-body-2">
              {{ error }}
            </div>
            <div v-if="importErrors.length > 3" class="text-body-2">
              ... 还有 {{ importErrors.length - 3 }} 个错误
            </div>
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="importDialog = false">取消</v-btn>
          <v-btn 
            color="primary" 
            :disabled="importPreview.length === 0 || importErrors.length > 0"
            :loading="importing"
            @click="confirmImport"
          >
            导入 {{ importPreview.length }} 条记录
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 成功提示 -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000">
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { databaseService } from '@/services/api';

// 响应式数据
const search = ref('');
const loading = ref(true);
const saving = ref(false);
const students = ref([]);
const changedItems = ref(new Set());
const savingItems = ref(new Set());

// 导入相关
const importDialog = ref(false);
const importText = ref('');
const importPreview = ref([]);
const importErrors = ref([]);
const importing = ref(false);

// 提示相关
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

// 表格头部
const headers = [
  { title: '学号', key: 'id', sortable: true },
  { title: '姓名', key: 'name', sortable: true },
  { title: '班级', key: 'class', sortable: true },
  { title: '第二课堂分数', key: 'secondClassScore', sortable: true },
  { title: '等级', key: 'grade', sortable: false },
  { title: '操作', key: 'actions', sortable: false }
];

// 计算属性
const filteredStudents = computed(() => {
  if (!search.value) return students.value;
  return students.value.filter(s => 
    s.name.includes(search.value) || 
    s.id.includes(search.value)
  );
});

const hasChanges = computed(() => changedItems.value.size > 0);

// 方法
const loadStudents = async () => {
  loading.value = true;
  try {
    const data = await databaseService.getStudents();
    students.value = data.map(student => ({
      ...student,
      secondClassScore: student.secondClassScore
    }));
  } catch (error) {
    showSnackbar('加载学生数据失败', 'error');
  }
  loading.value = false;
};

const markAsChanged = (studentId) => {
  changedItems.value.add(studentId);
};

const getGradeText = (score) => {
  if (score === null || score === undefined) return '未评分';
  if (score >= 90) return '优秀';
  if (score >= 80) return '良好';
  if (score >= 70) return '中等';
  if (score >= 60) return '及格';
  return '不及格';
};

const getGradeColor = (score) => {
  if (score === null || score === undefined) return 'grey';
  if (score >= 90) return 'success';
  if (score >= 80) return 'info';
  if (score >= 70) return 'warning';
  if (score >= 60) return 'orange';
  return 'error';
};

const saveScore = async (student) => {
  savingItems.value.add(student.id);
  try {
    const result = await databaseService.updateStudentScore(student.id, {
      academicScore: null,
      secondClassScore: student.secondClassScore,
      evaluationScore: null,
      bonusScore: null
    });
    if (result.success) {
      changedItems.value.delete(student.id);
      showSnackbar(`${student.name}的分数保存成功`, 'success');
    } else {
      showSnackbar(result.message || '保存失败', 'error');
    }
  } catch (error) {
    showSnackbar('保存失败', 'error');
  } finally {
    savingItems.value.delete(student.id);
  }
};

const saveAllScores = async () => {
  saving.value = true;
  try {
    const updatePromises = Array.from(changedItems.value).map(async (studentId) => {
      const student = students.value.find(s => s.id === studentId);
      return databaseService.updateStudentScore(studentId, {
        academicScore: null,
        secondClassScore: student.secondClassScore,
        evaluationScore: null,
        bonusScore: null
      });
    });

    const results = await Promise.all(updatePromises);
    const allSuccessful = results.every(result => result.success);
    
    if (allSuccessful) {
      changedItems.value.clear();
      showSnackbar('所有分数保存成功', 'success');
    } else {
      showSnackbar('部分分数保存失败', 'error');
    }
  } catch (error) {
    showSnackbar('保存失败', 'error');
  } finally {
    saving.value = false;
  }
};

const parseImportText = (text) => {
  if (!text.trim()) {
    importPreview.value = [];
    importErrors.value = [];
    return;
  }

  const lines = text.trim().split('\n');
  const preview = [];
  const errors = [];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();
    
    if (!trimmedLine) return;

    const parts = trimmedLine.split(',');
    if (parts.length !== 2) {
      errors.push(`第${lineNumber}行：格式错误，应为"学号,分数"`);
      return;
    }

    const [studentId, scoreStr] = parts.map(part => part.trim());
    const score = parseFloat(scoreStr);

    // 验证学号
    const student = students.value.find(s => s.id === studentId);
    if (!student) {
      errors.push(`第${lineNumber}行：学号"${studentId}"不存在`);
      return;
    }

    // 验证分数
    if (isNaN(score) || score < 0 || score > 100) {
      errors.push(`第${lineNumber}行：分数"${scoreStr}"无效，应为0-100的数字`);
      return;
    }

    preview.push({
      studentId,
      studentName: student.name,
      score
    });
  });

  importPreview.value = preview;
  importErrors.value = errors;
};

const validateImportText = (value) => {
  if (!value) return true;
  parseImportText(value);
  return importErrors.value.length === 0 || `存在${importErrors.value.length}个错误`;
};

const confirmImport = async () => {
  importing.value = true;
  try {
    const updatePromises = importPreview.value.map(async (item) => {
      return databaseService.updateStudentScore(item.studentId, {
        academicScore: null,
        secondClassScore: item.score,
        evaluationScore: null,
        bonusScore: null
      });
    });

    const results = await Promise.all(updatePromises);
    const allSuccessful = results.every(result => result.success);
    
    if (allSuccessful) {
      // 更新本地数据
      importPreview.value.forEach(item => {
        const student = students.value.find(s => s.id === item.studentId);
        if (student) {
          student.secondClassScore = item.score;
        }
      });

      showSnackbar(`成功导入${importPreview.value.length}条分数记录`, 'success');
      importDialog.value = false;
      importText.value = '';
      importPreview.value = [];
      importErrors.value = [];
      changedItems.value.clear();
    } else {
      showSnackbar('部分数据导入失败', 'error');
    }
  } catch (error) {
    showSnackbar('导入失败', 'error');
  } finally {
    importing.value = false;
  }
};

const showSnackbar = (message, color = 'success') => {
  snackbarText.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
};

// 生命周期
onMounted(() => {
  loadStudents();
});
</script>

<style scoped>
.v-text-field {
  min-width: 100px;
}
</style>
