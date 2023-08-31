import { PartialType } from '@nestjs/swagger';
import { CreateMealCompilationDto } from './create-meal-compilation.dto';

export class UpdateMealCompilationDto extends PartialType(
  CreateMealCompilationDto,
) {}
