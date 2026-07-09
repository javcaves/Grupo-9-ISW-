// src/context/NotificacionesContext.jsx
import React, { createContext, useContext, useEffect, useCallback, useRef, useState, useMemo } from 'react';
import { NotificacionesService } from '../api/notificaciones.service';
import { extraerListado } from '../utils/apiResponse';

const NotificacionesContext = createContext(null);

const INTERVALO_POLLING_MS = 10 * 60 * 1000; // 10 minutos

export function NotificacionesProvider({ children }) {
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const intervaloRef = useRef(null);

  // CAMBIO: la campana ahora solo pide notificaciones NO resueltas
  // (resuelto=false), en vez de traer todo el historial. El historial
  // completo se consulta aparte, desde HistorialSolicitudesModal.
  const refrescar = useCallback(async ({ mostrarCargando = false } = {}) => {
    try {
      if (mostrarCargando) setCargando(true);
      const res = await NotificacionesService.listarNoResueltas();
      setNotificaciones(extraerListado(res));
    } catch (error) {
      console.error('Error al refrescar notificaciones:', error);
    } finally {
      if (mostrarCargando) setCargando(false);
    }
  }, []);

  const refrescarManual = useCallback(() => refrescar({ mostrarCargando: true }), [refrescar]);

  const marcarLeida = useCallback(async (idNotificacion) => {
    setNotificaciones((prev) =>
      prev.map((n) =>
        n.id_notificacion === idNotificacion ? { ...n, leido: true } : n
      )
    );
    try {
      await NotificacionesService.marcarLeida(idNotificacion);
    } catch (error) {
      console.error('Error al marcar notificacion como leida:', error);
      refrescar();
    }
  }, [refrescar]);

  const marcarTodasLeidas = useCallback(async () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leido: true })));
    try {
      await NotificacionesService.marcarTodasLeidas();
    } catch (error) {
      console.error('Error al marcar todas como leidas:', error);
      refrescar();
    }
  }, [refrescar]);

  useEffect(() => {
    refrescar({ mostrarCargando: true });
    intervaloRef.current = setInterval(() => refrescar(), INTERVALO_POLLING_MS);
    return () => clearInterval(intervaloRef.current);
  }, [refrescar]);

  const noLeidas = notificaciones.filter((n) => !n.leido).length;

  const value = useMemo(
    () => ({
      notificaciones,
      noLeidas,
      cargando,
      refrescar: refrescarManual,
      marcarLeida,
      marcarTodasLeidas,
    }),
    [notificaciones, noLeidas, cargando, refrescarManual, marcarLeida, marcarTodasLeidas]
  );

  return (
    <NotificacionesContext.Provider value={value}>
      {children}
    </NotificacionesContext.Provider>
  );
}

export function useNotificaciones() {
  const ctx = useContext(NotificacionesContext);
  if (!ctx) {
    throw new Error('useNotificaciones debe usarse dentro de <NotificacionesProvider>');
  }
  return ctx;
}