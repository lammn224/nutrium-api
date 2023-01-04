import { Controller, Get, Request } from '@nestjs/common';
import { SchoolUsersService } from './school-users.service';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationDto } from '@/dtos/pagination-response.dto';
import { AuthApiError } from '@/decorators/api-error-response.decorator';

@ApiExtraModels(PaginationDto)
@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
export class SchoolUsersController {
  constructor(private readonly schoolUsersService: SchoolUsersService) {}

  @AuthApiError()
  @ApiOperation({ summary: 'Fetch me' })
  @Get('me')
  async me(@Request() req) {
    return await this.schoolUsersService.me(req.user._id);
  }
}
