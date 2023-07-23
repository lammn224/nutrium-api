import { OverrideMethods } from '@/constants/override-method.constant';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import mongoose, { Document, ObjectId } from 'mongoose';
import * as MongooseDelete from 'mongoose-delete';
import { SchoolUser } from '../school-users/school-user.schema';
import { Status } from '@/enums/status.enum';

export type SchoolDocument = School & Document;

@Schema({
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    currentTime: () => Date.now(),
  },
})
export class School {
  @ApiProperty({ type: String, required: true })
  _id: string | ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'SchoolUser' })
  createdBy: string | SchoolUser;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'SchoolUser' })
  manager: string | SchoolUser;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true, unique: true, index: true })
  code: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty({ enum: Status, default: Status.Pending })
  @IsEnum(Status)
  @Prop({
    required: true,
    enum: Status,
    default: Status.Pending,
  })
  status: Status;

  @Prop({ type: Number })
  createdAt: number;

  @Prop({ type: Number })
  updatedAt: number;

  @Prop({ type: Number })
  deletedAt?: number;
}

export const SchoolSchema = SchemaFactory.createForClass(School);

SchoolSchema.plugin(MongooseDelete, {
  deletedAt: { type: Number },
  deleted: true,
  overrideMethods: OverrideMethods,
});

SchoolSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const school = this;

  // @ts-ignore
  school.name = school.name.trim();

  return next();
});

SchoolSchema.set('toJSON', {
  transform: function (doc, ret, opt) {
    delete ret['__v'];
    return ret;
  },
});

SchoolSchema.set('toObject', {
  transform: function (doc, ret, opt) {
    delete ret['__v'];
    return ret;
  },
});
