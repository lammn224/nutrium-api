import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ObjectId } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { UserGender } from '@/modules/school-users/enum/user-gender.enum';
import * as MongooseDelete from 'mongoose-delete';
import { OverrideMethods } from '@/constants/override-method.constant';
import { Role } from '@/enums/role.enum';
import { School } from '@/modules/schools/schools.schema';
import { Classes } from '@/modules/classes/classes.schema';
import { UserStatus } from '@/modules/school-users/enum/user-status.enum';
import { SchoolUser } from '@/modules/school-users/school-user.schema';

export type StudentDocument = Student & Document;

@Schema({
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    currentTime: () => Date.now(),
  },
})
export class Student {
  @ApiProperty({ type: String, required: true })
  _id: string | ObjectId;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true, unique: true, index: true })
  studentId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  password: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  fullName: string;

  @ApiProperty({ enum: Role, default: Role.Parents })
  @IsNotEmpty()
  @IsEnum(Role)
  @Prop({
    required: true,
    enum: Role,
    default: Role.Parents,
  })
  role: Role;

  @IsNumber()
  @ApiProperty({ type: Number, required: true })
  @Prop({ type: Number, required: true })
  dateOfBirth: number;

  @ApiProperty({ enum: UserGender, default: UserGender.male })
  @IsEnum(UserGender)
  @Prop({ enum: UserGender, default: UserGender.male })
  gender: UserGender;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: SchoolUser.name })
  parents: string | SchoolUser;

  @IsEnum(UserStatus)
  @ApiProperty({ enum: UserStatus, default: UserStatus.active })
  @Prop({ enum: UserStatus, default: UserStatus.active })
  status: string;

  @IsString()
  @ApiProperty({ type: String })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: School.name })
  school: string | School;

  @IsString()
  @ApiProperty({ type: String })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Classes.name })
  class: string | Classes;

  @Prop({ type: Number })
  createdAt: number;

  @Prop({ type: Number })
  updatedAt: number;

  @Prop({ type: Number })
  deletedAt?: number;
}

export const StudentSchema = SchemaFactory.createForClass(Student);

StudentSchema.plugin(MongooseDelete, {
  deletedAt: { type: Number },
  deleted: true,
  overrideMethods: OverrideMethods,
});

StudentSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;

  if (this.isModified('password') || this.isNew) {
    const salt = await bcrypt.genSalt(10);

    // @ts-ignore
    user.password = await bcrypt.hash(user.password, salt);
  }

  return next();
});

StudentSchema.set('toJSON', {
  transform: function (doc, ret, opt) {
    delete ret['password'];
    delete ret['__v'];
    return ret;
  },
});
