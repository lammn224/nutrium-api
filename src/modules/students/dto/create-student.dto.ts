import { PickType } from '@nestjs/swagger';
import { Student } from '@/modules/students/students.schema';

export class CreateStudentDto extends PickType(Student, [
  'studentId',
  'fullName',
  'gender',
  'dateOfBirth',
  'role',
  'status',
  'school',
  'password',
  'parents',
  'class',
] as const) {}
