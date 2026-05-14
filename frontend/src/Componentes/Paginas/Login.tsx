import LogoGoogle from "../../assets/LogoGoogle.png";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../Styles/Login.css";

const API = "http://172-16-13-104.nip.io:3000/auth";

function Login() {
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const loginGoogle = () => {
    window.location.href = `${API}/google`;
  };

  useEffect(()=> {
    const params = new URLSearchParams(location.search);
    const errorParams = params.get("error");

    if(errorParams){navigate("/", { replace:true })}
    if(errorParams === "dominio_no_permitido"){ setError("Fallo en el correo"); }
    else if(errorParams === "google_auth_failed") { setError("Error al iniciar sesion con google"); }
  },[]);

  return (
    <div className="pagina-login">
      <div className="login">
        <header className="login-header">
          <h1>Iniciar Sesión</h1>
          <p>Ingresa tus datos para continuar</p>
        </header>
        
        {error && (
          <p className="error-mensaje">
            <span>
              <i className="pi pi-times"></i>
            </span>
            {error}
          </p>
        )}
        <Divider className="divider" />

        <Button
          type="button"
          className="p-button-outlined boton-google"
          onClick={loginGoogle}
          aria-label="Google"
        >
          <img alt="logo" src={LogoGoogle} className="google-icon" />
          <span className="google-text">Continuar con Google</span>
        </Button>
      </div>
    </div>
  );
}

export default Login;