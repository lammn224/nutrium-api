import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import mongoose from 'mongoose';
@ValidatorConstraint({ name: 'isObjectId', async: false })
export class IsObjectId implements ValidatorConstraintInterface {
  async validate(id: string, validationArguments: ValidationArguments) {
    const result = mongoose.isObjectIdOrHexString(id);
    return result;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} is not valid!`;
  }
}
