import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { User } from './user.schema';
import {
  PaginationDto,
  PaginationResponse,
} from '@/dtos/pagination-response.dto';
import { PaginationRequestFullDto } from '@/dtos/pagination-request.dto';
import { AuthApiError } from '@/decorators/api-error-response.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Roles } from '@/decorators/roles.decorator';
import { Role } from '@/enums/role.enum';

@ApiExtraModels(PaginationDto)
@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @AuthApiError()
  @ApiOperation({ summary: 'Fetch me' })
  @Get('me')
  async me(@Request() req) {
    return await this.usersService.me(req.user._id);
  }

  @Roles(Role.Admin)
  @PaginationResponse(User)
  @ApiOperation({ summary: 'User list with filter' })
  @AuthApiError()
  @Get()
  async findAll(
    @Query() queries: PaginationRequestFullDto,
  ): Promise<PaginationDto<User>> {
    const data = await this.usersService.findAll(queries);

    return data;
  }

  @ApiOkResponse({ type: User })
  @AuthApiError()
  @ApiOperation({ summary: 'Get a user' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    const data = await this.usersService.findById(id);

    return data;
  }

  @ApiOkResponse({ type: User })
  @AuthApiError()
  @ApiOperation({ summary: 'Update a user' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const data = await this.usersService.update(id, updateUserDto);

    return data;
  }

  @ApiCreatedResponse({ type: User })
  @ApiOperation({ summary: 'Create a user' })
  @AuthApiError()
  @Post()
  async create(@Request() req, @Body() user: CreateUserDto) {
    const data = await this.usersService.create(req.user, user);
    return data;
  }

  @ApiNoContentResponse()
  @AuthApiError()
  @ApiOperation({ summary: 'Change password' })
  @Post('change-my-password')
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(req.user, changePasswordDto);
  }
}
