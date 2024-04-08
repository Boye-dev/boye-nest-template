import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { RolesEnum } from '../interfaces/user.interfaces';

@ValidatorConstraint({ name: 'DoctorDetailsValidator', async: false })
export class DoctorDetailsValidator implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const { object } = args;

    const otherFieldValue = object['role'];

    if (otherFieldValue === RolesEnum.Doctor) {
      if (value === undefined) {
        return true;
      } else {
        return false;
      }
    } else {
      if (
        args.property === 'existingMedicalConditions' ||
        args.property === 'allergies'
      ) {
        return true;
      } else {
        if (value?.trim()?.length > 0) {
          return true;
        } else {
          return false;
        }
      }
    }
  }

  defaultMessage(args: ValidationArguments) {
    if (JSON.parse(JSON.stringify(args.object)).role === RolesEnum.Doctor) {
      return 'Please exclude this field not a patient';
    } else {
      return `${args.property} should be a valid string`;
    }
  }
}
