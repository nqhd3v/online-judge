import { BullModule } from '@nestjs/bull';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from 'src/account/account.module';
import { AssignmentModule } from 'src/assignment/assignment.module';
import { LocalFileModule } from 'src/files/localFile.module';
import { LanguageModule } from 'src/language/language.module';
import { LoggerModule } from 'src/logger/logger.module';
import { ProblemModule } from 'src/problem/problem.module';
import { QueueModule } from 'src/queue/queue.module';
import { SettingModule } from 'src/setting/setting.module';
import { SubmissionController } from './submission.controller';
import { SubmissionProcessor } from './submission.processor';
import { SubmissionRepository } from './submission.repository';
import { SubmissionService } from './submission.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubmissionRepository]),
    BullModule.registerQueue({ name: 'submission' }),
    forwardRef(() => AssignmentModule),
    forwardRef(() => AccountModule),
    forwardRef(() => SettingModule),
    ProblemModule,
    LanguageModule,
    QueueModule,
    LocalFileModule,
    LoggerModule,
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService, SubmissionProcessor],
  exports: [SubmissionService],
})
export class SubmissionModule {}
