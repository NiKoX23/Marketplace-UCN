import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Componentes/Paginas/Login";
import Inicio from "./Componentes/Paginas/Inicio";
import AuthCallback from "./Componentes/Paginas/AuthCallback";
import SubirArchivo from "./Componentes/Publicaciones/SubirArchivo";
import AdminPanel from "./Componentes/Admin/AdminPanel";
import AdminRoute from "./Componentes/Auth/AdminRoute";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/inicio" element={<Inicio />} />
                <Route path="/subirArchivo" element={<SubirArchivo />} />
                <Route path="/adminPanel" 
                    element={<AdminRoute>
                                <AdminPanel />
                             </AdminRoute>}/>
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;