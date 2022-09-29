import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import * as path from 'path';
import { Account } from 'src/account/entities/account.entity';
import { Queue as QueueEntity } from 'src/queue/entities/queue.entity';
import { Assignment } from 'src/assignment/entities/assignment.entity';
import { addFile, isExist } from 'common/file.helper';
import { QueueService } from 'src/queue/queue.service';
import { Http400Exception } from 'utils/Exceptions/http400.exception';
import { Http503Exception } from 'utils/Exceptions/http503.exception';
import { ISubmission } from 'utils/types';
import { Submission } from './entities/submission.entity';
import { SubmissionRepository } from './submission.repository';
import { IAddSubmission, SubmissionFilter } from './submission.types';
import { QueueName } from 'src/queue/queue.enum';
import CustomLogger from 'src/logger/customLogger';



@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(SubmissionRepository)
    private readonly submissionRepository: SubmissionRepository,
    private readonly queueService: QueueService,
    @InjectQueue('submission')
    private readonly submissionQueue: Queue,
    private readonly logger: CustomLogger,
  ) {}

  /**
   * Upload with code (**code is text**)
   * 
   * This func will create a new submission, add a new job to queue to run code.
   * @param {IAddSubmission} data Data to create a new submission
   * @param {Account} submitter Who submit
   * @returns 
   */
  public async create (data: IAddSubmission, submitter: Account, fileExt: string) {
    const newSubmission = new Submission();
    newSubmission.assignment = data.assignment;
    newSubmission.problem = data.problem;
    newSubmission.language = data.language;
    newSubmission.submitter = submitter;
    newSubmission.id = Submission.genId();
    // Handle write code to file
    await this.createCodeFile(
      data.code,
      './upload/problems-solutions',
      `solution__${newSubmission.id}.${fileExt}`,
    );
    this.logger.log(
      'Saved code to file:' +
      path.join(
        '/upload/problems-solutions',
        `solution__${newSubmission.id}.${fileExt}`,
      )
    );

    // Update submission info
    const queueId = QueueEntity.genId();
    const newJob = await this.submissionQueue.add({
      queueId,
    });
    const newQueue = await this.queueService.add({
      id: queueId,
      jobId: newJob.id,
      name: QueueName.Submission,
    });
    newSubmission.queue = newQueue;
    return await this.submissionRepository.save(newSubmission);
  }

  /**
   * Update all of coefficient in submission.
   * --
   * This func will be run when anyone update `start_time`, `finish_time` & `late_rule` in assignment.
   * @param assignment Assignment, which updated
   * @param coefficient Value, which calculated by `start`, `finish` & `rule` in assignment.
   * @returns {Submission[]} Submissions if success.
   */
  public async updateCoefficientForAll(assignment: Assignment, coefficient: string): Promise<Submission[]> {
    const submissions = await this.submissionRepository.find({ assignment });
    const submissionsNeedUpdate = submissions.map(sms => ({ ...sms, coefficient }));
    return await this.submissionRepository.save(submissionsNeedUpdate);
  }

  public async getById(id: string, showErrIfErr: boolean = true): Promise<Submission> {
    const submission = await this.submissionRepository.createQueryBuilder("sub")
      .leftJoinAndSelect("sub.submitter", "account")
      .leftJoinAndSelect("sub.language", "lang")
      .leftJoinAndSelect("sub.problem", "problem")
      .leftJoinAndSelect("sub.assignment", "assignment")
      .where("sub.id = :id", { id })
      .getOne();
    if (!submission && showErrIfErr) {
      throw new Http400Exception('submission.notfound', {
        notFoundId: id,
      });
    }
    return submission;
  }

  public async get({
    problemId,
    assignmentId,
    accountId,
    langId,
    page,
    limit
  }: SubmissionFilter): Promise<{ data: Submission[], total: number }> {
    let submissionsQuery = this.submissionRepository.createQueryBuilder("sub")
      .leftJoinAndSelect("sub.submitter", "account")
      .leftJoinAndSelect("sub.language", "lang")
      .leftJoinAndSelect("sub.problem", "problem")
      .leftJoinAndSelect("sub.assignment", "assignment");
    if (problemId) {
      submissionsQuery = submissionsQuery.andWhere("problem.id = :problemId", { problemId });
    }
    if (assignmentId) {
      submissionsQuery = submissionsQuery.andWhere("assignment.id = :assignmentId", { assignmentId });
    }
    if (accountId) {
      submissionsQuery = submissionsQuery.andWhere("account.id = :accountId", { accountId });
    }
    if (langId) {
      submissionsQuery = submissionsQuery.andWhere("lang.id = :langId", { langId });
    }
    const countItems = await submissionsQuery.getCount();
    // Pagination
    const pageSkip = Number(page) - 1;
    const limitItem = Number(limit);
    if (!Number.isNaN(pageSkip) && !Number.isNaN(limitItem) && limit > 0 && Number(page) > 0) {
      submissionsQuery = submissionsQuery.limit(limit).skip(limit * (page - 1));
    }
    const submissions =  await submissionsQuery.getMany();
    return {
      data: submissions,
      total: countItems,
    }
  }

  // [FINAL SUBMISSION] - All services, which reference to FINAL SUBMISSION.

  public async getFinalSubmissions(assignment: Assignment) {
    const submissions = await this.submissionRepository.createQueryBuilder("sub")
      .leftJoinAndSelect("sub.submitter", "account")
      .leftJoinAndSelect("sub.language", "lang")
      .leftJoinAndSelect("sub.problem", "problem")
      .leftJoinAndSelect("sub.assignment", "assignment")
      .leftJoinAndSelect("sub.queue", "queue")
      .where("assignment.id = :assignmentId AND sub.is_final = true", { assignmentId: assignment.id })
      .getMany();
    return submissions;
  }
  
  public async updateFinalSubmission(submission: Submission) {
    // Get and remove current final, if exist.
    const currentFinal = await this.submissionRepository.createQueryBuilder("sub")
      .leftJoinAndSelect("sub.submitter", "account")
      .leftJoinAndSelect("sub.language", "lang")
      .leftJoinAndSelect("sub.problem", "problem")
      .leftJoinAndSelect("sub.assignment", "assignment")
      .where(
        "assignment.id = :assignmentId AND problem.id = :problemId AND sub.is_final = true",
        {
          assignmentId: submission.assignment.id,
          problemId: submission.problem.id,
        }
      )
      .getOne();
    if (currentFinal) {
      if (currentFinal.id === submission.id) {
        return currentFinal;
      }
      currentFinal.is_final = false;
      await this.submissionRepository.save(currentFinal);
    }
    // Update new final
    submission.is_final = true;
    return await this.submissionRepository.save(submission);
  }

  public async countSubGroupByAccountProblem(assignment: Assignment) {
    try {

    } catch (err) {
      console.error(`Something went wrong while counting subs, which grouped by "accountId" & "problemId" for assignment(${assignment.id}):`, err);
      throw new Http503Exception('feature:submission.count-subs.account-problem');
    }
    const tmp = await this.submissionRepository.createQueryBuilder("sub")
      .leftJoinAndSelect("sub.submitter", "submitter")
      .leftJoinAndSelect("sub.problem", "problem")
      .leftJoinAndSelect("sub.assignment", "assignment")
      .andWhere("assignment.id = :assignmentId", { assignmentId: assignment.id })
      .select(["submitter.id as account_id", "problem.id as problem_id", "COUNT (*) AS subs_count"])
      .groupBy("submitter.id, problem.id")
      .getMany();
    const accountResult = {};
    tmp.forEach((item: any) => {
      // Init if not exist
      if (!accountResult[item.submitter.id]) {
        accountResult[item.submitter.id] = {};
      }
      // if (!accountResult[item.submitter.id][item.problem.id]) {
      //   accountResult[item.submitter.id][item.problem.id] = {};
      // }

      accountResult[item.submitter.id][item.problem.id] = item.subs_count;
    })
    return accountResult;
  }

  // public transformData()

  /**
   * This func will create a new file from submit's code input.
   */
  private async createCodeFile (code: string, dirPath: string, filename: string = "solution") {
    try {
      const resCreateFile = await addFile(dirPath, filename, code);
      return resCreateFile;
    } catch (err) {
      console.error(err);
      throw new Http503Exception('local-file.unknown', { err });
    }
  }
}
