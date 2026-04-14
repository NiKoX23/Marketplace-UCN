import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

/**
 * Página de callback para Google OAuth.
 * El backend redirige aquí con ?accessToken=...&refreshToken=...
 * Los guarda en localStorage y navega a /inicio.
 */
function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (accessToken && refreshToken) {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      navigate("/inicio", { replace: true });
    } else {
      // Si falta algún token, volver al login con mensaje de error
      navigate("/?error=google_auth_failed", { replace: true });
    }
  }, [params, navigate]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "radial-gradient(circle at top right, #1e293b, #0f172a)",
        color: "#f8fafc",
        flexDirection: "column",
        gap: "16px",
        fontFamily: "sans-serif",
      }}
    >
      <i className="pi pi-spin pi-spinner" style={{ fontSize: "2.5rem", color: "#60a5fa" }} />
      <p>Autenticando con Google...</p>
    </div>
  );
}

export default AuthCallback;
