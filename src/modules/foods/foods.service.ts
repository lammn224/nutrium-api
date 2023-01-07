import { FOOD_NOT_EXIST } from '@/constants/error-codes.constant';
import { throwNotFound } from '@/utils/exception.utils';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateFoodDto } from './dto/create-food.dto';
import { Food, FoodDocument } from './food.schema';

@Injectable()
export class FoodsService {
  constructor(@InjectModel(Food.name) private foodModel: Model<FoodDocument>) {}

  async create(createFoodDto: CreateFoodDto) {
    const newFood = await this.foodModel.create({ ...createFoodDto });
    return newFood;
  }

  async findAll() {
    return await this.foodModel.find({});
  }

  async findOne(id: string) {
    const food = await this.foodModel.findById(id);

    if (!food) {
      throwNotFound(FOOD_NOT_EXIST);
    }

    return food;
  }
}
