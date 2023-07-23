import {
  FOOD_CANNOT_DELETED,
  FOOD_CANNOT_UPDATED,
  FOOD_NOT_EXIST,
} from '@/constants/error-codes.constant';
import { throwBadRequest, throwNotFound } from '@/utils/exception.utils';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateFoodDto } from './dto/create-food.dto';
import { Food, FoodDocument } from './food.schema';
import { PaginationRequestFullDto } from '@/dtos/pagination-request.dto';
import { PaginationDto } from '@/dtos/pagination-response.dto';
import { SortType } from '@/enums/sort.enum';
import { UpdateFoodDto } from '@/modules/foods/dto/update-food.dto';
import { Role } from '@/enums/role.enum';

@Injectable()
export class FoodsService {
  constructor(@InjectModel(Food.name) private foodModel: Model<FoodDocument>) {}

  async create(createFoodDto: CreateFoodDto, user) {
    const newFood = await this.foodModel.create({
      ...createFoodDto,
      school: user.school,
    });
    return newFood;
  }

  async findAllWithFilter(
    paginationRequestFullDto: PaginationRequestFullDto,
    user,
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

    let foods = [];
    let total = 0;

    if (user.role === Role.Sysadmin) {
      total = await this.foodModel.countDocuments({
        school: null,
        ...filter,
      });

      foods = await this.foodModel
        .find({
          school: null,
          ...filter,
        })
        .select('-deleted -createdAt -updatedAt')
        .sort(sortObj)
        .skip(paginationRequestFullDto.offset)
        .limit(paginationRequestFullDto.limit);
    } else {
      total = await this.foodModel.countDocuments({
        $or: [{ school: null }, { school: user.school }],
        ...filter,
      });

      foods = await this.foodModel
        .find({
          $or: [{ school: null }, { school: user.school }],
          ...filter,
        })
        .select('-deleted -createdAt -updatedAt')
        .sort(sortObj)
        .skip(paginationRequestFullDto.offset)
        .limit(paginationRequestFullDto.limit);
    }

    return {
      total,
      results: foods,
    };
  }

  async findAll(): Promise<Food[]> {
    const foods = await this.foodModel
      .find({})
      .select('-deleted -createdAt -updatedAt');

    return foods;
  }

  async findOne(id: string) {
    const food = await this.foodModel.findById(id);

    if (!food) {
      throwNotFound(FOOD_NOT_EXIST);
    }

    return food;
  }

  async update(id: string, updateFoodDto: UpdateFoodDto, user) {
    const food = await this.foodModel.findById(id);

    if (!food) {
      throwNotFound(FOOD_NOT_EXIST);
    }

    if (user.school && food.school != user.school) {
      throwBadRequest(FOOD_CANNOT_UPDATED);
    }

    for (const key in updateFoodDto) {
      food[key] = updateFoodDto[key];
    }

    await food.save();

    return food;
  }

  async delete(id: string, user) {
    const food = await this.foodModel.findById(id);

    if (!food) {
      throwNotFound(FOOD_NOT_EXIST);
    }

    if (user.school && food.school != user.school) {
      throwBadRequest(FOOD_CANNOT_DELETED);
    }

    await food.delete();
  }
}
