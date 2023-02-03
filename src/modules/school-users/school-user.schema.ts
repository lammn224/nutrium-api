import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ObjectId } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import * as MongooseDelete from 'mongoose-delete';
import { OverrideMethods } from '@/constants/override-method.constant';
import { Role } from '@/enums/role.enum';
import { UserStatus } from './enum/user-status.enum';
import { School } from '@/modules/schools/schools.schema';
import { Student } from '@/modules/students/students.schema';

export type SchoolUserDocument = SchoolUser & Document;

@Schema({
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    currentTime: () => Date.now(),
  },
})
export class SchoolUser {
  @ApiProperty({ type: String, required: true })
  _id: string | ObjectId;

  @IsString()
  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true, index: true })
  phoneNumber: string;

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
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Student' })
  child: string | Student;

  @Prop({ type: Number })
  createdAt: number;

  @Prop({ type: Number })
  updatedAt: number;

  @Prop({ type: Number })
  deletedAt?: number;
}

export const SchoolUserSchema = SchemaFactory.createForClass(SchoolUser);

SchoolUserSchema.plugin(MongooseDelete, {
  deletedAt: { type: Number },
  deleted: true,
  overrideMethods: OverrideMethods,
});

SchoolUserSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;

  if (this.isModified('password') || this.isNew) {
    const salt = await bcrypt.genSalt(10);

    // @ts-ignore
    user.password = await bcrypt.hash(user.password, salt);
  }

  return next();
});

SchoolUserSchema.set('toJSON', {
  transform: function (doc, ret, opt) {
    delete ret['password'];
    delete ret['__v'];
    return ret;
  },
});
