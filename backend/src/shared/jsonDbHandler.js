import fs from 'fs/promises';
import path from 'path';

// process.cwd() apunta a la raíz del proyecto
const DATA_PATH = path.join(process.cwd(), 'data');

/**
 * Factory de handlers JSON
 * Uso:
 * const dbUsuarios = jsonDbHandler('rrhh', 'usuarios.json');
 * await dbUsuarios.leer();
 * await dbUsuarios.escribir(data);
 */
const jsonDbHandler = (folderName, fileName) => {

    const filePath = path.join(DATA_PATH, folderName, fileName);

    return {

        async leer() {
            try {
                const data = await fs.readFile(filePath, 'utf-8');
                return JSON.parse(data);
            } catch (error) {

                if (error.code === 'ENOENT') {
                    return [];
                }

                throw error;
            }
        },

        async escribir(data) {
            try {

                if (!data || typeof data !== 'object') {
                    const err = new Error(
                        "Dato inválido: se espera Array u Objeto"
                    );

                    err.status = 400;
                    throw err;
                }

                // Crear carpeta si no existe
                const folderPath = path.join(DATA_PATH, folderName);

                await fs.mkdir(folderPath, {
                    recursive: true
                });

                await fs.writeFile(
                    filePath,
                    JSON.stringify(data, null, 2),
                    'utf-8'
                );

                return true;

            } catch (error) {

                console.error(
                    `Error al escribir en ${fileName}:`,
                    error
                );

                error.status = error.status || 500;

                throw error;
            }
        }
    };
};

export default jsonDbHandler;