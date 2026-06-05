import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FaLayerGroup, FaShieldHalved, FaChartLine, FaUsers, FaBoxesStacked, FaEnvelope, FaLock, FaRightToBracket } from "react-icons/fa6";
import { FaGoogle, FaMicrosoft } from "react-icons/fa";

export default function Login() {
  const { loginUser } = useAuth();
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#f8fafc] via-[#eef2ff] to-[#f1f5f9] relative overflow-hidden font-sans text-[#0f172a]">
      
      {/* Background Orbs */}
      <div className="absolute w-[250px] h-[250px] bg-[#7c3aed] rounded-full blur-[80px] opacity-40 -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-[200px] h-[200px] bg-[#3b82f6] rounded-full blur-[80px] opacity-40 -bottom-16 -right-16 pointer-events-none" />

      {/* Login Wrapper - Ajustado ligeramente el tamaño */}
      <div className="w-full max-w-[1100px] grid lg:grid-cols-[1fr_480px] bg-white/70 border border-white/60 rounded-[28px] shadow-[0_15px_40px_rgba(15,23,42,0.08)] backdrop-blur-2xl overflow-hidden relative z-10">
        
        {/* Left Panel */}
        <section className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#7c3aed] via-[#6d28d9] to-[#3b82f6] text-white relative overflow-hidden">
          <div className="absolute w-[400px] h-[400px] rounded-full bg-white/10 -top-[150px] -right-[100px]" />
          <div className="absolute w-[250px] h-[250px] rounded-full bg-white/5 -bottom-[100px] -left-[50px]" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-[16px] bg-white/15 backdrop-blur-md flex items-center justify-center text-xl">
              <FaLayerGroup />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">CleanAdmin</h1>
              <span className="opacity-80 text-sm">Enterprise Platform</span>
            </div>
          </div>

          <div className="relative z-10">
            <h2 className="text-[2.6rem] font-extrabold leading-[1.1] mb-5">Administra tu empresa de forma inteligente.</h2>
            <p className="text-base opacity-80 leading-7 max-w-[450px]">Controla usuarios, inventarios, permisos y reportes desde una plataforma moderna, segura y diseñada para alto rendimiento empresarial.</p>
            
            <div className="grid grid-cols-2 gap-3 mt-8">
              {[
                { icon: FaShieldHalved, title: "Seguridad Avanzada" },
                { icon: FaChartLine, title: "Analíticas" },
                { icon: FaUsers, title: "Gestión de Personal" },
                { icon: FaBoxesStacked, title: "Inventario" }
              ].map((f, i) => (
                <div key={i} className="p-4 rounded-[18px] bg-white/10 border border-white/10 backdrop-blur-md hover:bg-white/15 transition-all cursor-pointer">
                  <f.icon className="text-lg mb-2" />
                  <h4 className="font-semibold text-sm">{f.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Panel */}
        <section className="p-10 sm:p-12 bg-white/78 backdrop-blur-xl flex flex-col justify-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-2">Bienvenido de nuevo</h3>
            <p className="text-sm text-[#64748b]">Ingresa tus credenciales para acceder al panel administrativo.</p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-red-50 text-red-600 text-sm rounded-[14px] border border-red-100 font-medium">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="font-semibold text-xs text-[#334155]">Correo electrónico o RUT</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                <input 
                  type="text" required value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-sm rounded-[14px] border border-[#0f172a]/10 bg-white focus:ring-4 focus:ring-[#7c3aed]/10 focus:border-[#7c3aed] transition-all outline-none" 
                  placeholder="correo@empresa.cl" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-xs text-[#334155]">Contraseña</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                <input 
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-sm rounded-[14px] border border-[#0f172a]/10 bg-white focus:ring-4 focus:ring-[#7c3aed]/10 focus:border-[#7c3aed] transition-all outline-none" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-xs font-semibold">
              <label className="flex items-center gap-2 text-[#475569]"><input type="checkbox" className="w-3.5 h-3.5 accent-[#7c3aed]" /> Recordarme</label>
              <a href="#" className="text-[#7c3aed]">¿Olvidaste tu contraseña?</a>
            </div>

            <button 
              disabled={loading}
              className="w-full py-3 rounded-[16px] bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] text-white font-bold flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(124,58,237,0.2)] hover:-translate-y-0.5 transition-all disabled:opacity-70"
            >
              <FaRightToBracket /> {loading ? "Procesando..." : "Iniciar Sesión"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6 text-[#94a3b8] text-xs before:flex-1 before:h-px before:bg-[#0f172a]/10 after:flex-1 after:h-px after:bg-[#0f172a]/10">
            o continúa con
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button type="button" className="flex items-center justify-center gap-2 py-3 rounded-[14px] border border-[#0f172a]/10 bg-white text-sm font-semibold hover:shadow-md transition-all">
              <FaGoogle /> Google
            </button>
          </div>

          <p className="mt-7 text-center text-sm text-[#64748b]">¿No tienes cuenta? <a href="#" className="text-[#7c3aed] font-bold">Solicitar acceso</a></p>
        </section>
      </div>
    </div>
  );
}