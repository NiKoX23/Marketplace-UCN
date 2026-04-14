import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Inicio from "./Inicio";
import Registro from "./Registro";
import AuthCallback from "./AuthCallback";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/inicio" element={<Inicio />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;