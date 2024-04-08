import { Module } from '@nestjs/common';
import { AwsModule } from 'src/frameworks/aws/aws.module';

@Module({
  imports: [AwsModule],
  exports: [AwsModule],
})
export class AwsServiceModule {}
