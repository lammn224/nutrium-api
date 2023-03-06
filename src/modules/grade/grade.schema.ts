import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { Document, ObjectId } from 'mongoose';
import { IsNotEmpty, IsString } from 'class-validator';
import { School } from '@/modules/schools/schools.schema';
import * as MongooseDelete from 'mongoose-delete';
import { OverrideMethods } from '@/constants/override-method.constant';

export type GradeDocument = Grade & Document;

@Schema({
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    currentTime: () => Date.now(),
  },
})
export class Grade {
  @ApiProperty({ type: String, required: true })
  _id: string | ObjectId;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true, index: true })
  name: string;

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

export const GradeSchema = SchemaFactory.createForClass(Grade);

GradeSchema.plugin(MongooseDelete, {
  deletedAt: { type: Number },
  deleted: true,
  overrideMethods: OverrideMethods,
});

GradeSchema.set('toJSON', {
  transform: function (doc, ret, opt) {
    delete ret['__v'];
    return ret;
  },
});

GradeSchema.set('toObject', {
  transform: function (doc, ret, opt) {
    delete ret['__v'];
    return ret;
  },
});
