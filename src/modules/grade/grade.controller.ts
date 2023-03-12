import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Req,
  Request,
} from '@nestjs/common';
import { GradeService } from './grade.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { Roles } from '@/decorators/roles.decorator';
import { Role } from '@/enums/role.enum';
import { AuthApiError } from '@/decorators/api-error-response.decorator';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  PaginationDto,
  PaginationResponse,
} from '@/dtos/pagination-response.dto';
import { PaginationRequestFullDto } from '@/dtos/pagination-request.dto';
import { Grade } from '@/modules/grade/grade.schema';
import { IdRequestDto } from '@/dtos/id-request.dto';

@ApiExtraModels(PaginationDto)
@ApiBearerAuth()
@ApiTags('Grade')
@Controller('grade')
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Roles(Role.Admin)
  @AuthApiError()
  @ApiOperation({ summary: 'Create one grade' })
  @ApiResponse({ type: Grade })
  @Post()
  create(@Body() createGradeDto: CreateGradeDto) {
    return this.gradeService.createGrade(createGradeDto);
  }

  @Roles(Role.Admin)
  @AuthApiError()
  @ApiOperation({ summary: 'Get all grades' })
  @PaginationResponse(Grade)
  @Get()
  async findAll(
    @Query() queries: PaginationRequestFullDto,
    @Req() req,
  ): Promise<PaginationDto<Grade>> {
    return await this.gradeService.findAllWithPaging(req.user, queries);
  }

  @Roles(Role.Admin)
  @AuthApiError()
  @ApiOperation({ summary: 'Get one grade' })
  @ApiOkResponse({ type: Grade })
  @Get(':id')
  async findGradeById(
    @Param() idRequestDto: IdRequestDto,
    @Req() req,
  ): Promise<Grade> {
    return await this.gradeService.findGradeById(req.user, idRequestDto.id);
  }

  @Roles(Role.Admin)
  @AuthApiError()
  @ApiOperation({ summary: 'Update grade' })
  @ApiResponse({ type: Grade })
  @Patch(':id')
  async update(
    @Param() idRequestDto: IdRequestDto,
    @Request() req,
    @Body() updateGradeDto: UpdateGradeDto,
  ) {
    return await this.gradeService.update(
      req.user._id,
      updateGradeDto,
      idRequestDto.id,
    );
  }
}
