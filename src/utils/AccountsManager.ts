import localforage from "localforage";
import type { Account } from "../models/Account";
export class AccountsManager {
  private store:LocalForage;
  constructor(){
    this.store = localforage.createInstance({
      name: "accounts"
    });
  }
  async loadItems():Promise<Account[]> {
    let accounts:Account[] = [];
    let keys = await this.store.keys();
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index];
      let account = await this.store.getItem(key);
      if (account) {
        accounts.push(JSON.parse(account as string) as Account);
      }
    }
    return accounts;
  }

  async deleteItem(key:string) {
    await this.store.removeItem(key)
  }

  async setItem(key:string,account:Account) {
    await this.store.setItem(key,JSON.stringify(account))
  }

  async clear(){
    await this.store.clear();
  }
  async setItems(accounts:Account[]) {
    for (let index = 0; index < accounts.length; index++) {
      const account = accounts[index];
      await this.setItem(account.name,account);
    }
  }
}