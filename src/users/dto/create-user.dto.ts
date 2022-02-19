import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @Transform((params) => params.value.trim())
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  readonly name: string;
  @IsString()
  @IsEmail()
  @MaxLength(60)
  readonly email: string;
  @IsString()
  @Matches(/^[A-Za-z\d!@#$%^&*()]{8,30}$/)
  readonly passward: string;
  @IsNumber()
  readonly bigClass: number;
  @IsNumber()
  readonly middleClass: number;
}
