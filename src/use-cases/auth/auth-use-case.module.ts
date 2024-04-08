import { Module } from '@nestjs/common';
import { AuthFactoryService } from './auth-factory.service';
import { AuthUseCases } from './auth.use-case';
import { DataServicesModule } from 'src/services/data-services/data-services.module';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategies';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt-strategy';
import { RefreshStrategy } from './strategies/refresh-strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    DataServicesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '3600s' },
      }),
      inject: [ConfigService],
    }),
    PassportModule,
  ],
  providers: [
    AuthFactoryService,
    AuthUseCases,
    LocalStrategy,
    JwtStrategy,
    RefreshStrategy,
    ConfigService,
  ],
  exports: [
    AuthFactoryService,
    AuthUseCases,
    LocalStrategy,
    JwtStrategy,
    RefreshStrategy,
  ],
})
export class AuthUseCaseModule {}
