import { Injectable } from '@nestjs/common';
import { throwBadRequest, throwNotFound } from '@/utils/exception.utils';
import {
  UPLOAD_FAILED,
  USER_NOT_EXIST,
  USER_NOT_EXIST_OR_DELETED,
  WRONG_USER_OR_PASSWORD,
} from '@/constants/error-codes.constant';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student, StudentDocument } from '@/modules/students/students.schema';
import { UserStatus } from '@/modules/school-users/enum/user-status.enum';
import * as bcrypt from 'bcrypt';
import { SchoolUsersService } from '@/modules/school-users/school-users.service';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name)
    private studentModel: Model<StudentDocument>,
    private readonly schoolUserService: SchoolUsersService,
  ) {}

  async me(userId) {
    const user = await this.studentModel.findOne({ _id: userId });

    return user;
  }

  async findById(id: string): Promise<Student> {
    const student = await this.studentModel.findById(id);

    if (!student) {
      throwNotFound(USER_NOT_EXIST);
    }

    return student;
  }

  async createStudent(studentObj, parentObj) {
    const isExistedStudent = await this.studentModel.findOne({
      studentId: studentObj.studentId,
    });
    if (isExistedStudent) throwBadRequest(UPLOAD_FAILED);

    const newStudent = await this.studentModel.create({
      ...studentObj,
    });

    parentObj.child = newStudent._id;
    const parents = await this.schoolUserService.createParents(parentObj);

    newStudent.parents = parents._id;
    await newStudent.save();
    return newStudent;
  }

  async attempt(studentId: string, password: string, school: string) {
    const student = await this.studentModel.findOne({
      studentId,
      school,
    });

    let result = {
      status: USER_NOT_EXIST_OR_DELETED,
      canReturnToken: false,
      student: null,
    };

    if (student) {
      const matchPassword = await this.comparePassword(
        password,
        student.password,
      );

      if (matchPassword) {
        if (student.status === UserStatus.active) {
          result = {
            canReturnToken: true,
            student,
            status: student.status,
          };
        } else {
          result = {
            canReturnToken: false,
            student,
            status: student.status,
          };
        }
      } else {
        result = {
          canReturnToken: false,
          student,
          status: WRONG_USER_OR_PASSWORD,
        };
      }
    }

    return result;
  }

  async comparePassword(plainPass: string, password: string): Promise<boolean> {
    return await bcrypt.compare(plainPass, password);
  }
}
