import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../Styles/Login.css";
import "../../Styles/Registro.css";

const API = "http://localhost:3000/auth";

function Registro() {
  const [form, setForm] = useState({
    username: "",
    nombre: "",
    apellido: "",
    rut: "",
    email: "",
    password: "",
    confirmar: "",
  });
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const onChange = (campo: string, valor: string) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setError("");
  };

  const validar = (): boolean => {
    if (!form.username || !form.nombre || !form.apellido || !form.email || !form.password) {
      setError("Por favor completa todos los campos obligatorios.");
      return false;
    }
    if (form.password !== form.confirmar) {
      setError("Las contraseñas no coinciden.");
      return false;
    }
    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Ingresa un email válido.");
      return false;
    }
    return true;
  };

  const registrar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validar()) return;

    setCargando(true);
    try {
      const response = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          nombre: form.nombre,
          apellido: form.apellido,
          email: form.email,
          rut: form.rut || undefined,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        // Guardar tokens y redirigir
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        setExito(true);
        setTimeout(() => navigate("/inicio"), 1500);
      } else {
        setError(data.message ?? "Error al registrarse. Intenta de nuevo.");
      }
    } catch {
      setError("Error de conexión. Intenta más tarde.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="pagina-login">
      <div className="login registro-card">
        <header className="login-header">
          <h1>Crear Cuenta</h1>
          <p>Regístrate para acceder al Marketplace</p>
        </header>

        <div className="formulario">
          {exito ? (
            <div className="exito-mensaje">
              <i className="pi pi-check-circle" />
              <span>¡Cuenta creada! Redirigiendo...</span>
            </div>
          ) : (
            <form onSubmit={registrar}>
              <InputText
                className="input"
                placeholder="Nombre de Usuario (ej. @usuario_01) *"
                value={form.username}
                onChange={(e) => onChange("username", e.target.value)}
                required
              />

              <div className="fila-doble">
                <InputText
                  className="input"
                  placeholder="Nombre *"
                  value={form.nombre}
                  onChange={(e) => onChange("nombre", e.target.value)}
                  required
                />
                <InputText
                  className="input"
                  placeholder="Apellido *"
                  value={form.apellido}
                  onChange={(e) => onChange("apellido", e.target.value)}
                  required
                />
              </div>

              <InputText
                className="input"
                placeholder="RUT (opcional)"
                value={form.rut}
                onChange={(e) => onChange("rut", e.target.value)}
              />

              <InputText
                className="input"
                type="email"
                placeholder="Email *"
                value={form.email}
                onChange={(e) => onChange("email", e.target.value)}
                required
              />

              <div className="password-container">
                <InputText
                  type={mostrarPassword ? "text" : "password"}
                  className="input"
                  placeholder="Contraseña * (mín. 8 caracteres)"
                  value={form.password}
                  onChange={(e) => onChange("password", e.target.value)}
                  required
                />
                <i
                  className={`pi ${mostrarPassword ? "pi-eye-slash" : "pi-eye"} password-icon`}
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                />
              </div>

              <InputText
                type={mostrarPassword ? "text" : "password"}
                className="input"
                placeholder="Confirmar contraseña *"
                value={form.confirmar}
                onChange={(e) => onChange("confirmar", e.target.value)}
                required
              />

              {error && <p className="error-mensaje">{error}</p>}

              <Button
                type="submit"
                label={cargando ? "Registrando..." : "Crear Cuenta"}
                className="p-button-outlined boton-iniciarSesion"
                disabled={cargando}
              />
            </form>
          )}
        </div>

        <p className="link-registro">
          ¿Ya tienes cuenta?{" "}
          <Link to="/">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
}

export default Registro;
