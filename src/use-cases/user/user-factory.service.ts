import { CreateUserDto, UpdateUserDto } from '../../core/dto';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { IDataServices } from 'src/core';
import { AwsService } from 'src/frameworks/aws/aws.service';
import * as bcrypt from 'bcrypt';
import { HelperService } from 'src/frameworks/helper-services/helper.service';
import { UpdatePasswordDto } from 'src/core/dto/auth.dto';
import { Types } from 'mongoose';
import { MailService } from 'src/frameworks/mail/mail.service';

@Injectable()
export class UserFactoryService {
  constructor(
    private dataService: IDataServices,
    private awsService: AwsService,
    private helperService: HelperService,
    private mailService: MailService,
  ) {}

  async createNewUsers(createUserDto: CreateUserDto) {
    let userId: Types.ObjectId;
    try {
      const userExists = await this.dataService.users.findOne({
        email: createUserDto.email,
      });

      if (userExists) {
        throw new BadRequestException(
          `User with email: ${createUserDto.email} already exists`,
        );
      }

      const salt = await bcrypt.genSalt(13);

      const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

      createUserDto.password = hashedPassword;

      const verificationToken =
        await this.helperService.generateVerificationToken();

      const newUser = { ...createUserDto, verificationToken };

      const user = await this.dataService.users.create(newUser);
      userId = user._id;
      await this.mailService.sendVerifyEmail(user, user.verificationToken);

      return user;
    } catch (error) {
      if (error?.message === 'Error sending verrification mail' && userId) {
        await this.dataService.users.delete(userId);
      }
      throw new InternalServerErrorException(error?.message);
    }
  }

  async verifyUser(verificationToken: string, id: Types.ObjectId) {
    try {
      const existingUser = await this.dataService.users.findOne({
        _id: id,
        verificationToken,
      });
      if (!existingUser) {
        throw new BadRequestException(`Bad verification `);
      }
      existingUser.verified = true;
      existingUser.verificationToken = undefined;
      existingUser.markModified('verificationToken');
      existingUser.markModified('status');
      existingUser.markModified('verified');

      await existingUser.save();

      return existingUser.toJSON();
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  async forgotPassword(email: string) {
    try {
      const existingUser = await this.dataService.users.findOne({
        email,
      });
      if (!existingUser) {
        throw new BadRequestException(
          `User with email: ${existingUser.email} does not exists`,
        );
      }

      const resetPasswordToken =
        await this.helperService.generateVerificationToken();
      const resetPasswordExpires = new Date();
      resetPasswordExpires.setHours(resetPasswordExpires.getHours() + 1);

      existingUser.resetPasswordToken = resetPasswordToken;
      existingUser.resetPasswordExpires = resetPasswordExpires;

      return await existingUser.save();
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  async resetPassword(password: string, token: string, id: Types.ObjectId) {
    try {
      const existingUser = await this.dataService.users.findOne({
        _id: id,
        resetPasswordToken: token,
      });
      if (!existingUser) {
        throw new BadRequestException(`User not found`);
      }
      if (
        !existingUser.resetPasswordExpires ||
        existingUser.resetPasswordExpires < new Date()
      ) {
        existingUser.resetPasswordToken = undefined;
        existingUser.resetPasswordExpires = undefined;
        existingUser.markModified('resetPasswordExpires');
        existingUser.markModified('resetPasswordToken');
        await existingUser.save();
        throw new BadRequestException('Password reset token has expired');
      }

      const salt = await bcrypt.genSalt(13);

      const hashedPassword = await bcrypt.hash(password, salt);

      existingUser.password = hashedPassword;
      existingUser.resetPasswordToken = undefined;
      existingUser.resetPasswordExpires = undefined;
      existingUser.markModified('resetPasswordExpires');
      existingUser.markModified('resetPasswordToken');
      existingUser.markModified('password');

      return await existingUser.save();
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  async updateUser(
    updateUserDto: UpdateUserDto,
    file: Express.Multer.File,
    id: Types.ObjectId,
  ) {
    try {
      const user = await this.dataService.users.findById(id);
      if (!user) {
        throw new BadRequestException(`User not found`);
      }

      if (file) {
        try {
          const profilePicture = await this.awsService.uploadSingleFile(file);
          updateUserDto.profilePicture = profilePicture;
        } catch (error) {
          throw new BadRequestException(
            `Something went wrong while uploading the picture`,
          );
        }
      }

      return await this.dataService.users.update(id, updateUserDto);
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  async updatePassword(
    updatePasswordDto: UpdatePasswordDto,
    id: Types.ObjectId,
  ) {
    try {
      const user = await this.dataService.users.findById(id);
      if (!user) {
        throw new BadRequestException(`User not found`);
      }

      if (
        user &&
        (await bcrypt.compare(updatePasswordDto.oldPassword, user.password))
      ) {
        const salt = await bcrypt.genSalt(13);

        const hashedPassword = await bcrypt.hash(
          updatePasswordDto.newPassword,
          salt,
        );

        return await this.dataService.users.update(id, {
          password: hashedPassword,
        });
      } else {
        throw new BadRequestException(`Old Password is incorrect`);
      }
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }
}
