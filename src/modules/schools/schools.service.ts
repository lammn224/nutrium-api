import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegisterDto } from '../auth/dto/register.dto';
import { SchoolUsersService } from '../school-users/school-users.service';
import { School, SchoolDocument } from './schools.schema';

@Injectable()
export class SchoolsService {
  constructor(
    @InjectModel(School.name)
    private schoolModel: Model<SchoolDocument>,
    private readonly schoolUserService: SchoolUsersService,
  ) {}

  async createSchool(registerDto: RegisterDto) {
    const newSchool = await this.schoolModel.create({
      ...registerDto,
    });

    const owner = await this.schoolUserService.createSchoolOwner(
      newSchool._id.toString(),
      registerDto,
    );

    newSchool.createdBy = owner._id.toString();
    await newSchool.save();

    return {
      school: newSchool,
      owner,
    };
  }

  async checkExist(key: string, value: string): Promise<boolean> {
    const filter = {};
    filter[key] = value;

    const school = await this.schoolModel.findOne(filter);

    return !!school;
  }
}
