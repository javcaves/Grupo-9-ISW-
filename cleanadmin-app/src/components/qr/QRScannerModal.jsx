import { useState } from "react";

import QRScanner from "./QRScanner";

export default function QRScannerModal({

    open,
    onClose,
    onSuccess,

}) {

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState(null);

    if (!open) return null;

    async function manejarQREscaneado(datosQR) {

        try {

            setLoading(true);
            setError(null);

            // onSuccess es responsabilidad del padre: hace la llamada real a
            // /asistencia/marcar. Si falla, debe lanzar (throw) el error para
            // que se muestre acá.
            await onSuccess?.(datosQR);

            onClose?.();

        }

        catch (err) {

            console.error(err);

            setError(
                err?.message ??
                "Error registrando asistencia."
            );

        }

        finally {

            setLoading(false);

        }

    }

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">

                {/* Header */}

                <div
                    className="px-6 py-5 text-white"
                    style={{
                        background:
                            "linear-gradient(135deg,#7c3aed,#3b82f6)",
                    }}
                >

                    <div className="flex justify-between items-center">

                        <div>

                            <h2 className="text-xl font-bold">

                                Escanear Código QR

                            </h2>

                            <p className="text-sm opacity-90 mt-1">

                                Acerca el código QR del punto de control.

                            </p>

                        </div>

                        <button

                            onClick={onClose}

                            className="text-2xl"

                        >

                            ✕

                        </button>

                    </div>

                </div>

                {/* Scanner */}

                <div className="p-6">

                    {

                        loading

                        ?

                        (

                            <div className="py-12 text-center">

                                <i className="fas fa-spinner fa-spin text-3xl text-violet-600"></i>

                                <div className="mt-4 font-medium">

                                    Registrando asistencia...

                                </div>

                            </div>

                        )

                        :

                        // FIX: antes, apenas terminaba el "loading", este bloque volvía a
                        // montar <QRScanner /> automáticamente (haya habido éxito o error).
                        // Eso reactivaba la cámara de inmediato y, como normalmente el
                        // celular sigue apuntando al mismo QR, se disparaba un nuevo escaneo
                        // automático que llamaba setError(null) antes de que el usuario
                        // alcanzara a leer el mensaje ("se borra al instante").
                        //
                        // Ahora, si hay un error, se muestra fijo en pantalla y la cámara NO
                        // se vuelve a activar hasta que el usuario presiona "OK" (que recién
                        // ahí limpia el error y remonta el escáner para un nuevo intento).

                        error

                        ?

                        (

                            <div className="py-8 text-center">

                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">

                                    <i className="fas fa-triangle-exclamation text-2xl text-red-600"></i>

                                </div>

                                <p className="mb-1 font-semibold text-red-700">

                                    No se pudo registrar la asistencia

                                </p>

                                <p className="mb-6 text-sm text-slate-600 px-2">

                                    {error}

                                </p>

                                <button

                                    onClick={() => setError(null)}

                                    className="rounded-xl bg-violet-600 px-8 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"

                                >

                                    OK

                                </button>

                            </div>

                        )

                        :

                        (

                            <QRScanner

                                onSuccess={manejarQREscaneado}

                                onCancel={onClose}

                            />

                        )

                    }

                </div>

            </div>

        </div>

    );

}
