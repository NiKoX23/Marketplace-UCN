import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import "../Css/AdminPanel.css";

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

interface Ticket {
  id: string;
  creator: string;
  title: string;
  messages: Message[];
  status: "open" | "closed";
}

const AdminPanel: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const newSocket = io("http://localhost:3000", { transports: ["websocket"] });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("register", { rut: "admin" });
      newSocket.emit("getTickets", { rut: "admin", isAdmin: true });
    });

    newSocket.on("ticketsList", (tkts: Ticket[]) => setTickets(tkts));
    newSocket.on("ticketsUpdated", () => newSocket.emit("getTickets", { rut: "admin", isAdmin: true }));
    newSocket.on("ticketReplied", () => newSocket.emit("getTickets", { rut: "admin", isAdmin: true }));

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleReply = (ticketId: string) => {
    const text = replyInputs[ticketId];
    if (text?.trim() && socket) {
      socket.emit("replyTicket", { ticketId, sender: "admin", text });
      setReplyInputs({ ...replyInputs, [ticketId]: "" });
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <i className="pi pi-shield"></i>
        <h2>Panel de Administración de Tickets</h2>
      </div>

      <div className="tickets-grid">
        {tickets.length === 0 ? (
          <div className="no-tickets">No hay tickets activos en este momento.</div>
        ) : (
          tickets.map((t) => (
            <div key={t.id} className="ticket-card">
              <div className="ticket-title">
                <h4>{t.title}</h4>
                <span className={`status-badge ${t.status}`}>{t.status === "open" ? "Abierto" : "Cerrado"}</span>
              </div>
              <div className="ticket-meta">Creado por: <strong>{t.creator}</strong></div>

              <div className="ticket-actions">
                <Button 
                  label={expandedTicketId === t.id ? "Ocultar Detalles" : "Ver Conversación y Responder"}
                  icon={expandedTicketId === t.id ? "pi pi-angle-up" : "pi pi-angle-down"}
                  className="p-button-text p-button-sm"
                  onClick={() => setExpandedTicketId(expandedTicketId === t.id ? null : t.id)}
                />
              </div>

              {expandedTicketId === t.id && (
                <div className="ticket-expanded">
                  <div className="admin-messages-list">
                    {t.messages.map((m) => (
                      <div key={m.id} className={`admin-msg ${m.sender === "admin" ? "from-admin" : "from-user"}`}>
                        <strong>{m.sender === "admin" ? "Tú (Soporte)" : m.sender}: </strong>
                        <span>{m.text}</span>
                        <div className="admin-msg-time">{m.timestamp}</div>
                      </div>
                    ))}
                  </div>
                  <div className="admin-reply-box">
                    <InputText 
                      placeholder="Escribe tu respuesta pública..." 
                      value={replyInputs[t.id] || ""}
                      onChange={(e) => setReplyInputs({ ...replyInputs, [t.id]: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && handleReply(t.id)}
                    />
                    <Button icon="pi pi-send" onClick={() => handleReply(t.id)} />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
