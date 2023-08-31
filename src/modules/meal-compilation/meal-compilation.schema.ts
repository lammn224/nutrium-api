import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ObjectId } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { dateToTimestamps } from '@/utils/dateToTimestamps.utils';
import { Student } from '@/modules/students/students.schema';
import { School } from '@/modules/schools/schools.schema';
import { Meals } from '@/modules/meals/meals.schema';

export type MealCompilationDocument = MealCompilation & Document;

@Schema({
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    currentTime: () => Date.now(),
  },
})
export class MealCompilation {
  @ApiProperty({ type: String, required: true })
  _id: string | ObjectId;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ type: Number, required: true })
  @Prop({ type: Number, required: true })
  date: number;

  @IsNotEmpty()
  @IsArray()
  @ApiProperty({ type: [String] })
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: Meals.name })
  meals: Meals[];

  // @IsNotEmpty()
  // @IsString()
  // @ApiProperty({ type: String, required: true })
  // @Prop({ type: String, required: true })
  // recommend: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  recommendStable: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  recommendMildWeightGain: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  recommendWeightGain: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  recommendFastWeightGain: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  recommendMildWeightLoss: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  recommendWeightLoss: string;

  @IsNotEmpty()
  @ApiProperty({ type: Number, required: true })
  @Prop({ type: Number, required: true })
  totalPower: number;

  @IsNotEmpty()
  @ApiProperty({ type: Number, required: true })
  @Prop({ type: Number, required: true })
  totalProtein: number;

  @IsNotEmpty()
  @ApiProperty({ type: Number, required: true })
  @Prop({ type: Number, required: true })
  totalLipid: number;

  @IsNotEmpty()
  @ApiProperty({ type: Number, required: true })
  @Prop({ type: Number, required: true })
  totalGlucid: number;

  @IsNotEmpty()
  @ApiProperty({ type: Number, required: true })
  @Prop({ type: Number, required: true })
  totalCa: number;

  @IsNotEmpty()
  @ApiProperty({ type: Number, required: true })
  @Prop({ type: Number, required: true })
  totalFe: number;

  @IsNotEmpty()
  @ApiProperty({ type: Number, required: true })
  @Prop({ type: Number, required: true })
  totalFiber: number;

  @IsNotEmpty()
  @ApiProperty({ type: Number, required: true })
  @Prop({ type: Number, required: true })
  totalZn: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: School.name })
  school: string | School;

  @IsOptional()
  @ApiProperty({ type: String })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Student.name })
  student: string | Student;

  @Prop({ type: Number })
  createdAt: number;

  @Prop({ type: Number })
  updatedAt: number;

  @Prop({ type: Number })
  deletedAt?: number;
}

export const MealCompilationSchema =
  SchemaFactory.createForClass(MealCompilation);

MealCompilationSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const meal = this;

  if (this.isModified('date') || this.isNew) {
    // @ts-ignore
    if (typeof meal.date === 'string') {
      // @ts-ignore
      meal.date = await dateToTimestamps(meal.date);
    }
  }

  return next();
});

MealCompilationSchema.set('toJSON', {
  transform: function (doc, ret, opt) {
    delete ret['__v'];
    return ret;
  },
});

MealCompilationSchema.set('toObject', {
  transform: function (doc, ret, opt) {
    delete ret['__v'];
    return ret;
  },
});
