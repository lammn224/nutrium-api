import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Excel from 'exceljs';
import { SchoolUsersService } from '@/modules/school-users/school-users.service';
import { ClassesService } from '@/modules/classes/classes.service';
import { StudentsService } from '@/modules/students/students.service';
import { UserStatus } from '@/modules/school-users/enum/user-status.enum';
import { Role } from '@/enums/role.enum';
import { UserGender } from '@/modules/school-users/enum/user-gender.enum';
import { InjectConnection } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import * as moment from 'moment';

@Injectable()
export class FilesService {
  constructor(
    private readonly configService: ConfigService,
    private readonly schoolUserService: SchoolUsersService,
    private readonly studentService: StudentsService,
    private readonly classesService: ClassesService,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async readExcelFile(filename: string, grade: string, filePath: string, user) {
    const workbook = await new Excel.Workbook().xlsx.readFile(filePath);
    const worksheets = workbook.worksheets;
    const formatStr = 'DD/MM/YYYY';

    for (const sheet of worksheets) {
      const session = await this.connection.startSession();
      session.startTransaction();
      try {
        const members = [];
        const actualRows = sheet.actualRowCount - 4;
        const rows = sheet.getRows(7, actualRows);

        const newClass = await this.classesService.createNewClass(
          sheet.name,
          user.school.toString(),
          grade,
          session,
        );

        for (const row of rows) {
          const parentObj = {
            fullName: row.values[6],
            phoneNumber: row.values[7],
            school: user.school,
            role: Role.Parents,
            status: UserStatus.active,
            password: row.values[7],
          };

          const studentObj = {
            studentId: row.values[2].toString(),
            fullName: row.values[3],
            gender:
              row.values[4].toLowerCase() == 'nam'
                ? UserGender.male
                : UserGender.female,
            // dateOfBirth: await dateToTimestamps(row.values[5].toString()),
            dateOfBirth: moment(row.values[5].toString(), formatStr)
              .startOf('day')
              .unix(),
            status: UserStatus.active,
            school: user.school,
            role: Role.Student,
            password: row.values[2].toString(),
            class: newClass._id,
          };

          const newStudent = await this.studentService.createStudent(
            studentObj,
            parentObj,
            user.school.toString(),
            session,
          );

          members.push(newStudent._id);
          await this.classesService.addMember(
            sheet.name,
            user.school.toString(),
            members,
            session,
          );
        }
        await session.commitTransaction();
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        await session.endSession();
      }
    }
  }
}
