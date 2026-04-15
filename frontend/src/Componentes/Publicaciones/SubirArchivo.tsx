import React, { useState } from "react";
import Publicaciones from "./Publicaciones";
import "../../Styles/SubirArchivo.css";

function SubirArchivo() {
    const [titulo, setTitulo] = useState("");
    const [comentario, setComentario] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const API = "http://localhost:3000";

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
        <div>
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
        </div>
    )
}

export default SubirArchivo;