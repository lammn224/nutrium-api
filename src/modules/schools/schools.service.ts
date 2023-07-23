import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegisterDto } from '../auth/dto/register.dto';
import { SchoolUsersService } from '../school-users/school-users.service';
import { School, SchoolDocument } from './schools.schema';
import { throwBadRequest, throwNotFound } from '@/utils/exception.utils';
import {
  SCHOOL_CODE_EXISTED,
  SCHOOL_NOT_EXIST,
} from '@/constants/error-codes.constant';
import { PaginationRequestFullDto } from '@/dtos/pagination-request.dto';
import { PaginationDto } from '@/dtos/pagination-response.dto';
import { SortType } from '@/enums/sort.enum';
import { CreateSchoolDto } from '@/modules/schools/dto/create-school.dto';
import { Status } from '@/enums/status.enum';

@Injectable()
export class SchoolsService {
  constructor(
    @InjectModel(School.name)
    private schoolModel: Model<SchoolDocument>,
    private readonly schoolUserService: SchoolUsersService,
  ) {}

  async findSchoolByCode(code: string) {
    const school = await this.schoolModel.findOne({ code });

    if (!school) throwNotFound(SCHOOL_NOT_EXIST);

    return school;
  }

  async findSchoolById(schoolId: string | School) {
    const school = await this.schoolModel.findById(schoolId);

    if (!school) throwNotFound(SCHOOL_NOT_EXIST);

    return school;
  }

  async createSchool(registerDto: RegisterDto) {
    const newSchool = await this.schoolModel.create({
      ...registerDto,
      // status: Status.Pending,
      status: Status.Active,
    });

    const owner = await this.schoolUserService.createSchoolOwner(
      newSchool._id.toString(),
      registerDto,
    );

    newSchool.createdBy = owner._id.toString();
    newSchool.manager = owner._id.toString();
    await newSchool.save();

    return {
      school: newSchool,
      owner,
    };
  }

  async createSchoolBySysadmin(user, createSchoolDto: CreateSchoolDto) {
    const newSchool = await this.schoolModel.create({
      ...createSchoolDto,
      // status: Status.Pending,
      status: Status.Active,
    });

    createSchoolDto.password = process.env.DEFAULT_PASSWORD;
    const owner = await this.schoolUserService.createSchoolOwner(
      newSchool._id.toString(),
      createSchoolDto,
    );

    newSchool.createdBy = user._id.toString();
    newSchool.manager = owner._id.toString();
    await newSchool.save();

    return newSchool;
  }

  async approveBySysadmin(user, schoolId) {
    const school = await this.schoolModel.findById(schoolId);

    if (!school) {
      throwNotFound(SCHOOL_NOT_EXIST);
    }

    school.status = Status.Unconfirmed;
    await school.save();

    // tao active code
    // active code expired
    // save database

    // gui tin nhan

    return school;
  }

  async checkExist(key: string, value: string): Promise<boolean> {
    const filter = {};
    filter[key] = { $regex: new RegExp('^' + value.toLowerCase().trim(), 'i') };

    const school = await this.schoolModel.findOne(filter);

    if (school) throwBadRequest(SCHOOL_CODE_EXISTED);

    return !!school;
  }

  async findAllSchoolWithFilter(
    paginationRequestFullDto: PaginationRequestFullDto,
  ): Promise<PaginationDto<School>> {
    const filter = {
      ...(paginationRequestFullDto.keyword && {
        $or: [
          {
            name: {
              $regex: `.*${paginationRequestFullDto.keyword}.*`,
              $options: 'i',
            },
          },
          {
            code: {
              $regex: `.*${paginationRequestFullDto.keyword}.*`,
              $options: 'i',
            },
          },
        ],
      }),
    };

    const sortObj = {};
    sortObj[paginationRequestFullDto.sortBy] =
      paginationRequestFullDto.sortType === SortType.asc ? 1 : -1;

    const total = await this.schoolModel.countDocuments(filter);

    const schools = await this.schoolModel
      .find(filter)
      .populate({ path: 'createdBy' })
      .populate({ path: 'manager' })
      .select('-deleted -createdAt -updatedAt')
      .sort(sortObj)
      .skip(paginationRequestFullDto.offset)
      .limit(paginationRequestFullDto.limit);

    return {
      total,
      results: schools,
    };
  }

  async findAllSchool() {
    const schools = await this.schoolModel
      .find()
      .populate({ path: 'createdBy' })
      .populate({ path: 'manager' })
      .select('-deleted -createdAt -updatedAt');

    return schools;
  }
}
