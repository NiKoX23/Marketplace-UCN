import { useEffect, useState } from "react";

const API_URL = "http://localhost:3000";

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

function Publicaciones() {
    const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchdata = async () => {
            try {
                const response = await fetch(`${API_URL}/publicaciones`);
                if (!response.ok) { throw new Error("Error al cargar publicaciones"); }
                const data = await response.json();
                setPublicaciones(data ?? []); 

            }catch (error) { console.error("Error al cargar publicaciones:", error); }
            finally { setLoading(false); }
        };
        fetchdata();
    }, []);

    if(loading) { return <p style={{color: "white"}}>Cargando publicaciones...</p>; }

    return (
        <div style= {{padding: "20px", color: "white"}}>
            <h2>Publicaciones</h2>

            {publicaciones.length === 0 ? (
                <p>No hay publicaciones disponibles.</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {publicaciones.map((pub) => (
                        <div key={pub.id} style={{background: "#1e293b",padding: "15px",borderRadius: "10px",}}>
                            <h3>{pub.titulo}</h3>
                            <p>{pub.comentario}</p>

                            <p style={{fontSize: "12px", opacity:"0.7"}}>
                                Archivo: {" "}
                                <a href={pub.fileUrl} target="_blank" rel="noreferrer" style={{color: "#60a5fa"}}>
                                    {pub.fileName}
                                </a>
                            </p>

                            <p style={{fontSize: "14px", fontWeight: "bold", color: "#a78bfa"}}>Usuario: {pub.usuario?.username || pub.usuarioId}</p>
                            <p style={{fontSize: "12px", opacity:"0.5"}}>{new Date(pub.creadoEn).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


export default Publicaciones;