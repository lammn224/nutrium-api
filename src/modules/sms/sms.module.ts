import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import SmsController from '@/modules/sms/sms.controller';
import SmsService from '@/modules/sms/sms.service';

@Module({
  imports: [
    // ConfigModule.forRoot({
    //   validationSchema: Joi.object({
    //     TWILIO_ACCOUNT_SID: Joi.string().required(),
    //     TWILIO_AUTH_TOKEN: Joi.string().required(),
    //     TWILIO_VERIFICATION_SERVICE_SID: Joi.string().required(),
    //     // ...
    //   }),
    // }),
  ],
  controllers: [SmsController],
  providers: [SmsService],
})
export class SmsModule {}
