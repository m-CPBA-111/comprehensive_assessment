<template>
  <v-container fluid class="bg-light-gray pa-4">
    <!-- 顶部信息区（吸顶） -->
    <v-card fixed class="mb-6 bg-gradient-blue elevation-4">
      <v-card-text class="d-flex justify-space-between align-center">
        <div class="d-flex items-center">
          <!-- 院徽图片 -->
          <img src="@/assets/logo.png" alt="院徽" class="mr-4" style="height: 40px; width: auto;">
          <div class="text-white">
            <span class="font-weight-bold mr-4">{{ studentInfo.name }}</span>
            <span class="mr-4">学号：{{ studentInfo.studentId }}</span>
            <span class="mr-4">班级：{{ studentInfo.class }}</span>
            <span>学院：{{ studentInfo.college }}</span>
          </div>
        </div>
        <div class="d-flex items-center">
          <span class="text-white font-weight-bold mr-4" v-if="totalScore">
            总分：{{ totalScore }} | 排名：{{ rank }}
          </span>
          <v-btn color="white" text @click="handleLogout">退出登录</v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- 页面标题 -->
    <v-row class="mb-6 mt-16">
      <v-col>
        <h1 class="text-h4 font-google-sans font-weight-bold text-dark-gray">学生综合测评信息</h1>
      </v-col>
    </v-row>

    <!-- 主体评分区（卡片式布局） -->
    <v-row>
      <!-- 教师评价 -->
      <v-col cols="12" md="6" lg="4" class="mb-6">
        <v-card elevation-2 class="h-full d-flex flex-column">
          <v-card-title class="d-flex justify-space-between items-center">
            <div>
              <span class="font-google-sans">教师评价</span>
              <v-chip class="ml-2" small label>{{ teacherRatio }}</v-chip>
            </div>
            <v-chip :color="teacherStatusColor" small>{{ teacherStatusText }}</v-chip>
          </v-card-title>
          <v-card-text class="flex-grow-1">
            <v-expansion-panels>
              <v-expansion-panel>
                <v-expansion-panel-title>评价详情</v-expansion-panel-title>
                <v-expansion-panel-content>
                  <v-list>
                    <v-list-item v-for="(item, idx) in teacherScores" :key="idx">
                      <v-list-item-title>{{ item.item }}</v-list-item-title>
                      <v-list-item-subtitle>
                        得分：{{ item.score }} | {{ item.comment || '无备注' }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 基本素质评分 -->
      <v-col cols="12" md="6" lg="4" class="mb-6">
        <v-card elevation-2 class="h-full d-flex flex-column">
          <v-card-title class="d-flex justify-space-between items-center">
            <div>
              <span class="font-google-sans">基本素质评分</span>
              <v-chip class="ml-2" small label>{{ qualityRatio }}</v-chip>
            </div>
            <v-chip :color="qualityStatusColor" small>{{ qualityStatusText }}</v-chip>
          </v-card-title>
          <v-card-text class="flex-grow-1">
            <v-expansion-panels>
              <v-expansion-panel>
                <v-expansion-panel-title>评分详情</v-expansion-panel-title>
                <v-expansion-panel-content>
                  <v-list>
                    <v-list-item v-for="(item, idx) in qualityScores" :key="idx">
                      <v-list-item-title>{{ item.item }}</v-list-item-title>
                      <v-list-item-subtitle>得分：{{ item.score }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 学习成绩 -->
      <v-col cols="12" md="6" lg="4" class="mb-6">
        <v-card elevation-2 class="h-full d-flex flex-column">
          <v-card-title class="d-flex justify-space-between items-center">
            <div>
              <span class="font-google-sans">学习成绩</span>
              <v-chip class="ml-2" small label>{{ studyRatio }}</v-chip>
            </div>
          </v-card-title>
          <v-card-text class="flex-grow-1">
            <v-data-table
              :items="studyScores"
              :headers="studyHeaders"
              dense
              hide-default-footer
              :items-per-page="5"
            ></v-data-table>
            <div class="mt-2 text-right">
              <span class="font-weight-medium">GPA：{{ gpa }}</span>
              <span class="font-weight-medium ml-4">加权平均分：{{ weightedAvg }}</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 二课积分 -->
      <v-col cols="12" md="6" lg="4" class="mb-6">
        <v-card elevation-2 class="h-full d-flex flex-column">
          <v-card-title class="d-flex justify-space-between items-center">
            <div>
              <span class="font-google-sans">二课积分</span>
              <v-chip class="ml-2" small label>{{ secondClassRatio }}</v-chip>
            </div>
          </v-card-title>
          <v-card-text class="flex-grow-1">
            <v-list>
              <v-list-item>
                <v-list-item-title>总积分</v-list-item-title>
                <v-list-item-subtitle class="text-h5">{{ secondClassScore }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 扣除分 -->
      <v-col cols="12" md="6" lg="4" class="mb-6">
        <v-card elevation-2 class="h-full d-flex flex-column">
          <v-card-title class="d-flex justify-space-between items-center">
            <div>
              <span class="font-google-sans">扣除分</span>
              <v-chip class="ml-2" small label>{{ deductionRatio }}</v-chip>
            </div>
            <v-chip :color="deductionStatusColor" small>{{ deductionStatusText }}</v-chip>
          </v-card-title>
          <v-card-text class="flex-grow-1">
            <v-data-table
              :items="deductionItems"
              :headers="deductionHeaders"
              dense
              hide-default-footer
            >
              <template #no-data>
                <v-row justify="center" align="center" class="pa-4">
                  <v-col cols="12" class="text-center">
                    无扣除分记录
                  </v-col>
                </v-row>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 附加分 -->
      <v-col cols="12" md="6" lg="4" class="mb-6">
        <v-card elevation-2 class="h-full d-flex flex-column">
          <v-card-title class="d-flex justify-space-between items-center">
            <div>
              <span class="font-google-sans">附加分</span>
              <v-chip class="ml-2" small label>{{ extraRatio }}</v-chip>
            </div>
            <v-chip :color="extraStatusColor" small>{{ extraStatusText }}</v-chip>
          </v-card-title>
          <v-card-text class="flex-grow-1">
            <v-data-table
              :items="displayExtraScores"
              :headers="extraHeaders"
              dense
              hide-default-footer
              :items-per-page="3"
            >
              <template #item.fileUrl="{ item }">
                <a v-if="item.fileUrl" :href="item.fileUrl" target="_blank" class="text-primary">查看附件</a>
                <span v-else>-</span>
              </template>
              <template #no-data>
                <v-row justify="center" align="center" class="pa-4">
                  <v-col cols="12" class="text-center">
                    <v-btn color="primary" @click="openExtraScoreDialog">
                      添加附加分项目
                    </v-btn>
                  </v-col>
                </v-row>
              </template>
            </v-data-table>

            <!-- 总提交按钮 -->
            <v-btn 
              v-if="tempExtraScores.length > 0"
              color="success" 
              class="mt-4"
              @click="submitAllExtraScores"
            >
              提交所有附加分项目（{{ tempExtraScores.length }}项）
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 申诉界面（页面底部） -->
    <v-card class="mt-8 mb-12 elevation-2">
      <v-card-title class="font-google-sans">申诉功能</v-card-title>
      <v-card-text>
        <v-btn color="error" @click="openAppealDialog">提交申诉</v-btn>
        
        <!-- 申诉对话框 -->
        <v-dialog v-model="appealDialog" max-width="500px">
          <v-card>
            <v-card-title>申诉提交</v-card-title>
            <v-card-text>
              <v-form>
                <v-select
                  label="申诉项目"
                  v-model="appealItem"
                  :items="appealItems"
                  required
                ></v-select>
                <v-textarea
                  label="申诉理由"
                  v-model="appealReason"
                  rows="4"
                  required
                ></v-textarea>
                <v-file-input
                  label="上传证明材料"
                  v-model="appealFile"
                  accept="application/pdf,image/*"
                ></v-file-input>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-btn @click="appealDialog = false">取消</v-btn>
              <v-btn color="primary" @click="submitAppeal">提交</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card-text>
    </v-card>

    <!-- 附加分添加对话框 -->
    <v-dialog v-model="extraScoreDialog" max-width="500px">
      <v-card>
        <v-card-title>添加附加分项目</v-card-title>
        <v-card-text>
          <v-form ref="extraForm">
            <v-text-field
              label="申请项目"
              v-model="newExtraItem.name"
              required
              :rules="[(v) => !!v || '项目名称不能为空']"
            ></v-text-field>
            <v-text-field
              label="项目分值"
              v-model="newExtraItem.score"
              type="number"
              required
              :rules="[
                (v) => !!v || '分值不能为空',
                (v) => !isNaN(Number(v)) || '请输入有效数字',
                (v) => Number(v) >= 0 || '分值不能为负数'
              ]"
            ></v-text-field>
            <v-file-input
              label="上传证明材料"
              v-model="newExtraItem.file"
              accept="application/pdf,image/*"
              required
            ></v-file-input>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="resetExtraForm">取消</v-btn>
          <v-btn color="primary" @click="addTempExtraScore">添加</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

// 路由参数获取
const route = useRoute();
const router = useRouter();
const studentInfo = ref({
  studentId: route.query.studentId || '',
  name: route.query.name || '',
  class: route.query.class || '',
  grade: '',
  college: ''
});

// 评分数据
const totalScore = ref(null);
const rank = ref(null);

// 教师评价
const teacherRatio = ref('20%');
const teacherScores = ref([]);
const teacherStatusText = ref('未公示');
const teacherStatusColor = ref('warning');

// 基本素质评分
const qualityRatio = ref('20%');
const qualityScores = ref([]);
const qualityStatusText = ref('未公示');
const qualityStatusColor = ref('warning');

// 学习成绩
const studyRatio = ref('40%');
const studyScores = ref([]);
const studyHeaders = ref([
  { title: '课程名称', key: 'course' },
  { title: '课程性质', key: 'course_type' },
  { title: '成绩', key: 'score' },
  { title: '学期', key: 'semester' }
]);
const gpa = ref('0');
const weightedAvg = ref('0');

// 二课积分
const secondClassRatio = ref('10%');
const secondClassScore = ref('0');

// 扣除分
const deductionRatio = ref('10%');
const deductionItems = ref([]);
const deductionHeaders = ref([
  { title: '扣分原因', key: 'reason' },
  { title: '扣分数值', key: 'score' }
]);
const deductionStatusText = ref('未公示');
const deductionStatusColor = ref('warning');

// 附加分 - 新增临时存储数组
const extraRatio = ref('10%');
const extraScores = ref([]); // 已提交的附加分
const tempExtraScores = ref([]); // 临时存储未提交的附加分
const extraHeaders = ref([
  { title: '申请项目', key: 'name' },
  { title: '分值', key: 'score' },
  { title: '证明材料', key: 'fileUrl' }
]);
const extraStatusText = ref('未公示');
const extraStatusColor = ref('warning');

// 对话框状态
const appealDialog = ref(false);
const extraScoreDialog = ref(false);

// 申诉数据
const appealItems = ref(['学习成绩', '基本素质评分', '二课积分', '附加分', '扣除分']);
const appealItem = ref('');
const appealReason = ref('');
const appealFile = ref(null);

// 新增附加分数据
const newExtraItem = ref({
  name: '',
  score: null,
  file: null,
  fileUrl: '' // 临时显示用
});

// 计算属性：显示临时或已提交的附加分
const displayExtraScores = computed(() => {
  return tempExtraScores.value.length > 0 ? tempExtraScores.value : extraScores.value;
});

// 页面加载时获取数据
onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/student/info', {
      params: { studentId: studentInfo.value.studentId }
    });
    if (res.data.success) {
      const data = res.data.data;
      studentInfo.value.grade = data.studentInfo.grade || '';
      studentInfo.value.college = data.studentInfo.college || '';
      
      totalScore.value = data.totalScore;
      rank.value = data.rank;
      teacherScores.value = data.teacherScores;
      teacherStatusText.value = data.teacherStatus === 'published' ? '已公示' : '未公示';
      teacherStatusColor.value = data.teacherStatus === 'published' ? 'success' : 'warning';
      
      qualityScores.value = data.qualityScores;
      qualityStatusText.value = data.qualityStatus === 'published' ? '已公示' : '未公示';
      qualityStatusColor.value = data.qualityStatus === 'published' ? 'success' : 'warning';
      
      studyScores.value = data.studyScores;
      gpa.value = data.gpa;
      weightedAvg.value = data.weightedAvg;
      
      secondClassScore.value = data.secondClassScore;
      
      deductionItems.value = data.deductionItems;
      deductionStatusText.value = data.deductionStatus === 'published' ? '已公示' : '未公示';
      deductionStatusColor.value = data.deductionStatus === 'published' ? 'success' : 'warning';
      
      extraScores.value = data.extraScores;
      extraStatusText.value = data.extraStatus === 'published' ? '已公示' : '未公示';
      extraStatusColor.value = data.extraStatus === 'published' ? 'success' : 'warning';
    }
  } catch (err) {
    console.error('获取综测信息失败', err);
  }
});

// 临时添加附加分项目（未提交到后端）
const addTempExtraScore = async () => {
  const form = extraForm.value;
  if (!(await form.validate())) return;

  // 临时显示文件名称
  const fileUrl = newExtraItem.value.file ? newExtraItem.value.file.name : '';
  
  // 添加到临时数组
  tempExtraScores.value.push({
    ...newExtraItem.value,
    fileUrl
  });
  
  // 重置表单并关闭对话框
  resetExtraForm();
  extraScoreDialog.value = false;
};

// 提交所有附加分项目到后端
const submitAllExtraScores = async () => {
  if (tempExtraScores.value.length === 0) return;

  const formData = new FormData();
  formData.append('studentId', studentInfo.value.studentId);
  
  // 添加所有项目
  tempExtraScores.value.forEach((item, index) => {
    formData.append(`items[${index}][name]`, item.name);
    formData.append(`items[${index}][score]`, item.score);
    formData.append(`files[${index}]`, item.file);
  });

  try {
    const res = await axios.post(
      'http://localhost:5000/api/student/submit-all-extra',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    if (res.data.success) {
      alert(`成功提交${tempExtraScores.value.length}项附加分，等待审核`);
      tempExtraScores.value = [];
      // 重新获取数据刷新列表
      await onMounted();
    } else {
      alert(res.data.msg || '提交失败，请重试');
    }
  } catch (err) {
    console.error('提交附加分失败', err);
    alert('服务器连接失败，请稍后重试');
  }
};

// 重置附加分表单
const extraForm = ref(null);
const resetExtraForm = () => {
  newExtraItem.value = { name: '', score: null, file: null, fileUrl: '' };
  if (extraForm.value) extraForm.value.reset();
};

// 提交申诉
const submitAppeal = async () => {
  if (!appealItem.value || !appealReason.value) {
    alert('请填写申诉项目和理由');
    return;
  }

  const formData = new FormData();
  formData.append('studentId', studentInfo.value.studentId);
  formData.append('item', appealItem.value);
  formData.append('reason', appealReason.value);
  if (appealFile.value) {
    formData.append('file', appealFile.value);
  }

  try {
    const res = await axios.post(
      'http://localhost:5000/api/student/appeal',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    if (res.data.success) {
      alert('申诉提交成功，等待审核');
      appealDialog.value = false;
      appealItem.value = '';
      appealReason.value = '';
      appealFile.value = null;
    } else {
      alert(res.data.msg || '提交失败，请重试');
    }
  } catch (err) {
    console.error('提交申诉失败', err);
    alert('服务器连接失败，请稍后重试');
  }
};

// 打开附加分对话框
const openExtraScoreDialog = () => {
  resetExtraForm();
  extraScoreDialog.value = true;
};

// 打开申诉对话框
const openAppealDialog = () => {
  appealDialog.value = true;
};

// 退出登录
const handleLogout = () => {
  router.push('/Student/login');
};
</script>

<style scoped>
.font-google-sans {
  font-family: 'Google Sans Medium', sans-serif;
}
.bg-light-gray {
  background-color: #F5F7FA;
}
.text-dark-gray {
  color: #263238;
}
.bg-gradient-blue {
  background: linear-gradient(90deg, #2962FF, #448AFF);
}
.v-card.fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}
.v-card.h-full {
  height: 100%;
}
</style>