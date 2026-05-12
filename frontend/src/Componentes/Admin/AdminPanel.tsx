import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import "../../Styles/AdminPanel.css";

const API_URL = "http://localhost:3000";

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
  createdAt?: string;
}

interface Usuario {
  id: string;
  username: string | null;
  nombre: string;
  apellido: string;
  email: string;
  rut: string | null;
  rol: string;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

type Vista = "menu" | "usuarios" | "tickets";

const AdminPanel: React.FC = () => {
  const [vista, setVista] = useState<Vista>("menu");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const navigate = useNavigate();
  const userActualRef = useRef("");

  // Socket para tickets
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        userActualRef.current = payload.username || payload.email;
      } catch { }
    }

    const newSocket = io(API_URL, {
      transports: ["websocket"],
      auth: { token },
    });
    setSocket(newSocket);

    newSocket.on("connect", () => newSocket.emit("getTickets"));
    newSocket.on("ticketsList", (tkts: Ticket[]) => {
      // Ordenar de más antiguo a más nuevo
      const ordenados = [...tkts].sort((a, b) => {
        const fa = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const fb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return fa - fb;
      });
      setTickets(ordenados);
    });
    newSocket.on("ticketsUpdated", () => newSocket.emit("getTickets"));
    newSocket.on("ticketReplied", () => newSocket.emit("getTickets"));

    return () => { newSocket.disconnect(); };
  }, []);

  // Cargar usuarios
  const cargarUsuarios = async () => {
    setLoadingUsuarios(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/admin/usuarios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsuarios(data);
      }
    } catch (e) {
      console.error("Error cargando usuarios", e);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  useEffect(() => {
    if (vista === "usuarios") cargarUsuarios();
  }, [vista]);

  const handleReply = (ticketId: string) => {
    const text = replyInputs[ticketId];
    if (text?.trim() && socket) {
      socket.emit("replyTicket", { ticketId, text });
      setReplyInputs({ ...replyInputs, [ticketId]: "" });
    }
  };

  const handleCerrarTicket = (ticketId: string) => {
    if (socket) {
      socket.emit("closeTicket", { ticketId });
    }
  };

  // ── MENÚ PRINCIPAL ─────────────────────────────────────────────────────────
  if (vista === "menu") {
    return (
      <div className="admin-page-container">
        <div className="admin-panel">
          <div className="admin-header">
            <i className="pi pi-shield" style={{ fontSize: "1.8rem", color: "#a78bfa" }}></i>
            <h2>Panel de Administración</h2>
            <button className="admin-btn-volver" onClick={() => navigate("/inicio")}>
              ← Volver a Inicio
            </button>
          </div>

          <div className="admin-menu-grid">
            <button className="admin-menu-card" onClick={() => setVista("usuarios")}>
              <i className="pi pi-users" style={{ fontSize: "2.5rem", color: "#60a5fa" }}></i>
              <h3>Lista de Usuarios</h3>
              <p>Ver todos los usuarios registrados en el sistema</p>
            </button>

            <button className="admin-menu-card" onClick={() => setVista("tickets")}>
              <i className="pi pi-ticket" style={{ fontSize: "2.5rem", color: "#34d399" }}></i>
              <h3>Administración de Tickets</h3>
              <p>Gestionar y responder tickets de soporte</p>
              {tickets.filter(t => t.status === "open").length > 0 && (
                <span className="admin-badge">{tickets.filter(t => t.status === "open").length} abiertos</span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── LISTA DE USUARIOS ──────────────────────────────────────────────────────
  if (vista === "usuarios") {
    return (
      <div className="admin-page-container">
        <div className="admin-panel">
          <div className="admin-header">
            <button className="admin-btn-back" onClick={() => setVista("menu")}>← Volver</button>
            <i className="pi pi-users" style={{ fontSize: "1.4rem", color: "#60a5fa" }}></i>
            <h2>Lista de Usuarios</h2>
          </div>

          {loadingUsuarios ? (
            <p style={{ color: "#94a3b8", padding: "20px" }}>Cargando usuarios...</p>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Email</th>
                    <th>RUT</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Registrado</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(u => (
                    <tr key={u.id}>
                      <td>{u.username ?? <span style={{ color: "#475569" }}>—</span>}</td>
                      <td>{u.nombre}</td>
                      <td>{u.apellido}</td>
                      <td>{u.email}</td>
                      <td>{u.rut ?? <span style={{ color: "#475569" }}>—</span>}</td>
                      <td>
                        <span className={`role-badge ${u.rol}`}>{u.rol}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${u.activo ? "open" : "closed"}`}>
                          {u.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td style={{ fontSize: "12px", color: "#94a3b8" }}>
                        {new Date(u.creadoEn).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {usuarios.length === 0 && (
                <p style={{ color: "#64748b", textAlign: "center", padding: "30px" }}>No hay usuarios registrados.</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── TICKETS ────────────────────────────────────────────────────────────────
  return (
    <div className="admin-page-container">
      <div className="admin-panel">
        <div className="admin-header">
          <button className="admin-btn-back" onClick={() => setVista("menu")}>← Volver</button>
          <i className="pi pi-ticket" style={{ fontSize: "1.4rem", color: "#34d399" }}></i>
          <h2>Administración de Tickets</h2>
        </div>

        <div className="tickets-grid">
          {tickets.length === 0 ? (
            <div className="no-tickets">No hay tickets activos en este momento.</div>
          ) : (
            tickets.map((t) => (
              <div key={t.id} className={`ticket-card ${t.status}`}>
                <div className="ticket-header-row">
                  <div>
                    <h4 className="ticket-title-text">{t.title}</h4>
                    <div className="ticket-meta">
                      <span>👤 <strong>@{t.creator}</strong></span>
                      {t.createdAt && (
                        <span style={{ marginLeft: "12px", color: "#64748b", fontSize: "12px" }}>
                          🕐 {new Date(t.createdAt).toLocaleString("es-CL")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span className={`status-badge ${t.status}`}>{t.status === "open" ? "Abierto" : "Cerrado"}</span>
                    <button
                      className="admin-btn-expand"
                      onClick={() => setExpandedTicketId(expandedTicketId === t.id ? null : t.id)}
                    >
                      {expandedTicketId === t.id ? "Ocultar" : "Responder"}
                    </button>
                    {t.status === "open" && (
                      <button
                        className="admin-btn-close"
                        onClick={() => handleCerrarTicket(t.id)}
                        title="Dar por finalizado y eliminar ticket"
                      >
                        ✓ Finalizar
                      </button>
                    )}
                  </div>
                </div>

                {expandedTicketId === t.id && (
                  <div className="ticket-expanded">
                    <div className="admin-messages-list">
                      {t.messages.length === 0 && (
                        <p style={{ color: "#64748b", fontSize: "13px" }}>Sin mensajes aún.</p>
                      )}
                      {t.messages.map((m) => (
                        <div key={m.id} className={`admin-msg ${m.sender === userActualRef.current ? "from-admin" : "from-user"}`}>
                          <strong>{m.sender === userActualRef.current ? "Tú (Soporte)" : `@${m.sender}`}: </strong>
                          <span>{m.text}</span>
                          <div className="admin-msg-time">{m.timestamp}</div>
                        </div>
                      ))}
                    </div>
                    <div className="admin-reply-box">
                      <input
                        className="admin-reply-input"
                        placeholder="Escribe tu respuesta..."
                        value={replyInputs[t.id] || ""}
                        onChange={(e) => setReplyInputs({ ...replyInputs, [t.id]: e.target.value })}
                        onKeyDown={(e) => e.key === "Enter" && handleReply(t.id)}
                      />
                      <button className="admin-btn-send" onClick={() => handleReply(t.id)}>
                        Enviar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
