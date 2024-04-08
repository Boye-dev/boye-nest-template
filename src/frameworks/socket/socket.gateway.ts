import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { SocketService } from './socket.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  constructor(private readonly socketService: SocketService) {}
  handleConnection(socket: Socket) {
    this.socketService.handleConnection(socket, this.server);
  }

  handleDisconnect(socket: Socket) {
    this.socketService.handleDisconnect(socket, this.server);
  }
}
