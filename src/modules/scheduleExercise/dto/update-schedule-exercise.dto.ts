import { PartialType } from '@nestjs/swagger';
import { CreateScheduleExerciseDto } from '@/modules/scheduleExercise/dto/create-schedule-exercise.dto';

export class UpdateScheduleExerciseDto extends PartialType(
  CreateScheduleExerciseDto,
) {}
