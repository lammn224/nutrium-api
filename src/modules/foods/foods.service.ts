import { FOOD_NOT_EXIST } from '@/constants/error-codes.constant';
import { throwNotFound } from '@/utils/exception.utils';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateFoodDto } from './dto/create-food.dto';
import { Food, FoodDocument } from './food.schema';
import { PaginationRequestFullDto } from '@/dtos/pagination-request.dto';
import { PaginationDto } from '@/dtos/pagination-response.dto';
import { SortType } from '@/enums/sort.enum';
import { UpdateFoodDto } from '@/modules/foods/dto/update-food.dto';

@Injectable()
export class FoodsService {
  constructor(@InjectModel(Food.name) private foodModel: Model<FoodDocument>) {}

  async create(createFoodDto: CreateFoodDto) {
    const newFood = await this.foodModel.create({ ...createFoodDto });
    return newFood;
  }

  async findAllWithFilter(
    paginationRequestFullDto: PaginationRequestFullDto,
  ): Promise<PaginationDto<Food>> {
    const filter = {
      ...(paginationRequestFullDto.keyword && {
        name: {
          $regex: `.*${paginationRequestFullDto.keyword}.*`,
          $options: 'i',
        },
      }),
    };

    const sortObj = {};
    sortObj[paginationRequestFullDto.sortBy] =
      paginationRequestFullDto.sortType === SortType.asc ? 1 : -1;

    const total = await this.foodModel.countDocuments(filter);

    const foods = await this.foodModel
      .find(filter)
      .select('-deleted -createdAt -updatedAt')
      .sort(sortObj)
      .skip(paginationRequestFullDto.offset)
      .limit(paginationRequestFullDto.limit);

    return {
      total,
      results: foods,
    };
  }

  async findAll(): Promise<PaginationDto<Food>> {
    const total = await this.foodModel.countDocuments({});

    const foods = await this.foodModel
      .find({})
      .select('-deleted -createdAt -updatedAt');

    return {
      total,
      results: foods,
    };
  }

  async findOne(id: string) {
    const food = await this.foodModel.findById(id);

    if (!food) {
      throwNotFound(FOOD_NOT_EXIST);
    }

    return food;
  }

  async update(id: string, updateFoodDto: UpdateFoodDto) {
    const food = await this.foodModel.findById(id);

    if (!food) {
      throwNotFound(FOOD_NOT_EXIST);
    }

    for (const key in updateFoodDto) {
      food[key] = updateFoodDto[key];
    }

    await food.save();

    return food;
  }

  async delete(id: string) {
    const food = await this.foodModel.findById(id);

    if (!food) {
      throwNotFound(FOOD_NOT_EXIST);
    }

    await food.delete();
  }
}
