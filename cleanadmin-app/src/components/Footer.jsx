// src/components/Footer.jsx
import React, { useState } from "react";
import { Modal } from "./Modal";
import { Linkedin, Github, Star, Users, Code2 } from "lucide-react";

const ANIO = new Date().getFullYear();

/**
 * ─────────────────────────────────────────────────────────────────────────
 * EQUIPO DE DESARROLLO
 * ─────────────────────────────────────────────────────────────────────────
 * Para cada persona:
 *  - foto:    ruta de la imagen en /public (ej. "/CB_perfil.png"). Deja null
 *             si aún no la subes -> se muestra un avatar con las iniciales.
 *  - icono:   "star" para usar una estrella en vez de foto (lo pidió Amasis).
 *             Deja null para comportamiento normal (foto o iniciales).
 *  - linkedin / github: pega la URL cuando la tengas. Si está en null, el
 *             botón aparece igual pero deshabilitado ("próximamente").
 *
 * >> Sube las fotos a la carpeta public/ del frontend y referencia el nombre
 *    con "/" delante (ej. public/CB_perfil.png  ->  foto: "/CB_perfil.png").
 */
const DESARROLLADORES = [
  {
    nombre: "Carlos Bustos",
    rol: "Desarrollador Fullstack",
    modulo: "Manejo de vistas. Módulo de sesión, seguridad y correcciones (fixes).",
    foto: "/CB_perfil.png",
    icono: null,
    linkedin: "https://www.linkedin.com/in/carlos-bustos-anriquez/",
    github: "https://github.com/ZakiumyI",
  },
  {
    nombre: "Javiera Cuevas",
    rol: "Desarrolladora Fullstack",
    modulo: "Módulo de Inventario.",
    foto: null,
    icono: null,
    linkedin: null,
    github: null,
  },
  {
    nombre: "Fernanda Fernandez",
    rol: "Desarrolladora Fullstack",
    modulo: "Módulo de Actividades y vinculación con turnos.",
    foto: null,
    icono: null,
    linkedin: null,
    github: null,
  },
  {
    nombre: "Amasis Guzman",
    rol: "Desarrollador Fullstack",
    modulo: "Módulo de Turnos y Asistencias.",
    foto: null,
    icono: "star",
    linkedin: "https://www.linkedin.com/in/amasisg/",
    github: "https://github.com/ElfoAlienigena",
  },
  {
    nombre: "Antonia Peña",
    rol: "Desarrolladora Fullstack",
    modulo: "Módulo de personal y RRHH.",
    foto: null,
    icono: null,
    linkedin: null,
    github: null,
  },
];

function iniciales(nombre) {
  const partes = String(nombre).trim().split(/\s+/);
  const primera = partes[0]?.[0] ?? "";
  const segunda = partes[1]?.[0] ?? "";
  return (primera + segunda).toUpperCase();
}

function Avatar({ dev }) {
  const base = "w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center overflow-hidden";

  if (dev.icono === "star") {
    return (
      <div className={`${base} text-white`} style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}>
        <Star size={28} fill="currentColor" />
      </div>
    );
  }

  if (dev.foto) {
    return (
      <div className={base}>
        <img
          src={dev.foto}
          alt={dev.nombre}
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      </div>
    );
  }

  return (
    <div className={`${base} text-white font-bold text-lg`} style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}>
      {iniciales(dev.nombre)}
    </div>
  );
}

function BotonSocial({ url, icon: Icon, label, hoverColor }) {
  const claseBase = "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors";

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${claseBase} text-slate-700 border-slate-200 bg-white hover:text-white ${hoverColor}`}
      >
        <Icon size={14} /> {label}
      </a>
    );
  }

  return (
    <button
      type="button"
      disabled
      title="Próximamente"
      className={`${claseBase} text-slate-400 border-slate-200 bg-slate-50 cursor-not-allowed`}
    >
      <Icon size={14} /> {label}
    </button>
  );
}

function TarjetaDev({ dev }) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center gap-3">
        <Avatar dev={dev} />
        <div className="min-w-0">
          <h4 className="font-semibold text-slate-800 leading-tight">{dev.nombre}</h4>
          <p className="text-xs font-medium text-violet-600 mt-0.5">{dev.rol}</p>
        </div>
      </div>

      <p className="text-sm text-slate-500 leading-snug">{dev.modulo}</p>

      <div className="flex gap-2 mt-auto">
        <BotonSocial url={dev.linkedin} icon={Linkedin} label="LinkedIn" hoverColor="hover:bg-[#0a66c2] hover:border-[#0a66c2]" />
        <BotonSocial url={dev.github} icon={Github} label="GitHub" hoverColor="hover:bg-slate-800 hover:border-slate-800" />
      </div>
    </div>
  );
}

export default function Footer({ className = "" }) {
  const [equipoAbierto, setEquipoAbierto] = useState(false);

  return (
    <footer className={`w-full border-t border-slate-200/70 bg-white/40 backdrop-blur-sm ${className}`}>
      <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        {/* Copyright */}
        <p className="text-xs text-slate-500 order-3 md:order-1">
          © {ANIO} CleanAdmin. Todos los derechos reservados.
        </p>

        {/* Enlaces legales / contacto (agrega los href reales más adelante) */}
        <nav className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 order-2">
          <a href="#" className="hover:text-violet-600 transition-colors">Política de privacidad y cookies</a>
          <span className="text-slate-300">·</span>
          <a href="#" className="hover:text-violet-600 transition-colors">Contacto</a>
          <span className="text-slate-300">·</span>
          <a href="#" className="hover:text-violet-600 transition-colors">Términos y condiciones</a>
        </nav>

        {/* Botón Desarrolladores */}
        <button
          type="button"
          onClick={() => setEquipoAbierto(true)}
          className="order-1 md:order-3 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-200 hover:bg-violet-100 transition-colors shrink-0"
        >
          <Users size={14} /> Desarrolladores
        </button>
      </div>

      <Modal
        isOpen={equipoAbierto}
        onClose={() => setEquipoAbierto(false)}
        title="Equipo de desarrollo"
        variant="wide"
      >
        <div className="mb-5 flex items-center gap-2 text-sm text-slate-500">
          <Code2 size={16} className="text-violet-500" />
          <span>Grupo 9 — ISW. Estas son las personas detrás de CleanAdmin y los módulos que trabajó cada una.</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {DESARROLLADORES.map((dev) => (
            <TarjetaDev key={dev.nombre} dev={dev} />
          ))}
        </div>
      </Modal>
    </footer>
  );
}
