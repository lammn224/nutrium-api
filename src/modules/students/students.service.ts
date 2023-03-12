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
import { UpdateStudentInfoDto } from '@/modules/students/dto/update-student-info-dto';
import { UserGender } from '@/modules/school-users/enum/user-gender.enum';
import { GradeService } from '@/modules/grade/grade.service';
import { ClassesService } from '@/modules/classes/classes.service';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name)
    private studentModel: Model<StudentDocument>,
    private readonly schoolUserService: SchoolUsersService,
    private readonly gradeService: GradeService,
    private readonly classesService: ClassesService,
  ) {}

  async me(userId) {
    const user = await this.studentModel
      .findOne({ _id: userId })
      .populate({
        path: 'parents',
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

  async createStudent(studentObj, parentObj, school) {
    const isExistedStudent = await this.studentModel.findOne({
      studentId: studentObj.studentId,
      school,
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
          Math.round((updateStudentInfoDto.rcmCalories * 0.45 + 1.5) * 100) /
          100;
        student['maxDinnerCalories'] =
          Math.round((updateStudentInfoDto.rcmCalories * 0.2 + 1.5) * 100) /
          100;
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
    const array = ['none', 'light', 'moderate', 'heavy'];
    const students = await this.studentModel.find({});

    students.forEach((student) => {
      if (student.gender === UserGender.male) {
        student.activityType = array[Math.floor(Math.random() * array.length)];
        student.height = this.generateRandom(170, 185);
        student.weight = this.generateRandom(58, 70);
        student.save();
      } else {
        student.activityType = array[Math.floor(Math.random() * array.length)];
        student.height = this.generateRandom(155, 165);
        student.weight = this.generateRandom(42, 55);
        student.save();
      }
    });

    return 'oke';
  }
}
