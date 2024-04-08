import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { LoginDto, RefreshDto } from 'src/core/dto/auth.dto';
import { AuthUseCases } from 'src/use-cases/auth/auth.use-case';
import { LocalAuthGuard } from 'src/use-cases/auth/guards/local-auth.guard';
import { RefreshJwtGuard } from 'src/use-cases/auth/guards/refresh-jwt-auth.gurad';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private authUseCases: AuthUseCases) {}

  @ApiBody({
    type: LoginDto,
    description: 'Json structure for auth object',
  })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return await this.authUseCases.login(req.user);
  }

  @ApiBody({
    type: RefreshDto,
    description: 'Json structure for auth object',
  })
  @UseGuards(RefreshJwtGuard)
  @Post('refresh')
  async refreshToken(@Request() req) {
    return this.authUseCases.refreshToken(req.user);
  }
}
