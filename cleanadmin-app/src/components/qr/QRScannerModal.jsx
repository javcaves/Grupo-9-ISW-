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

                        (

                            <QRScanner

                                onSuccess={manejarQREscaneado}

                                onCancel={onClose}

                            />

                        )

                    }

                    {

                        error && (

                            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">

                                <div className="text-red-700 font-semibold">

                                    {error}

                                </div>

                            </div>

                        )

                    }

                </div>

            </div>

        </div>

    );

}
