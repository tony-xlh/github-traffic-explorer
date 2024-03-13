import localforage from "localforage";
import type { Account } from "../models/Account";
export class AccountsManager {
  private store:LocalForage;
  constructor(){
    this.store = localforage.createInstance({
      name: "accounts"
    });
  }
  async loadAccounts():Promise<Account[]> {
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

  async deleteAccount(key:string) {
    await this.store.removeItem(key)
  }

  async setAccount(key:string,account:Account) {
    await this.store.setItem(key,JSON.stringify(account))
  }

  async clear(){
    await this.store.clear();
  }
  async setAccounts(accounts:Account[]) {
    for (let index = 0; index < accounts.length; index++) {
      const account = accounts[index];
      await this.setAccount(account.name,account);
    }
  }
}