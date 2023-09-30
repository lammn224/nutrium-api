import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
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
import { IdRequestDto } from '@/dtos/id-request.dto';
import { Activity } from '@/modules/activities/activity.schema';
import { CreateActivityDto } from '@/modules/activities/dto/create-activity.dto';
import { UpdateActivityDto } from '@/modules/activities/dto/update-activity.dto';
import { ActivityService } from '@/modules/activities/activity.service';

@ApiExtraModels(PaginationDto)
@ApiBearerAuth()
@ApiTags('Activity')
@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Roles(Role.Admin)
  @AuthApiError()
  @ApiOperation({ summary: 'Create one activities' })
  @ApiResponse({ type: Activity })
  @Post()
  create(@Body() createActivityDto: CreateActivityDto) {
    return this.activityService.createActivity(createActivityDto);
  }

  @Roles(Role.Admin, Role.Parents, Role.Student, Role.Sysadmin)
  @AuthApiError()
  @ApiOperation({ summary: 'Get all activities' })
  @PaginationResponse(Activity)
  @Get()
  async findAllWithFilter(
    @Query() queries: PaginationRequestFullDto,
    @Query('level') level: string,
    @Req() req,
  ): Promise<PaginationDto<Activity>> {
    return await this.activityService.findAllWithPaging(
      req.user,
      queries,
      level,
    );
  }

  @Roles(Role.Admin, Role.Parents, Role.Student)
  @AuthApiError()
  @ApiOperation({ summary: 'Get all activities' })
  @ApiOkResponse({ type: [Activity] })
  @Get('all')
  async findAll(): Promise<Activity[]> {
    return await this.activityService.findAll();
  }

  @Roles(Role.Admin)
  @AuthApiError()
  @ApiOperation({ summary: 'Get one activities' })
  @ApiOkResponse({ type: Activity })
  @Get(':id')
  async findActivityById(
    @Param() idRequestDto: IdRequestDto,
    @Req() req,
  ): Promise<Activity> {
    return await this.activityService.findActivityById(
      req.user,
      idRequestDto.id,
    );
  }

  @Roles(Role.Admin, Role.Sysadmin)
  @AuthApiError()
  @ApiOperation({ summary: 'Update activities' })
  @ApiResponse({ type: Activity })
  @Patch(':id')
  async update(
    @Param() idRequestDto: IdRequestDto,
    @Body() updateActivityDto: UpdateActivityDto,
    @Req() req,
  ) {
    return await this.activityService.update(
      idRequestDto.id,
      updateActivityDto,
      req.user._id,
    );
  }

  @Roles(Role.Admin, Role.Sysadmin)
  @AuthApiError()
  @ApiOperation({ summary: 'Delete activities' })
  @ApiOkResponse({ type: Activity })
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req) {
    return await this.activityService.delete(id, req.user);
  }
}
