import LogoGoogle from "../assets/LogoGoogle.png";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Divider } from "primereact/divider";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Css/Login.css";

function Login() {
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const [rut, setRut] = useState("");
  const [contraseña, setContraseña] = useState("");
  const navigate = useNavigate();

  const login= async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({rut, contraseña})
      });

      const data = await response.json();
      if (data.ok) {
        localStorage.setItem("accessToken", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        navigate("/inicio");
      }else {
        console.log("RUT o contraseña incorrectos");
      }

    }catch (error) {
      console.error("Error en el login:", error);
    }
  }
  console.log("render");

  return(
    <div className="pagina-login">
      <div className="login">
        <header className="login-header">
          <h1>Iniciar Sesión</h1>
          <p>Ingresa tus datos para continuar</p>
        </header>

        <div className="formulario">
          <form onSubmit={login}>
            <InputText className="input" 
                      placeholder="RUT"
                      value={rut} onChange={(e) => setRut(e.target.value)} />
            <div className="password-container">
              <InputText
                type={mostrarContraseña ? "text" : "password"}
                className="input"
                placeholder="Contraseña"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
              />
              <i 
                className={`pi ${mostrarContraseña ? "pi-eye-slash" : "pi-eye"} password-icon`}
                onClick={() => setMostrarContraseña(!mostrarContraseña)}
              ></i>
              
            </div>
            <Button type="submit" label="Iniciar Sesión" className="p-button-outlined boton-iniciarSesion" aria-label="Iniciar Sesión" />
          </form>
        </div>

        <Divider className="divider"></Divider>

        <Button type="submit"className="p-button-outlined boton-google" aria-label="Google">
          <img alt="logo" src={LogoGoogle} className="google-icon" />
          <span className="google-text">Continuar con Google</span>
        </Button>
        
      </div>
    </div>

  )
} 

export default Login;