import React, {useState, useEffect} from "react";
import {Modal} from '../Modal';
import { hojaDeVidaService } from "../../../../backend/src/modules/hoja_de_vida/hojaDeVida.service.js";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

//=========CONFIGURACION DE NIVELES EN FRONTEND========
const NIVEL_CONFIG = {
    "Excelente": {
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        icon: "fa-star",
        label: "Excelente"
    },
    "Bueno": {
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200",
        icon: "fa-thumbs-up",
        label: "Bueno"
    },
    "Regular": {
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
        icon: "fa-minus",
        label: "Regular"
    },
    "Necesita mejorar": {
        color: "text-red-600",
        bg: "bg-res-50",
        border: "border-red-200",
        icon: "fa-exclamation-triangle",
        label: "Necesita mejorar"
    }
};

export default function hojaDeVidaGlobalModal({isOpen, onClose, empleado}){
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(()=>{
        if(isOpen && empleado){
            cargarHojaDeVida();
        }
    }, [isOpen, empleado]);

    const cargarHojaDeVida = async () => {
        setLoading(true);
        setError(null);

        try{
            const response = await hojaDeVidaService.obtenerHojaDeVida(empleado.id);
            setData(response.data);
        } catch (err){
            setError(err.message || 'Error al cargar la hoja de vida');
        }
    }
}