import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { ClassesService } from './classes.service';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  PaginationDto,
  PaginationResponse,
} from '@/dtos/pagination-response.dto';
import { Roles } from '@/decorators/roles.decorator';
import { Role } from '@/enums/role.enum';
import { AuthApiError } from '@/decorators/api-error-response.decorator';
import { PaginationRequestFullDto } from '@/dtos/pagination-request.dto';
import { Classes } from '@/modules/classes/classes.schema';
import { IdRequestDto } from '@/dtos/id-request.dto';

@ApiExtraModels(PaginationDto)
@ApiBearerAuth()
@ApiTags('Classes')
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Roles(Role.Admin)
  @AuthApiError()
  @ApiOperation({ summary: 'Get all classes' })
  @PaginationResponse(Classes)
  @ApiOkResponse({ type: Classes })
  @Get()
  async findAll(
    @Query() queries: PaginationRequestFullDto,
    @Req() req,
  ): Promise<PaginationDto<Classes>> {
    return await this.classesService.findAll(req.user, queries);
  }

  @Roles(Role.Admin)
  @AuthApiError()
  @ApiOperation({ summary: 'Get one class' })
  @ApiOkResponse({ type: Classes })
  @Get(':id')
  async findClassById(
    @Param() idRequestDto: IdRequestDto,
    @Req() req,
  ): Promise<Classes> {
    return await this.classesService.findClassById(req.user, idRequestDto.id);
  }
}
