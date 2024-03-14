<template>
  <div class="container">
    <a href="#">Back</a>
    <h2>More Details</h2>
    <div>
      <h3>Referring Sites</h3>
      <a-table :dataSource="dataSource" :columns="columns">
        <template #headerCell="{ column }">
          <template v-if="column.key">
            <span>
              {{column.name}}
            </span>
          </template>
        </template>

        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'repos'">
            <div class="repos">
              <ol>
                <li v-for="repo in record['repos']">
                  {{ repo }}
                </li>
              </ol>
            </div>
          </template>
          <template v-else>
            <span>
              {{ console.log(record) }}
              {{ record[column.key] }}
            </span>
          </template>
        </template>
      </a-table>
    </div>
    <div>
      <h3>Repos not Having Referrers</h3>
      <ol>
        <li v-for="repo in reposNotHavingReferrers">
          {{ repo.owner + "/" + repo.name }}
        </li>
      </ol>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type { ReferrerDetails } from '@/models/ReferrerDetails';
import type { Repo } from '@/models/Repo';
import type { RepoTraffic } from '@/models/RepoTraffic';
import { AccountsManager } from '@/utils/AccountsManager';
import { GitHubAPI } from '@/utils/GitHubAPI';
import { onMounted, ref } from 'vue';
const columns = [
  {
    name: 'Referrer',
    dataIndex: 'referrer',
    key: 'name',
  },
  {
    name: 'Views',
    dataIndex: 'views',
    key: 'views',
    sorter: (a: ReferrerDetails, b: ReferrerDetails) => a.views! - b.views!,
  },
  {
    name: 'Unique Views',
    dataIndex: 'uniqueViews',
    key: 'uniqueViews',
    sorter: (a: ReferrerDetails, b: ReferrerDetails) => a.uniqueViews! - b.uniqueViews!,
  },
  {
    name: 'Repos',
    dataIndex: 'repos',
    key: 'repos',
  }
];
const dataSource = ref([] as ReferrerDetails[]);
const reposNotHavingReferrers = ref([] as Repo[]);
const calculateDataSource = async () => {
  const details:ReferrerDetails[] = [];
  const dataDict:any = {};
  const accountsManager = new AccountsManager();
  const accountArray = await accountsManager.loadItems();
  const allRepos:RepoTraffic[] = [];
  const allReposNotHavingReferrers:Repo[] = [];
  for (let index = 0; index < accountArray.length; index++) {
    const account = accountArray[index];
    const api = new GitHubAPI(account,true);
    const reposArray = await api.listRepos();
    for (let index = 0; index < reposArray.length; index++) {
      const repo = reposArray[index];
      let traffic = await api.fetchTraffic(repo);
      allRepos.push(traffic);
    }
  }
  for (let index = 0; index < allRepos.length; index++) {
    const repo = allRepos[index];
    if (repo.referrers) {
      if (repo.referrers.length === 0) {
        allReposNotHavingReferrers.push(repo);
      }
      for (let j = 0; j < repo.referrers.length; j++) {
        const referrer = repo.referrers[j];
        let views = referrer.views;
        let uniqueViews = referrer.uniqueViews;
        let repos = [repo.owner+"/"+repo.name]
        if (referrer.name in dataDict) {
          views = views + dataDict[referrer.name].views;
          uniqueViews = uniqueViews + dataDict[referrer.name].uniqueViews;
          repos = repos.concat(dataDict[referrer.name].repos);
        }
        dataDict[referrer.name] = {
          views:views,
          uniqueViews:uniqueViews,
          repos:repos
        }
      }
    }
  }
  for (let index = 0; index < Object.keys(dataDict).length; index++) {
    const name = Object.keys(dataDict)[index];
    details.push({
      name:name,
      views:dataDict[name].views,
      uniqueViews:dataDict[name].uniqueViews,
      repos:dataDict[name].repos
    });
  }
  reposNotHavingReferrers.value = allReposNotHavingReferrers;
  dataSource.value = details;
}
onMounted(async () => {
  calculateDataSource();
});
</script>
<style scoped>
.container {
  padding: 10px;
}

.repos {
  max-height: 100px;
  overflow: auto;
}
</style>