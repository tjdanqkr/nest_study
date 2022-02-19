import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { Request, RequestParamHandler } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Req() req: Request, @Param() param: RequestParamHandler): string {
    console.log('req', req, 'param', param);
    console.log('ENV : ', process.env.DATABASE_ENV);

    return this.appService.getHello();
  }
}
