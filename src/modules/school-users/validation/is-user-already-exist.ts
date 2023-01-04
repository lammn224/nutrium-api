import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { SchoolUsersService } from '../school-users.service';

@ValidatorConstraint({ name: 'isEmailAlreadyExist', async: false })
@Injectable()
export class IsUserAlreadyExist implements ValidatorConstraintInterface {
  constructor(private readonly schoolUserService: SchoolUsersService) {}

  async validate(value: string, validationArguments: ValidationArguments) {
    // @ts-ignore
    const id = validationArguments.object?.context?.params?.id;
    const key = validationArguments.property;
    const result = await this.schoolUserService.checkExist(key, value, id);

    return !result;
  }

  defaultMessage(args: ValidationArguments) {
    return `This ${args.property} already exists!`;
  }
}
