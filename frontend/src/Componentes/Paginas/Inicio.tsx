import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatPanel from "../Chat/ChatPanel";
import PerfilPanel from "../Perfil/PerfilPanel";
import AdminPanel from "../Admin/AdminPanel";
import Publicaciones from "../Publicaciones/Publicaciones";
import "../../Styles/BarraLateral.css";
import "primeicons/primeicons.css";

function Inicio() {
    const [abrirBarra, setAbrirBarra] = useState(false);
    const [abrirPerfil, setAbrirPerfil] = useState(false);
    const [abrirChat, setAbrirChat] = useState(false);
    const navigate = useNavigate();
    const getRutFromToken = () => {
        const token = localStorage.getItem("accessToken");
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.rut ?? payload.email ?? "desconocido";
        } catch {
            return null;
        }
    };

    const isAdmin = getRutFromToken() === "admin";
    
    return (
        <div className="inicio">
            <header className="headerBarraLateral">
                <div className="izquierda">
                    <button className="botonMenu" onClick={() => setAbrirBarra(!abrirBarra)}> 
                        <i className="pi pi-bars" style={{ fontSize: "1.25rem" }}></i>
                        <p style={{color:"#ebebeb"}}>Servidores</p>
                    </button>
                </div>

                <div className="derecha" style={{ display: "flex", gap: "10px" }}>
                    <button className={`botonSubirArchivo ${abrirChat ? "activo" : ""}`} onClick={() => navigate("/subirArchivo")}>
                        <i className="pi pi-upload" style={{ fontSize: "1.5rem" }}></i>
                        <p style={{color:"#ebebeb"}}>Subir Archivo</p>
                    </button>
                    
                    <button className={`botonChat ${abrirChat ? "activo" : ""}`} onClick={() => setAbrirChat(!abrirChat)}> 
                        <i className="pi pi-comments" style={{ fontSize: "1.5rem" }}></i>
                        <p style={{color:"#ebebeb"}}>Chat</p>
                    </button>

                    <button className={`botonPerfil ${abrirPerfil ? "activo" : ""}`} onClick={() => setAbrirPerfil(!abrirPerfil)}> 
                        <i className="pi pi-user" style={{ fontSize: "1.5rem" }}></i>
                        <p style={{color:"#ebebeb"}}>Perfil</p>
                    </button>
                </div>
            </header>

            <ChatPanel isOpen={abrirChat} onClose={() => setAbrirChat(false)} />
            <PerfilPanel isOpen={abrirPerfil} onClose={() => setAbrirPerfil(false)} />

            <main style={{ padding: "80px 20px 20px" }}>
                <h2 style={{color: "white"}}>Bienvenido al Marketplace</h2>
                {isAdmin ? (
                    <AdminPanel />
                ): (
                    <Publicaciones />
                )}
            </main>
                <div className={`barra-lateral ${abrirBarra ? "activa" : ""}`}>
                    <h2>Canales</h2>
                    <ul>
                        <li>Ingeniería de Software</li>
                        <li>Calculo II</li>
                        <li>Álgebra I</li>
                        <li>POO</li>
                    </ul>
                </div>
        </div>
    )
}
export default Inicio;