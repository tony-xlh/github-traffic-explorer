<template>
  <div id="app">
    <header>
      <h2>GitHub Traffic Explorer</h2>
    </header>
    <main>
      <div class="account">
        <AccountItem @delete-clicked="deleteAccount" @changed="accountChanged" v-for="account in accounts" :account="account"></AccountItem>
        <div>
          <a-button type="primary" @click="newAccount">New</a-button>
        </div>
      </div>
    </main>
  </div>
</template>
<script lang="ts" setup>
import type { Account } from '@/models/Account';
import AccountItem from './components/AccountItem.vue';
import { onMounted, ref } from "vue";
import { AccountsManager } from './utils/AccountsManager';
const accountsManager = new AccountsManager();

const accounts = ref([] as Account[])
onMounted(async () => {
  const accountArray = await accountsManager.loadAccounts();
  if (accountArray.length === 0 ) {
    accountArray.push({name:"",type:"user",token:""});
  }
  accounts.value = accountArray;
});

const accountChanged = async (_account:Account) => {
  console.log("accountChanged");
  await accountsManager.clear()
  await accountsManager.setAccounts(accounts.value);
}

const newAccount = () => {
  accounts.value.push({name:"",type:"user",token:""});
}

const deleteAccount = async (_account:Account) => {
  await accountsManager.deleteAccount(_account.name)
  accounts.value = await accountsManager.loadAccounts();
}
</script>
<style scoped>
#app {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
header {
  padding:20px;
}

</style>./utils/AccountsManager
