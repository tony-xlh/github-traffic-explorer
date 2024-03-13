import type { Account } from "@/models/Account";
import type { Repo } from "@/models/Repo";

export class GitHubAPI {
  private account:Account;
  private headers;
  constructor(account:Account) {
    this.account = account;
    this.headers = new Headers();
    this.headers.append("Accept", "application/vnd.github+json");
    this.headers.append("Authorization", "Bearer "+this.account.token);
    this.headers.append("X-GitHub-Api-Version", "2022-11-28");
  }

  async listRepos(){
    let repos:Repo[] = [];
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
    return repos;
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
}