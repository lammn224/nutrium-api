import { PickType } from '@nestjs/swagger';
import { Food } from '../food.schema';

export class CreateFoodDto extends PickType(Food, [
  'name',
  'power',
  'protein',
  'lipid',
  'glucid',
]) {}
