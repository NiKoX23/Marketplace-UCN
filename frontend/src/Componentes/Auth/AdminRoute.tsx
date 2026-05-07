import { Navigate } from "react-router-dom";

interface Props {
    children: React.ReactNode;
}

function AdminRoute({children}: Props){
    const token = localStorage.getItem("accessToken");

    if(!token) { return <Navigate to="/"/>;}

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if(payload.rol !== "admin"){
            return <Navigate to="/"/>;
        }

        return children;

    }catch {
        return <Navigate to="/"/>;
    }
}

export default AdminRoute;