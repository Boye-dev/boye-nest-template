import {
  GenderEnum,
  RelationshipStatusEnum,
  RolesEnum,
} from 'src/core/interfaces/user.interfaces';

export class User {
  firstName: string;

  middleName: string;

  phoneNumber: string;

  lastName: string;

  address: string;

  gender: GenderEnum;

  emergencyContactName: string;

  emergencyContactNumber: string;

  emergencyContactAddress: string;

  profilePicture: string;

  dateOfBirth: Date;

  relationshipStatus: RelationshipStatusEnum;

  existingMedicalConditions: string[];

  allergies: string[];

  verified: boolean;

  email: string;

  password: string;

  role: RolesEnum;

  specialty: string;

  verificationToken: string;

  resetPasswordToken: string;

  resetPasswordExpires: Date;
}
