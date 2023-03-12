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
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationDto } from '@/dtos/pagination-response.dto';
import { UpdateStudentInfoDto } from '@/modules/students/dto/update-student-info-dto';
import { Student } from '@/modules/students/students.schema';
import { IdRequestDto } from '@/dtos/id-request.dto';
import { Public } from '@/decorators/public.decorator';
import { Roles } from '@/decorators/roles.decorator';
import { Role } from '@/enums/role.enum';
import { MealPerStudentDto } from '@/modules/meals/dto/meal-per-student.dto';
import { SelectedGradeDto } from '@/modules/grade/dto/selected-grade.dto';

@ApiExtraModels(PaginationDto)
@ApiBearerAuth()
@ApiTags('Students')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

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
