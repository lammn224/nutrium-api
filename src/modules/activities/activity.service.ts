import { Injectable } from '@nestjs/common';
import { CreateActivityDto } from './dto/create-activity.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginationRequestFullDto } from '@/dtos/pagination-request.dto';
import { PaginationDto } from '@/dtos/pagination-response.dto';
import { throwBadRequest, throwNotFound } from '@/utils/exception.utils';
import {
  ACTIVITY_CANNOT_DELETED,
  ACTIVITY_CANNOT_UPDATED,
  ACTIVITY_EXISTED,
  ACTIVITY_NOT_EXISTED,
  FOOD_CANNOT_UPDATED,
} from '@/constants/error-codes.constant';
import {
  Activity,
  ActivityDocument,
} from '@/modules/activities/activity.schema';
import { UpdateActivityDto } from '@/modules/activities/dto/update-activity.dto';
import { SortType } from '@/enums/sort.enum';
import { Role } from '@/enums/role.enum';

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
  ) {}
  async createActivity(createActivityDto: CreateActivityDto) {
    const isExistedActivity = await this.activityModel.findOne({
      name: createActivityDto.name,
      school: createActivityDto.school,
    });
    if (isExistedActivity) throwBadRequest(ACTIVITY_EXISTED);

    const newActivity = await this.activityModel.create({
      ...createActivityDto,
    });

    await newActivity.save();
    return newActivity;
  }

  async findAllWithPaging(
    user,
    paginationRequestFullDto: PaginationRequestFullDto,
  ): Promise<PaginationDto<Activity>> {
    const filter = {
      // school: user.school,
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

    let activities = [];
    let total = 0;

    if (user.role === Role.Sysadmin) {
      total = await this.activityModel.countDocuments({
        school: null,
        ...filter,
      });

      activities = await this.activityModel
        .find({
          school: null,
          ...filter,
        })
        .select('-deleted -createdAt -updatedAt')
        .sort(sortObj)
        .skip(paginationRequestFullDto.offset)
        .limit(paginationRequestFullDto.limit);
    } else {
      total = await this.activityModel.countDocuments({
        $or: [{ school: null }, { school: user.school }],
        ...filter,
      });

      activities = await this.activityModel
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
      results: activities,
    };
  }

  async findAll(): Promise<Activity[]> {
    const activities = await this.activityModel
      .find({})
      .select('-deleted -createdAt -updatedAt');

    return activities;
  }

  async findActivityById(user, id: string) {
    const activity = await this.activityModel.findOne({
      _id: id,
      // school: user.school,
    });

    if (!activity) {
      throwNotFound(ACTIVITY_NOT_EXISTED);
    }

    return activity;
  }

  async update(activityId, updateActivityDto: UpdateActivityDto, user) {
    const activity = await this.activityModel.findOne({
      _id: activityId,
    });

    if (!activity) {
      throwNotFound(ACTIVITY_NOT_EXISTED);
    }

    if (user.school && activity.school != user.school) {
      throwBadRequest(ACTIVITY_CANNOT_UPDATED);
    }

    for (const key in updateActivityDto) {
      activity[key] = updateActivityDto[key];
    }

    await activity.save();

    return activity;
  }
  async delete(id: string, user) {
    const activity = await this.activityModel.findById(id);

    if (!activity) {
      throwNotFound(ACTIVITY_NOT_EXISTED);
    }

    if (user.school && activity.school != user.school) {
      throwBadRequest(ACTIVITY_CANNOT_DELETED);
    }

    await activity.delete();
  }
}
