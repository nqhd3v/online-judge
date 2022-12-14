import { Account } from "src/account/entities/account.entity";
import { Assignment } from "src/assignment/entities/assignment.entity";
import { Language } from "src/language/entities/language.entity";
import { Problem } from "src/problem/entities/problem.entity";

export interface IFilter {
  keyword?: string;
  page?: number;
  limit?: number;
}
export interface IPagination {
  current?: number; // Start is 0
  num_of_page?: number; // Default is 10
}

// Modules interface
export interface ILang {
  id?: string;
  name: string;
  extension: string;
  default_time_limit?: number;
  default_memory_limit?: number;
  // sorting: number; // Maybe not use in this system
  // Relation data
  problems?: any[];
}
export interface ILangAddProblem {
  id: string;
  time_limit?: number;
  memory_limit?: number;
}
export interface IUpdateProblemLang {
  id: string;
  time_limit?: number;
  memory_limit?: number;
  lang: ILang;
}

export interface IProblem {
  name: string;
  content: string;
  note?: string;
  diff_cmd?: string; // Default is `diff`
  diff_arg?: string; // Default is `-bB`
  // Not allow to update
  created_by?: any;
  id?: string;
}

export interface INotification {
  id?: string;
  title: string;
  text: string;
}

export interface IAssignment {
  name: string;
  open?: boolean;
  javaexceptions?: boolean;
  description: string;
  start_time?: any;
  finish_time?: any;
  extra_time?: any;
  coefficient_rules?: string;
  moss_update?: string;
  is_public?: boolean;
  // Relations data
  participants?: Account[];
  problems?: Problem[];
}

export interface ISubmission {
  id?: string;
  is_final?: boolean;
  pre_score: number;
  status: string | "PENDING" | "SCORE" | "Uploaded";
  coefficient: string;
  file?: string;
  // Relations data
  assignment?: Assignment;
  problem?: Problem;
  language?: Language;
  submitter?: Account;
}

// Other
export interface FoundAndNotFoundResult<ItemType> {
  found: ItemType[],
  foundKeys: string[],
  notFoundKeys: string[],
}
export interface SuccessAndFailed<Type = any> {
  success?: Type[];
  failed?: Error[];
}

export type TMap = Record<any, any>;
export type TParamId = { id: string };

export enum TSortType {
  Asc = "ASC",
  Desc = "DESC",
};