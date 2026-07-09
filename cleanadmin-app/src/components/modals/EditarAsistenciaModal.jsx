import { useState, useEffect } from "react";
import { Modal } from "../Modal";
import { AsistenciaService } from "../../api/asistencia.service";

const OPCIONES_ESTADO = [
    { value: "PRESENTE", label: "Presente" },
    { value: "ATRASO", label: "Atraso" },
    { value: "FALTA_INJUSTIFICADA", label: "Falta Injustificada" },
    { value: "FALTA_JUSTIFICADA", label: "Falta Justificada" },
    { value: "ESPERANDO", label: "Esperando Marcaje" },
    { value: "RETIRADO", label: "Retirado Anticipadamente" }
];

export default function EditarAsistenciaModal({ isOpen, onClose, registro, onSuccess }) {
    const [estado, setEstado] = useState("ESPERANDO");
    const [horaIngreso, setHoraIngreso] = useState("");
    const [horaEgreso, setHoraEgreso] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (registro) {
            setEstado(registro.estado || "ESPERANDO");
            setHoraIngreso(registro.hora_ingreso ? registro.hora_ingreso.slice(0, 5) : "");
            setHoraEgreso(registro.hora_egreso ? registro.hora_egreso.slice(0, 5) : "");
            setError(null);
        }
    }, [registro]);

    if (!isOpen || !registro) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                estado,
                hora_ingreso: horaIngreso || null,
                hora_egreso: horaEgreso || null
            };

            await AsistenciaService.editarHistorial(
                registro.id_asistencia,
                registro.id_empleado,
                payload
            );

            onSuccess();
            onClose();
        } catch (err) {
            console.error("Error editando asistencia:", err);
            setError(err?.response?.data?.message || err.message || "Error al actualizar la asistencia.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Editar Asistencia - ${registro.empleado_nombre}`}
            icon="fa-pen"
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                        {error}
                    </div>
                )}

                <div className="flex flex-col gap-1 text-sm text-gray-500 mb-2">
                    <p><strong>Fecha:</strong> {registro.fecha}</p>
                    <p><strong>Turno:</strong> {registro.turno_nombre}</p>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                        Estado de Asistencia
                    </label>
                    <select
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                        required
                    >
                        <option value="" disabled>Seleccione estado...</option>
                        {OPCIONES_ESTADO.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                            Hora Ingreso (opcional)
                        </label>
                        <input
                            type="time"
                            value={horaIngreso}
                            onChange={(e) => setHoraIngreso(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                            Hora Salida (opcional)
                        </label>
                        <input
                            type="time"
                            value={horaEgreso}
                            onChange={(e) => setHoraEgreso(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                        disabled={loading}
                    >
                        {loading && <i className="fas fa-spinner fa-spin" />}
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </Modal>
    );
}
