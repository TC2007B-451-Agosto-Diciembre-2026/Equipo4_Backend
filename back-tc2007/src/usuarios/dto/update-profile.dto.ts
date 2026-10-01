import { ApiPropertyOptional } from '@nestjs/swagger';
import {IsEmail, IsOptional, IsString, MinLength, Matches} from 'class-validator';

export class UpdateMyProfileDto {
  @ApiPropertyOptional({ example: 'Paquito Gomez' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  nombre?: string;

  @ApiPropertyOptional({ example: 'paquito@mail.com' })
  @IsOptional()
  @IsEmail()
  correo?: string;
}