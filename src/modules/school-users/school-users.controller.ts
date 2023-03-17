import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { SchoolUsersService } from './school-users.service';
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
import { AuthApiError } from '@/decorators/api-error-response.decorator';
import { UpdateUserInfoDto } from '@/modules/school-users/dto/update-user-info-dto';
import { SchoolUser } from '@/modules/school-users/school-user.schema';
import { Roles } from '@/decorators/roles.decorator';
import { Role } from '@/enums/role.enum';
import { PaginationRequestFullDto } from '@/dtos/pagination-request.dto';
import { IdRequestDto } from '@/dtos/id-request.dto';
import { ResetPasswordDto } from '@/dtos/reset-password.dto';

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

  @Roles(Role.Admin)
  @AuthApiError()
  @ApiOperation({ summary: 'Find all parents with paging' })
  @PaginationResponse(SchoolUser)
  @Get()
  async findAllWithFilter(
    @Request() req,
    @Query() queries: PaginationRequestFullDto,
  ) {
    return await this.schoolUsersService.findAllWithFilter(req.user, queries);
  }

  @Roles(Role.Admin)
  @ApiNoContentResponse()
  @AuthApiError()
  @ApiOperation({ summary: 'Reset password' })
  @Post(':id/reset-password')
  async resetPasswordByAdmin(
    @Param() idRequestDto: IdRequestDto,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    await this.schoolUsersService.resetPasswordByAdmin(
      idRequestDto.id,
      resetPasswordDto,
    );
  }
}
