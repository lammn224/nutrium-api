import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ScheduleExercise,
  ScheduleExerciseDocument,
} from '@/modules/scheduleExercise/scheduleExercise.schema';
import { CreateScheduleExerciseDto } from '@/modules/scheduleExercise/dto/create-schedule-exercise.dto';
import {
  throwBadRequest,
  throwForbidden,
  throwNotFound,
} from '@/utils/exception.utils';
import {
  ACTIVITY_NOT_EXISTED,
  MEAL_HAS_OVERCOME_MAX_BREAKFAST_CALORIES,
  MEAL_HAS_OVERCOME_MAX_DINNER_CALORIES,
  MEAL_NOT_UPDATED,
  SCHEDULE_EXISTED,
  SCHEDULE_NOT_EXISTED,
} from '@/constants/error-codes.constant';
import { Role } from '@/enums/role.enum';
import { ActivityService } from '@/modules/activities/activity.service';
import { MealType } from '@/enums/meal-type.enum';
import { UpdateScheduleExerciseDto } from '@/modules/scheduleExercise/dto/update-schedule-exercise.dto';

@Injectable()
export class ScheduleExerciseService {
  constructor(
    @InjectModel(ScheduleExercise.name)
    private scheduleExerciseModel: Model<ScheduleExerciseDocument>,

    private readonly activityService: ActivityService,
  ) {}

  async create(createScheduleExerciseDto: CreateScheduleExerciseDto, user) {
    const isExistSchedule = await this.scheduleExerciseModel.findOne({
      school: user.school,
      date: createScheduleExerciseDto.date,
      student: createScheduleExerciseDto.student,
      activity: createScheduleExerciseDto.activity,
    });

    if (isExistSchedule) {
      throwBadRequest(SCHEDULE_EXISTED);
    }

    const activity = await this.activityService.findActivityById(
      user,
      createScheduleExerciseDto.activity.toString(),
    );

    if (!activity) {
      throwNotFound(ACTIVITY_NOT_EXISTED);
    }

    const schedule = await this.scheduleExerciseModel.create(
      createScheduleExerciseDto,
    );

    return schedule;
  }

  async findAll(user): Promise<ScheduleExercise[]> {
    let scheduleExercises = [];
    if (user.role === Role.Parents) {
      for (let i = 0; i < user.child.length; i++) {
        const scheduleExercisesEachChild = await this.scheduleExerciseModel
          .find({
            school: user.school,
            student: user.child[i],
          })
          .populate({ path: 'student' })
          .populate({ path: 'activity' });

        scheduleExercises = [
          ...scheduleExercises,
          ...scheduleExercisesEachChild,
        ];
      }
    } else if (user.role === Role.Student) {
      scheduleExercises = await this.scheduleExerciseModel
        .find({
          school: user.school,
          student: user._id,
        })
        .populate({ path: 'student' })
        .populate({ path: 'activity' });
    }

    return scheduleExercises;
  }

  async updateMeal(
    id: string,
    updateScheduleExerciseDto: UpdateScheduleExerciseDto,
    user,
  ) {
    const scheduleExercise = await this.scheduleExerciseModel.findById(id);

    if (!scheduleExercise) {
      throwBadRequest(SCHEDULE_NOT_EXISTED);
    }

    for (const key in updateScheduleExerciseDto) {
      scheduleExercise[key] = updateScheduleExerciseDto[key];
    }

    await scheduleExercise.save();

    return scheduleExercise;
  }
}
