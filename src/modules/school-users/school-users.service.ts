import { Injectable, NotFoundException } from '@nestjs/common';
import { SchoolUser, SchoolUserDocument } from './school-user.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import {
  PARENTS_ACCOUNT_EXISTED,
  PARENTS_ACCOUNT_NOT_FOUND,
  USER_NOT_EXIST,
  USER_NOT_EXIST_OR_DELETED,
  WRONG_USER_OR_PASSWORD,
} from '@/constants/error-codes.constant';
import { UserStatus } from './enum/user-status.enum';
import { throwBadRequest, throwNotFound } from '@/utils/exception.utils';
import { CreateSchoolUserDto } from './dto/create-school-user.dto';
import { Role } from '@/enums/role.enum';
import { CreateParentsDto } from '@/modules/school-users/dto/create-parents.dto';
import { UpdateUserInfoDto } from '@/modules/school-users/dto/update-user-info-dto';
import { PaginationRequestFullDto } from '@/dtos/pagination-request.dto';
import { PaginationDto } from '@/dtos/pagination-response.dto';
import { SortType } from '@/enums/sort.enum';
import { ResetPasswordDto } from '@/dtos/reset-password.dto';

@Injectable()
export class SchoolUsersService {
  constructor(
    @InjectModel(SchoolUser.name)
    private schoolUserModel: Model<SchoolUserDocument>,
  ) {}

  async createParents(
    school,
    createParentsDto: CreateParentsDto,
    newStudent,
    session: mongoose.ClientSession | null = null,
  ) {
    const isExistedParents = await this.schoolUserModel
      .findOne({
        school,
        phoneNumber: createParentsDto.phoneNumber,
      })
      .session(session);

    if (isExistedParents) {
      isExistedParents.child.push(newStudent);
      await isExistedParents.save({ session });

      return isExistedParents;
    }

    const [newParents] = await this.schoolUserModel.create([createParentsDto], {
      session,
    });

    return newParents;
  }

  async createParentsByAdmin(
    school,
    createParentsDto: CreateParentsDto,
    newStudent,
    isExistedParentAcc,
  ) {
    if (isExistedParentAcc) {
      const isExistedParents = await this.schoolUserModel.findOne({
        school,
        phoneNumber: createParentsDto.phoneNumber,
      });

      if (!isExistedParents) {
        throwNotFound(PARENTS_ACCOUNT_NOT_FOUND);
      }

      isExistedParents.child.push(newStudent);
      await isExistedParents.save();

      return isExistedParents;
    }

    const isExistedParents = await this.schoolUserModel.findOne({
      school,
      phoneNumber: createParentsDto.phoneNumber,
    });

    if (isExistedParents) {
      throwBadRequest(PARENTS_ACCOUNT_EXISTED);
    }

    const newParents = await this.schoolUserModel.create({
      ...createParentsDto,
    });

    return newParents;
  }

  async createSchoolOwner(
    school: string,
    createSchoolUserDto: CreateSchoolUserDto,
  ): Promise<SchoolUser> {
    const owner = await this.schoolUserModel.create({
      school,
      ...createSchoolUserDto,
      child: null,
      role: Role.Admin,
    });

    return owner;
  }

  async createAdminAccount(
    school: string,
    createSchoolUserDto: CreateSchoolUserDto,
  ): Promise<SchoolUser> {
    const newAdmin = await this.schoolUserModel.create({
      school,
      ...createSchoolUserDto,
      child: null,
      role: Role.Admin,
    });

    return newAdmin;
  }

  async findById(id: string): Promise<SchoolUser> {
    const schoolUser = await this.schoolUserModel.findOne({ _id: id });

    if (!schoolUser) {
      throwNotFound(USER_NOT_EXIST);
    }

    return schoolUser;
  }

  async attempt(phoneNumber, password, school) {
    const schoolUser = await this.schoolUserModel.findOne({
      school,
      phoneNumber,
    });

    let result = {
      status: USER_NOT_EXIST_OR_DELETED,
      canReturnToken: false,
      schoolUser: null,
    };

    if (schoolUser) {
      const matchPassword = await this.comparePassword(
        password,
        schoolUser.password,
      );

      if (matchPassword) {
        if (schoolUser.status === UserStatus.active) {
          result = {
            canReturnToken: true,
            schoolUser,
            status: schoolUser.status,
          };
        } else {
          result = {
            canReturnToken: false,
            schoolUser,
            status: schoolUser.status,
          };
        }
      } else {
        result = {
          canReturnToken: false,
          schoolUser,
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

    const user = await this.schoolUserModel.findOne(filter);

    return !!user;
  }

  async me(userId) {
    const user = await this.schoolUserModel
      .findOne({ _id: userId })
      .populate({
        path: 'school',
      })
      .populate({
        path: 'child',
        populate: 'class',
      });

    if (user.role === Role.Admin) user.child = null;

    return user;
  }

  async updateInfo(schoolUserId, updateUserInfoDto: UpdateUserInfoDto) {
    const schoolUser = await this.schoolUserModel.findOne({
      _id: schoolUserId,
    });

    if (!schoolUser) {
      throwNotFound(USER_NOT_EXIST);
    }

    for (const key in updateUserInfoDto) {
      schoolUser[key] = updateUserInfoDto[key];
    }

    await schoolUser.save();

    return schoolUser;
  }

  async findAllParentsAccountWithFilter(
    user,
    paginationRequestFullDto: PaginationRequestFullDto,
  ): Promise<PaginationDto<SchoolUser>> {
    const filter = {
      school: user.school,
      role: Role.Parents,
      ...(paginationRequestFullDto.keyword && {
        fullName: {
          $regex: `.*${paginationRequestFullDto.keyword}.*`,
          $options: 'i',
        },
      }),
    };

    const sortObj = {};
    sortObj[paginationRequestFullDto.sortBy] =
      paginationRequestFullDto.sortType === SortType.asc ? 1 : -1;

    const total = await this.schoolUserModel.countDocuments(filter);

    const students = await this.schoolUserModel
      .find(filter)
      .populate('child')
      .select('-deleted -createdAt -updatedAt')
      .sort(sortObj)
      .skip(paginationRequestFullDto.offset)
      .limit(paginationRequestFullDto.limit);

    return {
      total,
      results: students,
    };
  }

  async findAllAdminAccountWithFilter(
    user,
    paginationRequestFullDto: PaginationRequestFullDto,
  ): Promise<PaginationDto<SchoolUser>> {
    const filter = {
      school: user.school,
      role: Role.Admin,
      ...(paginationRequestFullDto.keyword && {
        fullName: {
          $regex: `.*${paginationRequestFullDto.keyword}.*`,
          $options: 'i',
        },
      }),
    };

    const sortObj = {};
    sortObj[paginationRequestFullDto.sortBy] =
      paginationRequestFullDto.sortType === SortType.asc ? 1 : -1;

    const total = await this.schoolUserModel.countDocuments(filter);

    const students = await this.schoolUserModel
      .find(filter)
      .populate('child')
      .select('-deleted -createdAt -updatedAt')
      .sort(sortObj)
      .skip(paginationRequestFullDto.offset)
      .limit(paginationRequestFullDto.limit);

    return {
      total,
      results: students,
    };
  }

  async resetPasswordByAdmin(_id: string, resetPasswordDto: ResetPasswordDto) {
    const parents = await this.schoolUserModel.findOne({ _id });

    if (!parents) {
      throw new NotFoundException(USER_NOT_EXIST);
    }

    parents.password = resetPasswordDto.newPassword;
    await parents.save();
  }
}
