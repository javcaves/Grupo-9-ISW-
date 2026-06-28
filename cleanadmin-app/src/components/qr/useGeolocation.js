// src/components/qr/useGeolocation.js

import { useState } from "react";

export function useGeolocation() {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    async function obtenerUbicacion() {

        setLoading(true);
        setError(null);

        try {

            if (!navigator.geolocation) {
                throw new Error("Este dispositivo no soporta geolocalización.");
            }

            const posicion = await new Promise((resolve, reject) => {

                navigator.geolocation.getCurrentPosition(

                    resolve,

                    (err) => {

                        switch (err.code) {

                            case err.PERMISSION_DENIED:
                                reject(new Error("Debes permitir el acceso a tu ubicación."));
                                break;

                            case err.POSITION_UNAVAILABLE:
                                reject(new Error("No fue posible determinar tu ubicación."));
                                break;

                            case err.TIMEOUT:
                                reject(new Error("La ubicación tardó demasiado en responder."));
                                break;

                            default:
                                reject(new Error("No fue posible obtener la ubicación."));
                        }

                    },

                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0,
                    }

                );

            });

            return {

                latitud_emp: posicion.coords.latitude,
                longitud_emp: posicion.coords.longitude,

                precision: Math.round(posicion.coords.accuracy),

                velocidad: posicion.coords.speed,

                altitud: posicion.coords.altitude,

                timestamp: posicion.timestamp,

            };

        }

        finally {

            setLoading(false);

        }

    }

    return {

        loading,
        error,
        obtenerUbicacion,

    };

}