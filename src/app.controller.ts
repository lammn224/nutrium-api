import { Controller, Get, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './decorators/public.decorator';
import { ApiOkResponse } from '@nestjs/swagger';

@Public()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOkResponse()
  @Get()
  async getHello(): Promise<string> {
    return await this.appService.getHello();
  }

  @ApiOkResponse()
  @Get('/health')
  async healthCheck(@Req() req, @Res() res) {
    return await this.appService.healthCheck(req, res);
  }
}
