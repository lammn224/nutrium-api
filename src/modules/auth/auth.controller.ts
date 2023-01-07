import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { LoginDto } from './dto/login.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { Public } from '@/decorators/public.decorator';
import { CacheService } from '../cache/cache.service';
import { TOKEN_BLACK_LIST } from '@/constants/cache.constant';
import { ConfigService } from '@nestjs/config';
import { AuthCodeResponse } from '@/dtos/error-code-response.dto';
import {
  BLOCKED,
  DELETED,
  INACTIVE,
  USER_NOT_EXIST_OR_DELETED,
  WRONG_USER_OR_PASSWORD,
} from '@/constants/error-codes.constant';
import { LoginResponseDto } from './dto/login.response.dto';
import {
  AuthApiError,
  PublicApiError,
} from '@/decorators/api-error-response.decorator';
import { RegisterResponseDto } from './dto/register-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private cacheService: CacheService,
    private configService: ConfigService,
  ) {}

  @Public()
  @PublicApiError()
  @ApiCreatedResponse({ type: RegisterResponseDto })
  @ApiOperation({ summary: 'Register' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const res = await this.authService.register(registerDto);

    return res;
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @AuthCodeResponse(
    WRONG_USER_OR_PASSWORD,
    INACTIVE,
    BLOCKED,
    DELETED,
    USER_NOT_EXIST_OR_DELETED,
  )
  @ApiOkResponse({ type: LoginResponseDto })
  @PublicApiError()
  @ApiOperation({ summary: 'Login' })
  @Post('login')
  async login(
    @Request() req,
    @Body() loginDto: LoginDto,
  ): Promise<LoginResponseDto> {
    const token = await this.authService.login(req.user);

    return token;
  }

  @ApiBearerAuth()
  @AuthApiError()
  @Post('logout')
  async logout(@Request() req) {
    const authorization = req.headers?.authorization;
    if (authorization) {
      const splits = authorization.split(' ');
      if (splits.length > 1) {
        const token = splits[1];

        if (token) {
          await this.cacheService.set(
            `${TOKEN_BLACK_LIST}${token}`,
            1,
            this.configService.get('JWT_TTL'),
          );
        }
      }
    }
  }
}
