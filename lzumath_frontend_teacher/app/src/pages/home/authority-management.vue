<template>
  <v-container>
    <v-data-table
      v-model="selected"
      :headers="headers"
      :items="groupmembers"
      item-value="id"
      :search="keywords1"
      :show-select="showSelect">
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>
            <v-icon
              color="medium-emphasis"
              icon="mdi-book-multiple"
              size="x-middle"
            ></v-icon>           
            综测小组成员
          <v-divider class="mx-2" vertical></v-divider>
          <v-btn
            class="me-2"
            color="orange-darken-2"
            variant="flat"
            prepend-icon="mdi-cog-outline"
            text="成员管理"
            :disabled="locked"
            @click="manage"
          ></v-btn>
            <template v-if="showSubButtons" class="d-flex gap-2">
              <v-dialog
                v-model="dialog"
                max-width="800"
                persistent>
                <template v-slot:activator="{ props: activatorProps }">
                  <v-btn 
                    v-bind="activatorProps"
                    class="me-2"
                    color="info"
                    variant="flat"
                    prepend-icon="mdi-plus"
                    text="添加"
                    @click="selected = []"
                  ></v-btn>
                </template>
                <v-card title="添加综测组员">
                  <template v-slot:text>
                    <v-row>
                      <v-col cols="12" md="5">
                        <v-autocomplete
                          v-model="input.college"
                          label="学院"
                          :items="colleges"
                          item-title="content"
                          item-value="key"
                          variant="outlined"
                          density="comfortable"
                        ></v-autocomplete>
                      </v-col>
                      <v-col cols="12" md="5">
                        <v-select
                          v-model="input.grade"
                          label="年级"
                          :items="grades"
                          item-title="content"
                          item-value="key"
                          variant="outlined"
                          density="comfortable"
                        ></v-select>
                      </v-col>
                      <v-col cols="12" md="2">
                        <v-btn 
                          class="ma-1"
                          color="info"
                          variant="flat"
                          text="查询"
                          @click="query"
                        ></v-btn>
                      </v-col>
                    </v-row>
                    <v-data-table
                      v-model="selected"
                      :headers="headers"
                      :items="students"
                      :items-per-page="itemsPerPage"
                      item-value="id"
                      :search="keywords2"
                      show-select>
                      <template v-if="showSearch" v-slot:top>
                        <v-text-field
                          v-model="keywords2"
                          label="搜索"
                          prepend-inner-icon="mdi-magnify"
                          variant="outlined"
                          density="comfortable"
                          hide-details
                          single-line
                        ></v-text-field>
                      </template>
                    </v-data-table>
                  </template>
                  <template v-slot:actions>
                    <v-btn text="取消" @click="cancel"></v-btn>
                    <v-btn 
                      :disabled="!addEnabled" 
                      text="确认添加" 
                      @click="edit('add')"
                    ></v-btn>
                  </template>
                </v-card>
              </v-dialog>
              <v-btn 
                :disabled="!deleteEnabled"
                class="me-2"
                color="error"
                variant="flat"
                prepend-icon="mdi-delete"
                text="删除"
                @click="edit('remove')"
              ></v-btn>
              <v-btn 
                class="me-2"
                color="success"
                variant="flat"
                prepend-icon="mdi-check"
                text="完成"
                @click="finish"
              ></v-btn>
            </template>
          </v-toolbar-title>
          <v-tooltip text="帮助">
            <template v-slot:activator="{ props }">
              <v-btn 
                v-bind="props" 
                size="x-small"
                variant="outlined"
                icon="mdi-help"
              ></v-btn>
            </template>
          </v-tooltip>              
        </v-toolbar>
      </template>
      <template v-slot:tfoot>
        <v-text-field
          v-model="keywords1"
          style="width: 200px;"
          class="ma-2"
          label="搜索"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          single-line
        ></v-text-field>
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup>

import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import axios from 'axios'

//---JensonButton---

const locked = ref(false)
const showSubButtons = ref(false)
const showSelect = ref(false)

function manage() {
  showSubButtons.value = true
  locked.value = true
  showSelect.value = true
}

function finish() {
  showSubButtons.value = false
  locked.value = false
  showSelect.value = false
}

const dialog = ref(false)

function cancel() {
  dialog.value = false
  selected.value = []
}

//------select------

const deleteEnabled = ref()
const addEnabled = ref()
const selected = ref([])

watch(selected, (aaa) => {
  deleteEnabled.value = aaa.length > 0
  addEnabled.value = aaa.length > 0
})

function edit(action) { 
  const ids = selected.value
  axios.post('http://localhost:5000/api/groupmember/edit', {
    action,
    ids,
    tableName: tableName.value,
  })
  .then(res => {
    console.log(res)
    if (res.data.success) {
      alert(res.data.message)
      selected.value = []
      if (action === 'add') {
        dialog.value = false
      }
    } else {
      alert(res.data.message)
      return
    }
  })
  .catch(err => {
    alert('请求出错');
    console.log(err);
  });
}

//------------------

//-------查询-------

const colleges = [
  { content:'数学与统计学院', key:'math' },
  { content:'物理', key:'physics' },
  { content:'化学', key:'chemistry' },
]
const grades = [
  { content:'22级', key:'2022' },
  { content:'23级', key:'2023' },
  { content:'24级', key:'2024' },
]

const input = ref({
  college: "",
  grade: "",
});

const students = ref([])
const tableName = ref('')

function query() {
  const college = input.value.college; 
  const grade = input.value.grade; 

  if (!college || !grade) {
    alert("请选择学院和年级");
    return;
  }

  axios.post('http://localhost:5000/api/student/query', {
    college,
    grade,
  })
  .then(res => {
    console.log(res)
    if (res.data.success) {
      tableName.value = res.data.tableName
      students.value = res.data.datas
    } else {
      alert(res.data.message)
      return
    }
  })
  .catch(err => {
    alert('请求出错');
    console.log(err);
  });
/*try {
    const res = await axios.post('http://127.0.0.1:5000/api/student/query', {
      college,
      grade,
    })
    console.log(res)
    if (res.data.success) {
      tableName.value = res.data.tableName
      students.value = res.data.datas
    } else {
      alert('数据获取失败')
      return
    }
  } catch (err) {
      console.error('数据获取失败',err)
  }*/
}

//------------------

//-----数据库连接-----

const headers = [
    { title: '学号', key: 'id', align: 'start' },
    { title: '姓名', key: 'name', align: 'start' },
    { title: '学院', key: 'college', align: 'start' },
    { title: '年级', key: 'grade', align: 'start' },
    { title: '专业', key: 'major', align: 'start' },
//  { title: '权限', key: 'authority', align: 'start' },
]

const groupmembers = ref([])
let time = null

function fetchData() {
  axios.get('http://localhost:5000/api/groupmember/data')
  .then(res => {
    console.log(res)
    if (res.data.success) {
      groupmembers.value = res.data.datas
    } else {
      alert(res.data.message)
      return
    }
  })
  .catch(err => {
    alert('请求出错');
    console.log(err);
  });
}

onMounted(() => {
  fetchData()
  time = setInterval(fetchData, 114514) // 1.5s
})

onBeforeUnmount(() => {
  if (time) clearInterval(time)
})

//------------------

//------table-------

const itemsPerPage = ref(6)

const keywords1 = ref('')
const keywords2 = ref('')

const showSearch = ref(false)
watch(students, (bbb) => {
  showSearch.value = bbb.length > 0
})

//------------------

</script>