import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatPanel from "../Chat/ChatPanel";
import PerfilPanel from "../Perfil/PerfilPanel";
import Publicaciones from "../Publicaciones/Publicaciones";
import "../../Styles/Inicio.css";
import "primeicons/primeicons.css";

const traducciones: any = {
    es: {
        servidores: "Servidores",
        subirArchivo: "Subir Archivo",
        chat: "Chat",
        perfil: "Perfil",
        perfilAdmin: "Perfil Admin",
        bienvenido: "Bienvenido al Marketplace",
        canales: "Canales",
        ultimasOfertas: "Últimas ofertas",
        ingSoftware: "Ingeniería de Software",
        calculo: "Cálculo II",
        algebra: "Álgebra I",
        poo: "POO",
        claro: "Claro",
        oscuro: "Oscuro",
    },
    en: {
        servidores: "Servers",
        subirArchivo: "Upload File",
        chat: "Chat",
        perfil: "Profile",
        perfilAdmin: "Admin Profile",
        bienvenido: "Welcome to the Marketplace",
        canales: "Channels",
        ultimasOfertas: "Latest Offers",
        ingSoftware: "Software Engineering",
        calculo: "Calculus II",
        algebra: "Algebra I",
        poo: "OOP",
        claro: "Light",
        oscuro: "Dark",
    }
};

function Inicio() {
    const [abrirBarra, setAbrirBarra] = useState(false);
    const [abrirPerfil, setAbrirPerfil] = useState(false);
    const [abrirChat, setAbrirChat] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [idioma, setIdioma] = useState<"es" | "en">("es");
    const [ultimasOfertas, setUltimasOfertas] = useState<any[]>([]);
    const [canales, setCanales] = useState<any[]>([]);
    const [selectedCanal, setSelectedCanal] = useState<number | null>(null);
    const navigate = useNavigate();

    const t = traducciones[idioma];

    useEffect(() => {
        const fetchOfertas = async () => {
            try {
                const res = await fetch("http://172-16-13-104.nip.io:3000/publicaciones", { credentials: "include" });
                if (res.ok) {
                    const data = await res.json();
                    setUltimasOfertas(data.slice(0, 5));
                }
            } catch (e) {}
        };
        fetchOfertas();
    }, []);

    useEffect(() => {
        const fetchCanales = async () => {
            try {
                const res = await fetch("http://172-16-13-104.nip.io:3000/canales", { credentials: "include" });
                if(res.ok){
                    const data = await res.json();
                    setCanales(data);
                }
            }catch(e){console.log(e)}
        };

        fetchCanales();
    },[])

    const getPayloadFromToken = () => {
        const token = localStorage.getItem("accessToken");
        if (!token) return null;
        try {
            return JSON.parse(atob(token.split(".")[1]));
        } catch {
            return null;
        }
    };

    const payload = getPayloadFromToken();
    const isAdmin = payload?.rol === "admin";

    return (
        <div className={`inicio ${isDarkMode ? "" : "light"}`} style={{ background: "var(--background-color)", minHeight: "100vh", height: "auto" }}>
            <header className="headerBarraLateral">
                <div className="izquierda">
                    <button className="botonMenu" onClick={() => setAbrirBarra(!abrirBarra)}>
                        <i className="pi pi-bars" style={{ fontSize: "1.25rem" }}></i>
                        <p style={{ color: "var(--text-color)" }}>{t.servidores}</p>
                    </button>
                </div>

                <div className="derecha" style={{ display: "flex", gap: "10px" }}>
                    {/* Toggle de idioma */}
                    <button className="botonMenu" onClick={() => setIdioma(idioma === "es" ? "en" : "es")}>
                        <i className="pi pi-language" style={{ fontSize: "1.5rem" }}></i>
                        <p style={{ color: "var(--text-color)" }}>{idioma === "es" ? "EN" : "ES"}</p>
                    </button>

                    {/* Toggle de modo claro/oscuro */}
                    <button className="botonMenu" onClick={() => setIsDarkMode(!isDarkMode)}>
                        <i className={`pi ${isDarkMode ? "pi-sun" : "pi-moon"}`} style={{ fontSize: "1.5rem" }}></i>
                        <p style={{ color: "var(--text-color)" }}>{isDarkMode ? t.claro : t.oscuro}</p>
                    </button>

                    <button className={"botonSubirArchivo"} onClick={() => navigate("/subirArchivo")}>
                        <i className="pi pi-upload" style={{ fontSize: "1.5rem" }}></i>
                        <p style={{ color: "var(--text-color)" }}>{t.subirArchivo}</p>
                    </button>

                    <button className={`botonChat ${abrirChat ? "activo" : ""}`} onClick={() => setAbrirChat(!abrirChat)}>
                        <i className="pi pi-comments" style={{ fontSize: "1.5rem" }}></i>
                        <p style={{ color: "var(--text-color)" }}>{t.chat}</p>
                    </button>

                    {isAdmin && (
                        <button className="botonAdmin" onClick={() => navigate("/adminPanel")}>
                            <i className="pi pi-shield" style={{ fontSize: "1.5rem" }}></i>
                            <p style={{ color: "var(--text-color)" }}>{t.perfilAdmin}</p>
                        </button>
                    )}

                    <button className={`botonPerfil ${abrirPerfil ? "activo" : ""}`} onClick={() => setAbrirPerfil(!abrirPerfil)}>
                        <i className="pi pi-user" style={{ fontSize: "1.5rem" }}></i>
                        <p style={{ color: "var(--text-color)" }}>{t.perfil}</p>
                    </button>
                </div>
            </header>

            {abrirChat && (
                <>
                    <div className="chat-overlay" onClick={() => setAbrirChat(false)} />
                    <ChatPanel isOpen={abrirChat} onClose={() => setAbrirChat(false)} />
                </>
            )}

            <PerfilPanel isOpen={abrirPerfil} onClose={() => setAbrirPerfil(false)} />

            {/* Título justo debajo del header */}
            <div style={{ paddingTop: "80px", paddingLeft: "20px", paddingRight: "20px", width: "100%" }}>
                <h2 style={{ color: "var(--text-title-color)" }}>{t.bienvenido}</h2>
            </div>

            {/* Layout principal: publicaciones + aside */}
            <div style={{ display: "flex", margin: "0 20px 20px", width: "100%", boxSizing: "border-box" }}>
                <main style={{
                    flex: 1,
                    padding: "20px",
                    border: isDarkMode ? "1px solid #475569" : "1px solid #cbd5e1",
                    borderRadius: "8px",
                    marginRight: "20px",
                    background: isDarkMode ? "transparent" : "#ffffff"
                }}>
                    <Publicaciones idioma={idioma} isDarkMode={isDarkMode} selectedCanal={selectedCanal} />
                </main>

                {/* Panel de Últimas Ofertas */}
                <aside style={{
                    width: "280px",
                    flexShrink: 0,
                    padding: "20px",
                    border: isDarkMode ? "1px solid #475569" : "1px solid #cbd5e1",
                    borderRadius: "8px",
                    background: isDarkMode ? "#1e293b" : "#f1f5f9",
                    alignSelf: "flex-start"
                }}>
                    <h3 style={{ color: "var(--text-title-color)", marginBottom: "15px" }}>{t.ultimasOfertas}</h3>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {ultimasOfertas.length === 0 && (
                            <p style={{ fontSize: "12px", color: "#64748b" }}>Sin ofertas recientes.</p>
                        )}
                        {ultimasOfertas.map(oferta => (
                            <li key={oferta.id} style={{ marginBottom: "15px", borderBottom: "1px solid #334155", paddingBottom: "10px" }}>
                                <a href={`#pub-${oferta.id}`} style={{ textDecoration: "none", color: "#3b82f6", fontWeight: "bold", fontSize: "14px" }}>{oferta.titulo}</a>
                                <p style={{ fontSize: "12px", color: "#a78bfa", margin: "4px 0 0 0" }}>{oferta.usuario?.username || oferta.usuarioId}</p>
                                <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>{new Date(oferta.creadoEn).toLocaleDateString()}</p>
                            </li>
                        ))}
                    </ul>
                </aside>
            </div>

            {/* Barra lateral de canales */}
            {abrirBarra && (
                <div className="sidebar-overlay" onClick={()=>setAbrirBarra(false)}
                />
            )}
            
            <div className={`barra-lateral ${abrirBarra ? "activa" : ""}`}>
                <h2>{t.canales}</h2>
                <ul>
                    <li onClick={() => setSelectedCanal(null)} 
                        style={{cursor: "Pointer", fontWeight:selectedCanal === null ? "bold" : "normal"}}
                    >
                        Todos
                    </li>

                    {canales.map((canal) => (
                        <li key={canal.id}
                            onClick={() => setSelectedCanal(canal.id)}
                            style={{cursor: "Pointer", fontWeight:selectedCanal === canal.id ? "bold" : "normal"}}
                        >
                            {canal.nombre}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
export default Inicio;