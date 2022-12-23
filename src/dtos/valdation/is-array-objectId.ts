import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import mongoose from 'mongoose';
@ValidatorConstraint({ name: 'isArrayObjectId', async: false })
export class IsArrayObjectId implements ValidatorConstraintInterface {
  async validate(arrayId: string[], validationArguments: ValidationArguments) {
    const result = arrayId.every((id) => mongoose.isObjectIdOrHexString(id));
    return result;
  }

  defaultMessage(args: ValidationArguments) {
    return `Id is not valid!`;
  }
}
