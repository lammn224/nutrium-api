import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ScheduleExercise,
  ScheduleExerciseDocument,
} from '@/modules/scheduleExercise/scheduleExercise.schema';
import { CreateScheduleExerciseDto } from '@/modules/scheduleExercise/dto/create-schedule-exercise.dto';
import { throwBadRequest, throwNotFound } from '@/utils/exception.utils';
import {
  ACTIVITY_NOT_EXISTED,
  SCHEDULE_EXISTED,
  SCHEDULE_NOT_EXISTED,
} from '@/constants/error-codes.constant';
import { Role } from '@/enums/role.enum';
import { ActivityService } from '@/modules/activities/activity.service';
import { UpdateScheduleExerciseDto } from '@/modules/scheduleExercise/dto/update-schedule-exercise.dto';
import * as moment from 'moment/moment';

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

  async findAll(user, startMonth, endMonth): Promise<ScheduleExercise[]> {
    const filter = {
      $and: [{ date: { $gte: startMonth } }, { date: { $lte: endMonth } }],
    };
    let scheduleExercises = [];
    if (user.role === Role.Parents) {
      for (let i = 0; i < user.child.length; i++) {
        const scheduleExercisesEachChild = await this.scheduleExerciseModel
          .find({
            ...filter,
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
          ...filter,
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

  async getScheduleExerciseByWeek(
    ts = Math.floor(Date.now() / 1000),
    user,
    studentId,
  ) {
    // const date = new Date(
    //   (await dateToTimestamps(convertTimeStampsToString(ts))) * 1000,
    // );
    // const startDateOfWeekTs = Math.floor(startOfWeek(date).getTime() / 1000);
    // const endDateOfWeekTs = Math.floor(endOfWeek(date).getTime() / 1000);

    // const date = moment.unix(ts).startOf('day').unix();

    const startDateOfWeekTs = moment.unix(ts).startOf('week').unix();
    const endDateOfWeekTs = moment.unix(ts).endOf('week').unix();

    const filter = {
      $and: [
        { date: { $gte: startDateOfWeekTs } },
        { date: { $lte: endDateOfWeekTs } },
      ],
    };

    const scheduleExercises = await this.scheduleExerciseModel
      .find({
        ...filter,
        school: user.school,
        student: studentId,
      })
      .populate({ path: 'activity' })
      .sort({ type: 1 });

    let res = null;

    const chartData = {
      mon: [],
      tue: [],
      wed: [],
      thu: [],
      fri: [],
      sat: [],
      sun: [],
    };

    const tableData = [
      {
        date: 'Thứ 2',
        scheduleExercise: [],
      },
      {
        date: 'Thứ 3',
        scheduleExercise: [],
      },
      {
        date: 'Thứ 4',
        scheduleExercise: [],
      },
      {
        date: 'Thứ 5',
        scheduleExercise: [],
      },
      {
        date: 'Thứ 6',
        scheduleExercise: [],
      },
      {
        date: 'Thứ 7',
        scheduleExercise: [],
      },
      {
        date: 'Chủ nhật',
        scheduleExercise: [],
      },
    ];

    scheduleExercises.forEach((e) => {
      const date = new Date(e.date * 1000);

      switch (date.toString().split(' ')[0]) {
        case 'Mon':
          chartData.mon.push(e);
          tableData[0].scheduleExercise.push(e);
          break;
        case 'Tue':
          chartData.tue.push(e);
          tableData[1].scheduleExercise.push(e);
          break;
        case 'Wed':
          chartData.wed.push(e);
          tableData[2].scheduleExercise.push(e);
          break;
        case 'Thu':
          chartData.thu.push(e);
          tableData[3].scheduleExercise.push(e);
          break;
        case 'Fri':
          chartData.fri.push(e);
          tableData[4].scheduleExercise.push(e);
          break;
        case 'Sat':
          chartData.sat.push(e);
          tableData[5].scheduleExercise.push(e);
          break;
        case 'Sun':
          chartData.sun.push(e);
          tableData[6].scheduleExercise.push(e);
          break;
      }
    });

    res = { chartData, tableData };

    return res;
  }
}
