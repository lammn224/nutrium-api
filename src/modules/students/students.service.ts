import { Injectable, NotFoundException } from '@nestjs/common';
import { throwBadRequest, throwNotFound } from '@/utils/exception.utils';
import {
  STUDENT_ID_ALREADY_EXISTED,
  UPLOAD_FAILED,
  USER_NOT_EXIST,
  USER_NOT_EXIST_OR_DELETED,
  WRONG_USER_OR_PASSWORD,
} from '@/constants/error-codes.constant';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Student, StudentDocument } from '@/modules/students/students.schema';
import { UserStatus } from '@/modules/school-users/enum/user-status.enum';
import * as bcrypt from 'bcrypt';
import { SchoolUsersService } from '@/modules/school-users/school-users.service';
import { UpdateStudentInfoDto } from '@/modules/students/dto/update-student-info-dto';
import { UserGender } from '@/modules/school-users/enum/user-gender.enum';
import { GradeService } from '@/modules/grade/grade.service';
import { ClassesService } from '@/modules/classes/classes.service';
import { PaginationRequestFullDto } from '@/dtos/pagination-request.dto';
import { PaginationDto } from '@/dtos/pagination-response.dto';
import { SortType } from '@/enums/sort.enum';
import { ResetPasswordDto } from '@/dtos/reset-password.dto';
import { CreateStudentDto } from '@/modules/students/dto/create-student.dto';
import { Role } from '@/enums/role.enum';
import { School } from '@/modules/schools/schools.schema';
import { activityIdx } from '@/constants/activity-index.constant';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name)
    private studentModel: Model<StudentDocument>,
    private readonly schoolUserService: SchoolUsersService,
    private readonly gradeService: GradeService,
    private readonly classesService: ClassesService,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async me(userId) {
    const user = await this.studentModel
      .findOne({ _id: userId })
      .populate({
        path: 'parents',
        populate: 'child',
      })
      .populate({
        path: 'school',
      })
      .populate({
        path: 'class',
      });

    return user;
  }

  async findById(id: string): Promise<Student> {
    const student = await this.studentModel.findById(id);

    if (!student) {
      throwNotFound(USER_NOT_EXIST);
    }

    return student;
  }

  async getDetailsStudentById(id: string): Promise<Student> {
    const student = await this.studentModel
      .findById(id)
      .populate({
        path: 'parents',
      })
      .populate({
        path: 'school',
      })
      .populate({
        path: 'class',
      });

    if (!student) {
      throwNotFound(USER_NOT_EXIST);
    }

    return student;
  }

  async createStudent(
    studentObj,
    parentObj,
    school,
    session: mongoose.ClientSession | null = null,
  ) {
    const isExistedStudent = await this.studentModel.findOne({
      studentId: studentObj.studentId,
      school,
    });
    if (isExistedStudent) throwBadRequest(UPLOAD_FAILED);

    const [newStudent] = await this.studentModel.create([studentObj], {
      session,
    });

    parentObj.child = [newStudent._id];
    const parents = await this.schoolUserService.createParents(
      school,
      parentObj,
      newStudent._id,
      session,
    );

    newStudent.parents = parents._id;
    await newStudent.save({ session });

    return newStudent;
  }

  async createOneByAdmin(user, createStudentDto: CreateStudentDto) {
    const isExistedStudent = await this.studentModel.findOne({
      studentId: createStudentDto.studentId,
      school: user.school,
    });

    if (isExistedStudent) {
      throwBadRequest(STUDENT_ID_ALREADY_EXISTED);
    }

    const session = await this.connection.startSession();

    session.startTransaction();
    try {
      const [newStudent] = await this.studentModel.create(
        [
          {
            studentId: createStudentDto.studentId,
            fullName: createStudentDto.fullName,
            gender: createStudentDto.gender,
            dateOfBirth: createStudentDto.dateOfBirth,
            password: createStudentDto.studentId,
            class: createStudentDto.class,
            school: user.school,
            status: UserStatus.active,
            role: Role.Student,
          },
        ],
        { session },
      );

      const parentObj = {
        fullName: createStudentDto.parentsFullName,
        phoneNumber: createStudentDto.parentsPhoneNumber,
        password: createStudentDto.parentsPhoneNumber,
        school: user.school,
        child: [newStudent._id],
        status: UserStatus.active,
        role: Role.Parents,
      };

      const parents = await this.schoolUserService.createParentsByAdmin(
        user.school,
        parentObj,
        newStudent._id,
        createStudentDto.isExistedParentAcc,
      );

      newStudent.parents = parents._id;
      await newStudent.save();

      await this.classesService.addMemberToClass(
        user,
        newStudent._id,
        createStudentDto.class,
      );

      await session.commitTransaction();

      // return newStudent;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
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

  async findAllWithFilter(
    user,
    paginationRequestFullDto: PaginationRequestFullDto,
  ): Promise<PaginationDto<Student>> {
    const filter = {
      school: user.school,
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

    const total = await this.studentModel.countDocuments(filter);

    const students = await this.studentModel
      .find(filter)
      .populate('class')
      .select('-deleted -createdAt -updatedAt')
      .sort(sortObj)
      .skip(paginationRequestFullDto.offset)
      .limit(paginationRequestFullDto.limit);

    return {
      total,
      results: students,
    };
  }

  async findAll(school: string | School): Promise<Student[]> {
    const filter = {
      school: school,
    };

    const students = await this.studentModel
      .find(filter)
      .select('-deleted -createdAt -updatedAt');

    return students;
  }

  async findAllWithFilterBySysadmin(
    user,
    paginationRequestFullDto: PaginationRequestFullDto,
    schoolId: string,
  ): Promise<PaginationDto<Student>> {
    const filter = {
      school: schoolId,
      ...(paginationRequestFullDto.keyword && {
        $or: [
          {
            fullName: {
              $regex: `.*${paginationRequestFullDto.keyword}.*`,
              $options: 'i',
            },
          },
          {
            studentId: {
              $regex: `.*${paginationRequestFullDto.keyword}.*`,
              $options: 'i',
            },
          },
        ],
      }),
    };

    // const sortObj = {};
    // sortObj[paginationRequestFullDto.sortBy] =
    //   paginationRequestFullDto.sortType === SortType.asc ? 1 : -1;

    const total = await this.studentModel.countDocuments(filter);

    const students = await this.studentModel
      .find(filter)
      .populate({ path: 'school' })
      .populate({ path: 'class' })
      .select('-deleted -createdAt -updatedAt')
      // .sort(sortObj)
      .skip(paginationRequestFullDto.offset)
      .limit(paginationRequestFullDto.limit);

    return {
      total,
      results: students,
    };
  }

  async resetPasswordByAdmin(_id: string, resetPasswordDto: ResetPasswordDto) {
    const student = await this.studentModel.findOne({ _id });

    if (!student) {
      throw new NotFoundException(USER_NOT_EXIST);
    }

    student.password = resetPasswordDto.newPassword;
    await student.save();
  }

  async updateInfo(studentId, updateStudentInfoDto: UpdateStudentInfoDto) {
    const student = await this.studentModel.findOne({
      _id: studentId,
    });

    if (!student) {
      throwNotFound(USER_NOT_EXIST);
    }

    for (const key in updateStudentInfoDto) {
      if (key === 'rcmCalories') {
        student['maxBreakfastCalories'] =
          Math.round((updateStudentInfoDto.rcmCalories * 0.4 + 1.5) * 100) /
          100;
        student['maxDinnerCalories'] =
          Math.round((updateStudentInfoDto.rcmCalories * 0.25 + 1.5) * 100) /
          100;
        //  rcmMildGainWeight, rcmMildLossWeight...
        student['rcmMildWeightGainCalories'] = Number(
          (updateStudentInfoDto.rcmCalories * 1.12).toFixed(2),
        ); // (gain 0.25kg/week)
        student['rcmWeightGainCalories'] = Number(
          (updateStudentInfoDto.rcmCalories * 1.23).toFixed(2),
        ); // (gain 0.50kg/week)
        student['rcmFastWeightGainCalories'] = Number(
          (updateStudentInfoDto.rcmCalories * 1.47).toFixed(2),
        ); // (gain 1.00kg/week)
        student['rcmMildWeightLossCalories'] = Number(
          (updateStudentInfoDto.rcmCalories * 0.88).toFixed(2),
        ); // (loss 0.25kg/week)
        student['rcmWeightLossCalories'] = Number(
          (updateStudentInfoDto.rcmCalories * 0.77).toFixed(2),
        ); // (loss 0.50kg/week)
      }
      student[key] = updateStudentInfoDto[key];
    }

    await student.save();

    return student;
  }

  async calcOverallWeightAndHeightByGrade(user) {
    const res = [];
    //get all grades
    const grades = await this.gradeService.findAll(user.school);

    //get all class each grades
    for (let i = 0; i < grades.length; i++) {
      const classObj = await this.classesService.findAllClassesByGrade(
        grades[i]._id,
      );
      let sumWeight = 0;
      let sumHeight = 0;
      let totalMembers = 0;
      for (let j = 0; j < classObj.length; j++) {
        classObj[j].members.forEach((student) => {
          // @ts-ignore
          sumWeight += student.weight;
          // @ts-ignore
          sumHeight += student.height;
        });
        totalMembers += classObj[j].members.length;
      }

      res.push({
        grade: grades[i].name,
        avgWeight: sumWeight / totalMembers ? sumWeight / totalMembers : 0,
        avgHeight: sumHeight / totalMembers ? sumHeight / totalMembers : 0,
      });
    }

    return res;
  }

  async calcOverallWeightAndHeightByClass(user, gradeId) {
    const res = [];
    if (gradeId === 'undefined') {
      return res;
    }
    const grade = await this.gradeService.findGradeById(user, gradeId);

    const classObj = await this.classesService.findAllClassesByGrade(grade._id);

    for (let i = 0; i < classObj.length; i++) {
      let sumWeight = 0;
      let sumHeight = 0;
      const totalMembers = classObj[i].members.length;
      classObj[i].members.forEach((student) => {
        // @ts-ignore
        sumWeight += student.weight;
        // @ts-ignore
        sumHeight += student.height;
      });

      res.push({
        class: classObj[i].name,
        avgWeight: sumWeight / totalMembers ? sumWeight / totalMembers : 0,
        avgHeight: sumHeight / totalMembers ? sumHeight / totalMembers : 0,
      });
    }

    return res;
  }
  generateRandom(min = 0, max = 100) {
    // find diff
    const difference = max - min;

    // generate random number
    let rand = Math.random();

    // multiply with difference
    rand = Math.floor(rand * difference);

    // add with min value
    rand = rand + min;

    return rand;
  }

  async randomData() {
    const activityTypeArray = ['none', 'light', 'moderate', 'heavy'];
    const students = await this.studentModel.find({}).populate({
      path: 'class',
    });

    students.forEach((student) => {
      if (student.gender === UserGender.male) {
        student.activityType =
          activityTypeArray[
            Math.floor(Math.random() * activityTypeArray.length)
          ];

        // 170 - 185
        // 58 - 75

        if (
          // @ts-ignore
          student.class.name.startsWith('6') ||
          // @ts-ignore
          student.class.name.startsWith('7')
        ) {
          student.height = this.generateRandom(170, 175);
          student.weight = this.generateRandom(58, 65);
        } else if (
          // @ts-ignore
          student.class.name.startsWith('8')
        ) {
          student.height = this.generateRandom(176, 180);
          student.weight = this.generateRandom(66, 70);
        } else {
          student.height = this.generateRandom(181, 185);
          student.weight = this.generateRandom(71, 75);
        }

        student.bmi =
          Math.round(
            ((student.weight * 10000) / (student.height * student.height)) * 10,
          ) / 10;

        student.rcmCalories = Math.floor(
          (66.47 +
            13.75 * student.weight +
            5.003 * student.height -
            6.755 *
              (new Date().getFullYear() -
                new Date(student.dateOfBirth * 1000).getFullYear())) *
            activityIdx.get(student.activityType),
        );
      } else {
        student.activityType =
          activityTypeArray[
            Math.floor(Math.random() * activityTypeArray.length)
          ];

        // 155 - 165
        // 42 - 55

        if (
          // @ts-ignore
          student.class.name.startsWith('6') ||
          // @ts-ignore
          student.class.name.startsWith('7')
        ) {
          student.height = this.generateRandom(155, 158);
          student.weight = this.generateRandom(42, 45);
        } else if (
          // @ts-ignore
          student.class.name.startsWith('8')
        ) {
          student.height = this.generateRandom(159, 162);
          student.weight = this.generateRandom(46, 50);
        } else {
          student.height = this.generateRandom(163, 165);
          student.weight = this.generateRandom(51, 55);
        }

        student.bmi =
          Math.round(
            ((student.weight * 10000) / (student.height * student.height)) * 10,
          ) / 10;

        student.rcmCalories = Math.floor(
          (655.1 +
            9.563 * student.weight +
            1.85 * student.height -
            4.676 *
              (new Date().getFullYear() -
                new Date(student.dateOfBirth * 1000).getFullYear())) *
            activityIdx.get(student.activityType),
        );
      }

      student['maxBreakfastCalories'] =
        Math.round((student.rcmCalories * 0.4 + 1.5) * 100) / 100;
      student['maxDinnerCalories'] =
        Math.round((student.rcmCalories * 0.25 + 1.5) * 100) / 100;
      student['rcmMildWeightGainCalories'] = Number(
        (student.rcmCalories * 1.12).toFixed(2),
      ); // (gain 0.25kg/week)
      student['rcmWeightGainCalories'] = Number(
        (student.rcmCalories * 1.23).toFixed(2),
      ); // (gain 0.50kg/week)
      student['rcmFastWeightGainCalories'] = Number(
        (student.rcmCalories * 1.47).toFixed(2),
      ); // (gain 1.00kg/week)
      student['rcmMildWeightLossCalories'] = Number(
        (student.rcmCalories * 0.88).toFixed(2),
      ); // (loss 0.25kg/week)
      student['rcmWeightLossCalories'] = Number(
        (student.rcmCalories * 0.77).toFixed(2),
      ); // (loss 0.50kg/week)

      student.save();
    });

    return 'oke';
  }
}
