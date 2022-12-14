import { FilesInterceptor } from '@nestjs/platform-express';
import { Injectable, mixin, NestInterceptor, Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage, DiskStorageOptions } from 'multer';
import * as fs from 'fs/promises';
import { Request } from 'express';
 
interface MultiFileInterceptorOptions {
  fieldName: string;
  maxCount?: number;
  path?: (req: Request, file: Express.Multer.File) => { dst: string, err?: Error };
  fileFilter?: MulterOptions['fileFilter'];
  limits?: MulterOptions['limits'];
}

function MultiFileInterceptor (options: MultiFileInterceptorOptions): Type<NestInterceptor> {
  @Injectable()
  class Interceptor implements NestInterceptor {
    filesInterceptor: NestInterceptor;
    constructor(configService: ConfigService) {
      const filesDestination = configService.get('UPLOAD_DIRECTORY_PATH');
 
      const destination: DiskStorageOptions['destination'] = async (req, file, cb) => {
        if (options.path) {
          const { dst, err } = options.path(req, file);
          // Create if dir not exist
          const finalDst = `${filesDestination}/${dst}`;
          await fs.mkdir(finalDst, { recursive: true });

          cb(err || null, finalDst);
          return;
        }
        await fs.mkdir(filesDestination, { recursive: true });
        cb(null, filesDestination);
      };
 
      const multerOptions: MulterOptions = {
        storage: diskStorage({
          destination,
          filename: (_, file, callback) => {
            const filename = `${file.originalname}`;
            callback(null, filename);
          },
        }),
        fileFilter: options.fileFilter,
        limits: options.limits
      }
 
      this.filesInterceptor = new (FilesInterceptor(options.fieldName, options.maxCount, multerOptions));
    }
 
    intercept(...args: Parameters<NestInterceptor['intercept']>) {
      return this.filesInterceptor.intercept(...args);
    }
  }
  return mixin(Interceptor);
}
 
export default MultiFileInterceptor;