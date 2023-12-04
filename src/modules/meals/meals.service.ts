import { Injectable } from '@nestjs/common';
import { CreateMealDto } from './dto/create-meal.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Meals, MealsDocument } from '@/modules/meals/meals.schema';
import { Role } from '@/enums/role.enum';
import { throwBadRequest, throwForbidden } from '@/utils/exception.utils';
import {
  MEAL_EXISTED,
  MEAL_HAS_OVERCOME_MAX_BREAKFAST_CALORIES,
  MEAL_HAS_OVERCOME_MAX_DINNER_CALORIES,
  MEAL_NOT_EXISTED,
  MEAL_NOT_UPDATED,
} from '@/constants/error-codes.constant';
import { UpdateMealDto } from '@/modules/meals/dto/update-meal.dto';
import { MealType } from '@/enums/meal-type.enum';
import { StudentsService } from '@/modules/students/students.service';
import { MealCompilationService } from '@/modules/meal-compilation/meal-compilation.service';
import { Student } from '@/modules/students/students.schema';
import * as moment from 'moment';
import { UPDATE_MEAL_COMPILATION } from '@/constants/events';
import { MealCompilationUpdateEvent } from '@/events/meal-compilation-update.event';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class MealsService {
  constructor(
    @InjectModel(Meals.name) private mealModel: Model<MealsDocument>,
    private readonly studentService: StudentsService,
    private readonly mealCompilationService: MealCompilationService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createMealDto: CreateMealDto, user) {
    const isExistMeal = await this.mealModel.findOne({
      school: user.school,
      type: createMealDto.type,
      date: createMealDto.date,
      student: createMealDto.student,
      createdBy: user._id,
    });

    if (isExistMeal) {
      throwBadRequest(MEAL_EXISTED);
    }

    // if (user.child) {
    //   const studentId = user.child.find(
    //     (item) => item.toString() === createMealDto.student,
    //   );
    //
    //   const student = await this.studentService.findById(studentId);
    //
    //   if (createMealDto.type === MealType.Breakfast) {
    //     if (createMealDto.power > student.maxBreakfastCalories) {
    //       throwBadRequest(MEAL_HAS_OVERCOME_MAX_BREAKFAST_CALORIES);
    //     }
    //   } else if (createMealDto.type === MealType.Dinner) {
    //     if (createMealDto.power > student.maxDinnerCalories) {
    //       throwBadRequest(MEAL_HAS_OVERCOME_MAX_DINNER_CALORIES);
    //     }
    //   }
    // }

    const newMeal = await this.mealModel.create(createMealDto);
    newMeal.createdBy = user._id;

    await newMeal.save();

    // create MealCompilation
    if (user.role === Role.Parents) {
      const mealsOneDay = await this.findMealsOneDay(
        user.school,
        createMealDto.student,
        createMealDto.date,
      );

      if (mealsOneDay.length === 3) {
        await this.mealCompilationService.create(
          user.school,
          createMealDto.student.toString(),
          createMealDto.date,
          mealsOneDay,
        );
      }
    } else if (user.role === Role.Admin) {
      this.eventEmitter.emit(
        UPDATE_MEAL_COMPILATION,
        new MealCompilationUpdateEvent(createMealDto.date, user.school),
      );
    }

    return newMeal;
  }

  async updateMeal(id: string, updateMealDto: UpdateMealDto, user) {
    const meal = await this.mealModel.findById(id);

    if (!meal) {
      throwBadRequest(MEAL_NOT_EXISTED);
    }

    if (meal.createdBy.toString() !== user._id.toString()) {
      throwForbidden(MEAL_NOT_UPDATED);
    }

    // if (user.child) {
    //   const studentId = user.child.find(
    //     (item) => item.toString() === updateMealDto.student,
    //   );
    //
    //   const student = await this.studentService.findById(studentId);
    //
    //   if (updateMealDto.type === MealType.Breakfast) {
    //     if (updateMealDto.power > student.maxBreakfastCalories) {
    //       throwBadRequest(MEAL_HAS_OVERCOME_MAX_BREAKFAST_CALORIES);
    //     }
    //   } else if (updateMealDto.type === MealType.Dinner) {
    //     if (updateMealDto.power > student.maxDinnerCalories) {
    //       throwBadRequest(MEAL_HAS_OVERCOME_MAX_DINNER_CALORIES);
    //     }
    //   }
    // }

    for (const key in updateMealDto) {
      meal[key] = updateMealDto[key];
    }

    await meal.save();

    // update MealCompilation
    if (user.role === Role.Parents) {
      const mealsOneDay = await this.findMealsOneDay(
        user.school,
        updateMealDto.student,
        updateMealDto.date,
      );

      if (mealsOneDay.length === 3) {
        await this.mealCompilationService.update(
          user.school,
          updateMealDto.student.toString(),
          updateMealDto.date,
          mealsOneDay,
        );
      }
    } else if (user.role === Role.Admin) {
      this.eventEmitter.emit(
        UPDATE_MEAL_COMPILATION,
        new MealCompilationUpdateEvent(updateMealDto.date, user.school),
      );
    }
    return meal;
  }

  async findMealsOneDay(
    school: string,
    student: string | Student,
    date: number,
  ): Promise<Meals[]> {
    date = moment.unix(date).startOf('day').unix();
    const filter = { date, school };

    const mealsByUser = await this.mealModel
      .find({ ...filter, student })
      .populate({ path: 'student' })
      .populate({ path: 'foods' })
      .select('-deleted -createdAt -updatedAt');

    const mealsByAdmin = await this.mealModel
      .find({
        ...filter,
        type: MealType.Launch,
        isCreatedByAdmin: true,
      })
      .populate({ path: 'student' })
      .populate({ path: 'foods' })
      .select('-deleted -createdAt -updatedAt');

    return [...mealsByAdmin, ...mealsByUser];
  }

  async findAll(user, startMonth, endMonth): Promise<Meals[]> {
    const filter = {
      $and: [{ date: { $gte: startMonth } }, { date: { $lte: endMonth } }],
    };
    if (user.role === Role.Admin) {
      const meals = await this.mealModel
        .find({
          ...filter,
          type: MealType.Launch,
          school: user.school,
          isCreatedByAdmin: true,
          // createdBy: user._id,
        })
        .populate({ path: 'foods' })
        .select('-deleted -createdAt -updatedAt');

      return meals;
    } else if (user.role === Role.Parents) {
      const mealsByUser = await this.mealModel
        .find({ ...filter, school: user.school, createdBy: user._id })
        .populate({ path: 'student' })
        .populate({ path: 'foods' })
        .select('-deleted -createdAt -updatedAt');

      const mealsByAdmin = await this.mealModel
        .find({
          ...filter,
          school: user.school,
          type: MealType.Launch,
          createdBy: { $ne: user._id },
        })
        .populate({ path: 'student' })
        .populate({ path: 'foods' })
        .select('-deleted -createdAt -updatedAt');

      return [...mealsByAdmin, ...mealsByUser];
    } else {
      const mealsByParent = await this.mealModel
        .find({
          ...filter,
          school: user.school,
          createdBy: user.parents,
          student: user._id,
        })
        .populate({ path: 'student' })
        .populate({ path: 'foods' })
        .select('-deleted -createdAt -updatedAt');

      const mealsByAdmin = await this.mealModel
        .find({
          ...filter,
          school: user.school,
          type: MealType.Launch,
          createdBy: { $ne: user.parents },
        })
        .populate({ path: 'foods' })
        .populate({ path: 'student' })
        .select('-deleted -createdAt -updatedAt');

      return [...mealsByAdmin, ...mealsByParent];
    }
  }

  async getMealsByWeek(ts = Math.floor(Date.now() / 1000), user, studentId) {
    // const date = new Date(
    //   (await dateToTimestamps(convertTimeStampsToString(ts))) * 1000,
    // );
    // const startDateOfWeekTs = Math.floor(startOfWeek(date).getTime() / 1000);
    // const endDateOfWeekTs = Math.floor(endOfWeek(date).getTime() / 1000);

    // const date = moment.unix(ts).startOf('day').unix();

    const startDateOfWeekTs = moment.unix(ts).startOf('week').unix();
    const endDateOfWeekTs = moment.unix(ts).endOf('week').unix();

    let meals;

    const filter = {
      $and: [
        { date: { $gte: startDateOfWeekTs } },
        { date: { $lte: endDateOfWeekTs } },
        { school: user.school },
      ],
    };

    if (user.role === Role.Admin) {
      if (!studentId) {
        const mealsByAdmin = await this.mealModel
          .find({
            ...filter,
            type: MealType.Launch,
            // school: user.school,
            isCreatedByAdmin: true,
          })
          .populate({ path: 'foods' })
          .sort({ type: 1 });

        meals = [...mealsByAdmin];
      } else {
        const mealsByAdmin = await this.mealModel
          .find({
            ...filter,
            type: MealType.Launch,
            // school: user.school,
            isCreatedByAdmin: true,
          })
          .populate({ path: 'foods' })
          .sort({ type: 1 });

        const mealsForStudent = await this.mealModel
          .find({
            ...filter,
            // createdBy: user._id,
            // school: user.school,
            student: studentId,
            isCreatedByAdmin: false,
          })
          .populate({ path: 'foods' })
          .sort({ type: 1 });

        meals = [...mealsByAdmin, ...mealsForStudent];
      }
    } else if (user.role === Role.Parents) {
      const mealsByAdmin = await this.mealModel
        .find({
          ...filter,
          type: MealType.Launch,
          // school: user.school,
          isCreatedByAdmin: true,
        })
        .populate({ path: 'foods' })
        .sort({ type: 1 });

      const mealsForStudent = await this.mealModel
        .find({
          ...filter,
          createdBy: user._id,
          // school: user.school,
          student: studentId,
          isCreatedByAdmin: false,
        })
        .populate({ path: 'foods' })
        .sort({ type: 1 });

      meals = [...mealsByAdmin, ...mealsForStudent];
    } else {
      const mealsByAdmin = await this.mealModel
        .find({
          ...filter,
          type: MealType.Launch,
          // school: user.school,
          isCreatedByAdmin: true,
        })
        .populate({ path: 'foods' })
        .sort({ type: 1 });

      const mealsForStudent = await this.mealModel
        .find({
          ...filter,
          createdBy: user.parents,
          // school: user.school,
          student: studentId,
          isCreatedByAdmin: false,
        })
        .populate({ path: 'foods' })
        .sort({ type: 1 });

      meals = [...mealsByAdmin, ...mealsForStudent];
    }

    // student || parents
    let mealCompiltaions;
    if (
      (user.role === Role.Student ||
        user.role === Role.Parents ||
        user.role === Role.Admin) &&
      studentId
    ) {
      mealCompiltaions =
        await this.mealCompilationService.findMealCompilationByWeek(
          ts,
          user,
          studentId,
        );
    } else if (user.role === Role.Admin && !studentId) {
      mealCompiltaions = [];
    }
    // find MealCompilations of week

    const chartData = {
      mon: [],
      tue: [],
      wed: [],
      thu: [],
      fri: [],
      sat: [],
      sun: [],
    };

    const chartDataExpected = {
      mon: {
        meals: [],
        mealCompilation: null,
      },
      tue: {
        meals: [],
        mealCompilation: null,
      },
      wed: {
        meals: [],
        mealCompilation: null,
      },
      thu: {
        meals: [],
        mealCompilation: null,
      },
      fri: {
        meals: [],
        mealCompilation: null,
      },
      sat: {
        meals: [],
        mealCompilation: null,
      },
      sun: {
        meals: [],
        mealCompilation: null,
      },
    };

    meals.forEach((meal) => {
      const date = new Date(meal.date * 1000);
      const dayName = date.toString().split(' ')[0].toLowerCase();

      switch (dayName) {
        case 'mon':
          chartDataExpected.mon.meals.push(meal);
          break;
        case 'tue':
          chartDataExpected.tue.meals.push(meal);
          break;
        case 'wed':
          chartDataExpected.wed.meals.push(meal);
          break;
        case 'thu':
          chartDataExpected.thu.meals.push(meal);
          break;
        case 'fri':
          chartDataExpected.fri.meals.push(meal);
          break;
        case 'sat':
          chartDataExpected.sat.meals.push(meal);
          break;
        case 'sun':
          chartDataExpected.sun.meals.push(meal);
          break;
      }

      switch (dayName) {
        case 'mon':
          chartData.mon.push(meal);
          break;
        case 'tue':
          chartData.tue.push(meal);
          break;
        case 'wed':
          chartData.wed.push(meal);
          break;
        case 'thu':
          chartData.thu.push(meal);
          break;
        case 'fri':
          chartData.fri.push(meal);
          break;
        case 'sat':
          chartData.sat.push(meal);
          break;
        case 'sun':
          chartData.sun.push(meal);
          break;
      }
    });

    mealCompiltaions.forEach((mealCompiltaion) => {
      const date = new Date(mealCompiltaion.date * 1000);
      const dayName = date.toString().split(' ')[0].toLowerCase();

      switch (dayName) {
        case 'mon':
          chartDataExpected.mon.mealCompilation = mealCompiltaion;
          break;
        case 'tue':
          chartDataExpected.tue.mealCompilation = mealCompiltaion;
          break;
        case 'wed':
          chartDataExpected.wed.mealCompilation = mealCompiltaion;
          break;
        case 'thu':
          chartDataExpected.thu.mealCompilation = mealCompiltaion;
          break;
        case 'fri':
          chartDataExpected.fri.mealCompilation = mealCompiltaion;
          break;
        case 'sat':
          chartDataExpected.sat.mealCompilation = mealCompiltaion;
          break;
        case 'sun':
          chartDataExpected.sun.mealCompilation = mealCompiltaion;
          break;
      }
    });
    // return { ...chartData, chartDataExpected };
    return { ...chartDataExpected };
  }

  async getMealsByWeekPerStudent(
    ts = Math.floor(Date.now() / 1000),
    studentId,
    user,
  ) {
    // const date = new Date(
    //   (await dateToTimestamps(convertTimeStampsToString(ts))) * 1000,
    // );
    // const startDateOfWeekTs = Math.floor(startOfWeek(date).getTime() / 1000);
    // const endDateOfWeekTs = Math.floor(endOfWeek(date).getTime() / 1000);

    // const date = moment.unix(ts).startOf('day').unix();

    const startDateOfWeekTs = moment.unix(ts).startOf('week').unix();
    const endDateOfWeekTs = moment.unix(ts).endOf('week').unix();

    const student = await this.studentService.findById(studentId);

    let meals;

    const filter = {
      $and: [
        { date: { $gte: startDateOfWeekTs } },
        { date: { $lte: endDateOfWeekTs } },
      ],
    };

    if (user.role === Role.Admin) {
      const mealsByAdmin = await this.mealModel
        .find({
          ...filter,
          type: MealType.Launch,
          school: user.school,
          isCreatedByAdmin: true,
        })
        .sort({ type: 1 });

      const mealsForStudent = await this.mealModel
        .find({
          ...filter,
          createdBy: student.parents,
          student: studentId,
          isCreatedByAdmin: false,
        })
        .sort({ type: 1 });

      meals = [...mealsByAdmin, ...mealsForStudent];
    } else if (user.role === Role.Parents) {
      const mealsByAdmin = await this.mealModel
        .find({
          ...filter,
          type: MealType.Launch,
          school: user.school,
          isCreatedByAdmin: true,
        })
        .sort({ type: 1 });

      const mealsForStudent = await this.mealModel
        .find({
          ...filter,
          createdBy: user._id,
          school: user.school,
          student: studentId,
          isCreatedByAdmin: false,
        })
        .sort({ type: 1 });

      meals = [...mealsByAdmin, ...mealsForStudent];
    } else {
      const mealsByAdmin = await this.mealModel
        .find({
          ...filter,
          type: MealType.Launch,
          school: user.school,
          isCreatedByAdmin: true,
        })
        .sort({ type: 1 });

      const mealsForStudent = await this.mealModel
        .find({
          ...filter,
          createdBy: user.parents,
          school: user.school,
          student: studentId,
          isCreatedByAdmin: false,
        })
        .sort({ type: 1 });

      meals = [...mealsByAdmin, ...mealsForStudent];
    }

    const res = {
      mon: [],
      tue: [],
      wed: [],
      thu: [],
      fri: [],
      sat: [],
      sun: [],
    };

    meals.forEach((meal) => {
      const date = new Date(meal.date * 1000);

      switch (date.toString().split(' ')[0]) {
        case 'Mon':
          res.mon.push(meal);
          break;
        case 'Tue':
          res.tue.push(meal);
          break;
        case 'Wed':
          res.wed.push(meal);
          break;
        case 'Thu':
          res.thu.push(meal);
          break;
        case 'Fri':
          res.fri.push(meal);
          break;
        case 'Sat':
          res.sat.push(meal);
          break;
        case 'Sun':
          res.sun.push(meal);
          break;
      }
    });

    return [res];
  }

  async cloneMealsLastWeek(srcWeek, desWeek, dayChecked, user) {
    const res = [];

    const startDateSrcWeek = new Date(srcWeek);
    const startDateDesWeek = new Date(desWeek);

    for (let i = 0; i < dayChecked.length; i++) {
      const dateFilter =
        new Date(
          startDateSrcWeek.getFullYear(),
          startDateSrcWeek.getMonth(),
          startDateSrcWeek.getDate() -
            startDateSrcWeek.getDay() +
            dayChecked[i],
        ).getTime() / 1000;

      const newDateCreated =
        new Date(
          startDateDesWeek.getFullYear(),
          startDateDesWeek.getMonth(),
          startDateDesWeek.getDate() -
            startDateDesWeek.getDay() +
            dayChecked[i],
        ).getTime() / 1000;

      const meal = await this.mealModel.findOne({
        type: MealType.Launch,
        createdBy: user._id,
        date: dateFilter,
      });

      if (!meal) continue;

      const newMealClone: Meals = {
        ...meal.toObject(),
        date: newDateCreated,
        student: null,
      };

      const isExistMeal = await this.mealModel.findOne({
        type: MealType.Launch,
        createdBy: user._id,
        date: newDateCreated,
      });

      if (isExistMeal) {
        await isExistMeal.delete();
      }

      delete newMealClone.createdAt;
      delete newMealClone.updatedAt;
      delete newMealClone._id;

      const newMeal = await this.mealModel.create(newMealClone);

      res.push(newMeal);
    }

    return res;
  }

  async updateCompilationEvents(payload: MealCompilationUpdateEvent) {
    const school = payload.school;
    const date = payload.date;

    const listStudents = await this.studentService.findAll(school);

    for (const stu of listStudents) {
      const mealsOneDay = await this.findMealsOneDay(school, stu, date);
      if (mealsOneDay.length === 3) {
        await this.mealCompilationService.create(
          school,
          stu._id.toString(),
          date,
          mealsOneDay,
        );
      }
    }
  }
}
