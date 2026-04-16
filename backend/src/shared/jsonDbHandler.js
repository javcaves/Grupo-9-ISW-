import fs from 'fs/promises';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data');

const jsonDbHandler = {
    /**
     * Leer un archivo JSON desde una carpeta específica
     * @param {string} folderName - Nombre de la carpeta
     * @param {string} fileName - Nombre del archivo
     */
    async leer(folderName, fileName){
        try{
            const filePath = path.join(DATA_PATH, folderName, fileName);
            const data = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(data);
        } catch (error){
            if (error.code === 'ENOENT'){
                console.warn(`Error 404. Archivo ${fileName} no encontrado. Devolviendo lista vacía`);
                return [];
            } else {
                console.error('Error 500. Error al leer base de datos')
                error.status = 500;
                throw error;
            }
        }
    },

    /**
     * Sobreescribir un archivo JSON con nueva info
     * @param {string} folderName - Nombre de la carpeta
     * @param {string} fileName - Nombre del archivo
     * @param {Array|Object} data - Datos a guardar
     */
    async escribir(folderName, fileName){
        try{
            if (!data || (typeof(data) !== 'object')){
                const error = new Error("Dato invalido: Se espera Array u Objeto");
                error.status = 400;
                throw error;
            }

            const filePath = path.join(DATA_PATH, folderName, fileName);
            await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
            return true;

        } catch (error){
            if (error.code === 'ENOENT'){
                console.warn(`Error 404. Archivo ${fileName} no encontrado. Devolviendo lista vacía`);
                return [];
            } else {
                console.error('Error 500. Error al leer base de datos')
                error.status = 500;
                throw error;
            }
        }
    }
}

export default jsonDbHandler;