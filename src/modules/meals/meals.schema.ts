import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ObjectId } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { MealType } from '@/enums/meal-type.enum';
import { Type } from 'class-transformer';
import { Food } from '@/modules/foods/food.schema';
import { dateToTimestamps } from '@/utils/dateToTimestamps.utils';
import { Student } from '@/modules/students/students.schema';
import { School } from '@/modules/schools/schools.schema';
import { SchoolUser } from '@/modules/school-users/school-user.schema';

export type MealsDocument = Meals & Document;

@Schema({
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    currentTime: () => Date.now(),
  },
})
export class Meals {
  @ApiProperty({ type: String, required: true })
  _id: string | ObjectId;

  @ApiProperty({ enum: MealType, default: MealType.Launch })
  @IsNotEmpty()
  @IsEnum(MealType)
  @Prop({
    required: true,
    enum: MealType,
    default: MealType.Launch,
  })
  type: MealType;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ type: Number, required: true })
  @Prop({ type: Number, required: true })
  power: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ type: Number, required: true })
  @Prop({ type: Number, required: true })
  protein: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ type: Number, required: true })
  @Prop({ type: Number, required: true })
  lipid: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ type: Number, required: true })
  @Prop({ type: Number, required: true })
  glucid: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ type: Number, required: true })
  @Prop({ type: Number, required: true })
  date: number;

  @IsNotEmpty()
  @IsArray()
  @ApiProperty({ type: [String] })
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: Food.name })
  foods: Food[];

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: School.name })
  school: string | School;

  @IsOptional()
  @ApiProperty({ type: String })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Student.name })
  student: string | Student;

  @IsOptional()
  @ApiProperty({ type: String })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: SchoolUser.name })
  createdBy: string | SchoolUser;

  @Prop({ type: Number })
  createdAt: number;

  @Prop({ type: Number })
  updatedAt: number;

  @Prop({ type: Number })
  deletedAt?: number;
}

export const MealsSchema = SchemaFactory.createForClass(Meals);

MealsSchema.pre('save', async function (next) {
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

MealsSchema.set('toJSON', {
  transform: function (doc, ret, opt) {
    delete ret['__v'];
    return ret;
  },
});

MealsSchema.set('toObject', {
  transform: function (doc, ret, opt) {
    delete ret['__v'];
    return ret;
  },
});
