<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon color="indigo" class="me-3">mdi-cog</v-icon>
            <span class="text-h5">设置综测成绩占比</span>
          </v-card-title>
          
          <v-card-text>
            <v-alert
              type="info"
              variant="tonal"
              class="mb-6"
              icon="mdi-information-outline"
            >
              调整各项评分在最终综测成绩中的权重。学业成绩、第二课堂、综合评价的总占比必须为100%。
            </v-alert>

            <v-row>
              <v-col v-for="(item, key) in percentages" :key="key" cols="12" md="4">
                <v-card variant="outlined" class="pa-4">
                  <div class="text-h6 mb-2 d-flex align-center">
                    <v-icon :color="getIconColor(key)" class="me-2">{{ getIcon(key) }}</v-icon>
                    {{ item.label }}
                  </div>
                  <v-text-field
                    v-model.number="item.value"
                    type="number"
                    suffix="%"
                    variant="outlined"
                    :rules="[v => v >= 0 && v <= 100 || '请输入0-100的数字']"
                    class="text-h4"
                  ></v-text-field>
                </v-card>
              </v-col>
            </v-row>

            <v-row class="mt-4">
              <v-col cols="12" md="4">
                <v-card variant="outlined" class="pa-4">
                  <div class="text-h6 mb-2 d-flex align-center">
                    <v-icon color="amber" class="me-2">mdi-star</v-icon>
                    {{ bonusScore.label }}
                  </div>
                  <v-text-field
                    v-model.number="bonusScore.value"
                    type="number"
                    suffix="分"
                    variant="outlined"
                    :rules="[v => v >= 0 && v <= 10 || '请输入0-10的数字']"
                    class="text-h4"
                  ></v-text-field>
                  <v-card-text class="pa-0">
                    <small class="text-medium-emphasis">奖励分不计入百分比计算</small>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <v-alert
              v-if="totalPercentage !== 100"
              type="warning"
              variant="tonal"
              class="mt-6 mb-4"
              icon="mdi-alert-circle-outline"
            >
              当前总和为 {{ totalPercentage }}%，请确保总占比为 100%。（奖励分不计入百分比）
            </v-alert>

            <v-alert
              v-else
              type="success"
              variant="tonal"
              class="mt-6 mb-4"
              icon="mdi-check-circle-outline"
            >
              占比设置正确，总和为 100%
            </v-alert>

            <div class="d-flex justify-end mt-6">
              <v-btn 
                color="indigo" 
                @click="savePercentages" 
                :disabled="totalPercentage !== 100"
                :loading="loading"
                size="large"
              >
                <v-icon start>mdi-content-save</v-icon>
                保存设置
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { databaseService } from '@/services/api';

const percentages = ref({
    academic: { label: '学业成绩', value: 60 },
    secondClass: { label: '第二课堂', value: 20 },
    evaluation: { label: '综合评价', value: 20 },
});

const bonusScore = ref({
    label: '综测奖励分', 
    value: 4
});

const loading = ref(false);

const totalPercentage = computed(() => {
    return Object.values(percentages.value).reduce((sum, item) => sum + (Number(item.value) || 0), 0);
});

// 获取图标
const getIcon = (key) => {
    const icons = {
        academic: 'mdi-school-outline',
        secondClass: 'mdi-school',
        evaluation: 'mdi-account-group'
    };
    return icons[key] || 'mdi-help-circle';
};

// 获取图标颜色
const getIconColor = (key) => {
    const colors = {
        academic: 'blue',
        secondClass: 'green',
        evaluation: 'purple'
    };
    return colors[key] || 'grey';
};

// 加载占比设置
const loadPercentages = async () => {
    try {
        // 使用固定的分数占比设置
        percentages.value = {
            academic: { label: '学业成绩', value: 60 },
            secondClass: { label: '第二课堂', value: 20 },
            evaluation: { label: '综合评价', value: 20 },
        };
        bonusScore.value.value = 4;
    } catch (error) {
        console.error('加载占比设置失败:', error);
    }
};

// 保存占比设置
const savePercentages = async () => {
    loading.value = true;
    try {
        // 这里可以添加实际的保存逻辑
        await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟网络请求
        
        // 显示成功消息
        // 可以使用 Vuetify 的 snackbar 或其他通知方式
        alert('占比设置已保存！');
    } catch (error) {
        console.error('保存失败:', error);
        alert('保存失败，请重试');
    }
    loading.value = false;
};

// 组件挂载时加载数据
onMounted(() => {
    loadPercentages();
});
</script>

<style scoped>
.v-text-field {
  font-size: 1.5rem;
}
</style>
