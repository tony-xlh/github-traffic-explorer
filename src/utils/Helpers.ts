import type { RepoTraffic } from "@/models/RepoTraffic";
import { AccountsManager } from "./AccountsManager";
import localforage from "localforage";
import type { Repo } from "@/models/Repo";
import type { Account } from "@/models/Account";

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
    traffic.clones
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
  downloadAsTxt(csv_string,"out.csv");
}

export async function exportData() {
  const accountsManager = new AccountsManager();
  let storedRepos = await localforage.getItem("repos");
  let repos:Repo[] = [];
  if (storedRepos) {
    repos = JSON.parse(storedRepos as string);
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
  let accounts = await accountsManager.loadItems();
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
  accountsManager.setItems(data.accounts);
  const repos:Repo[] = data.repos;
  const traffics:RepoTraffic[] = data.traffics;
  await localforage.setItem("repos",JSON.stringify(repos));
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