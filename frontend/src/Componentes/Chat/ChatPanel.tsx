import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import "../../Styles/ChatPanel.css";

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

interface PrivateChat {
  participants: string[];
  messages: Message[];
}

interface Ticket {
  id: string;
  creator: string;
  title: string;
  messages: Message[];
  status: "open" | "closed";
}

interface TokenPayload {
  sub: string;
  email: string;
  rol: "admin" | "user";
  username?: string;
}

const ChatPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"dms" | "support">("dms");
  const [socket, setSocket] = useState<Socket | null>(null);

  // DMs
  const [privateChats, setPrivateChats] = useState<PrivateChat[]>([]);
  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
  const [newChatInput, setNewChatInput] = useState("");
  const [msgInput, setMsgInput] = useState("");

  // Tickets
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [newTicketTitle, setNewTicketTitle] = useState("");
  const [newTicketText, setNewTicketText] = useState("");
  const [replyInput, setReplyInput] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const getPayload = (): TokenPayload | null => {
    const token = localStorage.getItem("accessToken");

    if (!token) return null;

    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  };

  const payload = getPayload();

  const activeUser =
    payload?.username ||
    payload?.email ||
    "Invitado";

  const isAdmin = payload?.rol === "admin";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (!isOpen) return;

    const token = localStorage.getItem("accessToken");

    const newSocket = io("http://localhost:3000", {
      transports: ["websocket"],
      auth: {
        token,
      },
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("getPrivateChats");
      newSocket.emit("getTickets");
    });

    newSocket.on("privateChatsList", (chats: PrivateChat[]) => {
      setPrivateChats(chats);
    });

    newSocket.on("privateMessage", () => {
      newSocket.emit("getPrivateChats");
    });

    newSocket.on("ticketsList", (tkts: Ticket[]) => {
      setTickets(tkts);
    });

    newSocket.on("ticketsUpdated", () => {
      newSocket.emit("getTickets");
    });

    newSocket.on("ticketReplied", () => {
      newSocket.emit("getTickets");
    });

    return () => {
      newSocket.disconnect();
    };
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [privateChats, tickets, selectedChatUser, selectedTicketId]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("chat-open");
    } else {
      document.body.classList.remove("chat-open");
    }

    return () => {
      document.body.classList.remove("chat-open");
    };
  }, [isOpen]);

  // ─── DMs ─────────────────────────────────────────

  const handleSendDM = () => {
    if (!msgInput.trim() || !selectedChatUser || !socket) return;

    socket.emit("sendPrivateMessage", {
      receiver: selectedChatUser,
      text: msgInput,
    });

    setMsgInput("");
  };

  const handleStartNewChat = () => {
    if (!newChatInput.trim() || newChatInput === activeUser) return;

    let finalTarget = newChatInput.trim();

    if (!finalTarget.startsWith("@")) {
      finalTarget = "@" + finalTarget;
    }

    socket?.emit("startPrivateChat", {
      receiver: finalTarget,
    });

    setSelectedChatUser(finalTarget);
    setNewChatInput("");
  };

  // ─── Tickets ────────────────────────────────────

  const handleCreateTicket = () => {
    if (!newTicketTitle.trim() || !newTicketText.trim() || !socket) return;

    socket.emit("createTicket", {
      title: newTicketTitle,
      text: newTicketText,
    });

    setNewTicketTitle("");
    setNewTicketText("");
    setIsCreatingTicket(false);
  };

  const handleReplyTicket = () => {
    if (!replyInput.trim() || !selectedTicketId || !socket) return;

    socket.emit("replyTicket", {
      ticketId: selectedTicketId,
      text: replyInput,
    });

    setReplyInput("");
  };

  if (!isOpen) return null;

  // ─── Views ──────────────────────────────────────

  const renderDMList = () => (
    <div className="list-container">
      <div className="new-chat">
        <InputText
          value={newChatInput}
          onChange={(e) => setNewChatInput(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && handleStartNewChat()
          }
          placeholder="Tag amigo (ej: @juan)..."
        />

        <Button
          icon="pi pi-plus"
          onClick={handleStartNewChat}
          className="p-button-rounded"
        />
      </div>

      <div className="chats-list">
        {privateChats.map((c, i) => {
          const otherUser =
            c.participants.find((p) => p !== activeUser) || activeUser;

          const lastMsg = c.messages[c.messages.length - 1];

          return (
            <div
              key={i}
              className="list-item"
              onClick={() => setSelectedChatUser(otherUser)}
            >
              <div className="item-title">
                <i className="pi pi-user"></i> {otherUser}
              </div>

              {lastMsg && (
                <div className="item-desc">
                  {lastMsg.text}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderDMChat = () => {
    const chat = privateChats.find((c) =>
      c.participants.includes(selectedChatUser!)
    );

    const messages = chat ? chat.messages : [];

    return (
      <div className="active-chat">
        <div className="chat-header-actions">
          <Button
            icon="pi pi-arrow-left"
            className="p-button-text p-button-rounded"
            onClick={() => setSelectedChatUser(null)}
          />

          <h4>{selectedChatUser}</h4>
        </div>

        <div className="messages-container">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${
                msg.sender === activeUser
                  ? "sent"
                  : "received"
              }`}
            >
              <div className="message-bubble">
                <p>{msg.text}</p>

                <span className="timestamp">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <InputText
            value={msgInput}
            onChange={(e) => setMsgInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && handleSendDM()
            }
            placeholder="Mensaje..."
          />

          <Button
            icon="pi pi-send"
            onClick={handleSendDM}
            className="p-button-rounded"
          />
        </div>
      </div>
    );
  };

  const renderTicketsList = () => (
    <div className="list-container">
      {!isAdmin && (
        <div className="new-ticket-action">
          <Button
            label="Crear Nuevo Ticket"
            icon="pi pi-plus"
            onClick={() => setIsCreatingTicket(true)}
            className="p-button-outlined"
          />
        </div>
      )}

      <div className="chats-list">
        {tickets.map((t) => (
          <div
            key={t.id}
            className="list-item"
            onClick={() => setSelectedTicketId(t.id)}
          >
            <div className="item-title">
              <i className="pi pi-ticket"></i> {t.title}
            </div>

            <div className="item-desc">
              {isAdmin
                ? `De: ${t.creator}`
                : `Estado: ${t.status}`}
            </div>
          </div>
        ))}

        {tickets.length === 0 && (
          <p
            style={{
              textAlign: "center",
              opacity: 0.7,
              marginTop: "20px",
            }}
          >
            No hay tickets.
          </p>
        )}
      </div>
    </div>
  );

  const renderCreateTicket = () => (
    <div className="create-ticket">
      <div className="chat-header-actions">
        <Button
          icon="pi pi-arrow-left"
          className="p-button-text p-button-rounded"
          onClick={() => setIsCreatingTicket(false)}
        />

        <h4>Nuevo Ticket de Soporte</h4>
      </div>

      <div className="form-container">
        <InputText
          value={newTicketTitle}
          onChange={(e) =>
            setNewTicketTitle(e.target.value)
          }
          placeholder="Asunto del problema"
        />

        <InputTextarea
          value={newTicketText}
          onChange={(e) =>
            setNewTicketText(e.target.value)
          }
          rows={5}
          placeholder="Describe detalladamente el problema..."
          autoResize
        />

        <Button
          label="Enviar Ticket"
          onClick={handleCreateTicket}
        />
      </div>
    </div>
  );

  const renderActiveTicket = () => {
    const ticket = tickets.find(
      (t) => t.id === selectedTicketId
    );

    if (!ticket) return null;

    return (
      <div className="active-chat">
        <div className="chat-header-actions">
          <Button
            icon="pi pi-arrow-left"
            className="p-button-text p-button-rounded"
            onClick={() => setSelectedTicketId(null)}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h4 style={{ margin: 0 }}>{ticket.title}</h4>

            <small style={{ opacity: 0.8 }}>
              {ticket.creator}
            </small>
          </div>
        </div>

        <div className="messages-container">
          {ticket.messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${
                msg.sender === activeUser
                  ? "sent"
                  : "received"
              }`}
            >
              <span className="sender">
                {msg.sender}
              </span>

              <div className="message-bubble">
                <p>{msg.text}</p>

                <span className="timestamp">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <InputText
            value={replyInput}
            onChange={(e) =>
              setReplyInput(e.target.value)
            }
            onKeyDown={(e) =>
              e.key === "Enter" &&
              handleReplyTicket()
            }
            placeholder="Responder al ticket..."
          />

          <Button
            icon="pi pi-send"
            onClick={handleReplyTicket}
            className="p-button-rounded"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="chat-panel expanded">
      <div className="chat-header">
        <div className="tabs">
          <button
            className={
              activeTab === "dms" ? "active" : ""
            }
            onClick={() => {
              setActiveTab("dms");
              setSelectedChatUser(null);
            }}
          >
            Mensajes
          </button>

          <button
            className={
              activeTab === "support" ? "active" : ""
            }
            onClick={() => {
              setActiveTab("support");
              setSelectedTicketId(null);
              setIsCreatingTicket(false);
            }}
          >
            Soporte
          </button>
        </div>
      </div>

      <Button
        icon="pi pi-times"
        className="p-button-rounded p-button-text close-btn"
        onClick={onClose}
      />

      <div className="chat-body">
        {activeTab === "dms" &&
          (selectedChatUser
            ? renderDMChat()
            : renderDMList())}

        {activeTab === "support" &&
          (isCreatingTicket
            ? renderCreateTicket()
            : selectedTicketId
            ? renderActiveTicket()
            : renderTicketsList())}
      </div>
    </div>
  );
};

export default ChatPanel;