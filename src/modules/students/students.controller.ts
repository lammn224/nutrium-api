import { Controller, Get, Request } from '@nestjs/common';
import { StudentsService } from './students.service';
import { AuthApiError } from '@/decorators/api-error-response.decorator';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationDto } from '@/dtos/pagination-response.dto';

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
}
