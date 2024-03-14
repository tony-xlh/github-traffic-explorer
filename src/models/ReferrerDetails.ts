import type { RepoTraffic } from "./RepoTraffic";

export interface ReferrerDetails {
  name:string;
  views:number;
  uniqueViews:number;
  repos:RepoTraffic[];
}