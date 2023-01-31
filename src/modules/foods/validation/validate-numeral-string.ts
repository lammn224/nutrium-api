import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ name: 'ValidateNumeralString', async: false })
@Injectable()
export class ValidateNumeralString implements ValidatorConstraintInterface {
  async validate(value: string, validationArguments: ValidationArguments) {
    const regex = new RegExp(/^[-+]?[0-9]*(\.[0-9]+)$/);
    return regex.test(value);
  }

  defaultMessage(args: ValidationArguments) {
    return `This ${args.property} not match regex format!`;
  }
}
