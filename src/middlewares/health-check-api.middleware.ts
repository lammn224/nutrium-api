import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class HealthCheckApiMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: () => void) {
    if (req.url === '/health') {
      res.status(200).json({ status: 'API is healthy' });
      return;
    }
    next();
  }
}
