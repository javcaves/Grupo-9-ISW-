import fs from 'fs/promises';
import path from 'path';

// process.cwd() es perfecto porque apunta a la raíz del proyecto
const DATA_PATH = path.join(process.cwd(), 'data');

const jsonDbHandler = {
    async leer(folderName, fileName) {
        try {
            const filePath = path.join(DATA_PATH, folderName, fileName);
            const data = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                return []; // Devolver lista vacía si no existe
            }
            throw error;
        }
    },

    /**
     * @param {string} folderName 
     * @param {string} fileName 
     * @param {Array|Object} data - ¡Agregado el parámetro que faltaba!
     */
    async escribir(folderName, fileName, data) { // <-- Se agregó 'data'
        try {
            if (!data || (typeof(data) !== 'object')) {
                const error = new Error("Dato inválido: Se espera Array u Objeto");
                error.status = 400;
                throw error;
            }

            const folderPath = path.join(DATA_PATH, folderName);
            const filePath = path.join(folderPath, fileName);

            // Asegurarse de que la carpeta existe antes de escribir
            await fs.mkdir(folderPath, { recursive: true });

            await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
            return true;
        } catch (error) {
            console.error(`Error al escribir en ${fileName}:`, error);
            error.status = 500;
            throw error;
        }
    }
};

export default jsonDbHandler;