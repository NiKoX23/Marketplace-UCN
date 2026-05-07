import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';

import {
  Logger,
  UnauthorizedException,
} from '@nestjs/common';

import { Socket, Server } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { Rol } from '../usuarios/usuario.entity';

interface SocketUser {
  sub: string;
  email: string;
  rol: Rol;
  username?: string;
}

export interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

export interface PrivateChat {
  participants: string[];
  messages: Message[];
  updatedAt?: number;
}

export interface Ticket {
  id: string;
  creator: string;
  title: string;
  messages: Message[];
  status: 'open' | 'closed';
  updatedAt?: number;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server!: Server;

  private logger: Logger = new Logger('ChatGateway');

  private tickets: Ticket[] = [];
  private privateChats: PrivateChat[] = [];

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const decoded = jwt.verify(
        token,
        process.env.SECRET_KEY!,
      ) as SocketUser;

      client.data.user = decoded;

      const room =
        decoded.username ||
        decoded.email ||
        decoded.sub;

      client.join(room);

      this.logger.log(
        `Client authenticated: ${room}`,
      );
    } catch (err) {
      this.logger.warn(`Unauthorized socket: ${client.id}`);
      client.disconnect();
    }
  }

  private getUser(client: Socket): SocketUser {
    const user = client.data.user as SocketUser;

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }

  private getSantiagoTime() {
    return new Date().toLocaleTimeString('es-CL', {
      timeZone: 'America/Santiago',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  @SubscribeMessage('getPrivateChats')
  handleGetPrivateChats(
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.getUser(client);

    const identifier =
      user.username || user.email;

    const chats = this.privateChats.filter((c) =>
      c.participants.includes(identifier),
    );

    chats.sort(
      (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0),
    );

    client.emit('privateChatsList', chats);
  }

  @SubscribeMessage('startPrivateChat')
  handleStartPrivateChat(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { receiver: string },
  ) {
    const user = this.getUser(client);

    const sender =
      user.username || user.email;

    let chat = this.privateChats.find(
      (c) =>
        c.participants.includes(sender) &&
        c.participants.includes(payload.receiver),
    );

    if (!chat) {
      chat = {
        participants: [sender, payload.receiver],
        messages: [],
        updatedAt: Date.now(),
      };

      this.privateChats.push(chat);
    }

    const chats = this.privateChats.filter((c) =>
      c.participants.includes(sender),
    );

    chats.sort(
      (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0),
    );

    client.emit('privateChatsList', chats);
  }

  @SubscribeMessage('sendPrivateMessage')
  handleSendPrivateMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { receiver: string; text: string },
  ) {
    const user = this.getUser(client);

    const sender =
      user.username || user.email;

    let chat = this.privateChats.find(
      (c) =>
        c.participants.includes(sender) &&
        c.participants.includes(payload.receiver),
    );

    if (!chat) {
      chat = {
        participants: [sender, payload.receiver],
        messages: [],
        updatedAt: Date.now(),
      };

      this.privateChats.push(chat);
    }

    const msg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      sender,
      text: payload.text,
      timestamp: this.getSantiagoTime(),
    };

    chat.messages.push(msg);
    chat.updatedAt = Date.now();

    this.server
      .to(sender)
      .emit('privateMessage', { chat, msg });

    this.server
      .to(payload.receiver)
      .emit('privateMessage', { chat, msg });
  }

  @SubscribeMessage('getTickets')
  handleGetTickets(
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.getUser(client);

    const identifier =
      user.username || user.email;

    const isAdmin = user.rol === Rol.ADMIN;

    const userTickets = isAdmin
      ? this.tickets
      : this.tickets.filter(
          (t) => t.creator === identifier,
        );

    userTickets.sort(
      (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0),
    );

    client.emit('ticketsList', userTickets);
  }

  @SubscribeMessage('createTicket')
  handleCreateTicket(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { title: string; text: string },
  ) {
    const user = this.getUser(client);

    const creator =
      user.username || user.email;

    const msg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      sender: creator,
      text: payload.text,
      timestamp: this.getSantiagoTime(),
    };

    const ticket: Ticket = {
      id: Math.random().toString(36).substr(2, 9),
      creator,
      title: payload.title,
      messages: [msg],
      status: 'open',
      updatedAt: Date.now(),
    };

    this.tickets.push(ticket);

    this.server.emit('ticketsUpdated', ticket);
  }

  @SubscribeMessage('replyTicket')
  handleReplyTicket(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { ticketId: string; text: string },
  ) {
    const user = this.getUser(client);

    const sender =
      user.rol === Rol.ADMIN
        ? 'Soporte'
        : user.username || user.email;

    const ticket = this.tickets.find(
      (t) => t.id === payload.ticketId,
    );

    if (!ticket) return;

    const msg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      sender,
      text: payload.text,
      timestamp: this.getSantiagoTime(),
    };

    ticket.messages.push(msg);
    ticket.updatedAt = Date.now();

    this.server.emit('ticketReplied', {
      ticketId: ticket.id,
      msg,
    });
  }
}