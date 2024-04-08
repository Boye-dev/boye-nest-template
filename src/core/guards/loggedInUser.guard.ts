import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class IsLoggedInUserGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const { user, params } = context.switchToHttp().getRequest();

    if (user?.id === params?.id) {
      return true;
    }

    throw new UnauthorizedException('You are not the logged in user');
  }
}
