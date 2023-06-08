import { PickType } from '@nestjs/swagger';
import { ScheduleExercise } from '@/modules/scheduleExercise/scheduleExercise.schema';

export class CreateScheduleExerciseDto extends PickType(ScheduleExercise, [
  'activity',
  'timeDur',
  'calo',
  'student',
  'school',
  'date',
] as const) {}
