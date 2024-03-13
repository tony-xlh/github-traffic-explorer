import localforage from "localforage";
import type { RepoTraffic } from "@/models/RepoTraffic";
export class TrafficManager {
  private store:LocalForage;
  constructor(){
    this.store = localforage.createInstance({
      name: "traffic"
    });
  }
  async loadTraffic():Promise<RepoTraffic[]> {
    let items:RepoTraffic[] = [];
    let keys = await this.store.keys();
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index];
      let item = await this.store.getItem(key);
      if (item) {
        items.push(JSON.parse(item as string) as RepoTraffic);
      }
    }
    return items;
  }

  async deleteItem(key:string) {
    await this.store.removeItem(key)
  }

  async setItem(key:string,item:RepoTraffic) {
    await this.store.setItem(key,JSON.stringify(item))
  }

  async clear(){
    await this.store.clear();
  }
  async setItems(items:RepoTraffic[]) {
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      await this.setItem(item.name,item);
    }
  }
}