import { OverrideMethods } from '@/constants/override-method.constant';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { ObjectId } from 'mongoose';
import * as MongooseDelete from 'mongoose-delete';
import { ValidateNumeralString } from '@/modules/foods/validation/validate-numeral-string';

export type FoodDocument = Food & Document;

@Schema({
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    currentTime: () => Date.now(),
  },
})
export class Food {
  @ApiProperty({ type: String, required: true })
  _id: string | ObjectId;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  name: string;

  @Validate(ValidateNumeralString)
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  power: string;

  @Validate(ValidateNumeralString)
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  protein: string;

  @Validate(ValidateNumeralString)
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  lipid: string;

  @Validate(ValidateNumeralString)
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  glucid: string;

  @Validate(ValidateNumeralString)
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  ca: string;

  @Validate(ValidateNumeralString)
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  fe: string;

  @Validate(ValidateNumeralString)
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  fiber: string;

  @Validate(ValidateNumeralString)
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  zn: string;

  @Prop({ type: Number })
  createdAt: number;

  @Prop({ type: Number })
  updatedAt: number;

  @Prop({ type: Number })
  deletedAt?: number;
}

export const FoodSchema = SchemaFactory.createForClass(Food);

FoodSchema.plugin(MongooseDelete, {
  deletedAt: { type: Number },
  deleted: true,
  overrideMethods: OverrideMethods,
});

FoodSchema.set('toJSON', {
  transform: function (doc, ret, opt) {
    delete ret['__v'];
    return ret;
  },
});

FoodSchema.set('toObject', {
  transform: function (doc, ret, opt) {
    delete ret['__v'];
    return ret;
  },
});
