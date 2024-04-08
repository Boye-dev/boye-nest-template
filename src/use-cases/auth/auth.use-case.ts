import { Injectable } from '@nestjs/common';
import { User } from 'src/core';
import { AuthFactoryService } from './auth-factory.service';

@Injectable()
export class AuthUseCases {
  constructor(private authFactoryService: AuthFactoryService) {}

  async login(user: User) {
    return await this.authFactoryService.login(user);
  }

  async refreshToken(user: User) {
    return await this.authFactoryService.refreshToken(user);
  }
}
