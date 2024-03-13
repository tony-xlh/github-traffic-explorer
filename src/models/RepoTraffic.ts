import type { Referrer } from "./Referrer";
import type { Repo } from "./Repo";

export interface RepoTraffic extends Repo{
  pageViews?:number;
  uniquePageViews?:number;
  clones?:number;
  uniqueClones?:number;
  referrers?:Referrer[];
  date?:string;
}