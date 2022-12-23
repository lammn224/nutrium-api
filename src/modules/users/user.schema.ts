import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ObjectId } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserStatus } from './enum/user.enum';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserGender } from '@/modules/users/enum/user-gender.enum';
import * as mongoose_delete from 'mongoose-delete';
import { OverrideMethods } from '@/constants/override-method.constant';
import { Role } from '@/enums/role.enum';

export type UserDocument = User & Document;

@Schema({
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    currentTime: () => Date.now(),
  },
})
export class User {
  @ApiProperty({ type: String, required: true })
  _id: string | ObjectId;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true, unique: true, index: true })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, default: '' })
  fullName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  password: string;

  @ApiProperty({ enum: UserStatus, default: UserStatus.active })
  @IsEnum(UserStatus)
  @Prop({ required: true, enum: UserStatus, default: UserStatus.active })
  status: UserStatus;

  @ApiProperty({ enum: Role, default: Role.Parents })
  @IsNotEmpty()
  @IsEnum(Role)
  @Prop({
    required: true,
    enum: Role,
    default: Role.Parents,
  })
  role: Role;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ type: Number, required: false })
  @Prop({ type: Number })
  dateOfBirth: number;

  @ApiProperty({ enum: UserGender, default: UserGender.male })
  @IsEnum(UserGender)
  @Prop({ enum: UserGender, default: UserGender.male })
  gender: UserGender;

  @IsString()
  @ApiProperty({ type: String })
  @Prop({ type: String, default: '' })
  avatar: string;

  @Prop({ type: Number })
  createdAt: number;

  @Prop({ type: Number })
  updatedAt: number;

  @Prop({ type: Number })
  deletedAt?: number;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.plugin(mongoose_delete, {
  deletedAt: { type: Number },
  deleted: true,
  overrideMethods: OverrideMethods,
});

UserSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;

  if (this.isModified('email') || this.isNew) {
    // @ts-ignore
    user.email = user.email.toLowerCase();
  }

  if (this.isModified('password') || this.isNew) {
    const salt = await bcrypt.genSalt(10);

    // @ts-ignore
    user.password = await bcrypt.hash(user.password, salt);
  }

  return next();
});

UserSchema.set('toJSON', {
  transform: function (doc, ret, opt) {
    delete ret['password'];
    delete ret['__v'];
    return ret;
  },
});
