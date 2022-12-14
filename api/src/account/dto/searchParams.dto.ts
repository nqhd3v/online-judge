import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SearchParamsDto {
  @IsOptional()
  @IsString()
  keyword: string;

  @IsOptional()
  @IsString()
  role: string;

  @IsOptional()
  @IsString()
  except: string;

  @IsOptional()
  @IsNumber()
  page: number;

  @IsOptional()
  @IsNumber()
  limit: number;
}

export default SearchParamsDto;
