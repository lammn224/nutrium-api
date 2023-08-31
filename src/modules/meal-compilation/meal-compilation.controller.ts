import { Controller } from '@nestjs/common';
import { MealCompilationService } from './meal-compilation.service';

@Controller('meal-compilation')
export class MealCompilationController {
  constructor(
    private readonly mealCompilationService: MealCompilationService,
  ) {}
}
