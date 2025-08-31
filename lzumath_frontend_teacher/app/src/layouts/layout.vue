<template>
  <v-app class="fixed">
    <v-navigation-drawer 
      position="fixed"
      :rail="rail"
      width="240"
      permanent>
      <v-card class="mx-auto" width="240">
        <v-toolbar class="text-white" image="https://cdn.vuetifyjs.com/images/backgrounds/vbanner.jpg">
          <v-btn 
            icon="mdi-menu"
            @click="rail = !rail"
          ></v-btn>
          <v-toolbar-title text="工具栏"></v-toolbar-title>
        </v-toolbar>
        <v-list v-model:opened="open">
          <v-list-item 
            v-for="(options, i) in options"
            :key="i"
            :prepend-icon="options.icon"
            :title="options.text"
            :value="options"
            color="primary"
            @click="router.push({ name: options.push })"
          ></v-list-item>
          <v-list-group value="数据库操作">
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                prepend-icon="mdi-upload"
                title="数据库操作"
              ></v-list-item>
            </template>
            <v-list-item
              v-for="([title, icon, push], i) in DatabaseManipulation"
              :key="i"
              :prepend-icon="icon"
              :title="title"
              :value="title"
              @click="router.push({ name: push })"
            ></v-list-item>
          </v-list-group>
        </v-list>
      </v-card>
    </v-navigation-drawer>
    <v-app-bar position="fixed" title="" image="https://cdn.vuetifyjs.com/images/backgrounds/vbanner.jpg">
      <v-app-bar-title>
        <h3>学生综合测评系统</h3>
      </v-app-bar-title>
      <v-menu open-on-hover>
      <template v-slot:activator="{ props }">
        <v-btn color="white" v-bind="props">
          <v-icon icon="mdi-account"></v-icon>
          <h3>{{ id }}</h3>
        </v-btn>
      </template>
      <v-card min-width="125">
        <v-list>
          <v-list-item
            :title= "id"
            subtitle="教师"
          ></v-list-item> 
          <v-list-item v-for="(userpage, i) in userpage" :key="i" :value="userpage">
            <v-list-item-title @click="router.push(userpage.push)">
              {{ userpage.title }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card> 
    </v-menu>
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<style scoped>
.fixed {
  overflow: hidden;
}
.v-main {
  padding-top: 64px;
  height: 100vh;
  overflow-y: auto;
}
</style>

<script setup>

import { useRouter } from "vue-router";
const router = useRouter();

import { useRoute } from 'vue-router'
const route = useRoute()

//import { watch } from 'vue'

const id = localStorage.getItem('id')
/* 
const id = route.params.id
watch(
  () => route.params.id,
  (newId) => {
    console.log('用户ID变化:', newId)
    fetchUserData(newId)
  }
)
*/
import { ref } from 'vue'
const rail = ref(false)

const options = [
  { text: '综测进度', icon: 'mdi-check-circle', push: 'ProgressQuery' },
  { text: '权限管理', icon: 'mdi-account-multiple-outline', push: 'AuthorityManagement' },
  { text: '教师评分', icon: 'mdi-flag', push: 'Grading' },
//{ text: '数据库操作', icon: 'mdi-upload', push: 'DatabaseManipulation' },
]
const userpage = [
  { title: '退出登录', push: '/login'},
]

const open = ref(['数据库操作'])
const DatabaseManipulation = [
  ['已评综测数据', '', 'CAquery'],
  ['学年末绩点导入', '', 'GPAimporting'],
  ['综测成绩构成', '', 'CAcomposition'],
]

</script>