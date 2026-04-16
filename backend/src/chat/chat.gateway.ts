import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

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

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private logger: Logger = new Logger('ChatGateway');

  private tickets: Ticket[] = [];
  private privateChats: PrivateChat[] = [];

  afterInit(server: Server) { this.logger.log('Init'); }
  handleDisconnect(client: Socket) { this.logger.log(`Client disconnected: ${client.id}`); }
  handleConnection(client: Socket) { this.logger.log(`Client connected: ${client.id}`); }

  private getSantiagoTime() {
    return new Date().toLocaleTimeString('es-CL', {
      timeZone: 'America/Santiago',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  @SubscribeMessage('register')
  handleRegister(client: Socket, payload: { rut: string }) {
    if (payload.rut && payload.rut !== 'Invitado') {
      client.join(payload.rut);
      this.logger.log(`User registered and joined room: ${payload.rut}`);
    }
  }

  /* --- DMS --- */
  @SubscribeMessage('getPrivateChats')
  handleGetPrivateChats(client: Socket, payload: { rut: string }) {
    const chats = this.privateChats.filter(c => c.participants.includes(payload.rut));
    // Sort from newest to oldest
    chats.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    client.emit('privateChatsList', chats);
  }

  @SubscribeMessage('startPrivateChat')
  handleStartPrivateChat(client: Socket, payload: { sender: string, receiver: string }) {
    let chat = this.privateChats.find(c => c.participants.includes(payload.sender) && c.participants.includes(payload.receiver));
    if (!chat) {
      chat = { participants: [payload.sender, payload.receiver], messages: [], updatedAt: Date.now() };
      this.privateChats.push(chat);
    }
    // Re-emit for the sender so they see the empty chat at the top
    const chats = this.privateChats.filter(c => c.participants.includes(payload.sender));
    chats.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    client.emit('privateChatsList', chats);
  }

  @SubscribeMessage('sendPrivateMessage')
  handleSendPrivateMessage(client: Socket, payload: { sender: string, receiver: string, text: string }) {
    let chat = this.privateChats.find(c => c.participants.includes(payload.sender) && c.participants.includes(payload.receiver));
    if (!chat) {
      chat = { participants: [payload.sender, payload.receiver], messages: [], updatedAt: Date.now() };
      this.privateChats.push(chat);
    }
    const msg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      sender: payload.sender,
      text: payload.text,
      timestamp: this.getSantiagoTime(),
    };
    chat.messages.push(msg);
    chat.updatedAt = Date.now();
    // Send to both sender and receiver rooms
    this.server.to(payload.sender).emit('privateMessage', { chat, msg });
    this.server.to(payload.receiver).emit('privateMessage', { chat, msg });
  }

  /* --- TICKETS --- */
  @SubscribeMessage('getTickets')
  handleGetTickets(client: Socket, payload: { rut: string, isAdmin: boolean }) {
    const userTickets = payload.isAdmin ? this.tickets : this.tickets.filter(t => t.creator === payload.rut);
    userTickets.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    client.emit('ticketsList', userTickets);
  }

  @SubscribeMessage('createTicket')
  handleCreateTicket(client: Socket, payload: { creator: string, title: string, text: string }) {
    const msg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      sender: payload.creator,
      text: payload.text,
      timestamp: this.getSantiagoTime(),
    };
    const ticket: Ticket = {
      id: Math.random().toString(36).substr(2, 9),
      creator: payload.creator,
      title: payload.title,
      messages: [msg],
      status: 'open',
      updatedAt: Date.now()
    };
    this.tickets.push(ticket);
    this.server.emit('ticketsUpdated', ticket); // Broad updates
  }

  @SubscribeMessage('replyTicket')
  handleReplyTicket(client: Socket, payload: { ticketId: string, sender: string, text: string }) {
    const ticket = this.tickets.find(t => t.id === payload.ticketId);
    if (!ticket) return;

    const msg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      sender: payload.sender,
      text: payload.text,
      timestamp: this.getSantiagoTime(),
    };
    ticket.messages.push(msg);
    ticket.updatedAt = Date.now();
    this.server.emit('ticketReplied', { ticketId: ticket.id, msg });
  }
}
