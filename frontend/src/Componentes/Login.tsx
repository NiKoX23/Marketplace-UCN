import LogoGoogle from "../assets/LogoGoogle.png";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Divider } from "primereact/divider";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../Css/Login.css";

const API = "http://localhost:3000/auth";

function Login() {
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const response = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identificador, password }),
      });

      const data = await response.json();
      if (data.ok) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        navigate("/inicio");
      } else {
        setError("RUT/email o contraseña incorrectos");
      }
    } catch {
      setError("Error de conexión. Intenta más tarde.");
    } finally {
      setCargando(false);
    }
  };

  const loginGoogle = () => {
    window.location.href = `${API}/google`;
  };

  return (
    <div className="pagina-login">
      <div className="login">
        <header className="login-header">
          <h1>Iniciar Sesión</h1>
          <p>Ingresa tus datos para continuar</p>
        </header>

        <div className="formulario">
          <form onSubmit={login}>
            <InputText
              className="input"
              placeholder="RUT o Email"
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
              required
            />
            <div className="password-container">
              <InputText
                type={mostrarContraseña ? "text" : "password"}
                className="input"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <i
                className={`pi ${mostrarContraseña ? "pi-eye-slash" : "pi-eye"} password-icon`}
                onClick={() => setMostrarContraseña(!mostrarContraseña)}
              />
            </div>

            {error && <p className="error-mensaje">{error}</p>}

            <Button
              type="submit"
              label={cargando ? "Ingresando..." : "Iniciar Sesión"}
              className="p-button-outlined boton-iniciarSesion"
              disabled={cargando}
            />
          </form>
        </div>

        <p className="link-registro">
          ¿No tienes cuenta?{" "}
          <Link to="/registro">Regístrate aquí</Link>
        </p>

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