import { Controller, Post, Req, BadRequestException } from '@nestjs/common';
import SmsService from './sms.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthApiError } from '@/decorators/api-error-response.decorator';

@ApiTags('Sms')
@ApiBearerAuth()
@Controller('sms')
export default class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @AuthApiError()
  @Post('initiate-verification')
  async initiatePhoneNumberVerification(@Req() request) {
    if (request.user.isPhoneNumberConfirmed) {
      throw new BadRequestException('Phone number already confirmed');
    }
    await this.smsService.initiatePhoneNumberVerification(
      request.user.phoneNumber,
    );
  }
}
