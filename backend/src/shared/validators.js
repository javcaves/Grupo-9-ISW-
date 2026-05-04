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

        // Limpieza profunda: quitamos puntos, guiones y espacios
        const cleanRut = rut.replace(/[\.\-\s]/g, '').toUpperCase();
        
        // Un RUT chileno tiene entre 8 y 9 caracteres (ej: 7.777.777-7 o 22.222.222-2)
        if (cleanRut.length < 8 || cleanRut.length > 9) return false;

        const cuerpo = cleanRut.slice(0, -1);
        const dvRecibido = cleanRut.slice(-1);

        // Validar que el cuerpo contenga solo números
        if (!/^\d+$/.test(cuerpo)) return false;

        let suma = 0;
        let multiplicador = 2;

        // Algoritmo Módulo 11
        for (let i = cuerpo.length - 1; i >= 0; i--) {
            suma += parseInt(cuerpo[i], 10) * multiplicador;
            multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
        }

        const resto = suma % 11;
        const dvEsperado = 11 - resto;
        
        let dvFinal;
        if (dvEsperado === 11) dvFinal = '0';
        else if (dvEsperado === 10) dvFinal = 'K';
        else dvFinal = dvEsperado.toString();

        return dvFinal === dvRecibido;
    },

    /**
     * Valida formato simple de Email
     */
    esCorreoValido(email) {
        if (!email || typeof email !== 'string') return false;
        // Regex un poco más estricta para evitar puntos seguidos o al inicio
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email.trim());
    }
};

export default validators;