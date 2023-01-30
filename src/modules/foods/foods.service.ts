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

@Injectable()
export class FoodsService {
  constructor(@InjectModel(Food.name) private foodModel: Model<FoodDocument>) {}

  async create(createFoodDto: CreateFoodDto) {
    const newFood = await this.foodModel.create({ ...createFoodDto });
    return newFood;
  }

  async findAll(
    paginationRequestFullDto: PaginationRequestFullDto,
  ): Promise<PaginationDto<Food>> {
    // return await this.foodModel.find({});

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

    const characters = await this.foodModel
      .find(filter)
      .select('-deleted -createdAt -updatedAt')
      .sort(sortObj)
      .skip(paginationRequestFullDto.offset)
      .limit(paginationRequestFullDto.limit);

    return {
      total,
      results: characters,
    };
  }

  async findOne(id: string) {
    const food = await this.foodModel.findById(id);

    if (!food) {
      throwNotFound(FOOD_NOT_EXIST);
    }

    return food;
  }
}
