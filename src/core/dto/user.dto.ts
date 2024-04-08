import {
  GenderEnum,
  RelationshipStatusEnum,
  RolesEnum,
} from 'src/core/interfaces/user.interfaces';

import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsPhoneNumber,
  IsOptional,
  IsDateString,
  IsEnum,
  Validate,
} from 'class-validator';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { DoctorDetailsValidator } from '../validator/DoctorDetailsValidator';
import { PatientDetailsValidator } from '../validator/PatientDetailsValidator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  middleName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('NG')
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ isArray: true, enum: GenderEnum })
  @IsEnum(GenderEnum)
  @IsString()
  @IsNotEmpty()
  gender: GenderEnum;

  @ApiProperty({ required: false })
  @Validate(DoctorDetailsValidator)
  emergencyContactName?: string;

  @ApiProperty({ required: false })
  @Validate(DoctorDetailsValidator)
  emergencyContactNumber?: string;

  @ApiProperty({ required: false })
  @Validate(DoctorDetailsValidator)
  emergencyContactAddress?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  profilePicture: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: Date;

  @ApiProperty({ isArray: true, enum: RelationshipStatusEnum })
  @IsEnum(RelationshipStatusEnum)
  @IsString()
  @IsNotEmpty()
  relationshipStatus: RelationshipStatusEnum;

  @ApiProperty({ required: false })
  @Validate(DoctorDetailsValidator)
  existingMedicalConditions?: string[];

  @ApiProperty({ required: false })
  @Validate(DoctorDetailsValidator)
  allergies?: string[];

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ isArray: true, enum: RolesEnum })
  @IsEnum(RolesEnum)
  @IsString()
  @IsNotEmpty()
  role: RolesEnum;

  @ApiProperty({ required: false })
  @Validate(PatientDetailsValidator)
  specialty?: string;
}

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['role', 'specialty', 'email', 'password']),
) {}
