import { Injectable } from '@nestjs/common';
import { CreateGradeDto } from './dto/create-grade.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Grade, GradeDocument } from '@/modules/grade/grade.schema';
import { PaginationRequestFullDto } from '@/dtos/pagination-request.dto';
import { PaginationDto } from '@/dtos/pagination-response.dto';
import { throwBadRequest, throwNotFound } from '@/utils/exception.utils';
import {
  GRADE_EXISTED,
  GRADE_NOT_EXISTED,
  USER_NOT_EXIST,
} from '@/constants/error-codes.constant';
import { UpdateGradeDto } from '@/modules/grade/dto/update-grade.dto';

@Injectable()
export class GradeService {
  constructor(
    @InjectModel(Grade.name) private gradeModel: Model<GradeDocument>,
  ) {}
  async createGrade(createGradeDto: CreateGradeDto) {
    const isExistedGrade = await this.gradeModel.findOne({
      name: createGradeDto.name,
      school: createGradeDto.school,
    });
    if (isExistedGrade) throwBadRequest(GRADE_EXISTED);

    const newGrade = await this.gradeModel.create({
      ...createGradeDto,
    });

    await newGrade.save();
    return newGrade;
  }

  async findAllWithPaging(
    user,
    paginationRequestFullDto: PaginationRequestFullDto,
  ): Promise<PaginationDto<Grade>> {
    const filter = {
      school: user.school,
      ...(paginationRequestFullDto.keyword && {
        name: {
          $regex: `.*${paginationRequestFullDto.keyword}.*`,
          $options: 'i',
        },
      }),
    };

    const total = await this.gradeModel.countDocuments(filter);

    const grades = await this.gradeModel
      .find(filter)
      .select('-deleted -createdAt -updatedAt')
      .sort({ name: 1 })
      .skip(paginationRequestFullDto.offset)
      .limit(paginationRequestFullDto.limit);

    return {
      total,
      results: grades,
    };
  }

  async findAll(school) {
    const grades = await this.gradeModel
      .find({ school })
      .select('-deleted -createdAt -updatedAt');

    return grades;
  }

  async findGradeById(user, id: string) {
    const grade = await this.gradeModel.findOne({
      _id: id,
      school: user.school,
    });

    if (!grade) {
      throwNotFound(GRADE_NOT_EXISTED);
    }

    return grade;
  }

  async update(user, updateGradeDto: UpdateGradeDto, gradeId) {
    const grade = await this.gradeModel.findOne({
      _id: gradeId,
    });

    if (!grade) {
      throwNotFound(USER_NOT_EXIST);
    }

    for (const key in updateGradeDto) {
      grade[key] = updateGradeDto[key];
    }

    await grade.save();

    return grade;
  }
}
