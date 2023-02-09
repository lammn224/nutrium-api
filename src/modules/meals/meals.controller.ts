import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { MealsService } from './meals.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { Roles } from '@/decorators/roles.decorator';
import { Role } from '@/enums/role.enum';
import { AuthApiError } from '@/decorators/api-error-response.decorator';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Meals } from '@/modules/meals/meals.schema';
import {
  PaginationDto,
  PaginationResponse,
} from '@/dtos/pagination-response.dto';
import { Food } from '@/modules/foods/food.schema';

@ApiTags('Meals')
@ApiBearerAuth()
@Controller('meals')
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Roles(Role.Admin, Role.Parents)
  @AuthApiError()
  @ApiOperation({ summary: 'Create new meal' })
  @ApiCreatedResponse({ type: Meals })
  @Post()
  async create(@Body() createMealDto: CreateMealDto, @Req() req) {
    return await this.mealsService.create(createMealDto, req.user);
  }

  @Roles(Role.Admin, Role.Parents, Role.Student)
  @AuthApiError()
  @ApiOperation({ summary: 'Get all meals' })
  @ApiOkResponse({ type: [Meals] })
  @Get('all')
  async findAll(): Promise<Meals[]> {
    return await this.mealsService.findAll();
  }
}
