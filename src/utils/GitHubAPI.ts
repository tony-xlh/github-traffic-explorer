import type { Account } from "@/models/Account";
import type { Referrer } from "@/models/Referrer";
import type { Repo } from "@/models/Repo";
import type { RepoTraffic } from "@/models/RepoTraffic";
import localforage from "localforage";
export class GitHubAPI {
  private account:Account;
  private headers;
  private useCache = false;
  constructor(account:Account,useCache:boolean) {
    this.account = account;
    this.headers = new Headers();
    this.headers.append("Accept", "application/vnd.github+json");
    this.headers.append("Authorization", "Bearer "+this.account.token);
    this.headers.append("X-GitHub-Api-Version", "2022-11-28");
    this.useCache = useCache;
  }

  async listRepos(){
    let repos:Repo[] = [];
    if (this.useCache) {
      let cached = await this.loadReposFromCache();
      if (cached) {
        return cached;
      }
    }
    let merged = [];
    let page = 1;
    let fetched = await this.fetchRepos(page,100);
    if (fetched.length == 100) {
      while (fetched.length == 100) {
        for (let index = 0; index < fetched.length; index++) {
          const item = fetched[index];
          merged.push(item);
        }
        page = page + 1;
        fetched = await this.fetchRepos(page,100);
      }
    }
    for (let index = 0; index < fetched.length; index++) {
      const item = fetched[index];
      merged.push(item);
    }
    for (let index = 0; index < merged.length; index++) {
      const item = merged[index];
      repos.push({name:item["name"],owner:this.account.name});
    }
    await this.saveReposToCache(repos);
    return repos;
  }

  async loadReposFromCache():Promise<undefined|Repo[]>{
    let repos = await localforage.getItem("repos");
    if (repos) {
      return JSON.parse(repos as string);
    }
    return undefined;
  }

  async saveReposToCache(repos:Repo[]){
    await localforage.setItem("repos",JSON.stringify(repos));
  }

  async fetchRepos(page:number,pageSize:number):Promise<any[]>{
    let url;
    if (this.account.type == "org") {
      url = "https://api.github.com/orgs/"+this.account.name+"/repos";  
    }else{
      url = "https://api.github.com/users/"+this.account.name+"/repos";  
    }
    url = url+"?per_page="+pageSize+"&page="+page;
    const request = new Request(url, {
      method: "GET",
      headers: this.headers,
      mode: "cors",
      cache: "default",
    });
    const response = await fetch(request);
    const object = await response.json();
    return object;
  }

  async fetchTraffic(repo:Repo) {
    let repoTraffic:RepoTraffic = {
      name:repo.name,
      owner:repo.owner
    }
    if (this.useCache) {
      let traffic = await this.loadTrafficFromCache(repoTraffic);
      if (traffic) {
        return traffic;
      }
    }
    const clonesURL = "https://api.github.com/repos/"+repo.owner+"/"+repo.name+"/traffic/clones";
    const viewsURL = "https://api.github.com/repos/"+repo.owner+"/"+repo.name+"/traffic/views";
    const referringURL = "https://api.github.com/repos/"+repo.owner+"/"+repo.name+"/traffic/popular/referrers";
    const clonesRequest = new Request(clonesURL, {
      method: "GET",
      headers: this.headers,
      mode: "cors",
      cache: "default",
    });
    let response = await fetch(clonesRequest);
    let object = await response.json();
    repoTraffic.clones = object.count;
    repoTraffic.uniqueClones = object.uniques;

    const viewsRequest = new Request(viewsURL, {
      method: "GET",
      headers: this.headers,
      mode: "cors",
      cache: "default",
    });
    response = await fetch(viewsRequest);
    object = await response.json();
    repoTraffic.pageViews = object.count;
    repoTraffic.uniquePageViews = object.uniques;

    const referringRequest = new Request(referringURL, {
      method: "GET",
      headers: this.headers,
      mode: "cors",
      cache: "default",
    });
    response = await fetch(referringRequest);
    object = await response.json();
    let referrers = [];
    for (let index = 0; index < object.length; index++) {
      const item = object[index];
      let referrer:Referrer = {
        name:item.referrer,
        views:item.count,
        uniqueViews:item.uniques
      }
      referrers.push(referrer);
    }
    repoTraffic.referrers = referrers;
    await this.saveTrafficToCache(repoTraffic)
    return repoTraffic;
  }

  async saveTrafficToCache(traffic:RepoTraffic){
    await localforage.setItem(traffic.owner+"-"+traffic.name,JSON.stringify(traffic));
  }

  async loadTrafficFromCache(repo:Repo):Promise<RepoTraffic | undefined>{
    let traffic = await localforage.getItem(repo.owner+"-"+repo.name);
    if (traffic) {
      return JSON.parse(traffic as string);
    }
    return undefined;
  }
}