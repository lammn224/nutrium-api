import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ObjectId } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import {
  SchoolUser,
  SchoolUserSchema,
} from '@/modules/school-users/school-user.schema';
import { School } from '@/modules/schools/schools.schema';
import * as MongooseDelete from 'mongoose-delete';
import { OverrideMethods } from '@/constants/override-method.constant';

export type ClassesDocument = Classes & Document;
@Schema({
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    currentTime: () => Date.now(),
  },
})
export class Classes {
  @ApiProperty({ type: String, required: true })
  _id: string | ObjectId;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true, unique: true, index: true })
  name: string;

  @IsArray()
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: School.name })
  members: SchoolUser[];

  @IsString()
  @ApiProperty({ type: String })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: School.name })
  school: string | School;

  @Prop({ type: Number })
  createdAt: number;

  @Prop({ type: Number })
  updatedAt: number;

  @Prop({ type: Number })
  deletedAt?: number;
}

export const ClassesSchema = SchemaFactory.createForClass(Classes);

SchoolUserSchema.plugin(MongooseDelete, {
  deletedAt: { type: Number },
  deleted: true,
  overrideMethods: OverrideMethods,
});

ClassesSchema.set('toJSON', {
  transform: function (doc, ret, opt) {
    delete ret['__v'];
    return ret;
  },
});

ClassesSchema.set('toObject', {
  transform: function (doc, ret, opt) {
    delete ret['__v'];
    return ret;
  },
});
