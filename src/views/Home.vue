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
          <a-button class="ml-20" type="primary" @click="fetchTraffic">Fetch Traffic</a-button>
          <a-checkbox class="ml-20" v-model:checked="useCacheChecked">Use Cache</a-checkbox>
          <span>{{ status }}</span>
        </div>
        <div class="actions">
        <input style="display:none" type="file" id="fileInput"/>
          <a-dropdown class="ml-20">
            <template #overlay>
              <a-menu @click="handleMenuClick">
                <a-menu-item key="1">
                  Download as CSV
                </a-menu-item>
                <a-menu-item key="2">
                  Export data
                </a-menu-item>
                <a-menu-item key="3">
                  Import data
                </a-menu-item>
                <a-menu-item key="4">
                  Explore more details
                </a-menu-item>
              </a-menu>
            </template>
            <a-button>
              Action
            </a-button>
          </a-dropdown>
        </div>
        <div>
          <a-table :dataSource="dataSource" :columns="columns">
            <template #headerCell="{ column }">
            <template v-if="column.key === 'action'">
              <span>
                Action
              </span>
            </template>
            <template v-else>
              <span>
                {{column.name}}
              </span>
            </template>
          </template>

          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <a-button type="link" @click="fetchRepoTraffic(record)">Fetch Data</a-button>
            </template>
            <template v-if="column.key === 'referrer'">
              <div class="referrer">
                <div v-for="referrer in record['referrers']">
                  <div>{{ referrer.name }}</div>
                  <div>{{ "Count: "+referrer.views+" Unique:"+referrer.uniqueViews }}</div>
                </div>
              </div>
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
import AccountItem from '../components/AccountItem.vue';
import { onMounted, ref } from "vue";
import { AccountsManager } from '../utils/AccountsManager';
import { GitHubAPI } from '../utils/GitHubAPI';
import type { Repo } from '../models/Repo';
import type { RepoTraffic } from '../models/RepoTraffic';
import type { MenuProps } from 'ant-design-vue';
import { exportData, importData, type ExchangeData, exportAsCSV } from '../utils/Helpers';
const accountsManager = new AccountsManager();
const status = ref("");
const useCacheChecked = ref(true);
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
    sorter: (a: RepoTraffic, b: RepoTraffic) => a.pageViews! - b.pageViews!,
  },
  {
    name: 'Unique Page Views',
    dataIndex: 'uniquePageViews',
    key: 'uniquePageViews',
    sorter: (a: RepoTraffic, b: RepoTraffic) => a.uniquePageViews! - b.uniquePageViews!,
  },
  {
    name: 'Clones',
    dataIndex: 'clones',
    key: 'clones',
    sorter: (a: RepoTraffic, b: RepoTraffic) => a.clones! - b.clones!,
  },
  {
    name: 'Unique Clones',
    dataIndex: 'uniqueClones',
    key: 'uniqueClones',
    sorter: (a: RepoTraffic, b: RepoTraffic) => a.uniqueClones! - b.uniqueClones!,
  },
  {
    name: 'Referrer',
    dataIndex: 'referrer',
    key: 'referrer',
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
  status.value = "Fetching...";
  const accountArray = accounts.value;
  const allRepos = [];
  for (let index = 0; index < accountArray.length; index++) {
    const account = accountArray[index];
    const api = new GitHubAPI(account,useCacheChecked.value);
    const reposArray = await api.listRepos();
    for (let index = 0; index < reposArray.length; index++) {
      const repo = reposArray[index];
      allRepos.push(repo);
    }
  }
  repos.value = allRepos;
  loadRepos();
  status.value = "";
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

const fetchRepoTraffic = async (record:RepoTraffic)=> {
  let account;
  for (let index = 0; index < accounts.value.length; index++) {
    const element = accounts.value[index];
    if (element.name === record.owner) {
      account = element;
    }
  }
  if (account) {
    const api = new GitHubAPI(account,useCacheChecked.value);
    let traffic = await api.fetchTraffic(record);
    record.clones = traffic.clones;
    record.uniqueClones = traffic.uniqueClones;
    record.pageViews = traffic.pageViews;
    record.uniquePageViews = traffic.uniquePageViews;
    record.referrers = traffic.referrers;
  }
}

const fetchTraffic = async () => {
  status.value = "Fetching...";
  for (let index = 0; index < dataSource.value.length; index++) {
    const record = dataSource.value[index];
    await fetchRepoTraffic(record)
    status.value = (index + 1) + "/" + dataSource.value.length;
  }
  status.value = "";
}

const handleMenuClick: MenuProps['onClick'] = e => {
  console.log('click', e);
  if (e.key === "1") {
    exportAsCSV(dataSource.value);
  }else if (e.key === "2"){
    exportData()
  }else if (e.key === "3"){
    let fileInput = document.getElementById("fileInput") as HTMLInputElement;
    fileInput.onchange = function(){
      let files = fileInput.files;
      console.log(files);
      if (files && files?.length>0) {
        let file = files[0];
        console.log(file)
        let fileReader = new FileReader();
        fileReader.onload = function(e){
          if (e.target) {
            status.value = "Importing...";
            importData(JSON.parse(e.target.result as string) as ExchangeData);
            status.value = "";
            location.reload();
          }
        };
        fileReader.readAsText(file);
      }
    }
    fileInput.click();
  }else{
    window.location.pathname = "/more";
  }
};

</script>
<style scoped>
.container {
  padding:10px;
}
header {
  padding:5px;
}

.referrer {
  max-height: 50px;
  overflow: auto;
}

.actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
</style>
