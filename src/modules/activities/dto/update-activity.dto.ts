import { PartialType } from '@nestjs/swagger';
import { CreateActivityDto } from '@/modules/activities/dto/create-activity.dto';

export class UpdateActivityDto extends PartialType(CreateActivityDto) {}
