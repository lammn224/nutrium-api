import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
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
import {
  PaginationDto,
  PaginationResponse,
} from '@/dtos/pagination-response.dto';
import { PaginationRequestFullDto } from '@/dtos/pagination-request.dto';
import { UpdateFoodDto } from '@/modules/foods/dto/update-food.dto';

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
  @Roles(Role.Admin, Role.Parents, Role.Student)
  @AuthApiError()
  @ApiOperation({ summary: 'Get all foods' })
  @PaginationResponse(Food)
  @ApiOkResponse({ type: Food })
  @Get()
  async findAll(
    @Query() queries: PaginationRequestFullDto,
  ): Promise<PaginationDto<Food>> {
    return await this.foodsService.findAll(queries);
  }

  @Roles(Role.Admin)
  @AuthApiError()
  @ApiOperation({ summary: 'Get one food' })
  @ApiOkResponse({ type: Food })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.foodsService.findOne(id);
  }

  @Roles(Role.Admin)
  @AuthApiError()
  @ApiOperation({ summary: 'Update one food' })
  @ApiOkResponse({ type: Food })
  @Patch(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() updateFoodDto: UpdateFoodDto,
  ) {
    return await this.foodsService.update(id, updateFoodDto);
  }

  @Roles(Role.Admin)
  @AuthApiError()
  @ApiOperation({ summary: 'Delete one food' })
  @ApiOkResponse({ type: Food })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.foodsService.delete(id);
  }
}
