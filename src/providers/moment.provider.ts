import { Injectable, OnModuleInit } from '@nestjs/common';
import * as moment from 'moment';

@Injectable()
export class MomentProvider implements OnModuleInit {
  onModuleInit() {
    moment.locale('vi');
  }
}
