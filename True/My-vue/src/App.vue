<template>
  <div id="app">
    <TodoApp />
  </div>
</template>

<script setup lang="ts">
import TodoApp from './components/TodoApp.vue'
</script>

<style>
body {
  margin: 0;
  padding: 0;
  background: linear-gradient(
    to right,
    rgb(113, 65, 168),
    rgba(44, 114, 251, 1)
  );
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

#app {
  min-height: 100vh;
}
</style>
