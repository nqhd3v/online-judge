import { Submission } from "src/submission/entities/submission.entity";
import { Assignment } from "./entities/assignment.entity";
import { AssignmentAccount } from "./entities/assignment_account.entity";
import { AssignmentProblem } from "./entities/assignment_problem.entity";

export interface ICoefficientInfo {coefficient: any; finished: boolean};

export interface  IAssignmentProblemTransformed {
  id: string; // problem.id
  name: string; // problem.name
  problemName: string; // problem_name
};
export interface IAssignmentAccountTransformed {
  id: string; // account.id
  displayName: string; // account.display_name
};
export interface IAssignmentSubmissionTransformed {
  id: string; // id
};
export interface IAssignmentTransformed {
  id: string,
  name: string,
  description: string,
  startTime: string,
  finishTime: string,
  extraTime: number,
  lateRule: string,
  open: boolean;
  createdAt: Date,
  problems: IAssignmentProblemTransformed[],
  participants: IAssignmentAccountTransformed[],
  submissions: IAssignmentSubmissionTransformed[],
  // Coefficient info
  coefficient?: any;
  finished?: boolean;
}

export interface IAssignmentEntity extends Assignment {
  // Coefficient info
  coefficient?: any;
  finished?: boolean;
}

export interface IAssignmentProblemInput {
  id: string;
  name: string;
  score: number;
  ordering: number;
}

export type TSearchQuery = {
  keyword?: string;
  exceptIds?: string[];
  page?: number;
  limit?: number;
}