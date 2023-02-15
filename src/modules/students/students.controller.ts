import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
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

  @AuthApiError()
  @ApiOperation({ summary: 'Get details student' })
  @ApiResponse({ type: Student })
  @Get(':id')
  async getDetailsStudentById(@Param() idRequestDto: IdRequestDto) {
    return await this.studentsService.getDetailsStudentById(idRequestDto.id);
  }
}
