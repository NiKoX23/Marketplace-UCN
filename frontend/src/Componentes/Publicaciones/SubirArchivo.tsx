import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../Styles/SubirArchivo.css";

function SubirArchivo() {
    const navigate = useNavigate();
    const [titulo, setTitulo] = useState("");
    const [comentario, setComentario] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const API = "http://localhost:3000";

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !titulo || !comentario) {
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
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Error upload"); 
            
            }

            setTitulo("");
            setComentario("");
            setFile(null);
            alert("Publicación subida exitosamente!");

        } catch (error: any) {
            alert(error instanceof Error ? error.message : "Error al subir la publicación");

        } finally { setLoading(false); }
    };

    return (
        <div className="container-subir-archivo">
            <h2 style={{ textAlign: "center", marginBottom: "5px", color: "white" }}>Sube tu archivo con nosotros</h2>
            <p style={{ textAlign: "center", marginBottom: "20px", color: "#94a3b8", fontSize: "14px" }}>No aceptamos archivos superiores a 10mb</p>
            <form onSubmit={handleUpload} style={{ marginBottom: "30px" }}>
                <input
                    placeholder="Título"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    style={{ display: "block", marginBottom: "10px" }}
                />
                <textarea
                    placeholder="Comentario"
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    style={{ display: "block", marginBottom: "10px" }}
                />

                <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    style={{ display: "block", marginBottom: "10px" }}
                />

                <button type="submit" disabled={loading}>{loading ? "Subiendo..." : "Subir publicación"}</button>
                <button
                    type="button"
                    onClick={() => navigate("/inicio")}
                    style={{ display: "block", marginTop: "15px", background: "#64748b", color: "white", padding: "10px", border: "none", borderRadius: "5px", cursor: "pointer", width: "100%" }}
                >
                    Volver a Inicio
                </button>
            </form>
        </div>
    )
}

export default SubirArchivo;