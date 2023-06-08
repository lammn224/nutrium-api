import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
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
import { PaginationDto } from '@/dtos/pagination-response.dto';
import { ScheduleExerciseService } from '@/modules/scheduleExercise/scheduleExercise.service';
import { CreateScheduleExerciseDto } from '@/modules/scheduleExercise/dto/create-schedule-exercise.dto';
import { ScheduleExercise } from '@/modules/scheduleExercise/scheduleExercise.schema';
import { Meals } from '@/modules/meals/meals.schema';
import { IdRequestDto } from '@/dtos/id-request.dto';
import { UpdateMealDto } from '@/modules/meals/dto/update-meal.dto';
import { UpdateScheduleExerciseDto } from '@/modules/scheduleExercise/dto/update-schedule-exercise.dto';

@ApiExtraModels(PaginationDto)
@ApiBearerAuth()
@ApiTags('Schedule Exercise')
@Controller('schedule-exercise')
export class ScheduleExerciseController {
  constructor(
    private readonly scheduleExerciseService: ScheduleExerciseService,
  ) {}

  @Roles(Role.Parents, Role.Student)
  @AuthApiError()
  @ApiOperation({ summary: 'Create one exercise' })
  @ApiResponse({ type: ScheduleExercise })
  @Post()
  create(
    @Body() createScheduleExerciseDto: CreateScheduleExerciseDto,
    @Req() req,
  ) {
    return this.scheduleExerciseService.create(
      createScheduleExerciseDto,
      req.user,
    );
  }

  @Roles(Role.Parents, Role.Student)
  @AuthApiError()
  @ApiOperation({ summary: 'Get all schedule exercise' })
  @ApiOkResponse({ type: [ScheduleExercise] })
  @Get()
  async findAll(@Req() req): Promise<ScheduleExercise[]> {
    return await this.scheduleExerciseService.findAll(req.user);
  }

  @Roles(Role.Student, Role.Parents)
  @AuthApiError()
  @ApiOperation({ summary: 'Update schedule exercise' })
  @ApiOkResponse({ type: ScheduleExercise })
  @Patch(':id')
  async updateMeal(
    @Param() idRequestDto: IdRequestDto,
    @Body() updateScheduleExerciseDto: UpdateScheduleExerciseDto,
    @Req() req,
  ): Promise<ScheduleExercise> {
    return await this.scheduleExerciseService.updateMeal(
      idRequestDto.id,
      updateScheduleExerciseDto,
      req.user,
    );
  }
  //
  // @Roles(Role.Admin)
  // @AuthApiError()
  // @ApiOperation({ summary: 'Get one activities' })
  // @ApiOkResponse({ type: Schedule Exercise })
  // @Get(':id')
  // async findSchedule ExerciseById(
  //   @Param() idRequestDto: IdRequestDto,
  //   @Req() req,
  // ): Promise<Schedule Exercise> {
  //   return await this.activityService.findSchedule ExerciseById(
  //     req.user,
  //     idRequestDto.id,
  //   );
  // }
}
