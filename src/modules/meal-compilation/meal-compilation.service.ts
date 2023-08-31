import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  MealCompilation,
  MealCompilationDocument,
} from '@/modules/meal-compilation/meal-compilation.schema';
import { Model } from 'mongoose';
import { Meals } from '@/modules/meals/meals.schema';
import { StudentsService } from '@/modules/students/students.service';
import * as moment from 'moment/moment';
import { throwNotFound } from '@/utils/exception.utils';
import { MEAL_COMPILATION_NOT_EXISTED } from '@/constants/error-codes.constant';

@Injectable()
export class MealCompilationService {
  constructor(
    @InjectModel(MealCompilation.name)
    private mealCompilationModel: Model<MealCompilationDocument>,
    private readonly studentService: StudentsService,
  ) {}

  async create(
    school: string,
    student: string,
    date: number,
    mealsOneDay: Meals[],
  ) {
    let totalPower = 0;
    let totalProtein = 0;
    let totalLipid = 0;
    let totalGlucid = 0;
    let totalCa = 0;
    let totalFe = 0;
    let totalFiber = 0;
    let totalZn = 0;
    const meals = [];
    let recommendStable = '';
    let recommendMildWeightGain = '';
    let recommendWeightGain = '';
    let recommendFastWeightGain = '';
    let recommendMildWeightLoss = '';
    let recommendWeightLoss = '';

    const curStudent = await this.studentService.findById(student);

    const rcmCaloriesStable = curStudent.rcmCalories;
    const rcmCaloriesMildWeightGain = curStudent.rcmMildWeightGainCalories; // (gain 0.25kg/week)
    const rcmCaloriesWeightGain = curStudent.rcmWeightGainCalories; // (gain 0.50kg/week)
    const rcmCaloriesFastWeightGain = curStudent.rcmFastWeightGainCalories; // (gain 1.00kg/week)
    const rcmCaloriesMildWeightLoss = curStudent.rcmMildWeightLossCalories; // (loss 0.25kg/week)
    const rcmCaloriesWeightLoss = curStudent.rcmWeightLossCalories; // (loss 0.50kg/week)

    for (const meal of mealsOneDay) {
      totalPower += meal.power;
      totalProtein += meal.protein;
      totalLipid += meal.lipid;
      totalGlucid += meal.glucid;
      totalCa += meal.ca;
      totalFe += meal.fe;
      totalFiber += meal.fiber;
      totalZn += meal.zn;
      meals.push(meal._id);
    }

    totalPower = Number(totalPower.toFixed(2));
    totalProtein = Number(totalProtein.toFixed(2));
    totalLipid = Number(totalLipid.toFixed(2));
    totalGlucid = Number(totalGlucid.toFixed(2));
    totalCa = Number(totalCa.toFixed(2));
    totalFe = Number(totalFe.toFixed(2));
    totalFiber = Number(totalFiber.toFixed(2));
    totalZn = Number(totalZn.toFixed(2));

    // stable
    if (totalPower > rcmCaloriesStable) {
      recommendStable += `Với nhu cầu giữ nguyên mức cân nặng, tổng năng lượng các bữa ăn trong ngày đang dư ${(
        totalPower - rcmCaloriesStable
      ).toFixed(
        2,
      )} (kcal), cần luyện tập thêm để đốt cháy lượng calo dư thừa\n`;
    } else if (totalPower < rcmCaloriesStable) {
      recommendStable += `Với nhu cầu giữ nguyên mức cân nặng, tổng năng lượng các bữa ăn trong ngày đang thiếu ${(
        rcmCaloriesStable - totalPower
      ).toFixed(2)} (kcal), cần nạp thêm để bổ sung lượng calo thiếu hụt\n`;
    }

    // mild weight gain
    if (totalPower > rcmCaloriesMildWeightGain) {
      recommendMildWeightGain += `Ở mức tăng cân nhẹ (khoảng 0,25kg/ tuần), tổng năng lượng các bữa ăn trong ngày đang dư ${(
        totalPower - rcmCaloriesMildWeightGain
      ).toFixed(
        2,
      )} (kcal), cần luyện tập thêm để đốt cháy lượng calo dư thừa\n`;
    } else if (totalPower < rcmCaloriesMildWeightGain) {
      recommendMildWeightGain += `Ở mức tăng cân nhẹ (khoảng 0,25kg/ tuần), tổng năng lượng các bữa ăn trong ngày đang thiếu ${(
        rcmCaloriesMildWeightGain - totalPower
      ).toFixed(2)} (kcal), cần nạp thêm để bổ sung lượng calo thiếu hụt\n`;
    }

    // weight gain
    if (totalPower > rcmCaloriesWeightGain) {
      recommendWeightGain += `Ở mức tăng cân trung bình (khoảng 0,5kg/ tuần), tổng năng lượng các bữa ăn trong ngày đang dư ${(
        totalPower - rcmCaloriesWeightGain
      ).toFixed(
        2,
      )} (kcal), cần luyện tập thêm để đốt cháy lượng calo dư thừa\n`;
    } else if (totalPower < rcmCaloriesWeightGain) {
      recommendWeightGain += `Ở mức tăng cân trung bình (khoảng 0,5kg/ tuần), tổng năng lượng các bữa ăn trong ngày đang thiếu ${(
        rcmCaloriesWeightGain - totalPower
      ).toFixed(2)} (kcal), cần nạp thêm để bổ sung lượng calo thiếu hụt\n`;
    }

    // fast weight gain
    if (totalPower > rcmCaloriesFastWeightGain) {
      recommendFastWeightGain += `Ở mức tăng cân nhanh (khoảng 1kg/ tuần), tổng năng lượng các bữa ăn trong ngày đang dư ${(
        totalPower - rcmCaloriesFastWeightGain
      ).toFixed(
        2,
      )} (kcal), cần luyện tập thêm để đốt cháy lượng calo dư thừa\n`;
    } else if (totalPower < rcmCaloriesFastWeightGain) {
      recommendFastWeightGain += `Ở mức tăng cân nhanh (khoảng 1kg/ tuần), tổng năng lượng các bữa ăn trong ngày đang thiếu ${(
        rcmCaloriesFastWeightGain - totalPower
      ).toFixed(2)} (kcal), cần nạp thêm để bổ sung lượng calo thiếu hụt\n`;
    }

    // mild weight loss
    if (totalPower > rcmCaloriesMildWeightLoss) {
      recommendMildWeightLoss += `Ở mức giảm cân nhẹ (khoảng 0.25kg/ tuần), tổng năng lượng các bữa ăn trong ngày đang dư ${(
        totalPower - rcmCaloriesMildWeightLoss
      ).toFixed(
        2,
      )} (kcal), cần luyện tập thêm để đốt cháy lượng calo dư thừa\n`;
    } else if (totalPower < rcmCaloriesMildWeightLoss) {
      recommendMildWeightLoss += `Ở mức giảm cân nhẹ (khoảng 0.25kg/ tuần), tổng năng lượng các bữa ăn trong ngày đang thiếu ${(
        rcmCaloriesMildWeightLoss - totalPower
      ).toFixed(2)} (kcal), cần nạp thêm để bổ sung lượng calo thiếu hụt\n`;
    }

    // weight loss
    if (totalPower > rcmCaloriesWeightLoss) {
      recommendWeightLoss += `Ở mức giảm cân trung bình (khoảng 0.5kg/ tuần), tổng năng lượng các bữa ăn trong ngày đang dư ${(
        totalPower - rcmCaloriesWeightLoss
      ).toFixed(
        2,
      )} (kcal), cần luyện tập thêm để đốt cháy lượng calo dư thừa\n`;
    } else if (totalPower < rcmCaloriesWeightLoss) {
      recommendWeightLoss += `Ở mức giảm cân trung bình (khoảng 0.5kg/ tuần), tổng năng lượng các bữa ăn trong ngày đang thiếu ${(
        rcmCaloriesWeightLoss - totalPower
      ).toFixed(2)} (kcal), cần nạp thêm để bổ sung lượng calo thiếu hụt\n`;
    }

    const mealCompilation = await this.mealCompilationModel.findOne({
      school,
      student,
      date,
    });

    console.log(
      'from create mealCompilation',
      recommendStable,
      recommendMildWeightGain,
      recommendWeightGain,
      recommendFastWeightGain,
      recommendMildWeightLoss,
      recommendWeightLoss,
    );

    if (mealCompilation) {
      mealCompilation.totalPower = totalPower;
      mealCompilation.totalProtein = totalProtein;
      mealCompilation.totalLipid = totalLipid;
      mealCompilation.totalGlucid = totalGlucid;
      mealCompilation.totalCa = totalCa;
      mealCompilation.totalFe = totalFe;
      mealCompilation.totalFiber = totalFiber;
      mealCompilation.totalZn = totalZn;
      mealCompilation.meals = meals;
      mealCompilation.recommendStable = recommendStable;
      mealCompilation.recommendMildWeightGain = recommendMildWeightGain;
      mealCompilation.recommendWeightGain = recommendWeightGain;
      mealCompilation.recommendFastWeightGain = recommendFastWeightGain;
      mealCompilation.recommendMildWeightLoss = recommendMildWeightLoss;
      mealCompilation.recommendWeightLoss = recommendWeightLoss;

      await mealCompilation.save();
      await mealCompilation.populate({
        path: 'meals',
        populate: { path: 'foods' },
      });

      console.log('mealCompilation', mealCompilation);
    } else {
      const newMealCompilation = await this.mealCompilationModel.create({
        totalPower,
        totalProtein,
        totalLipid,
        totalGlucid,
        totalCa,
        totalFe,
        totalFiber,
        totalZn,
        meals,
        school,
        student,
        date,
        recommendStable,
        recommendMildWeightGain,
        recommendWeightGain,
        recommendFastWeightGain,
        recommendMildWeightLoss,
        recommendWeightLoss,
      });

      await newMealCompilation.populate({
        path: 'meals',
        populate: { path: 'foods' },
      });

      console.log('newMealCompilation', newMealCompilation);
    }
  }

  async update(
    school: string,
    student: string,
    date: number,
    mealsOneDay: Meals[],
  ) {
    const mealCompilation = await this.mealCompilationModel.findOne({
      school,
      student,
      date,
    });

    if (!mealCompilation) {
      throwNotFound(MEAL_COMPILATION_NOT_EXISTED);
    }

    const curStudent = await this.studentService.findById(student);

    let totalPower = 0;
    let totalProtein = 0;
    let totalLipid = 0;
    let totalGlucid = 0;
    let totalCa = 0;
    let totalFe = 0;
    let totalFiber = 0;
    let totalZn = 0;
    const meals = [];
    let recommendStable = '';
    let recommendMildWeightGain = '';
    let recommendWeightGain = '';
    let recommendFastWeightGain = '';
    let recommendMildWeightLoss = '';
    let recommendWeightLoss = '';

    const rcmCaloriesStable = curStudent.rcmCalories;
    const rcmCaloriesMildWeightGain = curStudent.rcmMildWeightGainCalories; // (gain 0.25kg/week)
    const rcmCaloriesWeightGain = curStudent.rcmWeightGainCalories; // (gain 0.50kg/week)
    const rcmCaloriesFastWeightGain = curStudent.rcmFastWeightGainCalories; // (gain 1.00kg/week)
    const rcmCaloriesMildWeightLoss = curStudent.rcmMildWeightLossCalories; // (loss 0.25kg/week)
    const rcmCaloriesWeightLoss = curStudent.rcmWeightLossCalories; // (loss 0.50kg/week)

    for (const meal of mealsOneDay) {
      totalPower += meal.power;
      totalProtein += meal.protein;
      totalLipid += meal.lipid;
      totalGlucid += meal.glucid;
      totalCa += meal.ca;
      totalFe += meal.fe;
      totalFiber += meal.fiber;
      totalZn += meal.zn;
      meals.push(meal._id);
    }

    totalPower = Number(totalPower.toFixed(2));
    totalProtein = Number(totalProtein.toFixed(2));
    totalLipid = Number(totalLipid.toFixed(2));
    totalGlucid = Number(totalGlucid.toFixed(2));
    totalCa = Number(totalCa.toFixed(2));
    totalFe = Number(totalFe.toFixed(2));
    totalFiber = Number(totalFiber.toFixed(2));
    totalZn = Number(totalZn.toFixed(2));

    // stable
    if (totalPower > rcmCaloriesStable) {
      recommendStable += `Với nhu cầu giữ nguyên mức cân nặng, tổng năng lượng các bữa ăn trong ngày đang dư ${(
        totalPower - rcmCaloriesStable
      ).toFixed(
        2,
      )} (kcal), cần luyện tập thêm để đốt cháy lượng calo dư thừa\n`;
    } else if (totalPower < rcmCaloriesStable) {
      recommendStable += `Với nhu cầu giữ nguyên mức cân nặng, tổng năng lượng các bữa ăn trong ngày đang thiếu ${(
        rcmCaloriesStable - totalPower
      ).toFixed(2)} (kcal), cần nạp thêm để bổ sung lượng calo thiếu hụt\n`;
    }

    // mild weight gain
    if (totalPower > rcmCaloriesMildWeightGain) {
      recommendMildWeightGain += `Ở mức tăng cân nhẹ (khoảng 0,25kg/ tuần), tổng năng lượng các bữa ăn trong ngày đang dư ${(
        totalPower - rcmCaloriesMildWeightGain
      ).toFixed(
        2,
      )} (kcal), cần luyện tập thêm để đốt cháy lượng calo dư thừa\n`;
    } else if (totalPower < rcmCaloriesMildWeightGain) {
      recommendMildWeightGain += `Ở mức tăng cân nhẹ (khoảng 0,25kg/ tuần), tổng năng lượng các bữa ăn trong ngày đang thiếu ${(
        rcmCaloriesMildWeightGain - totalPower
      ).toFixed(2)} (kcal), cần nạp thêm để bổ sung lượng calo thiếu hụt\n`;
    }

    // weight gain
    if (totalPower > rcmCaloriesWeightGain) {
      recommendWeightGain += `Ở mức tăng cân trung bình (khoảng 0,5kg/ tuần), tổng năng lượng các bữa ăn trong ngày đang dư ${(
        totalPower - rcmCaloriesWeightGain
      ).toFixed(
        2,
      )} (kcal), cần luyện tập thêm để đốt cháy lượng calo dư thừa\n`;
    } else if (totalPower < rcmCaloriesWeightGain) {
      recommendWeightGain += `Ở mức tăng cân trung bình (khoảng 0,5kg/ tuần), tổng năng lượng các bữa ăn trong ngày đang thiếu ${(
        rcmCaloriesWeightGain - totalPower
      ).toFixed(2)} (kcal), cần nạp thêm để bổ sung lượng calo thiếu hụt\n`;
    }

    // fast weight gain
    if (totalPower > rcmCaloriesFastWeightGain) {
      recommendFastWeightGain += `Ở mức tăng cân nhanh (khoảng 1kg/ tuần), tổng năng lượng các bữa ăn trong ngày đang dư ${(
        totalPower - rcmCaloriesFastWeightGain
      ).toFixed(
        2,
      )} (kcal), cần luyện tập thêm để đốt cháy lượng calo dư thừa\n`;
    } else if (totalPower < rcmCaloriesFastWeightGain) {
      recommendFastWeightGain += `Ở mức tăng cân nhanh (khoảng 1kg/ tuần), tổng năng lượng các bữa ăn trong ngày đang thiếu ${(
        rcmCaloriesFastWeightGain - totalPower
      ).toFixed(2)} (kcal), cần nạp thêm để bổ sung lượng calo thiếu hụt\n`;
    }

    // mild weight loss
    if (totalPower > rcmCaloriesMildWeightLoss) {
      recommendMildWeightLoss += `Ở mức giảm cân nhẹ (khoảng 0.25kg/ tuần), tổng năng lượng các bữa ăn trong ngày đang dư ${(
        totalPower - rcmCaloriesMildWeightLoss
      ).toFixed(
        2,
      )} (kcal), cần luyện tập thêm để đốt cháy lượng calo dư thừa\n`;
    } else if (totalPower < rcmCaloriesMildWeightLoss) {
      recommendMildWeightLoss += `Ở mức giảm cân nhẹ (khoảng 0.25kg/ tuần), tổng năng lượng các bữa ăn trong ngày đang thiếu ${(
        rcmCaloriesMildWeightLoss - totalPower
      ).toFixed(2)} (kcal), cần nạp thêm để bổ sung lượng calo thiếu hụt\n`;
    }

    // weight loss
    if (totalPower > rcmCaloriesWeightLoss) {
      recommendWeightLoss += `Ở mức giảm cân trung bình (khoảng 0.5kg/ tuần), tổng năng lượng các bữa ăn trong ngày đang dư ${(
        totalPower - rcmCaloriesWeightLoss
      ).toFixed(
        2,
      )} (kcal), cần luyện tập thêm để đốt cháy lượng calo dư thừa\n`;
    } else if (totalPower < rcmCaloriesWeightLoss) {
      recommendWeightLoss += `Ở mức giảm cân trung bình (khoảng 0.5kg/ tuần), tổng năng lượng các bữa ăn trong ngày đang thiếu ${(
        rcmCaloriesWeightLoss - totalPower
      ).toFixed(2)} (kcal), cần nạp thêm để bổ sung lượng calo thiếu hụt\n`;
    }

    console.log(
      'from update mealCompilation',
      recommendStable,
      recommendMildWeightGain,
      recommendWeightGain,
      recommendFastWeightGain,
      recommendMildWeightLoss,
      recommendWeightLoss,
    );

    mealCompilation.totalPower = totalPower;
    mealCompilation.totalProtein = totalProtein;
    mealCompilation.totalLipid = totalLipid;
    mealCompilation.totalGlucid = totalGlucid;
    mealCompilation.totalCa = totalCa;
    mealCompilation.totalFe = totalFe;
    mealCompilation.totalFiber = totalFiber;
    mealCompilation.totalZn = totalZn;
    mealCompilation.meals = meals;
    mealCompilation.recommendStable = recommendStable;
    mealCompilation.recommendMildWeightGain = recommendMildWeightGain;
    mealCompilation.recommendWeightGain = recommendWeightGain;
    mealCompilation.recommendFastWeightGain = recommendFastWeightGain;
    mealCompilation.recommendMildWeightLoss = recommendMildWeightLoss;
    mealCompilation.recommendWeightLoss = recommendWeightLoss;

    await mealCompilation.save();
    await mealCompilation.populate({
      path: 'meals',
      populate: { path: 'foods' },
    });

    console.log('update mealCompilation', mealCompilation);
  }

  async findMealCompilationByWeek(
    ts = Math.floor(Date.now() / 1000),
    user,
    student,
  ): Promise<MealCompilation[]> {
    const startDateOfWeekTs = moment.unix(ts).startOf('week').unix();
    const endDateOfWeekTs = moment.unix(ts).endOf('week').unix();

    const filter = {
      $and: [
        { date: { $gte: startDateOfWeekTs } },
        { date: { $lte: endDateOfWeekTs } },
        { school: user.school },
        { student },
      ],
    };

    const mealCompilations = await this.mealCompilationModel.find({
      ...filter,
    });

    return mealCompilations;
  }
}
