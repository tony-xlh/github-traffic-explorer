import type { Referring } from "./Referring";
import type { Repo } from "./Repo";

export interface RepoTraffic extends Repo{
  pageViews?:number;
  uniquePageViews?:number;
  clones?:number;
  uniqueClones?:number;
  referrings?:Referring[];
}