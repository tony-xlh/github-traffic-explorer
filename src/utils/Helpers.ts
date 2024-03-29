import type { RepoTraffic } from "@/models/RepoTraffic";
import { AccountsManager } from "./AccountsManager";
import localforage from "localforage";
import type { Repo } from "@/models/Repo";
import type { Account } from "@/models/Account";
import type { ReferrerDetails } from "@/models/ReferrerDetails";

export interface ExchangeData{
  accounts:Account[];
  repos:Repo[];
  traffics:RepoTraffic[];
}

export function exportAsCSV(repoTraffics:RepoTraffic[]) {
  let separator = ",";
  let csv = [];
  let headRow = ["Name","Owner","Page Views","Unique Page Views","Clones","Unique Clones","Referrers"];
  csv.push(headRow);
  for (let i = 0; i < repoTraffics.length; i++) {
    let row = [];
    let traffic = repoTraffics[i];
    row.push(traffic.name);
    row.push(traffic.owner);
    row.push(traffic.pageViews);
    row.push(traffic.uniquePageViews);
    row.push(traffic.clones);
    row.push(traffic.uniqueClones);
    row.push(JSON.stringify(traffic.referrers));
    csv.push(row.join(separator));
  }
  let csv_string = csv.join('\n');
  let date = new Date();
  let filename = date.getFullYear() + (date.getMonth()+1).toString().padStart(2,"0") + date.getDate().toString().padStart(2,"0") + ".csv";
  downloadAsTxt(csv_string,filename);
}

export function exportReferringDetailsAsCSV(details:ReferrerDetails[]) {
  let separator = ",";
  let csv = [];
  let headRow = ["Name","Views","Unique Views","Repos"];
  csv.push(headRow);
  for (let i = 0; i < details.length; i++) {
    let row = [];
    let item = details[i];
    row.push(item.name);
    row.push(item.views);
    row.push(item.uniqueViews);
    row.push(JSON.stringify(item.repos));
    csv.push(row.join(separator));
  }
  let csv_string = csv.join('\n');
  downloadAsTxt(csv_string,"details.csv");
}

export async function exportData() {
  const accountsManager = new AccountsManager();
  let accounts = await accountsManager.loadItems();
  let repos:Repo[] = [];
  for (let index = 0; index < accounts.length; index++) {
    const account = accounts[index];
    let storedRepos = await localforage.getItem(account.name+"--repos");
    if (storedRepos) {
      let reposOfOneAccount = JSON.parse(storedRepos as string);
      repos = repos.concat(reposOfOneAccount);
    }
  }
  let traffics:RepoTraffic[] = [];
  for (let index = 0; index < repos.length; index++) {
    const repo = repos[index];
    let storedTraffic = await localforage.getItem(repo.owner+"-"+repo.name);
    if (storedTraffic) {
      let traffic = JSON.parse(storedTraffic as string);
      traffics.push(traffic);
    }
  }
  
  let data:ExchangeData = {
    accounts:accounts,
    repos:repos,
    traffics:traffics
  };
  let date = new Date();
  
  let filename = date.getFullYear() + (date.getMonth()+1).toString().padStart(2,"0") + date.getDate().toString().padStart(2,"0") + ".txt";
  downloadAsTxt(JSON.stringify(data),filename);
}

export async function importData(data:ExchangeData) {
  const accountsManager = new AccountsManager();
  await accountsManager.setItems(data.accounts);
  const repos:Repo[] = data.repos;
  const traffics:RepoTraffic[] = data.traffics;

  for (let index = 0; index < data.accounts.length; index++) {
    const account = data.accounts[index];
    const reposOfOneAccount = [];
    for (let j = 0; j < repos.length; j++) {
      const repo = repos[j]; 
      if (repo.owner == account.name) {
        reposOfOneAccount.push(repo);
      }
    }
    await localforage.setItem(account.name+"--repos",JSON.stringify(reposOfOneAccount));
  }
  //console.log(repos);

  for (let index = 0; index < repos.length; index++) {
    const repo = repos[index];
    const traffic = traffics[index];
    await localforage.setItem(repo.owner+"-"+repo.name,JSON.stringify(traffic));
  }
}

export function downloadAsTxt(text:string,filename:string){
  let link = document.createElement('a');
  link.style.display = 'none';
  link.setAttribute('target', '_blank');
  link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}