import React, { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import "../../Styles/PerfilPanel.css";

interface PerfilPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const PerfilPanel: React.FC<PerfilPanelProps> = ({ isOpen, onClose }) => {
    const [perfil, setPerfil] = useState<any>(null);
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen && !perfil) {
            setCargando(true);
            const token = localStorage.getItem("accessToken");
            fetch("http://localhost:3000/auth/perfil", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            .then(res => res.json())
            .then(data => {
                if(data.ok) {
                    setPerfil(data.usuario);
                }
            })
            .catch(console.error)
            .finally(() => setCargando(false));
        }
    }, [isOpen, perfil]);

    const handleCerrarSesion = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/");
    };

    return (
        <>
            {isOpen && <div className="perfil-overlay" onClick={onClose}></div>}
            <div className={`perfil-lateral ${isOpen ? "activa" : ""}`}>
                <div className="perfil-header">
                    <h2>Mi Perfil</h2>
                    <Button icon="pi pi-times" className="close-btn" onClick={onClose} />
                </div>
                
                <div className="perfil-content">
                    {cargando ? (
                        <p style={{color: "white"}}>Cargando...</p>
                    ) : perfil ? (
                        <div className="info-usuario">
                            <div className="avatar-placeholder">
                                <i className="pi pi-user" style={{fontSize: "3rem"}}></i>
                            </div>
                            <h3>{perfil.nombre} {perfil.apellido}</h3>
                            <p className="username-tag">{perfil.username}</p>
                            <p className="correo-tag">{perfil.email}</p>
                        </div>
                    ) : (
                        <p style={{color: "white"}}>Error al cargar el perfil</p>
                    )}
                </div>

                <div className="perfil-acciones">
                    <Button label="Volver a Inicio"
                            icon="pi pi-home" 
                            className="action-btn"
                            onClick={() => { navigate("/inicio"); onClose(); }} />

                    <Button label="Configuración"
                            icon="pi pi-cog" 
                            className="action-btn" />
                    <Button label="Cerrar Sesión" 
                            icon="pi pi-sign-out" 
                            className="action-btn logout" 
                            onClick={handleCerrarSesion} />
                </div>
            </div>
        </>
    );
};

export default PerfilPanel;
