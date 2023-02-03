import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { SchoolUsersService } from './school-users.service';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationDto } from '@/dtos/pagination-response.dto';
import { AuthApiError } from '@/decorators/api-error-response.decorator';
import { UpdateUserInfoDto } from '@/modules/school-users/dto/update-user-info-dto';
import { SchoolUser } from '@/modules/school-users/school-user.schema';

@ApiExtraModels(PaginationDto)
@ApiBearerAuth()
@ApiTags('School Users')
@Controller('school-users')
export class SchoolUsersController {
  constructor(private readonly schoolUsersService: SchoolUsersService) {}

  @AuthApiError()
  @ApiOperation({ summary: 'Fetch me' })
  @Get('me')
  async me(@Request() req) {
    return await this.schoolUsersService.me(req.user._id);
  }

  @AuthApiError()
  @ApiOperation({ summary: 'Update info' })
  @ApiResponse({ type: SchoolUser })
  @Post('update-info')
  async updateInfo(
    @Request() req,
    @Body() updateUserInfoDto: UpdateUserInfoDto,
  ) {
    return await this.schoolUsersService.updateInfo(
      req.user._id,
      updateUserInfoDto,
    );
  }
}
