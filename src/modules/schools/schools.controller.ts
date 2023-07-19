import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SchoolsService } from './schools.service';
import { Public } from '@/decorators/public.decorator';
import {
  AuthApiError,
  PublicApiError,
} from '@/decorators/api-error-response.decorator';
import { School } from '@/modules/schools/schools.schema';
import { Roles } from '@/decorators/roles.decorator';
import { Role } from '@/enums/role.enum';
import {
  PaginationDto,
  PaginationResponse,
} from '@/dtos/pagination-response.dto';
import { Food } from '@/modules/foods/food.schema';
import { PaginationRequestFullDto } from '@/dtos/pagination-request.dto';
import { CreateSchoolDto } from '@/modules/schools/dto/create-school.dto';

@ApiTags('Schools')
@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Public()
  @PublicApiError()
  @ApiResponse({ type: School })
  @ApiOperation({ summary: 'Get school' })
  @Get(':code')
  async findSchoolByCode(@Param('code') code: string) {
    return await this.schoolsService.findSchoolByCode(code);
  }

  @Roles(Role.Sysadmin)
  @AuthApiError()
  @ApiOperation({ summary: 'Get all school with filter' })
  @PaginationResponse(School)
  @ApiResponse({ type: School })
  @Get('/')
  async findAllSchoolWithFilter(
    @Query() queries: PaginationRequestFullDto,
  ): Promise<PaginationDto<School>> {
    return await this.schoolsService.findAllSchoolWithFilter(queries);
  }

  @Roles(Role.Sysadmin)
  @AuthApiError()
  @ApiOperation({ summary: 'Create new school by sysadmin' })
  @PaginationResponse(School)
  @ApiResponse({ type: School })
  @Post('/')
  async createSchoolBySysadmin(
    @Body() createSchoolDto: CreateSchoolDto,
    @Req() req,
  ): Promise<School> {
    return await this.schoolsService.createSchoolBySysadmin(
      req.user,
      createSchoolDto,
    );
  }
}
