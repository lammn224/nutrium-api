import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
import { PaginationRequestFullDto } from '@/dtos/pagination-request.dto';
import { CreateSchoolDto } from '@/modules/schools/dto/create-school.dto';
import { IdRequestDto } from '@/dtos/id-request.dto';

@ApiTags('Schools')
@ApiBearerAuth()
@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}
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
  @ApiOperation({ summary: 'Get all schools' })
  @ApiResponse({ type: School })
  @Get('/all')
  async findAllSchool(): Promise<School[]> {
    return await this.schoolsService.findAllSchool();
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

  @Roles(Role.Sysadmin)
  @AuthApiError()
  @ApiOperation({ summary: 'Approve school by sysadmin' })
  @PaginationResponse(School)
  @ApiResponse({ type: School })
  @Post('/approve/:id')
  async approveBySysadmin(
    @Param() idRequestDto: IdRequestDto,
    @Req() req,
  ): Promise<School> {
    return await this.schoolsService.approveBySysadmin(
      req.user,
      idRequestDto.id,
    );
  }

  @Public()
  @PublicApiError()
  @ApiResponse({ type: School })
  @ApiOperation({ summary: 'Get school' })
  @Get(':code')
  async findSchoolByCode(@Param('code') code: string) {
    return await this.schoolsService.findSchoolByCode(code);
  }
}
