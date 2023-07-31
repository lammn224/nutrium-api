import { OverrideMethods } from '@/constants/override-method.constant';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import mongoose, { ObjectId } from 'mongoose';
import * as MongooseDelete from 'mongoose-delete';
import { School } from '@/modules/schools/schools.schema';

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

  @IsString()
  @ApiProperty({ type: String })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: School.name,
    default: null,
  })
  school: string | School;

  @IsNotEmpty()
  @IsString()
  // @Type(() => Number)
  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  power: string;

  @IsNotEmpty()
  @IsString()
  // @Type(() => Number)
  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  protein: string;

  @IsNotEmpty()
  @IsString()
  // @Type(() => Number)
  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  lipid: string;

  @IsNotEmpty()
  @IsString()
  // @Type(() => Number)
  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  glucid: string;

  @IsNotEmpty()
  @IsString()
  // @Type(() => Number)
  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  ca: string;

  @IsNotEmpty()
  @IsString()
  // @Type(() => Number)
  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  fe: string;

  @IsNotEmpty()
  @IsString()
  // @Type(() => Number)
  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  fiber: string;

  @IsNotEmpty()
  @IsString()
  // @Type(() => Number)
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
