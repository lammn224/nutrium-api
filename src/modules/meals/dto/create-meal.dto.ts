import { ApiProperty, PickType } from '@nestjs/swagger';
import { Meals } from '@/modules/meals/meals.schema';
import { MealType } from '@/enums/meal-type.enum';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Prop } from '@nestjs/mongoose';

export class CreateMealDto extends PickType(Meals, [
  'type',
  'power',
  'protein',
  'lipid',
  'glucid',
  'date',
  'foods',
  'school',
  'student',
] as const) {
  @ApiProperty({ enum: MealType, default: MealType.Launch })
  @IsNotEmpty()
  @IsEnum(MealType)
  @Prop({
    required: true,
    enum: MealType,
    default: MealType.Launch,
  })
  type: MealType;
}
