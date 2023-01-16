import { PickType } from '@nestjs/swagger';
import { Classes } from '@/modules/classes/classes.schema';

export class CreateClassDto extends PickType(Classes, [
  'name',
  'school',
] as const) {}
