import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthFactoryService } from '../auth-factory.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthFactoryService) {
    super();
  }

  async validate(username: string, password: string) {
    const userValidated = await this.authService.validateUser(
      username,
      password,
    );

    return userValidated;
  }
}
