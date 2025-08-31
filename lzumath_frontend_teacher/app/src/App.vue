<template>
  <v-app>
    <v-main>
      <!--所有页面跳转时都会出现的动画-->
      <v-slide-x-transition>
        <router-view />
      </v-slide-x-transition>
    </v-main>
  </v-app>
</template>

<script setup>
defineOptions({
  name: 'App'
})
</script>


