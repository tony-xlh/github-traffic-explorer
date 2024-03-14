<template>
  <component :is="currentView" />
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import Home from './views/Home.vue'
import More from './views/More.vue'
const routes = {
  '/': Home,
  '/more': More
}

const currentPath = ref(window.location.pathname)
window.addEventListener('hashchange', () => {
  currentPath.value = window.location.hash
})
const currentView = computed(() => {
  let path:string = currentPath.value;
  let view = (routes as any)[path];
  return view;
})
</script>
