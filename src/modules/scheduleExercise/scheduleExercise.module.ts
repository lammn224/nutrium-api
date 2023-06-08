import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ScheduleExercise,
  ScheduleExerciseSchema,
} from '@/modules/scheduleExercise/scheduleExercise.schema';
import { ScheduleExerciseService } from '@/modules/scheduleExercise/scheduleExercise.service';
import { ScheduleExerciseController } from '@/modules/scheduleExercise/scheduleExercise.controller';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ScheduleExercise.name, schema: ScheduleExerciseSchema },
    ]),
  ],
  controllers: [ScheduleExerciseController],
  providers: [ScheduleExerciseService],
  exports: [ScheduleExerciseService],
})
export class ScheduleExerciseModule {}
