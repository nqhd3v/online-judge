import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/account/account.enum';
import { Account } from 'src/account/entities/account.entity';
import { Language } from 'src/language/entities/language.entity';
import CustomLogger from 'src/logger/customLogger';
import { TJudgeProblemLang, TJudgeProblemTransformed } from 'src/setting/setting.utils';
import { Http400Exception } from 'utils/Exceptions/http400.exception';
import { Http503Exception } from 'utils/Exceptions/http503.exception';
import FileUtils from 'utils/file-utils';
import { getFileInDir } from 'utils/func';
import { FoundAndNotFoundResult, ILang, ILangAddProblem, IProblem, IUpdateProblemLang, SuccessAndFailed } from 'utils/types';
import { Problem } from './entities/problem.entity';
import { ProblemLanguage } from './entities/problem_language.entity';
import { ProblemLangRepository, ProblemRepository } from './problem.repository';
import { ProblemFilter, TProblemTemplate } from './problem.types';

@Injectable()
export class ProblemService {
  constructor(
    @InjectRepository(ProblemRepository)
    private readonly problemRepository: ProblemRepository,
    @InjectRepository(ProblemLangRepository)
    private readonly problemLangRepository: ProblemLangRepository,
    private readonly logger: CustomLogger,
    private readonly configService: ConfigService,
  ) {}

  public async create ({ note, ...data }: IProblem, author: Account): Promise<Problem> {
    const newProb = this.problemRepository.create({ ...data, admin_note: note, created_by: author  });
    return await this.problemRepository.save(newProb);
  }

  public async createByJudgeProblems (
    problems: TJudgeProblemTransformed[],
  ): Promise<SuccessAndFailed<Problem> & {
    judgeProbIdMap2ProbId: Record<number, string>,
    judgeProbIdMap2Langs: Record<number, TJudgeProblemLang[]>,
    judgeProbIdMap2JudgeAssIds: Record<number, number[]>,
  }> {
    const judgeProbIdMap2ProbId: Record<string, string> = {};
    const judgeProbIdMap2JudgeAssIds: Record<string, number[]> = {};
    const judgeProbIdMap2Langs: Record<string, TJudgeProblemLang[]> = {};
    const createPromise = problems.map(async ({ problem, judgeId, judgeLanguages, judgeAssignmentIds }) => {
      try {
        const created = await this.problemRepository.save(problem);
        judgeProbIdMap2ProbId[judgeId] = created.id;
        judgeProbIdMap2JudgeAssIds[judgeId] = judgeAssignmentIds;
        judgeProbIdMap2Langs[judgeId] = judgeLanguages;
        return created;
      } catch (err) {
        return err;
      }
    });
    const resCreated = await Promise.all(createPromise);
    const success = resCreated.filter(r => !(r instanceof Error));
    const failed = resCreated.filter(r => r instanceof Error);
    return {
      success,
      failed,
      judgeProbIdMap2ProbId,
      judgeProbIdMap2JudgeAssIds,
      judgeProbIdMap2Langs
    };
  }

  public async update (curProb: Problem, data: IProblem): Promise<Problem> {
    const {created_by, ...dataUpdate } = data;
    const updateProb = { ...curProb, ...dataUpdate };
    return await this.problemRepository.save(updateProb);
  }

  public async updateById (id: string, data: IProblem): Promise<Problem> {
    const {created_by, ...dataUpdate } = data;
    const curProb = await this.problemRepository.findOne(id);
    const updateProb = { ...curProb, ...dataUpdate };
    return await this.problemRepository.save(updateProb);
  }

  public async deleteById (id: string): Promise<boolean> {
    const res = await this.problemRepository.delete(id);
    if (!res.affected) {
      throw new Http400Exception('problem.notfound');
    }
    return !!res.affected;
  }

  /**
   * ## DANGER
   * This func will remove all of problems in the current system!
   */
  public async removeAll(): Promise<Problem[]> {
    const problemsNeedRemove = await this.problemRepository.find();
    return await this.problemRepository.remove(problemsNeedRemove);
  }

  public async getById(
    id: string,
    showErrIfErr: boolean = true
  ): Promise<{ problem: Problem; template: TProblemTemplate | undefined, test: any[] }> {
    const curProb = await this.problemRepository.createQueryBuilder("problem")
      .leftJoinAndSelect("problem.created_by", "created_by")
      .leftJoinAndSelect("problem.languages", "problem_language")
      .leftJoinAndSelect("problem_language.language", "language")
      .leftJoinAndSelect("problem.assignments", "problem_assignment")
      .leftJoinAndSelect("problem_assignment.assignment", "assignment")
      .where('problem.id = :id', { id })
      .getOne();
    if (!curProb && showErrIfErr) {
      if (showErrIfErr) {
        throw new Http400Exception('problem.notfound', {
          notFoundId: id,
        });
      }
      return {
        problem: null,
        test: [],
        template: undefined,
      }
    }
    // GET TEMPLATE
    const { banned, before, after, err: errGetTemplate } = await this.getProblemTemplate(id);
    // Get Test cases
    const testCases = await this.getProblemTestCases(id);

    return {
      problem: curProb,
      test: testCases,
      template: {
        before,
        after,
        banned,
      }
    };
  }

  public async getByIds(ids: string[], showErrIfErr: boolean = true): Promise<FoundAndNotFoundResult<Problem>> {
    if (ids.length === 0) {
      return {
        found: [],
        foundKeys: [],
        notFoundKeys: [],
      };
    }
    try {
      let problemItemsQuery = this.problemRepository.createQueryBuilder("problem")
        .leftJoinAndSelect( "problem.created_by", "created_by")
        .leftJoinAndSelect("problem.languages", "problem_language")
        .leftJoinAndSelect("problem_language.language", "language");
      if (Array.isArray(ids) && ids.length > 0) {
        problemItemsQuery = problemItemsQuery.andWhere("problem.id IN (:...ids)", { ids })
      }
        
      const problemItems = await problemItemsQuery.getMany();
      const problemFoundIds = problemItems.map(problem => problem.id);
      const problemNotFoundIds = ids.filter(id => !problemFoundIds.includes(id));
  
      if (showErrIfErr && problemNotFoundIds.length > 0) {
        throw new Http400Exception('problem.notfound', {
          notFoundKeys: problemNotFoundIds,
        });
      }
  
      return {
        found: problemItems,
        foundKeys: problemFoundIds,
        notFoundKeys: problemNotFoundIds,
      };
    } catch (err) {
      console.error('[feature:problem.getByIds]', err);
      throw new Http503Exception('feature:problem.getByIds');
    }
  }

  public async getAll({ assignmentIds, langIds, accountId, keyword, except, page, limit }: ProblemFilter) {
    let problemItemsQuery = this.problemRepository.createQueryBuilder("problem")
      .leftJoinAndSelect( "problem.created_by", "created_by")
      .leftJoinAndSelect("problem.languages", "problem_language")
      .leftJoinAndSelect("problem_language.language", "language")
      .leftJoinAndSelect("problem.assignments", "problem_assignment")
      .leftJoinAndSelect("problem_assignment.assignment", "assignment");
    if (assignmentIds) {
      problemItemsQuery = problemItemsQuery.andWhere("assignment.id IN (:...assignmentIds)", { assignmentIds: assignmentIds.split(',') });
    }
    if (langIds) {
      problemItemsQuery = problemItemsQuery.andWhere("language.id IN (:...langIds)", { langIds: langIds.split(',') });
    }
    if (accountId) {
      problemItemsQuery = problemItemsQuery.andWhere("created_by.id = :accountId", { accountId });
    }
    if (keyword) {
      problemItemsQuery = problemItemsQuery.andWhere(
        "(problem.name ILIKE :keyword OR problem.content ILIKE :keyword OR problem.admin_note ILIKE :keyword)",
        { keyword: `%${keyword}%` },
      );
    }
    const exceptIds = except?.split(',');
    if (Array.isArray(exceptIds) && exceptIds.length > 0) {
      problemItemsQuery = problemItemsQuery.andWhere("problem.id NOT IN (:...exceptIds)", { exceptIds });
    }
    const countItems = await problemItemsQuery.getCount();
    const pageSkip = Number(page) - 1;
    const limitItem = Number(limit);
    if (!Number.isNaN(pageSkip) && !Number.isNaN(limitItem) && limitItem > 0 && pageSkip >= 0) {
      problemItemsQuery = problemItemsQuery.skip(limitItem * pageSkip).take(limitItem);
    }
    const problems = await problemItemsQuery.getMany();
    return {
      data: problems,
      total: countItems,
    };
  }

  // Problem - Langs
  public async getProblemLangByIds(ids: string[], showErrIfErr: boolean = true): Promise<FoundAndNotFoundResult<ProblemLanguage>> {
    if (ids.length === 0) return {
      found: [],
      foundKeys: [],
      notFoundKeys: [],
    }
    const problemLangs = await this.problemLangRepository
      .createQueryBuilder('probLang')
      .leftJoinAndSelect('probLang.language', 'lang')
      .leftJoinAndSelect('probLang.problem', 'problem')
      .where('probLang.id IN (:...ids)', { ids })
      .getMany();
    const problemLangFoundIds = problemLangs.map(problemLang => problemLang.id);
    const problemLangNotFoundIds = ids.filter(id => !problemLangFoundIds.includes(id));

    if (showErrIfErr && problemLangNotFoundIds.length > 0) {
      throw new Http400Exception('problem-lang.notfound', {
        notFoundKeys: problemLangNotFoundIds,
      });
    }

    return {
      found: problemLangs,
      foundKeys: problemLangFoundIds,
      notFoundKeys: problemLangNotFoundIds,
    };
  }

  /**
   * This func will return all of data for ProblemLanguage.
   * ### -> Need transform to PUBLIC data before send to user.
   * 
   * @param {Problem} problem Problem
   * @param {Language} language Language
   * @returns {Promise<ProblemLanguage>}
   */
   public async getProbLangByProbAndLang(problem: Problem, language: Language): Promise<ProblemLanguage> {
    try {
      if (!language || !problem) {
        return null;
      }
      const probLang = await this.problemLangRepository.findOne({
        language,
        problem,
      });
      return probLang;
    } catch (err) {
      this.logger.error(err);
      throw new Http503Exception('getProbLang-by-Prob&Lang.unknown-error');
    }
  }

  public async addProblemLangs(problem: Problem, langs: Language[], langMapping: Record<string, ILangAddProblem>) {
    const newProblemLangs = langs.map(lang => this.problemLangRepository.create({
      problem,
      time_limit: langMapping[lang.id]?.time_limit || lang.default_time_limit,
      memory_limit: langMapping[lang.id]?.memory_limit || lang.default_memory_limit,
      language: lang,
    }));
    return await this.problemLangRepository.save(newProblemLangs);
  }

  public async updateProblemLangs(problemLangs: ProblemLanguage[], langMapping: Record<string, IUpdateProblemLang>) {
    const langsNeedUpdate = problemLangs.map(problemLang => {
      const { time_limit, memory_limit, lang } = langMapping[problemLang.id];
      return {
        ...problemLang,
        language: lang,
        time_limit,
        memory_limit,
      };
    });
    return await this.problemLangRepository.save(langsNeedUpdate);
  }

  public async deleteProblemLangsByLang(lang: Language) {
    const problemLangUseLang = await this.problemLangRepository.find({
      language: lang,
    });
    const problemLangsNeedDelete = problemLangUseLang.map(async ({ id }) => await this.problemLangRepository.delete(id));
    return await Promise.all(problemLangsNeedDelete);
  }

  public async deleteProblemLangsByProblem(problem: Problem) {
    const problemLangUseProblem = await this.problemLangRepository.find({
      problem,
    });
    const problemLangsNeedDelete = problemLangUseProblem.map(async ({ id }) => await this.problemLangRepository.delete(id));
    return await Promise.all(problemLangsNeedDelete);
  }

  public async deleteProblemLangsByIds(ids: string[]) {
    const problemLangsNeedDelete = ids.map(async (id) => await this.problemLangRepository.delete(id));
    return await Promise.all(problemLangsNeedDelete);
  }

  // Transform data
  public transformData (requester: Account, ...problems: Problem[]) {
    const ifAdmin = (value: any) => requester.role === Role.Admin ? value : undefined;
    const problemTransformed = problems.map(problem => {
      const created_by = problem.created_by ? {
        id: problem.created_by.id,
        display_name: problem.created_by.display_name,
      } : undefined;
      const languages = problem.languages
        ? problem.languages.map(lang => (
          lang.language
            ? {
              id: lang.id,
              langId: lang.language.id,
              name: lang.language.name,
              timeLimit: lang.time_limit,
              memoryLimit: lang.memory_limit,
            }
            : undefined
          )).filter(lang => lang)
        : undefined;
      const assignments = problem.assignments
        ? problem.assignments.map(ass => (
            ass.assignment
              ? {
                id: ass.assignment.id,
                name: ass.assignment.name,
              }
              : undefined
          )).filter(ass => ass)
        : undefined;
      return {
        id: problem.id,
        name: problem.name,
        content: problem.content,
        status: problem.status,
        note: ifAdmin(problem.admin_note),
        diff_cmd: ifAdmin(problem.diff_cmd),
        diff_arg: ifAdmin(problem.diff_arg),
        created_by: ifAdmin(created_by),
        assignments: ifAdmin(assignments),
        languages,
      }
    });
    return problemTransformed;
  }

  /**
   * Read template file.
   * 
   * -----
   * *Function `template` in file `application/controllers/Submit.php`*
   * 
   * @param id Problem's ID
   * @returns 
   */
  private async getProblemTemplate (
    id: string
  ): Promise<TProblemTemplate> {
    try {
      const content = await new FileUtils(`upload/${id}/template.php`).content();
      if (!content) {
        return { banned: [], before: '', after: '' };
      }
      let matches = content.match(/(\/\*###Begin banned.*\n)((.*\n)*)(###End banned keyword\*\/)/);
      const banned = matches[2] ? matches[2].split('\n') : [];

      matches = content.match(/(###End banned keyword\*\/\n)((.*\n)*)\/\/###INSERT CODE HERE -\n?((.*\n?)*)/);
      const before = matches[2] || "";
      const after = matches[4] || "";

      return {
        banned,
        before,
        after,
      }

    } catch (err) {
      if (!(err.message || '').includes('no such file or directory')) {
        this.logger.errorCustom(err);
      }
      return { banned: [], before: '', after: '', err };
    }
  }

  private async getProblemTestCases (id: string) {
    try {
      return await getFileInDir(`${this.configService.get('UPLOAD_DIRECTORY_PATH')}/problem-solutions/${id}`, '_')
    } catch (err) {
      return {};
    }
  }
}
