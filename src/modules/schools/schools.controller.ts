import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SchoolsService } from './schools.service';
import { Public } from '@/decorators/public.decorator';
import { PublicApiError } from '@/decorators/api-error-response.decorator';
import { School } from '@/modules/schools/schools.schema';

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
}
