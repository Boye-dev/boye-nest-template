import { Module } from '@nestjs/common';
import { SocketModule } from 'src/frameworks/socket/socket.module';

@Module({
  imports: [SocketModule],
  exports: [SocketModule],
})
export class SocketServiceModule {}
