import { Injectable } from '@nestjs/common';
import { CreateMealDto } from './dto/create-meal.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Meals, MealsDocument } from '@/modules/meals/meals.schema';
import { Role } from '@/enums/role.enum';
import { throwBadRequest } from '@/utils/exception.utils';
import { MEAL_EXISTED } from '@/constants/error-codes.constant';
import {
  convertTimeStampsToString,
  dateToTimestamps,
} from '@/utils/dateToTimestamps.utils';
import { Food } from '@/modules/foods/food.schema';

@Injectable()
export class MealsService {
  constructor(
    @InjectModel(Meals.name) private mealModel: Model<MealsDocument>,
  ) {}

  async create(createMealDto: CreateMealDto, user) {
    if (user.role === Role.Parents) {
      createMealDto.student = user.child;
    }

    const isExistMeal = await this.mealModel.findOne({
      type: createMealDto.type,
      date: await dateToTimestamps(
        convertTimeStampsToString(createMealDto.date),
      ),
      createdBy: user._id,
    });

    if (isExistMeal) {
      throwBadRequest(MEAL_EXISTED);
    }

    const newMeal = await this.mealModel.create(createMealDto);
    newMeal.createdBy = user._id;

    await newMeal.save();

    return newMeal;
  }

  async findAll(): Promise<Meals[]> {
    const meals = await this.mealModel
      .find({})
      .select('-deleted -createdAt -updatedAt');

    return meals;
  }
}
