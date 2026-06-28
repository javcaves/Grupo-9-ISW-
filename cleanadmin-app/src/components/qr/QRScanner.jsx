import { useEffect, useRef, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";

import { useGeolocation } from "./useGeolocation";
import { parseQR, validarQR } from "./qr.utils";

export default function QRScanner({

    onSuccess,
    onCancel,

}) {

    const { obtenerUbicacion } = useGeolocation();

    const [estado, setEstado] = useState("ESCANEANDO");

    const [mensaje, setMensaje] = useState(
        "Apunta la cámara hacia el código QR."
    );

    const [error, setError] = useState(null);

    const [scanActivo, setScanActivo] = useState(true);

    const procesando = useRef(false);

    useEffect(() => {

        return () => {

            procesando.current = false;

        };

    }, []);

    async function procesar(resultado) {

        if (procesando.current) return;

        procesando.current = true;

        setScanActivo(false);

        setEstado("OBTENIENDO_UBICACION");

        setMensaje("Obteniendo ubicación...");

        try {

            const qr = parseQR(resultado.rawValue);

            validarQR(qr);

            const gps = await obtenerUbicacion();

            setEstado("ENVIANDO");

            setMensaje("Validando información...");

            await onSuccess({

                ...qr,

                ...gps,

            });

        }

        catch (err) {

            console.error(err);

            setEstado("ERROR");

            setError(err.message);

        }

    }

    function reiniciar() {

        procesando.current = false;

        setEstado("ESCANEANDO");

        setMensaje("Apunta la cámara hacia el código QR.");

        setError(null);

        setScanActivo(true);

    }

    return (

        <div className="space-y-4">

            <div className="rounded-2xl overflow-hidden border shadow">

                {scanActivo && (

                    <Scanner

                        constraints={{

                            facingMode: "environment",

                        }}

                        onScan={(resultados) => {

                            if (!resultados?.length) return;

                            procesar(resultados[0]);

                        }}

                        onError={(err) => {

                            console.error(err);

                            setEstado("ERROR");

                            setError("No fue posible acceder a la cámara.");

                        }}

                    />

                )}

            </div>

            <div className="rounded-xl border p-4 bg-white">

                <div className="font-semibold">

                    {mensaje}

                </div>

                {estado === "OBTENIENDO_UBICACION" && (

                    <div className="text-sm mt-2 text-gray-500">

                        Esperando permisos de ubicación...

                    </div>

                )}

                {estado === "ENVIANDO" && (

                    <div className="text-sm mt-2 text-gray-500">

                        Registrando asistencia...

                    </div>

                )}

                {error && (

                    <div className="mt-3 text-red-600 text-sm">

                        {error}

                    </div>

                )}

            </div>

            <div className="flex gap-3">

                {estado === "ERROR" && (

                    <button

                        onClick={reiniciar}

                        className="flex-1 rounded-xl py-3 bg-violet-600 text-white"

                    >

                        Reintentar

                    </button>

                )}

                <button

                    onClick={onCancel}

                    className="flex-1 rounded-xl py-3 border"

                >

                    Cancelar

                </button>

            </div>

        </div>

    );

}