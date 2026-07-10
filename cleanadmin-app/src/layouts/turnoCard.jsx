// layouts/turnoCard.jsx
import { Card } from '../components/Card.jsx';

export const TurnoCard = ({ turno, onEdit, onGenerarQr, onManageColaciones, onEliminar, tieneQrActivo = false }) => {
  const badgeActivo = (
    <span
      className="px-2.5 py-1 text-xs font-semibold rounded-full border"
      style={{
        background: "var(--turno-badge-bg)",
        color: "var(--turno-badge-text)",
        borderColor: "var(--turno-badge-border)",
      }}
    >
      Activo
    </span>
  );

  return (
    <Card
      title={turno.nombre ?? turno.descripcion?.split(' ').slice(0, 3).join(' ') ?? 'Turno sin título'}
      subtitle={`ID: #${turno.id_turno?.toString().slice(-4) ?? '—'}`}
      icon="fa-clock"
      headerAction={badgeActivo}
      className="rounded-2xl flex flex-col h-full"
    >
      <div className="flex flex-col flex-grow">

        {/* Descripción */}
        <p
          className="text-sm line-clamp-2 mb-4"
          style={{ color: "var(--turno-desc-text)" }}
        >
          {turno.descripcion || 'Sin descripción adicional.'}
        </p>

        {/* Bloque horario */}
        <div
          className="grid grid-cols-2 gap-3 p-3 rounded-xl text-sm mb-5"
          style={{
            background: "var(--turno-horario-bg)",
            border: "1px solid var(--turno-horario-border)",
          }}
        >
          <div>
            <span
              className="block text-xs font-medium uppercase mb-0.5"
              style={{ color: "var(--turno-horario-label)" }}
            >
              Ingreso
            </span>
            <span
              className="font-semibold"
              style={{ color: "var(--turno-horario-value)" }}
            >
              {turno.hora_ingreso ?? '—'} hrs
            </span>
          </div>
          <div>
            <span
              className="block text-xs font-medium uppercase mb-0.5"
              style={{ color: "var(--turno-horario-label)" }}
            >
              Salida
            </span>
            <span
              className="font-semibold"
              style={{ color: "var(--turno-horario-value)" }}
            >
              {turno.hora_salida ?? '—'} hrs
            </span>
          </div>
        </div>

        <div className="mt-auto space-y-2">
          <button
            onClick={() => onGenerarQr?.(turno, 'ENTRADA')}
            className="w-full py-2 text-sm font-medium rounded-xl transition-colors duration-200 focus:outline-none"
            style={{
              color: "#fff",
              background: tieneQrActivo
                ? "linear-gradient(135deg,#7c3aed,#3b82f6)"
                : "linear-gradient(135deg,#7c3aed,#3b82f6)",
            }}
          >
            {tieneQrActivo ? "ⓘ Ver QR de Entrada" : "⛶ Generar QR de Entrada"}
          </button>

          <button
            onClick={() => onGenerarQr?.(turno, 'SALIDA')}
            className="w-full py-2 text-sm font-medium rounded-xl transition-colors duration-200 focus:outline-none"
            style={{
              color: "#fff",
              background: tieneQrActivo
                ? "linear-gradient(135deg,#9333ea,#a855f7)"
                : "linear-gradient(135deg,#9333ea,#a855f7)",
            }}
          >
            {tieneQrActivo ? "ⓘ Ver QR de Salida" : "⛶ Generar QR de Salida"}
          </button>

          <button
            onClick={() => onManageColaciones?.(turno)}
            className="w-full py-2 text-sm font-medium rounded-xl transition-colors duration-200 focus:outline-none bg-amber-100 hover:bg-amber-200 text-amber-800"
          >
            ☕︎ Gestionar Colaciones
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => onEdit(turno)}
              className="flex-1 py-2 text-sm font-medium rounded-xl transition-colors duration-200 focus:outline-none"
              style={{
                color: "var(--turno-btn-text)",
                background: "var(--turno-btn-bg)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--turno-btn-bg-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--turno-btn-bg)"; }}
            >
              ✎ Modificar
            </button>

            <button
              onClick={() => onEliminar?.(turno)}
              className="px-3 py-2 text-sm font-medium rounded-xl transition-colors duration-200 focus:outline-none bg-red-100 hover:bg-red-200 text-red-700"
              title="Eliminar Turno"
            >
              🗑️
            </button>
          </div>
        </div>

      </div>
    </Card>
  );
};

