import { OverrideMethods } from '@/constants/override-method.constant';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';
import * as MongooseDelete from 'mongoose-delete';

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
  @Type(() => Number)
  @ApiProperty({ type: Number, required: true })
  @Prop({ type: Number, required: true })
  ca: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ type: Number, required: true })
  @Prop({ type: Number, required: true })
  fe: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ type: Number, required: true })
  @Prop({ type: Number, required: true })
  fiber: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ type: Number, required: true })
  @Prop({ type: Number, required: true })
  zn: number;

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
