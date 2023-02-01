import { Controller, Get, Query } from '@nestjs/common';
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

@ApiExtraModels(PaginationDto)
@ApiBearerAuth()
@ApiTags('Classes')
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Roles(Role.Admin)
  @AuthApiError()
  @ApiOperation({ summary: 'Get all foods' })
  @PaginationResponse(Classes)
  @ApiOkResponse({ type: Classes })
  @Get()
  async findAll(
    @Query() queries: PaginationRequestFullDto,
  ): Promise<PaginationDto<Classes>> {
    return await this.classesService.findAll(queries);
  }
}
