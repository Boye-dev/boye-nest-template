import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  GenderEnum,
  RelationshipStatusEnum,
  RolesEnum,
} from 'src/core/interfaces/user.interfaces';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.password;
      delete ret.verificationToken;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpires;
      delete ret.__v;
    },
  },
})
export class User {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ trim: true })
  middleName: string;

  @Prop({ required: true, trim: true })
  phoneNumber: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true, trim: true })
  gender: GenderEnum;

  @Prop()
  emergencyContactName: string;

  @Prop()
  emergencyContactNumber: string;

  @Prop()
  emergencyContactAddress: string;

  @Prop({ required: true })
  profilePicture: string;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop()
  relationshipStatus: RelationshipStatusEnum;

  @Prop({ default: undefined })
  existingMedicalConditions: string[];

  @Prop({ default: undefined })
  allergies: string[];

  @Prop({ default: false })
  verified: boolean;

  @Prop({
    unique: true,
    required: true,
    lowercase: true,
  })
  email: string;

  @Prop({ required: true, maxlength: 255 })
  password: string;

  @Prop({ required: true })
  role: RolesEnum;

  @Prop()
  specialty: string;

  @Prop()
  verificationToken: string;

  @Prop()
  resetPasswordToken: string;

  @Prop()
  resetPasswordExpires: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
