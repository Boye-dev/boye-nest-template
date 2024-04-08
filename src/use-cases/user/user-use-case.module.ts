import { Module } from '@nestjs/common';
import { UserFactoryService } from './user-factory.service';
import { UserUseCases } from './user.use-case';
import { DataServicesModule } from 'src/services/data-services/data-services.module';
import { AwsServiceModule } from 'src/services/aws-service/aws-service.module';
import { HelperServiceModule } from 'src/services/helper.service/helper-service.module';
import { MailServiceModule } from 'src/services/mail-service/mail-service.module';

@Module({
  imports: [
    DataServicesModule,
    AwsServiceModule,
    HelperServiceModule,
    MailServiceModule,
  ],
  providers: [UserFactoryService, UserUseCases],
  exports: [UserFactoryService, UserUseCases],
})
export class UserUseCaseModule {}
