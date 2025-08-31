<template>
  <v-container class="d-flex justify-center">
    <v-timeline direction="horizontal" line-inset="12" class="mt-12" style="max-width: 90vw;">
      <v-timeline-item
        v-for="(step, index) in steps"
        :key="index"
        :dot-color="index <= activeStep ? 'deep-purple accent-4' : 'grey lighten-1'"
        :icon="index <= activeStep ? 'mdi-check-circle' : 'mdi-progress-clock'"
      >
        <!-- 可点击圆点按钮（无文字） -->
        <template v-slot:opposite>
          <v-btn
            icon
            size="x-small"
            :color="index <= activeStep ? 'deep-purple' : 'grey'"
            @click="activeStep = index"
            class="elevation-2"
          >
            <v-icon>{{ index <= activeStep ? 'mdi-check' : 'mdi-circle-outline' }}</v-icon>
          </v-btn>
        </template>

        <!-- 事件内容 -->
        {{ step.content }}
      </v-timeline-item>
    </v-timeline>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'

const activeStep = ref(0) // 当前进度步骤
const steps = [
  { time: '2025-01', content: '综测小组打分' },
  { time: '2025-03', content: '学生端提交附加分' },
  { time: '2025-06', content: '教师端导入二课' },
  { time: '2025-08', content: '计算综合测评分数' },
  { time: '2025-10', content: '公示' },
  { time: '2025-12', content: '综合测评完成' }
]
</script>
