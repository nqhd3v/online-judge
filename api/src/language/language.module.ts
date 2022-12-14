import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'src/logger/logger.module';
import { ProblemModule } from 'src/problem/problem.module';
import { LangRepository } from './lang.repository';
import { LanguageController } from './language.controller';
import { LanguageService } from './language.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([LangRepository]),
    forwardRef(() => ProblemModule),
    LoggerModule,
  ],
  controllers: [LanguageController],
  providers: [LanguageService],
  exports: [LanguageService, TypeOrmModule],
})
export class LanguageModule {}
