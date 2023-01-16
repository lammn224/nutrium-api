import { Controller } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '@/dtos/pagination-response.dto';

@ApiExtraModels(PaginationDto)
@ApiBearerAuth()
@ApiTags('Classes')
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}
}
