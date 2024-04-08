import { Module } from '@nestjs/common';
import { MailModule } from 'src/frameworks/mail/mail.module';

@Module({
  imports: [MailModule],
  exports: [MailModule],
})
export class MailServiceModule {}
