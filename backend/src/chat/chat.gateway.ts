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
}

export interface Ticket {
  id: string;
  creator: string;
  title: string;
  messages: Message[];
  status: 'open' | 'closed';
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
    client.emit('privateChatsList', chats);
  }

  @SubscribeMessage('sendPrivateMessage')
  handleSendPrivateMessage(client: Socket, payload: { sender: string, receiver: string, text: string }) {
    let chat = this.privateChats.find(c => c.participants.includes(payload.sender) && c.participants.includes(payload.receiver));
    if (!chat) {
      chat = { participants: [payload.sender, payload.receiver], messages: [] };
      this.privateChats.push(chat);
    }
    const msg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      sender: payload.sender,
      text: payload.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    chat.messages.push(msg);
    // Send to both sender and receiver rooms
    this.server.to(payload.sender).emit('privateMessage', { chat, msg });
    this.server.to(payload.receiver).emit('privateMessage', { chat, msg });
  }

  /* --- TICKETS --- */
  @SubscribeMessage('getTickets')
  handleGetTickets(client: Socket, payload: { rut: string, isAdmin: boolean }) {
    const userTickets = payload.isAdmin ? this.tickets : this.tickets.filter(t => t.creator === payload.rut);
    client.emit('ticketsList', userTickets);
  }

  @SubscribeMessage('createTicket')
  handleCreateTicket(client: Socket, payload: { creator: string, title: string, text: string }) {
    const msg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      sender: payload.creator,
      text: payload.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const ticket: Ticket = {
      id: Math.random().toString(36).substr(2, 9),
      creator: payload.creator,
      title: payload.title,
      messages: [msg],
      status: 'open'
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
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    ticket.messages.push(msg);
    this.server.emit('ticketReplied', { ticketId: ticket.id, msg });
  }
}
