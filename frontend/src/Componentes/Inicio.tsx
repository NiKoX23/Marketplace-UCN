import { useState } from "react";
import ChatPanel from "./ChatPanel";
import AdminPanel from "./AdminPanel";
import Publicaciones from "./Publicaciones";
import "../Css/BarraLateral.css";
import "primeicons/primeicons.css";

const API = "http://localhost:3000";

function Inicio() {
    const [abrirBarra, setAbrirBarra] = useState(false);
    const [abrirPerfil, setAbrirPerfil] = useState(false);
    const [abrirChat, setAbrirChat] = useState(false);
    const [titulo, setTitulo] = useState("");
    const [comentario, setComentario] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

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

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!file || !titulo || !comentario) {
            alert("Por favor, completar todos los campos.");
            return;
        }

        const token = localStorage.getItem("accessToken");
        const formData = new FormData();
        formData.append("file", file);
        formData.append("titulo", titulo);
        formData.append("comentario", comentario);

        try {
            setLoading(true);
            const res = await fetch(`${API}/publicaciones`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            if (!res.ok) { throw new Error("Error upload"); }

            setTitulo("");
            setComentario("");
            setFile(null);
            alert("Publicación subida exitosamente!");

        } catch (error) {
            console.error(error);
            alert("Error al subir la publicación");

        } finally { setLoading(false); }
    };
    

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
                {isAdmin ? (
                    <AdminPanel />
                ): (
                    <>
                        <h2>Bienvenido al Marketplace</h2>
                        <form onSubmit={handleUpload} style={{marginBottom: "30px"}}>
                            <input 
                                placeholder="Título"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                style={{display: "block", marginBottom:"10px"}}
                            />
                            <textarea 
                                placeholder="Comentario"
                                value={comentario}
                                onChange={(e) => setComentario(e.target.value)}
                                style={{display: "block", marginBottom:"10px"}}
                            />

                            <input 
                                type="file"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                style={{display: "block", marginBottom:"10px"}}
                            />

                            <button type="submit" disabled={loading}>{loading ? "Subiendo..." : "Subir publicación"}</button>
                        </form>

                        <Publicaciones />
                    </>
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