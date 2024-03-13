<template>
  <div class="item">
    <label>
      Account:
      <input type="text" v-model="props.account.name" v-on:change="changed">
    </label>
    <label>
      Type:
      <select v-model="props.account.type" v-on:change="changed">
        <option value="user">User</option>
        <option value="org">Organization</option>
      </select>
    </label>
    <label>
      Token:
      <input type="password" v-model="props.account.token" v-on:change="changed">
    </label>
    <a-button @click="deleteClicked" type="primary" class="ml-20">Delete</a-button>
  </div>
</template>
<script setup lang="ts">
import type { Account } from '@/models/Account';
const props = defineProps<{
  account: Account
}>()
const emit = defineEmits(['changed','deleteClicked']);

const changed = () => {
  emit('changed',props.account);
}

const deleteClicked = () => {
  emit('deleteClicked',props.account);
}
</script>
<style scoped>
.item {
  padding:5px;
}
input {
  min-width: 100px;
  max-width: 150px;
}
</style>