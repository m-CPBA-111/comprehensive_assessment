<template>
  <v-container>
    <h2>模版下载</h2>
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
      <v-col cols="auto" class="p-2">
        <v-btn
          class="ma-1"
          color="success"
          variant="flat"
          prepend-icon="mdi-download"
          text="下载"
          @click="download"
        ></v-btn>
      </v-col>
    </v-row>
  </v-container> 
  <v-container>
    <h2>数据导入</h2>
    <v-file-input
    ></v-file-input>
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

//------------------

//-----download-----

function download() {
  const college = input.value.college; 
  const grade = input.value.grade; 
  const major = input.value.major; 

  if (!college || !grade || !major) {
    alert("请选择学院、年级和专业");
    return;
  }

  axios.post('http://localhost:5000/api/template/download', {
    college,
    grade,
    major,
  }, {
    responseType: 'blob', // 二进制流接收
  })
  .then(res => {

    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.href = url
    link.download = `${college}_${grade}_${major}_综测模板.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

  })
  .catch(err => {
    alert('请求出错');
    console.log(err);
  });
}

//------------------

</script>