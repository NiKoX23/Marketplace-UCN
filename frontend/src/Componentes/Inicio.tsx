import { useState } from "react";
import "../Css/BarraLateral.css";
import "primeicons/primeicons.css";
import ChatPanel from "./ChatPanel";
import AdminPanel from "./AdminPanel";

function Inicio() {
    const [abrirBarra, setAbrirBarra] = useState(false);
    const [abrirPerfil, setAbrirPerfil] = useState(false);
    const [abrirChat, setAbrirChat] = useState(false);

    const getRutFromToken = () => {
        const token = localStorage.getItem("accessToken");
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.rut;
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

            <main style={{ padding: "80px 20px 20px" }}>
                {isAdmin ? <AdminPanel /> : <div style={{ color: "white", padding: "20px" }}>Bienvenido al Marketplace</div>}
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