import { useEffect, useState } from 'react';
import { generarQrAsistencia } from './generarQrAsistencia';

export default function QRGenerator({ token, proyecto, turno, exp, radio = 200 }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function cargarQR() {
      try {
        setLoading(true);
        setError('');
        const dataUrl = await generarQrAsistencia({ token, proyecto, turno, exp, radio });
        if (active) setQrDataUrl(dataUrl);
      } catch (err) {
        if (active) setError(err.message || 'No se pudo generar el QR.');
      } finally {
        if (active) setLoading(false);
      }
    }

    if (token) {
      cargarQR();
    } else {
      setLoading(false);
      setError('No hay token disponible para generar el QR.');
    }

    return () => {
      active = false;
    };
  }, [token, proyecto, turno, exp, radio]);

  return (
    <div className="flex flex-col items-center gap-3">
      {loading && <p className="text-sm text-gray-500">Generando código QR...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && qrDataUrl && (
        <img src={qrDataUrl} alt="QR de asistencia" className="w-64 h-64 rounded-xl border bg-white p-2" />
      )}
    </div>
  );
}
