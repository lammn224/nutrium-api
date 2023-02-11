import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
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
import { IdRequestDto } from '@/dtos/id-request.dto';
import { UpdateMealDto } from '@/modules/meals/dto/update-meal.dto';

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

  @Roles(Role.Admin, Role.Parents)
  @AuthApiError()
  @ApiOperation({ summary: 'Update one meal' })
  @ApiOkResponse({ type: Meals })
  @Patch(':id')
  async updateMeal(
    @Param() idRequestDto: IdRequestDto,
    @Body() updateMealDto: UpdateMealDto,
    @Req() req,
  ): Promise<Meals> {
    return await this.mealsService.updateMeal(
      idRequestDto.id,
      updateMealDto,
      req.user,
    );
  }

  @Roles(Role.Admin, Role.Parents, Role.Student)
  @AuthApiError()
  @ApiOperation({ summary: 'Get all meals' })
  @ApiOkResponse({ type: [Meals] })
  @Get('all')
  async findAll(@Req() req): Promise<Meals[]> {
    return await this.mealsService.findAll(req.user);
  }
}
