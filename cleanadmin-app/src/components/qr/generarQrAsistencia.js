import QRCode from 'qrcode';

export async function generarQrAsistencia({ token, proyecto, turno, exp, radio = 200, tipo = 'ENTRADA' }) {
  if (!token) {
    throw new Error('Se requiere un token para generar el QR.');
  }

  const payload = {
    token,
    proyecto: proyecto ?? 'Proyecto',
    turno: turno ?? 'Turno',
    exp: exp ?? new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    radio,
    tipo,
  };

  const dataUrl = await QRCode.toDataURL(JSON.stringify(payload), {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 280,
  });

  return dataUrl;
}
