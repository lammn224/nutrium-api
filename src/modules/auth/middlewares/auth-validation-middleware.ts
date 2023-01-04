import {
  Injectable,
  NestMiddleware,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { validateOrReject } from 'class-validator';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthValidationMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const body = req.body;
    const login = new LoginDto();
    const errorObj = {};

    Object.keys(body).forEach((key) => {
      login[key] = body[key];
    });

    try {
      await validateOrReject(login);
    } catch (errs) {
      errs.forEach((err) => {
        if (errorObj[err.property]) {
          errorObj[err.property] = errorObj[err.property].concat(
            Object.values(err.constraints),
          );
        } else {
          errorObj[err.property] = Object.values(err.constraints);
        }
      });
    }

    if (Object.keys(errorObj).length !== 0) {
      throw new UnprocessableEntityException({ errors: errorObj });
    }
    next();
  }
}
