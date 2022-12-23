import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User, UserDocument } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import {
  ERROR_CODES,
  USER_NOT_EXIST,
  USER_NOT_EXIST_OR_DELETED,
  WRONG_CURRENT_PASSWORD,
  WRONG_USER_OR_PASSWORD,
} from '@/constants/error-codes.constant';
import { UserStatus } from './enum/user.enum';
import { RegisterDto } from '../auth/dto/register.dto';
import { PaginationRequestFullDto } from '@/dtos/pagination-request.dto';
import { SortType } from '@/enums/sort.enum';
import { PaginationDto } from '@/dtos/pagination-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { throwNotFound } from '@/utils/exception.utils';
import * as pick from 'lodash.pick';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findOne({ _id: id });

    if (!user) {
      throwNotFound(USER_NOT_EXIST);
    }

    return user;
  }

  async attempt(email: string, password: string) {
    const user = await this.userModel.findOne({ email });

    let result = {
      status: USER_NOT_EXIST_OR_DELETED,
      canReturnToken: false,
      user: null,
    };

    if (user) {
      const matchPassword = await this.comparePassword(password, user.password);

      if (matchPassword) {
        if (user.status === UserStatus.active) {
          result = { canReturnToken: true, user, status: user.status };
        } else {
          result = { canReturnToken: false, user, status: user.status };
        }
      } else {
        result = {
          canReturnToken: false,
          user,
          status: WRONG_USER_OR_PASSWORD,
        };
      }
    }

    return result;
  }

  async comparePassword(plainPass: string, password: string): Promise<boolean> {
    return await bcrypt.compare(plainPass, password);
  }

  async checkExist(
    key: string,
    value: string,
    userId = null,
  ): Promise<boolean> {
    const filter = {};
    filter[key] = value;
    if (userId) {
      filter['_id'] = { $ne: userId };
    }

    const user = await this.userModel.findOne(filter);

    return !!user;
  }

  async register(user: RegisterDto): Promise<User> {
    const newUser = await this.userModel.create({
      ...user,
      fullName: user.fullName,
      status: UserStatus.inactive,
    });

    return pick(newUser, ['_id', 'email', 'fullName', 'status']);
  }

  async findAll(
    paginationRequestFullDto: PaginationRequestFullDto,
  ): Promise<PaginationDto<User>> {
    const filter = paginationRequestFullDto.keyword
      ? {
          email: {
            $regex: `.*${paginationRequestFullDto.keyword}.*`,
            $options: 'i',
          },
        }
      : {};

    const sortObj = {};
    sortObj[paginationRequestFullDto.sortBy] =
      paginationRequestFullDto.sortType === SortType.asc ? 1 : -1;

    const total = await this.userModel.countDocuments(filter);

    const users = await this.userModel
      .find(filter)
      .populate({
        path: 'role',
        select: '_id name displayName',
      })
      .sort(sortObj)
      .skip(paginationRequestFullDto.offset)
      .limit(paginationRequestFullDto.limit);

    return {
      total,
      results: users,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findOne({ _id: id });

    if (!user) {
      throw new NotFoundException({
        message: USER_NOT_EXIST,
      });
    }

    for (const key in updateUserDto) {
      user[key] = updateUserDto[key];
    }

    await user.save();

    return user;
  }

  async create(currentUser: User, user: CreateUserDto) {
    const newUser = await this.userModel.create({
      ...user,
      createdBy: currentUser._id,
    });

    return newUser;
  }

  async changePassword(
    currentUser: User,
    changePasswordDto: ChangePasswordDto,
  ) {
    const user = await this.userModel.findOne({ _id: currentUser._id });

    const matchPassword = await this.comparePassword(
      changePasswordDto.currentPassword,
      user.password,
    );
    if (!matchPassword) {
      throw new BadRequestException({
        code: WRONG_CURRENT_PASSWORD,
        message: ERROR_CODES.get(WRONG_CURRENT_PASSWORD),
      });
    }

    user.password = changePasswordDto.newPassword;
    await user.save();
  }

  async me(userId) {
    const user = await this.userModel.findOne({ _id: userId }).populate({
      path: 'role',
      select: '_id name',
      populate: {
        path: 'permissions',
        select: '-createdAt -updatedAt',
      },
    });

    return user;
  }
}
