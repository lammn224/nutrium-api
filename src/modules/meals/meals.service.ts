import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateMealDto } from './dto/create-meal.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Meals, MealsDocument } from '@/modules/meals/meals.schema';
import { Role } from '@/enums/role.enum';
import { throwBadRequest, throwForbidden } from '@/utils/exception.utils';
import {
  MEAL_EXISTED,
  MEAL_NOT_EXISTED,
  MEAL_NOT_UPDATED,
} from '@/constants/error-codes.constant';
import { UpdateMealDto } from '@/modules/meals/dto/update-meal.dto';

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
      school: user.school,
      type: createMealDto.type,
      date: createMealDto.date,
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

  async updateMeal(id: string, updateMealDto: UpdateMealDto, user) {
    const meal = await this.mealModel.findById(id);

    if (!meal) {
      throwBadRequest(MEAL_NOT_EXISTED);
    }

    if (meal.createdBy.toString() !== user._id.toString()) {
      throwForbidden(MEAL_NOT_UPDATED);
    }

    for (const key in updateMealDto) {
      meal[key] = updateMealDto[key];
    }

    await meal.save();

    return meal;
  }

  async findAll(user): Promise<Meals[]> {
    if (user.role === Role.Admin) {
      const meals = await this.mealModel.find({
        school: user.school,
      });

      return meals;
    } else if (user.role === Role.Parents) {
      const mealsByUser = await this.mealModel
        .find({ school: user.school, createdBy: user._id })
        .select('-deleted -createdAt -updatedAt');

      const mealsByAdmin = await this.mealModel.find({
        school: user.school,
        createdBy: { $ne: user._id },
      });

      return [...mealsByAdmin, ...mealsByUser];
    } else {
      const mealsByParent = await this.mealModel
        .find({ school: user.school, createdBy: user.parents })
        .select('-deleted -createdAt -updatedAt');

      const mealsByAdmin = await this.mealModel.find({
        school: user.school,
        createdBy: { $ne: user.parents },
      });

      return [...mealsByAdmin, ...mealsByParent];
    }
  }
}
