// src/context/NotificacionesContext.jsx
import React, { createContext, useContext, useEffect, useCallback, useRef, useState, useMemo } from 'react';
import { NotificacionesService } from '../api/notificaciones.service';
import { extraerListado } from '../utils/apiResponse';

const NotificacionesContext = createContext(null);

// dispara re-renders de todo lo que consuma este contexto (ver más abajo).
// 10 minutos + refresco manual es un mejor balance.
const INTERVALO_POLLING_MS = 10 * 60 * 1000; // 10 minutos

export function NotificacionesProvider({ children }) {
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const intervaloRef = useRef(null);

  // FIX: antes `cargando` se prendía y apagaba en CADA poll automático
  // (cada 30s), lo que producía 3 renders de todo el árbol que usa
  // useNotificaciones() por ciclo: cargando=true -> cargando=false ->
  // notificaciones actualizadas. Ahora los polls en background son
  // silenciosos (no tocan `cargando`); solo el refresco manual (botón)
  // muestra el spinner.
  const refrescar = useCallback(async ({ mostrarCargando = false } = {}) => {
    try {
      if (mostrarCargando) setCargando(true);
      const res = await NotificacionesService.listar();
      setNotificaciones(extraerListado(res));
    } catch (error) {
      console.error('Error al refrescar notificaciones:', error);
    } finally {
      if (mostrarCargando) setCargando(false);
    }
  }, []);

  // Esta es la que debe usar cualquier botón de "Actualizar" en la UI.
  const refrescarManual = useCallback(() => refrescar({ mostrarCargando: true }), [refrescar]);

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
    refrescar({ mostrarCargando: true }); // carga inicial: sí mostramos loading
    intervaloRef.current = setInterval(() => refrescar(), INTERVALO_POLLING_MS); // polls en background: silenciosos
    return () => clearInterval(intervaloRef.current);
  }, [refrescar]);

  const noLeidas = notificaciones.filter((n) => !n.leido).length;

  // FIX: antes este objeto se creaba de cero en cada render del Provider,
  // así que TODO componente que llame useNotificaciones() en cualquier
  // parte del árbol se re-renderizaba en cada cambio, sin importar qué
  // parte del contexto usara. useMemo evita recrear el objeto salvo que
  // alguno de estos valores realmente haya cambiado.
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
