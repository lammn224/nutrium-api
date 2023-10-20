import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import { throwBadRequest } from '@/utils/exception.utils';

@Injectable()
export default class SmsService {
  private twilioClient: Twilio;
  private serviceSid = this.configService.get(
    'TWILIO_VERIFICATION_SERVICE_SID',
  );

  constructor(private readonly configService: ConfigService) {
    const accountSid = configService.get('TWILIO_ACCOUNT_SID');
    const authToken = configService.get('TWILIO_AUTH_TOKEN');

    this.twilioClient = new Twilio(accountSid, authToken);
  }

  initiatePhoneNumberVerification(phoneNumber: string) {
    console.groupCollapsed(this.twilioClient);
    // const serviceSid = this.configService.get(
    //   'TWILIO_VERIFICATION_SERVICE_SID',
    // );

    return this.twilioClient.verify.v2
      .services(this.serviceSid)
      .verifications.create({
        to: '+84382384224',
        channel: 'whatsapp',
        customCode: '012345',
      });
    //0911087017
    //+84329692910
  }

  async confirmPhoneNumber(
    userId: number,
    phoneNumber: string,
    verificationCode: string,
  ) {
    const result = await this.twilioClient.verify.v2
      .services(this.serviceSid)
      .verificationChecks.create({
        to: phoneNumber,
        code: verificationCode,
      });

    if (!result.valid || result.status !== 'approved') {
      throwBadRequest('Wrong code provided');
    }

    // await this.usersService.markPhoneNumberAsConfirmed(userId);
  }
}
