// src/pages/admin/proyectos/AsistenciaHistorialView.jsx
import { useState, useEffect, useCallback } from "react";
import { Card } from "../../../components/Card";
import { Table } from "../../../components/Table";
import { AsistenciaService } from "../../../api/asistencia.service";
import { formatearFecha } from "../../../utils/formatters";
import { Pencil } from "lucide-react";
import EditarAsistenciaModal from "../../../components/modals/EditarAsistenciaModal";

const COLORES_ESTADO = {
    PRESENTE: "bg-green-100 text-green-700",
    ATRASO: "bg-amber-100 text-amber-700",
    FALTA_INJUSTIFICADA: "bg-red-100 text-red-700",
    FALTA_JUSTIFICADA: "bg-blue-100 text-blue-700",
    ESPERANDO: "bg-gray-100 text-gray-500",
    RETIRADO: "bg-purple-100 text-purple-700"
};

const LABEL_ESTADO = {
    PRESENTE: "Presente",
    ATRASO: "Atraso",
    FALTA_INJUSTIFICADA: "Injustificada",
    FALTA_JUSTIFICADA: "Justificada",
    ESPERANDO: "Esperando",
    RETIRADO: "Retirado"
};

export default function AsistenciaHistorialView({ proyecto }) {
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state
    const [editarRegistro, setEditarRegistro] = useState(null);

    // Filter state
    const [filtroPersona, setFiltroPersona] = useState("");
    const [filtroFecha, setFiltroFecha] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");

    const cargarHistorial = useCallback(async () => {
        if (!proyecto?.id_proyecto) return;
        setLoading(true);
        try {
            const res = await AsistenciaService.historial(proyecto.id_proyecto);
            setHistorial(Array.isArray(res) ? res : (res?.data ?? []));
            setError(null);
        } catch (err) {
            console.error("Error cargando historial de asistencias:", err);
            setError("No se pudo cargar el historial de asistencias.");
        } finally {
            setLoading(false);
        }
    }, [proyecto?.id_proyecto]);

    useEffect(() => {
        cargarHistorial();
    }, [cargarHistorial]);



    // Aplanar los datos para la tabla
    const datosTabla = [];
    historial.forEach((jornada) => {
        const empleados = jornada.asistenciaEmpleados || [];
        empleados.forEach((ae) => {
            datosTabla.push({
                id_asistencia: jornada.id_asistencia,
                id_empleado: ae.id_empleado,
                fecha: jornada.fecha,
                turno_nombre: jornada.turno?.nombre || "Sin Turno",
                empleado_nombre: ae.empleado ? `${ae.empleado.nombre} ${ae.empleado.apellido}` : `ID ${ae.id_empleado}`,
                hora_ingreso: ae.hora_ingreso,
                hora_egreso: ae.hora_egreso,
                estado: ae.estado,
                jornada_activa: jornada.activo
            });
        });
    });

    const datosTablaFiltrados = datosTabla.filter((fila) => {
        let coincidePersona = true;
        let coincideFecha = true;
        let coincideEstado = true;

        if (filtroPersona) {
            coincidePersona = fila.empleado_nombre.toLowerCase().includes(filtroPersona.toLowerCase());
        }
        if (filtroFecha) {
            coincideFecha = fila.fecha === filtroFecha;
        }
        if (filtroEstado) {
            coincideEstado = fila.estado === filtroEstado;
        }

        return coincidePersona && coincideFecha && coincideEstado;
    });

    const columnas = [
        {
            key: "fecha",
            label: "Fecha",
            render: (val) => <span className="font-medium text-slate-700">{formatearFecha(val)}</span>
        },
        { key: "turno_nombre", label: "Turno" },
        { key: "empleado_nombre", label: "Empleado" },
        {
            key: "hora_ingreso",
            label: "Ingreso",
            render: (val) => val ? val.slice(0, 5) : "--:--"
        },
        {
            key: "hora_egreso",
            label: "Salida",
            render: (val) => val ? val.slice(0, 5) : "--:--"
        },
        {
            key: "estado",
            label: "Estado",
            render: (val) => (
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${COLORES_ESTADO[val] || "bg-gray-100 text-gray-700"}`}>
                    {LABEL_ESTADO[val] || val}
                </span>
            )
        },
        {
            key: "jornada_activa",
            label: "Jornada",
            render: (activa) => activa 
                ? <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded border border-green-200">Abierta</span> 
                : <span className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded border border-gray-200">Cerrada</span>
        },
        {
            key: "acciones",
            label: "Acciones",
            render: (_, fila) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => setEditarRegistro(fila)}
                        className="w-7 h-7 flex items-center justify-center rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                        title="Editar asistencia"
                    >
                        <Pencil size={14} />
                    </button>
                </div>
            )
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
            </div>
        );
    }

    if (error) {
        return <div className="p-4 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4 mb-2">
                <input
                    type="text"
                    placeholder="Buscar por empleado..."
                    value={filtroPersona}
                    onChange={(e) => setFiltroPersona(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto min-w-[200px]"
                />
                <input
                    type="date"
                    value={filtroFecha}
                    onChange={(e) => setFiltroFecha(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto text-gray-600"
                />
                <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto text-gray-600"
                >
                    <option value="">Todos los estados</option>
                    <option value="PRESENTE">Presente</option>
                    <option value="ATRASO">Atraso</option>
                    <option value="FALTA_INJUSTIFICADA">Injustificada</option>
                    <option value="FALTA_JUSTIFICADA">Justificada</option>
                    <option value="ESPERANDO">Esperando</option>
                    <option value="RETIRADO">Retirado</option>
                </select>
                {(filtroPersona || filtroFecha || filtroEstado) && (
                    <button
                        onClick={() => { setFiltroPersona(""); setFiltroFecha(""); setFiltroEstado(""); }}
                        className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Limpiar filtros
                    </button>
                )}
            </div>

            <Card title="Historial de Asistencias" icon="fa-calendar-days">
                <Table
                    columns={columnas}
                    data={datosTablaFiltrados}
                    emptyMessage="No hay registros de asistencia que coincidan con los filtros."
                />
            </Card>

            <EditarAsistenciaModal
                isOpen={!!editarRegistro}
                onClose={() => setEditarRegistro(null)}
                registro={editarRegistro}
                onSuccess={cargarHistorial}
            />
        </div>
    );
}
