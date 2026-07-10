import { hojaDeVidaService } from "./hojaDeVida.service.js";
import {handleSuccess, handleErrorClient, handleErrorServer } from '../../handlers/responseHandlers.js';

export const hojaDeVidaController = {
    //======°°°HOJA DE VIDA GLOBAL°°°=======
    async obtenerHojaDeVida(req, res){
        try{
            const { idEmpleado } = req.params;

            if(!idEmpleado || isNaN(parseInt(idEmpleado))){
                return handleErrorClient(res, 400, "id invalido", "el id del empleado debe ser un numero valido");
            }

            const [data, error] = await hojaDeVidaService.obtenerHojaDeVida(parseInt(idEmpleado));

            if (error){
                return handleErrorClient(res, 404, "error al obtener hoja de vida", error);
            }

            return handleSuccess(res, 200, "hoja de vida obtenida exitosamente", data);

        } catch (error) {
            return handleErrorServer(res, 500, "error interno en el servidor", error.message);
        }
    },

    //======°°°HOJA DE VIDA X PROYECTO°°°=======
    async obtenerHojaDeVidaPorProyecto(req, res){
        try{
            const { idProyecto, idEmpleado } = req.params;

            if(!idProyecto || isNaN(parseInt(idProyecto))){
                return handleErrorClient(res, 400, "id invalido", "el id del proyecto debe ser un numero valido");
            }

            if(!idEmpleado || isNaN(parseInt(idEmpleado))){
                return handleErrorClient(res, 400, "id invalido", "el id del empleado debe ser un numero valido");
            }

            const [data, error] = await hojaDeVidaService.obtenerHojaDeVidaPor(parseInt(idProyecto), parseInt(idEmpleado));

            if (error){
                return handleErrorClient(res, 404, "error al obtener hoja de vida del proyecto", error);
            }

            return handleSuccess(res, 200, "hoja de vida del proyecto obtenida exitosamente", data);

        } catch (error) {
            return handleErrorServer(res, 500, "error interno en el servidor", error.message);
        }
    }
};
