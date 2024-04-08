import { Module } from '@nestjs/common';
import { DataServicesModule } from './services/data-services/data-services.module';
import { UserUseCaseModule } from './use-cases/user/user-use-case.module';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './controllers/user.controller';
import { AwsServiceModule } from './services/aws-service/aws-service.module';
import { AuthUseCaseModule } from './use-cases/auth/auth-use-case.module';
import { AuthController } from './controllers/auth.controller';
import { HelperServiceModule } from './services/helper.service/helper-service.module';
import { MailServiceModule } from './services/mail-service/mail-service.module';

@Module({
  imports: [
    DataServicesModule,
    AwsServiceModule,
    MailServiceModule,
    HelperServiceModule,
    UserUseCaseModule,
    AuthUseCaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
  ],
  controllers: [UserController, AuthController],
})
export class AppModule {}
