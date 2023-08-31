import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UPDATE_MEAL_COMPILATION } from '@/constants/events';
import { MealCompilationUpdateEvent } from '@/events/meal-compilation-update.event';
import { MealsService } from '@/modules/meals/meals.service';

@Injectable()
export class MealCompilationUpdateListener {
  constructor(private mealService: MealsService) {}

  @OnEvent(UPDATE_MEAL_COMPILATION, { async: true })
  async handleUpdateMealCompilationEvent(payload: MealCompilationUpdateEvent) {
    await this.mealService.updateCompilationEvents(payload);
  }
}
