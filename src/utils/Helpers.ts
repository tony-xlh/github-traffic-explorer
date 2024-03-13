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
export function exportAsCSV(repoTraffic:RepoTraffic) {

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
  downloadAsTxt(JSON.stringify(data));
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

export function downloadAsTxt(text:string){
  let filename = 'out.txt';
  let link = document.createElement('a');
  link.style.display = 'none';
  link.setAttribute('target', '_blank');
  link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}