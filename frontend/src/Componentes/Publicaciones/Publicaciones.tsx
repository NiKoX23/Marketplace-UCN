import { useEffect, useState } from "react";

const API_URL = "http://172-16-13-104.nip.io:3000";

interface Publicacion {
    id: string;
    titulo: string;
    comentario: string;
    fileUrl: string;
    fileName: string;
    usuarioId: string;
    usuario?: { username: string };
    creadoEn: string;
}

function FilePreview({ pub }: { pub: Publicacion }) {
    const [showPreview, setShowPreview] = useState(false);
    const isImage = pub.fileName?.match(/\.(jpeg|jpg|png|gif)$/i);
    const isPdf = pub.fileName?.match(/\.pdf$/i);

    return (
        <div style={{ marginTop: "10px" }}>
            <p style={{ fontSize: "12px", opacity: "0.7", display: "flex", alignItems: "center", gap: "10px" }}>
                Archivo:
                {(isImage || isPdf) ? (
                    <>
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            style={{ padding: "5px 10px", cursor: "pointer", background: "#3b82f6", color: "white", border: "none", borderRadius: "5px" }}
                        >
                            {showPreview ? "Ocultar vista previa" : "Ver archivo"}
                        </button>
                        <a href={pub.fileUrl} download={pub.fileName} target="_blank" rel="noreferrer" style={{ padding: "5px 10px", cursor: "pointer", background: "#10b981", color: "white", border: "none", borderRadius: "5px", textDecoration: "none" }}>
                            Descargar
                        </a>
                    </>
                ) : (
                    <a href={pub.fileUrl} download={pub.fileName} target="_blank" rel="noreferrer" style={{ padding: "5px 10px", cursor: "pointer", background: "#10b981", color: "white", border: "none", borderRadius: "5px", textDecoration: "none" }}>
                        Descargar
                    </a>
                )}
            </p>
            {showPreview && isImage && (
                <img src={pub.fileUrl} alt={pub.fileName} style={{ maxWidth: "100%", maxHeight: "400px", borderRadius: "10px", marginTop: "10px" }} />
            )}
            {showPreview && isPdf && (
                <iframe src={pub.fileUrl} width="100%" height="500px" style={{ border: "none", borderRadius: "10px", marginTop: "10px" }} title={pub.fileName} />
            )}
        </div>
    );
}

interface Comentario {
    id: string;
    texto: string;
    usuario: string;
    fecha: string;
}

function HiloComentarios({ pubId, idioma }: { pubId: string; idioma: string }) {
    const [comentarios, setComentarios] = useState<Comentario[]>([]);
    const [nuevoComentario, setNuevoComentario] = useState("");

    const t: any = {
        es: { com: "Comentarios", seElPrimero: "Sé el primero en comentar.", escribe: "Escribe un comentario...", btn: "Comentar" },
        en: { com: "Comments", seElPrimero: "Be the first to comment.", escribe: "Write a comment...", btn: "Comment" }
    }[idioma] || { com: "Comentarios", seElPrimero: "Sé el primero en comentar.", escribe: "Escribe un comentario...", btn: "Comentar" };

    useEffect(() => {
        // TODO: GET /publicaciones/:id/comentarios cuando el backend lo implemente
        setComentarios([]);
    }, [pubId]);

    const agregarComentario = async () => {
        if (!nuevoComentario.trim()) return;
        const nuevo = {
            id: Date.now().toString(),
            texto: nuevoComentario,
            usuario: "UsuarioActual", // TODO: extraer del token JWT
            fecha: new Date().toLocaleString()
        };
        // TODO: POST /publicaciones/:id/comentarios cuando el backend lo implemente
        setComentarios([...comentarios, nuevo]);
        setNuevoComentario("");
    };

    return (
        <div style={{ marginTop: "20px", borderTop: "1px solid #334155", paddingTop: "15px" }}>
            <h4 style={{ color: "#cbd5e1", marginBottom: "10px" }}>{t.com}</h4>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "15px" }}>
                {comentarios.length === 0 ? (
                    <p style={{ fontSize: "12px", color: "#64748b" }}>{t.seElPrimero}</p>
                ) : (
                    comentarios.map(c => (
                        <div key={c.id} style={{ background: "#0f172a", padding: "10px", borderRadius: "8px" }}>
                            <p style={{ fontSize: "12px", color: "#a78bfa", fontWeight: "bold", marginBottom: "5px" }}>
                                @{c.usuario} <span style={{ color: "#64748b", fontWeight: "normal", marginLeft: "10px" }}>{c.fecha}</span>
                            </p>
                            <p style={{ fontSize: "14px", color: "#e2e8f0", margin: 0 }}>{c.texto}</p>
                        </div>
                    ))
                )}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
                <input
                    type="text"
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                    placeholder={t.escribe}
                    style={{ flex: 1, padding: "8px", borderRadius: "5px", border: "1px solid #475569", background: "#1e293b", color: "white" }}
                    onKeyDown={(e) => { if (e.key === 'Enter') agregarComentario(); }}
                />
                <button
                    onClick={agregarComentario}
                    style={{ background: "#3b82f6", color: "white", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: "pointer" }}
                >
                    {t.btn}
                </button>
            </div>
        </div>
    );
}

function Publicaciones({ idioma = "es", isDarkMode = true, selectedCanal= null }:
                       { idioma?: string; isDarkMode?: boolean; selectedCanal?: number | null }) {
    const t: any = {
        es: { cargando: "Cargando publicaciones...", sinPubs: "No hay publicaciones disponibles.", pubs: "Publicaciones", usuario: "Usuario" },
        en: { cargando: "Loading posts...", sinPubs: "No posts available.", pubs: "Posts", usuario: "User" }
    }[idioma] || { cargando: "Cargando publicaciones...", sinPubs: "No hay publicaciones disponibles.", pubs: "Publicaciones", usuario: "Usuario" };

    const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchdata = async () => {
            try {
                const endpoint = selectedCanal ? `${API_URL}/publicaciones/canal/${selectedCanal}` : `${API_URL}/publicaciones`
                const response = await fetch(endpoint, { credentials: "include" });
                if (!response.ok) { throw new Error("Error al cargar publicaciones"); }
                const data = await response.json();
                setPublicaciones(data ?? []);
            } catch (error) { console.error("Error al cargar publicaciones:", error); }
            finally { setLoading(false); }
        };
        fetchdata();
    }, [selectedCanal]);

    if (loading) { return <p style={{ color: isDarkMode ? "white" : "black" }}>{t.cargando}</p>; }

    return (
        <div style={{ padding: "20px", color: isDarkMode ? "white" : "black" }}>
            <h2>{t.pubs}</h2>

            {publicaciones.length === 0 ? (
                <p>{t.sinPubs}</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {publicaciones.map((pub) => (
                        <div id={`pub-${pub.id}`} key={pub.id} style={{ background: isDarkMode ? "#1e293b" : "#f1f5f9", padding: "15px", borderRadius: "10px", border: isDarkMode ? "none" : "1px solid #cbd5e1" }}>
                            <h3 style={{ color: isDarkMode ? "white" : "black" }}>{pub.titulo}</h3>
                            <p style={{ color: isDarkMode ? "white" : "black" }}>{pub.comentario}</p>

                            <FilePreview pub={pub} />

                            <p style={{ fontSize: "14px", fontWeight: "bold", color: "#a78bfa" }}>{t.usuario}: {pub.usuario?.username || pub.usuarioId}</p>
                            <p style={{ fontSize: "12px", opacity: "0.5" }}>{new Date(pub.creadoEn).toLocaleDateString()}</p>

                            <HiloComentarios pubId={pub.id} idioma={idioma} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


export default Publicaciones;