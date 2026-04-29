/**
 * Utilidades de validación global para el sistema
 */

const validators = {
    /**
     * Valida RUT chileno con algoritmo de dígito verificador (Módulo 11)
     * @param {string} rut - RUT con o sin puntos y guion
     * @returns {boolean}
     */
    esRutValido(rut) {
        if (!rut || typeof rut !== 'string') return false;

        const cleanRut = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
        if (cleanRut.length < 8) return false;

        const cuerpo = cleanRut.slice(0, -1);
        const dvRecibido = cleanRut.slice(-1);

        let suma = 0;
        let multiplicador = 2;

        for (let i = cuerpo.length - 1; i >= 0; i--) {
            suma += parseInt(cuerpo[i]) * multiplicador;
            multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
        }

        const dvEsperado = 11 - (suma % 11);
        
        let dvFinal;
        if (dvEsperado === 11) dvFinal = '0';
        else if (dvEsperado === 10) dvFinal = 'K';
        else dvFinal = dvEsperado.toString();

        return dvFinal === dvRecibido;
    },

    /**
     * Valida formato simple de Email: example@domain.com
     * @param {string} email
     * @returns {boolean}
     */
    esCorreoValido(email) {
        if (!email || typeof email !== 'string') return false;
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
};

export default validators;