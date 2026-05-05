import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Componentes/Paginas/Login";
import Inicio from "./Componentes/Paginas/Inicio";
import AuthCallback from "./Componentes/Paginas/AuthCallback";
import SubirArchivo from "./Componentes/Publicaciones/SubirArchivo";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/inicio" element={<Inicio />} />
                <Route path="/subirArchivo" element={<SubirArchivo />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;