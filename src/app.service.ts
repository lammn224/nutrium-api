import { Injectable, Req, Res } from '@nestjs/common';

@Injectable()
export class AppService {
  async getHello(): Promise<string> {
    return 'Hello World';
  }

  async healthCheck(@Req() req, @Res() res) {
    res.status(200).json({ msg: 'API is healthy' });
  }
}
