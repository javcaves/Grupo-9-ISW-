import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { loginUser } = useAuth();
  // 🌟 CAMBIO: De email pasamos a identifier
  const [identifier, setIdentifier] = useState(""); 
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 🌟 CAMBIO: Enviamos 'identifier' hacia el backend
        body: JSON.stringify({ identifier, password }), 
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        loginUser(data.user);
      } else {
        setError(data.detail || data.message || "Credenciales incorrectas");
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor. Inténtalo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-slate-200/60">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-950 tracking-tight">CleanAdmin</h2>
          <p className="mt-2 text-sm text-slate-500">Ingresa tus datos para acceder al panel</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 🌟 CAMBIO VISUAL: Input adaptado para recibir Correo o RUT */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1.5">
              Correo Electrónico o RUT
            </label>
            <input
              type="text" // 🌟 IMPORTANTE: Cambiado a text para soportar letras (como la 'K' del RUT)
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-transparent px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              placeholder="juan.perez@empresa.cl o 12345678-K"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-transparent px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-sky-600 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

      </div>
    </div>
  );
}