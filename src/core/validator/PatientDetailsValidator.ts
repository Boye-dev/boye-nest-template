import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { RolesEnum } from '../interfaces/user.interfaces';

@ValidatorConstraint({ name: 'PatientDetailsValidator', async: false })
export class PatientDetailsValidator implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const { object } = args;

    const otherFieldValue = object['role'];

    if (otherFieldValue === RolesEnum.Patient) {
      if (value === undefined) {
        return true;
      } else {
        return false;
      }
    } else {
      if (value?.trim()?.length > 0) {
        return true;
      } else {
        return false;
      }
    }
  }

  defaultMessage(args: ValidationArguments) {
    if (JSON.parse(JSON.stringify(args.object)).role === RolesEnum.Patient) {
      return 'Please exclude this field not a doctor';
    } else {
      return `${args.property} should be a valid string`;
    }
  }
}
