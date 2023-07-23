import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { AuthApiError } from '@/decorators/api-error-response.decorator';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiNoContentResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  PaginationDto,
  PaginationResponse,
} from '@/dtos/pagination-response.dto';
import { UpdateStudentInfoDto } from '@/modules/students/dto/update-student-info-dto';
import { Student } from '@/modules/students/students.schema';
import { IdRequestDto } from '@/dtos/id-request.dto';
import { Public } from '@/decorators/public.decorator';
import { Roles } from '@/decorators/roles.decorator';
import { Role } from '@/enums/role.enum';
import { SelectedGradeDto } from '@/modules/grade/dto/selected-grade.dto';
import { PaginationRequestFullDto } from '@/dtos/pagination-request.dto';
import { ResetPasswordDto } from '@/dtos/reset-password.dto';
import { CreateStudentDto } from '@/modules/students/dto/create-student.dto';

@ApiExtraModels(PaginationDto)
@ApiBearerAuth()
@ApiTags('Students')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @AuthApiError()
  @ApiOperation({ summary: 'Create one student' })
  @ApiResponse({ type: Student })
  @Post()
  async createOneByAdmin(
    @Request() req,
    @Body() createStudentDto: CreateStudentDto,
  ) {
    return await this.studentsService.createOneByAdmin(
      req.user,
      createStudentDto,
    );
  }

  @AuthApiError()
  @ApiOperation({ summary: 'Fetch me' })
  @Get('me')
  async me(@Request() req) {
    return await this.studentsService.me(req.user._id);
  }

  @AuthApiError()
  @ApiOperation({ summary: 'Update info' })
  @ApiResponse({ type: Student })
  @Post('update-info')
  async updateInfo(
    @Request() req,
    @Body() updateStudentInfoDto: UpdateStudentInfoDto,
  ) {
    return await this.studentsService.updateInfo(
      req.user._id,
      updateStudentInfoDto,
    );
  }

  @Roles(Role.Admin)
  @AuthApiError()
  @ApiOperation({ summary: 'Find all student with paging' })
  @PaginationResponse(Student)
  @Get()
  async findAllWithFilter(
    @Request() req,
    @Query() queries: PaginationRequestFullDto,
  ) {
    return await this.studentsService.findAllWithFilter(req.user, queries);
  }

  @Roles(Role.Sysadmin)
  @AuthApiError()
  @ApiOperation({ summary: 'Find all student with paging by sysadmin' })
  @PaginationResponse(Student)
  @Get('account')
  async findAllWithFilterBySysadmin(
    @Request() req,
    @Query() queries: PaginationRequestFullDto,
    @Query('schoolId') schoolId: string,
  ) {
    return await this.studentsService.findAllWithFilterBySysadmin(
      req.user,
      queries,
      schoolId,
    );
  }

  @Roles(Role.Admin, Role.Sysadmin)
  @ApiNoContentResponse()
  @AuthApiError()
  @ApiOperation({ summary: 'Reset password' })
  @Post(':id/reset-password')
  async resetPasswordByAdmin(
    @Param() idRequestDto: IdRequestDto,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    await this.studentsService.resetPasswordByAdmin(
      idRequestDto.id,
      resetPasswordDto,
    );
  }

  @Public()
  @Get('random-data')
  async randomData() {
    return await this.studentsService.randomData();
  }

  @Roles(Role.Admin)
  @AuthApiError()
  @ApiOperation({ summary: 'Calculate students body index by grade' })
  @Get('student-idx-by-grade')
  async calcOverallWeightAndHeightByGrade(@Request() req) {
    return await this.studentsService.calcOverallWeightAndHeightByGrade(
      req.user,
    );
  }

  @Roles(Role.Admin)
  @AuthApiError()
  @ApiOperation({ summary: 'Calculate students body index by class' })
  @Get('student-idx-by-class')
  async calcOverallWeightAndHeightByClass(
    @Request() req,
    @Query() selectedGradeDto: SelectedGradeDto,
  ) {
    return await this.studentsService.calcOverallWeightAndHeightByClass(
      req.user,
      selectedGradeDto.grade,
    );
  }

  @AuthApiError()
  @ApiOperation({ summary: 'Get details student' })
  @ApiResponse({ type: Student })
  @Get(':id')
  async getDetailsStudentById(@Param() idRequestDto: IdRequestDto) {
    return await this.studentsService.getDetailsStudentById(idRequestDto.id);
  }
}
