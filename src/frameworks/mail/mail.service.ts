import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from 'src/core';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendVerifyEmail(user: User, token: string) {
    try {
      const url = `https://nexus-frontend-rho.vercel.app/verify-user/?token=${token}`;
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Verify Your Email',
        template: './verifyemail.hbs',
        context: {
          name: user.lastName,
          url,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error sending verrification mail',
      );
    }
  }

  async sendForgotPasswordEmail(user: User, token: string) {
    try {
      const url = `https://nexus-frontend-rho.vercel.app/resetPassword?token=${token}`;
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Password Reset',
        template: './passwordreset.hbs',
        context: {
          name: user.lastName,
          url,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error sending password reset mail',
      );
    }
  }
}
