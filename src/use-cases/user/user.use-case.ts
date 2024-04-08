import { Injectable } from '@nestjs/common';
import { User } from 'src/core';
import { UserFactoryService } from './user-factory.service';
import { CreateUserDto, UpdateUserDto } from 'src/core/dto';
import { MailService } from 'src/frameworks/mail/mail.service';
import { UpdatePasswordDto } from 'src/core/dto/auth.dto';
import { Types } from 'mongoose';

@Injectable()
export class UserUseCases {
  constructor(
    private userFactoryService: UserFactoryService,

    private mailService: MailService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.userFactoryService.createNewUsers(createUserDto);

    return user.toJSON();
  }

  async verifyUser(token: string, id: Types.ObjectId) {
    return await this.userFactoryService.verifyUser(token, id);
  }

  async forgotPassword(email: string) {
    const user = await this.userFactoryService.forgotPassword(email);

    await this.mailService.sendForgotPasswordEmail(
      user,
      user.resetPasswordToken,
    );

    return user.toJSON();
  }
  async resetPassword(password: string, token: string, id: Types.ObjectId) {
    const user = await this.userFactoryService.resetPassword(
      password,
      token,
      id,
    );

    return user.toJSON();
  }
  async updateUser(
    updateUserDto: UpdateUserDto,
    file: Express.Multer.File,
    id: Types.ObjectId,
  ) {
    const user = await this.userFactoryService.updateUser(
      updateUserDto,
      file,
      id,
    );

    return user.toJSON();
  }

  async updatePassword(
    updatePasswordDto: UpdatePasswordDto,
    id: Types.ObjectId,
  ) {
    const user = await this.userFactoryService.updatePassword(
      updatePasswordDto,
      id,
    );

    return user.toJSON();
  }
}
