<template>
  <div class="container">
    <header>
      <h2>GitHub Traffic Explorer</h2>
    </header>
    <main>
      <div class="account" style="overflow:auto;">
        <AccountItem style="min-width: 650px;" @delete-clicked="deleteAccount" @changed="accountChanged" v-for="account in accounts" :account="account"></AccountItem>
        <div>
          <a-button type="primary" @click="newAccount">New</a-button>
        </div>
      </div>
      <div class="statistics" style="margin-top:10px;">
        <div>
          <a-button type="primary" @click="fetchRepos">Fetch Repos</a-button>
        </div>
        <div>
          <a-table :dataSource="dataSource" :columns="columns">
            <template #headerCell="{ column }">
            <template v-if="column.key === 'action'">
              <span>
                <smile-outlined />
                Action
              </span>
            </template>
            <template v-else>
              <span>
                <smile-outlined />
                {{column.name}}
              </span>
            </template>
          </template>

          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <span>
                loading...
              </span>
            </template>
            <template v-else>
              <a>
                {{ record[column.key] }}
              </a>
            </template>
          </template>
          </a-table>
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
import { GitHubAPI } from './utils/GitHubAPI';
import type { Repo } from './models/Repo';
import type { RepoTraffic } from './models/RepoTraffic';
const accountsManager = new AccountsManager();

const accounts = ref([] as Account[]);
const repos = ref([] as Repo[]);
const dataSource = ref([] as RepoTraffic[]);
const columns = [
  {
    name: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    name: 'Owner',
    dataIndex: 'owner',
    key: 'owner',
  },
  {
    name: 'Page Views',
    dataIndex: 'pageViews',
    key: 'pageViews',
  },
  {
    name: 'Unique Page Views',
    dataIndex: 'uniquePageViews',
    key: 'uniquePageViews',
  },
  {
    name: 'Clones',
    dataIndex: 'clones',
    key: 'clones',
  },
  {
    name: 'Unique Clones',
    dataIndex: 'uniqueClones',
    key: 'uniqueClones',
  },
  {
    name: 'Referring',
    dataIndex: 'referring',
    key: 'referring',
  },
  {
    title: 'Action',
    key: 'action',
  }
];

onMounted(async () => {
  const accountArray = await accountsManager.loadItems();
  if (accountArray.length === 0 ) {
    accountArray.push({name:"",type:"user",token:""});
  }
  accounts.value = accountArray;
});

const accountChanged = async (_account:Account) => {
  console.log("accountChanged");
  await accountsManager.clear()
  await accountsManager.setItems(accounts.value);
}

const newAccount = () => {
  accounts.value.push({name:"",type:"user",token:""});
}

const deleteAccount = async (_account:Account) => {
  await accountsManager.deleteItem(_account.name)
  accounts.value = await accountsManager.loadItems();
}

const fetchRepos = async () => {
  const accountArray = accounts.value;
  const allRepos = [];
  for (let index = 0; index < accountArray.length; index++) {
    const account = accountArray[index];
    const api = new GitHubAPI(account);
    const reposArray = await api.listRepos();
    for (let index = 0; index < reposArray.length; index++) {
      const repo = reposArray[index];
      allRepos.push(repo);
    }
  }
  repos.value = allRepos;
  loadRepos();
}

const loadRepos = () => {
  const allRepoTraffic:RepoTraffic[] = [];
  const allRepos = repos.value;
  for (let index = 0; index < allRepos.length; index++) {
    const repo = allRepos[index];
    const repoTraffic:RepoTraffic = {
      name:repo.name,
      owner:repo.owner
    }
    allRepoTraffic.push(repoTraffic);
  }
  dataSource.value = allRepoTraffic;
}

</script>
<style scoped>
.container {
  padding:10px;
}
header {
  padding:5px;
}
</style>
