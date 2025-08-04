<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h5 primary--text">
            <v-icon left>mdi-plus-circle</v-icon>
            附加分录入
          </v-card-title>
          <v-card-subtitle>
            为学生录入附加分（奖励分），最大值为 {{ maxBonusScore }} 分
          </v-card-subtitle>
          <v-card-text>
            <!-- 学生选择区域 -->
            <v-row>
              <v-col cols="12" md="6">
                <v-autocomplete
                  v-model="selectedStudent"
                  :items="students"
                  item-title="displayName"
                  item-value="campus_id"
                  label="选择学生"
                  prepend-inner-icon="mdi-account"
                  clearable
                  outlined
                  dense
                  @update:model-value="loadStudentBonusScore"
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props">
                      <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                      <v-list-item-subtitle>{{ item.raw.campus_id }} - {{ item.raw.class }}</v-list-item-subtitle>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="currentBonusScore"
                  label="当前附加分"
                  prepend-inner-icon="mdi-star"
                  suffix="分"
                  readonly
                  outlined
                  dense
                />
              </v-col>
            </v-row>

            <!-- 附加分录入表单 -->
            <v-form v-model="formValid" ref="bonusForm">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="bonusScore"
                    :rules="bonusScoreRules"
                    label="附加分数"
                    prepend-inner-icon="mdi-plus"
                    suffix="分"
                    type="number"
                    step="0.01"
                    outlined
                    dense
                    :disabled="!selectedStudent"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="bonusType"
                    :items="bonusTypes"
                    label="附加分类型"
                    prepend-inner-icon="mdi-tag"
                    outlined
                    dense
                    :disabled="!selectedStudent"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-textarea
                    v-model="bonusReason"
                    :rules="reasonRules"
                    label="附加分原因"
                    prepend-inner-icon="mdi-text"
                    placeholder="请详细描述获得附加分的原因..."
                    outlined
                    rows="3"
                    counter="200"
                    :disabled="!selectedStudent"
                  />
                </v-col>
              </v-row>
            </v-form>

            <!-- 操作按钮 -->
            <v-row class="mt-4">
              <v-col cols="12">
                <v-btn
                  @click="submitBonusScore"
                  :disabled="!formValid || !selectedStudent || loading"
                  :loading="loading"
                  color="primary"
                  large
                  block
                >
                  <v-icon left>mdi-check</v-icon>
                  提交附加分
                </v-btn>
              </v-col>
            </v-row>

            <!-- 当前学生的附加分历史记录 -->
            <v-divider class="mt-6 mb-4"></v-divider>
            <v-subheader class="text-h6">附加分记录</v-subheader>
            <v-data-table
              :headers="bonusHeaders"
              :items="bonusRecords"
              :loading="recordsLoading"
              class="elevation-1"
              no-data-text="暂无附加分记录"
              loading-text="加载中..."
            >
              <template v-slot:item.score="{ item }">
                <v-chip :color="item.score > 0 ? 'success' : 'error'" small>
                  {{ item.score > 0 ? '+' : '' }}{{ item.score }} 分
                </v-chip>
              </template>
              <template v-slot:item.created_at="{ item }">
                {{ formatDate(item.created_at) }}
              </template>
              <template v-slot:item.actions="{ item }">
                <v-tooltip bottom>
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      @click="deleteBonus(item)"
                      icon="mdi-delete"
                      size="small"
                      color="error"
                    />
                  </template>
                  <span>删除记录</span>
                </v-tooltip>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 成功提示 -->
    <v-snackbar
      v-model="showSuccess"
      color="success"
      timeout="3000"
      top
    >
      {{ successMessage }}
      <template v-slot:actions>
        <v-btn @click="showSuccess = false" icon="mdi-close" />
      </template>
    </v-snackbar>

    <!-- 错误提示 -->
    <v-snackbar
      v-model="showError"
      color="error"
      timeout="5000"
      top
    >
      {{ errorMessage }}
      <template v-slot:actions>
        <v-btn @click="showError = false" icon="mdi-close" />
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import axios from 'axios'

export default {
  name: 'BonusEntryView',
  setup() {
    // 响应式数据
    const students = ref([])
    const selectedStudent = ref(null)
    const currentBonusScore = ref(0)
    const bonusScore = ref('')
    const bonusType = ref('')
    const bonusReason = ref('')
    const bonusRecords = ref([])
    const maxBonusScore = ref(4)
    
    // 状态
    const formValid = ref(false)
    const loading = ref(false)
    const recordsLoading = ref(false)
    const showSuccess = ref(false)
    const showError = ref(false)
    const successMessage = ref('')
    const errorMessage = ref('')

    // 附加分类型选项
    const bonusTypes = [
      '学术竞赛',
      '科技创新',
      '社会实践',
      '志愿服务',
      '文体活动',
      '技能证书',
      '学术论文',
      '专利发明',
      '其他'
    ]

    // 表格头部
    const bonusHeaders = [
      { title: '分数', key: 'score', align: 'center', width: 100 },
      { title: '类型', key: 'type', align: 'center', width: 120 },
      { title: '原因', key: 'reason', align: 'start' },
      { title: '录入时间', key: 'created_at', align: 'center', width: 150 },
      { title: '操作', key: 'actions', align: 'center', width: 80, sortable: false }
    ]

    // 验证规则
    const bonusScoreRules = [
      v => !!v || '请输入附加分数',
      v => !isNaN(parseFloat(v)) || '请输入有效的数字',
      v => parseFloat(v) >= -10 || '附加分不能低于 -10 分',
      v => {
        const newTotal = parseFloat(currentBonusScore.value) + parseFloat(v)
        return newTotal <= maxBonusScore.value || `总附加分不能超过 ${maxBonusScore.value} 分`
      }
    ]

    const reasonRules = [
      v => !!v || '请输入附加分原因',
      v => v.length <= 200 || '原因描述不能超过200字'
    ]

    // 计算属性
    const studentsWithDisplay = computed(() => {
      return students.value.map(student => ({
        ...student,
        displayName: `${student.name} (${student.campus_id})`
      }))
    })

    // 方法
    const loadStudents = async () => {
      try {
        const response = await axios.get('/api/students')
        students.value = response.data
      } catch (error) {
        console.error('加载学生列表失败:', error)
        showError.value = true
        errorMessage.value = '加载学生列表失败'
      }
    }

    const loadStudentBonusScore = async () => {
      if (!selectedStudent.value) {
        currentBonusScore.value = 0
        bonusRecords.value = []
        return
      }

      try {
        recordsLoading.value = true
        
        // 获取学生当前附加分
        const studentResponse = await axios.get(`/api/students/${selectedStudent.value}`)
        currentBonusScore.value = studentResponse.data.bonus_score || 0

        // 获取附加分记录
        const recordsResponse = await axios.get(`/api/bonus-records/${selectedStudent.value}`)
        bonusRecords.value = recordsResponse.data

      } catch (error) {
        console.error('加载学生附加分失败:', error)
        showError.value = true
        errorMessage.value = '加载学生信息失败'
      } finally {
        recordsLoading.value = false
      }
    }

    const submitBonusScore = async () => {
      if (!selectedStudent.value || !bonusScore.value || !bonusType.value || !bonusReason.value) {
        showError.value = true
        errorMessage.value = '请填写完整信息'
        return
      }

      try {
        loading.value = true

        const bonusData = {
          student_campus_id: selectedStudent.value,
          score: parseFloat(bonusScore.value),
          type: bonusType.value,
          reason: bonusReason.value
        }

        await axios.post('/api/bonus-records', bonusData)
        
        // 重置表单
        bonusScore.value = ''
        bonusType.value = ''
        bonusReason.value = ''
        
        // 重新加载数据
        await loadStudentBonusScore()
        
        showSuccess.value = true
        successMessage.value = '附加分提交成功！'

      } catch (error) {
        console.error('提交附加分失败:', error)
        showError.value = true
        errorMessage.value = error.response?.data?.message || '提交附加分失败'
      } finally {
        loading.value = false
      }
    }

    const deleteBonus = async (item) => {
      if (!confirm('确定要删除这条附加分记录吗？')) {
        return
      }

      try {
        await axios.delete(`/api/bonus-records/${item.id}`)
        await loadStudentBonusScore()
        
        showSuccess.value = true
        successMessage.value = '附加分记录删除成功！'

      } catch (error) {
        console.error('删除附加分记录失败:', error)
        showError.value = true
        errorMessage.value = '删除失败'
      }
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString('zh-CN')
    }

    const loadEvaluationSettings = async () => {
      try {
        const response = await axios.get('/api/evaluation-settings')
        maxBonusScore.value = response.data.max_bonus_score || 4
      } catch (error) {
        console.error('加载评价设置失败:', error)
      }
    }

    // 生命周期
    onMounted(() => {
      loadStudents()
      loadEvaluationSettings()
    })

    return {
      // 响应式数据
      students: studentsWithDisplay,
      selectedStudent,
      currentBonusScore,
      bonusScore,
      bonusType,
      bonusReason,
      bonusRecords,
      maxBonusScore,
      
      // 状态
      formValid,
      loading,
      recordsLoading,
      showSuccess,
      showError,
      successMessage,
      errorMessage,
      
      // 选项和配置
      bonusTypes,
      bonusHeaders,
      bonusScoreRules,
      reasonRules,
      
      // 方法
      loadStudentBonusScore,
      submitBonusScore,
      deleteBonus,
      formatDate
    }
  }
}
</script>

<style scoped>
.v-card-title {
  background: linear-gradient(45deg, #1976d2, #42a5f5);
  color: white !important;
}

.v-subheader {
  color: #1976d2;
  font-weight: 600;
}
</style>
