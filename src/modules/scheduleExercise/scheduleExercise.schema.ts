import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { Document, ObjectId } from 'mongoose';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { School } from '@/modules/schools/schools.schema';
import * as MongooseDelete from 'mongoose-delete';
import { OverrideMethods } from '@/constants/override-method.constant';
import { Type } from 'class-transformer';
import { Activity } from '@/modules/activities/activity.schema';
import { Student } from '@/modules/students/students.schema';

export type ScheduleExerciseDocument = ScheduleExercise & Document;

@Schema({
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    currentTime: () => Date.now(),
  },
})
export class ScheduleExercise {
  @ApiProperty({ type: String, required: true })
  _id: string | ObjectId;

  @IsNotEmpty()
  @ApiProperty({ type: String, required: true })
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: Activity.name,
  })
  activity: Activity | string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ type: Number, required: true })
  @Prop({ type: Number, required: true })
  timeDur: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ type: Number, required: true })
  @Prop({ type: Number, required: true })
  calo: number;

  @IsString()
  @ApiProperty({ type: String })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: School.name })
  school: string | School;

  @IsOptional()
  @ApiProperty({ type: String })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Student.name })
  student: string | Student;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ type: Number, required: true })
  @Prop({ type: Number, required: true })
  date: number;

  @Prop({ type: Number })
  createdAt: number;

  @Prop({ type: Number })
  updatedAt: number;

  @Prop({ type: Number })
  deletedAt?: number;
}

export const ScheduleExerciseSchema =
  SchemaFactory.createForClass(ScheduleExercise);

ScheduleExerciseSchema.plugin(MongooseDelete, {
  deletedAt: { type: Number },
  deleted: true,
  overrideMethods: OverrideMethods,
});

ScheduleExerciseSchema.set('toJSON', {
  transform: function (doc, ret, opt) {
    delete ret['__v'];
    return ret;
  },
});

ScheduleExerciseSchema.set('toObject', {
  transform: function (doc, ret, opt) {
    delete ret['__v'];
    return ret;
  },
});
