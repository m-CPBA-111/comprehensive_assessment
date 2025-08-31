<template>
  <v-container class="pa-6" style="max-width: 600px">
    <v-row dense>
      <!-- 筛选：学院 -->
      <v-col cols="12" sm="4">
        <v-autocomplete
          v-model="selectedCollege"
          :items="colleges"
          label="选择学院"
          item-title="label"
          item-value="value"
          clearable
          dense
        />
      </v-col>

      <!-- 筛选：年级 -->
      <v-col cols="12" sm="4">
        <v-autocomplete
          v-model="selectedGrade"
          :items="grades"
          label="选择年级"
          item-title="label"
          item-value="value"
          clearable
          dense
        />
      </v-col>

      <!-- 筛选：专业 -->
      <v-col cols="12" sm="4">
        <v-autocomplete
          v-model="selectedMajor"
          :items="majors"
          label="选择专业"
          item-title="label"
          item-value="value"
          clearable
          dense
        />
      </v-col>
    </v-row>

    <!-- 确定按钮 -->
    <v-row justify="center" class="mt-4">
      <v-btn color="primary" @click="submitFilter">
        确定
      </v-btn>
    </v-row>
  </v-container>
  <!-- 弹出对话框：显示表名和数据 -->
<v-dialog v-model="showDialog" max-width="800px">
  <v-card>
    <v-card-title>
      <span class="text-h6">查询结果：{{ tableName || '未命名表' }}</span>
      <v-spacer />
      <v-btn icon @click="showDialog = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text>
      <!-- 上传按钮 -->
      <v-file-input
         v-model="scoreFile"
         accept=".csv, .xlsx"
         label="上传分数文件"
         prepend-icon="mdi-upload"
         @change="onFileUpload"
         dense
         hide-details
         outlined
      ></v-file-input>
      <v-data-table
        :headers="tableHeaders"
        :items="selectedClassInfo"
        class="elevation-1"
        dense
      ></v-data-table>
    </v-card-text>
  </v-card>
</v-dialog>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const selectedCollege = ref(null)
const selectedGrade = ref(null)
const selectedMajor = ref(null)
const selectedClassInfo = ref([])
const tableName = ref('')
const tableHeaders = ref([])
const showDialog = ref(false)  // 控制弹窗开关
const scoreFile = ref(null)    // 新增：绑定上传文件


const colleges = [
  { label: '数学与统计学院', value: 'mathstat' },
]

const grades = [
  { label: '2022级', value: '2022' },
  { label: '2023级', value: '2023' },
  { label: '2024级', value: '2024' },
  { label: '2025级', value: '2025' },
]

const majors = [
  { label: '数学基地班', value: 'base' },
  { label: '统计学', value: 'stastics' },
  { label: '信息与计算科学', value: 'techonology' },
]

async function submitFilter() {
  try {
    const response = await axios.post('http://localhost:5000/api/class_info', {
      college: selectedCollege.value,
      grade: selectedGrade.value,
      major: selectedMajor.value
    })

    tableName.value = response.data.table || ''
    const resultData = response.data.data || []
    selectedClassInfo.value = resultData

    if (resultData.length > 0) {
        const keys = response.data.columns || []
        tableHeaders.value = keys
    } 
    else {
    tableHeaders.value = []
    }

    showDialog.value = true  // 打开弹窗

  } catch (error) {
    console.error('查询失败：', error)
    selectedClassInfo.value = []
    tableHeaders.value = []
    tableName.value = ''
    showDialog.value = false
  }
}

// 新增：处理上传的分数文件
async function onFileUpload() {
  console.log('上传的文件:',scoreFile.value)
  if (!scoreFile.value) return

  if (!tableName.value) {
    alert('请先查询班级信息以获取表名')
    return
  }

  const formData = new FormData()
  formData.append('file', scoreFile.value)
  formData.append('table', tableName.value)

  try {
    const res = await axios.post('http://localhost:5000/api/import_scores', formData,{
        headers: { 'Content-Type': 'multipart/form-data' }})

    alert('成绩上传成功') // 如果你有 snackbar/toast 替换这里
    await submitFilter()     // 成功后重新加载数据
  } catch (err) {
    console.error('上传失败：', err)
    alert('成绩上传失败')
  }
}
</script>


