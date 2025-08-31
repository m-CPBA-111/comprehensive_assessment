<template>
  <v-container>
    <v-row class="d-flex justify-center mx-2">
      <v-col cols="auto" class="p-2">
        <v-select
          v-model="input.college"
          style="width: 200px;"
          label="学院"
          :items="colleges"
          item-title="content"
          item-value="key"
          variant="outlined"
          density="comfortable"
        ></v-select>
      </v-col>
      <v-col cols="auto" class="p-2">
        <v-select
          v-model="input.grade"
          style="width: 200px;"
          label="年级"
          :items="grades"
          item-title="content"
          item-value="key"
          variant="outlined"
          density="comfortable"
        ></v-select>
      </v-col>
      <v-col cols="auto" class="p-2">
        <v-select
          :disabled="!majorEnabled"
          v-model="input.major"
          style="width: 200px;"
          label="专业"
          :items="majors"
          item-title="content"
          item-value="content"
          variant="outlined"
          density="comfortable"
        ></v-select>
      </v-col>
    </v-row>
  </v-container> 
  <v-row justify="center" class="mt-4">
      <v-btn color="primary" @click="submitFilter">
        确定
      </v-btn>
    </v-row>
  <v-container>
  <v-data-table
    :headers="tableHeaders"
    :items="tableData"
    class="mt-4"
    dense
    bordered
  ></v-data-table>
</v-container>  
</template>


<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'

//------select------

const input = ref({
  college: "",
  grade: "",
  major: "",
})

const colleges = [
  { content:'数学与统计学院', key:'math' },
]
const grades = [
  { content:'23级', key:'2023' },
  { content:'24级', key:'2024' },
]

const majors = ref([])
const majorList = {
  math: {
    2023: [
      { content:'基地', key:'base' },
      { content:'统计', key:'statistics' },
      { content:'信计', key:'ICS' },
    ],
    2024: [
      { content:'基地', key:'base' },
      { content:'专业', key:'major' },
    ],
  },
}

const majorEnabled = ref()
watch([ () => input.value.college, () => input.value.grade ], ([ccc, ggg]) => {
  if (ccc && ggg) {
    majors.value = majorList[ccc]?.[ggg]
    majorEnabled.value = true
  } else {
    majors.value = []
    majorEnabled.value = false
  }
})

const selectedTable = ref('')
const tableData = ref([])
const tableHeaders = ref([])

const submitFilter = async () => {
  if (!input.value.college || !input.value.grade || !input.value.major) {
    alert('请选择学院、年级和专业')
    return
  }

  // 拼接表名，例如 math_2023_基地_综合测评模板
  const tableName = `${input.value.college}_${input.value.grade}_${input.value.major}_综合测评模板`
  selectedTable.value = tableName

  try {
    const res = await axios.post('http://localhost:5000/api/dispresult', {
      table: tableName
    })
    console.log('表名：', tableName)
    console.log('返回数据：', res.data)

    tableHeaders.value = res.data.columns
    tableData.value = res.data.rows
  } catch (error) {
    console.error('请求失败：', error)
  }
}
</script>