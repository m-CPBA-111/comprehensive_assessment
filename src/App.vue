<!-- 修改后的 App.vue (关键修改) -->
<template>
  <v-app>
    <!-- 使用 RouterView 作为路由出口 -->
    <RouterView />
  </v-app>
</template>

<script setup>
import { RouterView } from 'vue-router'
</script>