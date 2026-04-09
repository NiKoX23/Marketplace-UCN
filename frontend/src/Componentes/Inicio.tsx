import { useState } from "react";
import "../Css/BarraLateral.css";
import "primeicons/primeicons.css";

function Inicio() {
    const [abrirBarra, setAbrirBarra] = useState(false);
    const [abrirPerfil, setAbrirPerfil] = useState(false);

    return (
        <div className="inicio">
            <header className="headerBarraLateral">
                <div className="izquierda">
                    <button className="botonMenu" onClick={() => setAbrirBarra(!abrirBarra)}> 
                        <i className="pi pi-bars" style={{ fontSize: "1.25rem" }}></i>
                        <p style={{color:"#ebebeb"}}>Servidores</p>
                    </button>
                </div>

                <div className="derecha">
                    <button className={`botonPerfil ${abrirPerfil ? "activo" : ""}`} onClick={() => setAbrirPerfil(!abrirPerfil)}> 
                        <i className="pi pi-user" style={{ fontSize: "1.5rem" }}></i>
                        <p style={{color:"#ebebeb"}}>Perfil</p>
                    </button>
                </div>
            </header>

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