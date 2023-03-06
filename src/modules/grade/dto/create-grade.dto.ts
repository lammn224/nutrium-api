import { PickType } from '@nestjs/swagger';
import { Grade } from '@/modules/grade/grade.schema';

export class CreateGradeDto extends PickType(Grade, [
  'name',
  'school',
] as const) {}
