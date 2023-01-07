import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { FoodsService } from './foods.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { Roles } from '@/decorators/roles.decorator';
import { Role } from '@/enums/role.enum';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthApiError } from '@/decorators/api-error-response.decorator';
import { Food } from './food.schema';

@ApiTags('Foods')
@ApiBearerAuth()
@Controller('foods')
export class FoodsController {
  constructor(private readonly foodsService: FoodsService) {}

  @Roles(Role.Admin)
  @AuthApiError()
  @ApiOperation({ summary: 'Create new food' })
  @ApiCreatedResponse({ type: Food })
  @Post()
  async create(@Body() createFoodDto: CreateFoodDto) {
    return await this.foodsService.create(createFoodDto);
  }

  // filter with query
  @Roles(Role.Admin)
  @AuthApiError()
  @ApiOperation({ summary: 'Get all foods' })
  @ApiOkResponse({ type: Food })
  @Get()
  async findAll() {
    return await this.foodsService.findAll();
  }

  @Roles(Role.Admin)
  @AuthApiError()
  @ApiOperation({ summary: 'Get one food' })
  @ApiOkResponse({ type: Food })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.foodsService.findOne(id);
  }
}
