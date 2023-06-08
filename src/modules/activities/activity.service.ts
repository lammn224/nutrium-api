import { Injectable } from '@nestjs/common';
import { CreateActivityDto } from './dto/create-activity.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginationRequestFullDto } from '@/dtos/pagination-request.dto';
import { PaginationDto } from '@/dtos/pagination-response.dto';
import { throwBadRequest, throwNotFound } from '@/utils/exception.utils';
import {
  ACTIVITY_EXISTED,
  ACTIVITY_NOT_EXISTED,
  USER_NOT_EXIST,
} from '@/constants/error-codes.constant';
import {
  Activity,
  ActivityDocument,
} from '@/modules/activities/activity.schema';
import { UpdateActivityDto } from '@/modules/activities/dto/update-activity.dto';

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
      school: user.school,
      ...(paginationRequestFullDto.keyword && {
        name: {
          $regex: `.*${paginationRequestFullDto.keyword}.*`,
          $options: 'i',
        },
      }),
    };

    const total = await this.activityModel.countDocuments(filter);

    const activities = await this.activityModel
      .find(filter)
      .sort({ name: 1 })
      .skip(paginationRequestFullDto.offset)
      .limit(paginationRequestFullDto.limit);

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
      school: user.school,
    });

    if (!activity) {
      throwNotFound(ACTIVITY_NOT_EXISTED);
    }

    return activity;
  }

  async update(user, updateActivityDto: UpdateActivityDto, activityId) {
    const activity = await this.activityModel.findOne({
      _id: activityId,
    });

    if (!activity) {
      throwNotFound(USER_NOT_EXIST);
    }

    for (const key in updateActivityDto) {
      activity[key] = updateActivityDto[key];
    }

    await activity.save();

    return activity;
  }
  async delete(id: string) {
    const activity = await this.activityModel.findById(id);

    if (!activity) {
      throwNotFound(ACTIVITY_NOT_EXISTED);
    }

    await activity.delete();
  }
}
