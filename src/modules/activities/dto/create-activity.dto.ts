import { PickType } from '@nestjs/swagger';
import { Activity } from '@/modules/activities/activity.schema';

export class CreateActivityDto extends PickType(Activity, [
  'name',
  'metIdx',
  'school',
] as const) {}
