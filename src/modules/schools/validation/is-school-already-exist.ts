import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { SchoolsService } from '../schools.service';

@ValidatorConstraint({ name: 'isSchoolAlreadyExist', async: false })
@Injectable()
export class IsSchoolAlreadyExist implements ValidatorConstraintInterface {
  constructor(private readonly schoolService: SchoolsService) {}

  async validate(value: string, validationArguments: ValidationArguments) {
    const key = validationArguments.property;
    const result = await this.schoolService.checkExist(key, value);
    return !result;
  }

  defaultMessage(args: ValidationArguments) {
    return `This ${args.property} already exists!`;
  }
}
