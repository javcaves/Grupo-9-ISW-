// src/context/NotificacionesContext.jsx
import React, { createContext, useContext, useEffect, useCallback, useRef, useState } from 'react';
import { NotificacionesService } from '../api/notificaciones.service';
import { extraerListado } from '../utils/apiResponse';

const NotificacionesContext = createContext(null);

const INTERVALO_POLLING_MS = 30000;

export function NotificacionesProvider({ children }) {
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const intervaloRef = useRef(null);

  const refrescar = useCallback(async () => {
    try {
      setCargando(true);
      const res = await NotificacionesService.listar();
      setNotificaciones(extraerListado(res));
    } catch (error) {
      console.error('Error al refrescar notificaciones:', error);
    } finally {
      setCargando(false);
    }
  }, []);

  const marcarLeida = useCallback(async (idNotificacion) => {
    // optimista: la marcamos en el estado local altiro, sin esperar la red
    setNotificaciones((prev) =>
      prev.map((n) =>
        n.id_notificacion === idNotificacion ? { ...n, leido: true } : n
      )
    );
    try {
      await NotificacionesService.marcarLeida(idNotificacion);
    } catch (error) {
      console.error('Error al marcar notificacion como leida:', error);
      // si falla, refrescamos de verdad para no dejar el estado local mintiendo
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
    refrescar();
    intervaloRef.current = setInterval(refrescar, INTERVALO_POLLING_MS);
    return () => clearInterval(intervaloRef.current);
  }, [refrescar]);

  const noLeidas = notificaciones.filter((n) => !n.leido).length;

  return (
    <NotificacionesContext.Provider
      value={{ notificaciones, noLeidas, cargando, refrescar, marcarLeida, marcarTodasLeidas }}
    >
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
