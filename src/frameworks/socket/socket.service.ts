import { Injectable } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

@Injectable()
export class SocketService {
  private activeUsers = new Map<string, string[]>(); // userId -> socketId[]
  private chatRooms = new Map<string, Map<string, { sockets: string[] }>>(); // chatId -> userId -> { sockets: socketId[] }

  handleConnection(socket: Socket, server: Server) {
    socket.on('addUser', (userId: string) => {
      if (!this.activeUsers.has(userId)) {
        this.activeUsers.set(userId, []);
      }
      this.activeUsers.get(userId).push(socket.id);
      console.log(this.activeUsers, 'adduser');
      server.emit('getUsers', Array.from(this.activeUsers.keys()));
    });

    socket.on(
      'joinRoom',
      ({ chatId, userId }: { chatId: string; userId: string }) => {
        if (!this.chatRooms.has(chatId)) {
          this.chatRooms.set(chatId, new Map());
        }

        const chatRoom = this.chatRooms.get(chatId);

        if (!chatRoom.has(userId)) {
          chatRoom.set(userId, { sockets: [socket.id] });
        } else {
          chatRoom.get(userId).sockets.push(socket.id);
        }

        console.log(this.chatRooms.get(chatId), socket.id, 'join room');

        server.to(chatId).emit('chatUsers', Array.from(chatRoom.keys()));
      },
    );

    socket.on(
      'leaveRoom',
      ({ chatId, userId }: { chatId: string; userId: string }) => {
        if (this.chatRooms.has(chatId)) {
          const chatRoom = this.chatRooms.get(chatId);

          if (chatRoom.has(userId)) {
            const user = chatRoom.get(userId);

            const socketIndex = user.sockets.indexOf(socket.id);
            if (socketIndex !== -1) {
              user.sockets.splice(socketIndex, 1);
              console.log(
                `Removed socket ID ${socket.id} from user ${userId} in chat room ${chatId}`,
              );

              if (user.sockets.length === 0) {
                chatRoom.delete(userId);
                console.log(`Removed user ${userId} from chat room ${chatId}`);
              }

              if (chatRoom.size === 0) {
                this.chatRooms.delete(chatId);
                console.log(`Removed empty chat room ${chatId}`);
              }

              server.to(chatId).emit('chatUsers', Array.from(chatRoom.keys()));
            }
          }
          console.log(this.chatRooms.get(chatId), socket.id, 'leave room');
        }
      },
    );

    socket.on('sendMessage', ({ chatId, senderId, receiverIds, message }) => {
      if (this.chatRooms.has(chatId)) {
        const chatRoom = this.chatRooms.get(chatId);
        const receiversNotActive = [];
        const receiversActiveSockets = new Map();

        receiverIds.forEach((receiverId) => {
          if (this.activeUsers.has(receiverId)) {
            this.activeUsers.get(receiverId).forEach((activeUser) => {
              if (!receiversActiveSockets.has(receiverId)) {
                receiversActiveSockets.set(receiverId, {
                  sockets: [activeUser],
                });
              } else {
                receiversActiveSockets.get(receiverId).sockets.push(activeUser);
              }
            });
          } else {
            receiversNotActive.push(receiverId);
          }
        });
        if (this.activeUsers.has(senderId)) {
          const senderSockets = this.activeUsers.get(senderId);

          senderSockets.forEach((senderSocket) => {
            // Check if the sender's socket is not the current socket
            if (senderSocket !== socket.id) {
              server.to(senderSocket).emit('receiveMessage', {
                senderId,
                message,
              });
            }
            server
              .to(senderSocket)
              .emit('latestMessage', { senderId, message });
          });
        }
        receiversActiveSockets.forEach((socketsObj, receiverId) => {
          if (chatRoom.has(receiverId)) {
            const chatRoomSockets = chatRoom.get(receiverId).sockets;
            // Check if any of the receiver's sockets are in the chat room
            const socketsInChatRoom = socketsObj.sockets.filter(
              (receiverSocket) => chatRoomSockets.includes(receiverSocket),
            );

            const socketsNotInChatRoom = socketsObj.sockets.filter(
              (receiverSocket) => !chatRoomSockets.includes(receiverSocket),
            );

            if (socketsInChatRoom.length > 0) {
              // At least one socket is in the chat room, emit "messageReceived"
              socketsInChatRoom.forEach((receiverSocket) => {
                server.to(receiverSocket).emit('receiveMessage', {
                  senderId,
                  message,
                });
                server.to(receiverSocket).emit('latestMessage', {
                  senderId,
                  message,
                });
              });
            }
            if (socketsNotInChatRoom.length > 0) {
              socketsNotInChatRoom.forEach((receiverSocket) => {
                server.to(receiverSocket).emit('inAppNotification', {
                  senderId,
                  message,
                });
              });
            }
          } else {
            socketsObj.sockets.forEach((receiverSocket) => {
              server.to(receiverSocket).emit('inAppNotification', {
                senderId,
                message,
              });
              server.to(receiverSocket).emit('latestMessage', {
                senderId,
                message,
              });
            });
          }
        });
      }
    });
    socket.on('typing', ({ receiverIds, sender, chatId }) => {
      receiverIds.forEach((receiverId) => {
        if (this.activeUsers.has(receiverId)) {
          this.activeUsers.get(receiverId).forEach((activeUser) => {
            server.to(activeUser).emit('type', {
              typing: true,
              sender,
              chatId,
            });
          });
        }
      });
      console.log('Typing', chatId);
    });
    socket.on('stopTyping', ({ receiverIds, sender, chatId }) => {
      receiverIds.forEach((receiverId) => {
        if (this.activeUsers.has(receiverId)) {
          this.activeUsers.get(receiverId).forEach((activeUser) => {
            server.to(activeUser).emit('type', {
              typing: false,
              sender,
              chatId,
            });
          });
        }
      });
      console.log('Stop typing');
    });
  }

  handleDisconnect(socket: Socket, server) {
    const userIds = Array.from(this.activeUsers.keys());

    for (const userId of userIds) {
      const sockets = this.activeUsers.get(userId);

      // Check if the disconnected socket ID exists in the user's sockets
      const socketIndex = sockets.indexOf(socket.id);
      if (socketIndex !== -1) {
        sockets.splice(socketIndex, 1);
        console.log(`Removed socket ID ${socket.id} from user ${userId}`);

        // If the user has no more active sockets, remove the user entirely
        if (sockets.length === 0) {
          this.activeUsers.delete(userId);
          console.log(`Removed user ${userId} from activeUsers`);
        }
      }
    }

    this.chatRooms.forEach((chatRoom, chatId) => {
      chatRoom.forEach((user, userId) => {
        if (user.sockets.includes(socket.id)) {
          const socketIndex = user.sockets.indexOf(socket.id);
          if (socketIndex !== -1) {
            user.sockets.splice(socketIndex, 1);
            console.log(
              `Removed socket ID ${socket.id} from user ${userId} in chat room ${chatId}`,
            );

            if (user.sockets.length === 0) {
              chatRoom.delete(userId);
              console.log(`Removed user ${userId} from chat room ${chatId}`);
            }
          }
        }
      });

      // If the chat room becomes empty after removing users, you can also remove the chat room
      if (chatRoom.size === 0) {
        this.chatRooms.delete(chatId);
        console.log(`Removed empty chat room ${chatId}`);
      }

      // Broadcast the updated chat room to all clients in the chat room
      server.to(chatId).emit('chatUsers', Array.from(chatRoom.keys()));
    });
  }
}
