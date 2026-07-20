// Único punto del backend para convertir un Date a fecha calendario
// "YYYY-MM-DD". Usa siempre getters locales (nunca .toISOString(), que
// devuelve UTC sin importar la TZ del proceso) para que "hoy" coincida con
// lo que TypeORM/pg guardan y leen en las columnas `date`. Depende de que
// process.env.TZ esté fijado (ver ConfigEnv.js).
const pad = (n) => String(n).padStart(2, "0");

export const formatFechaLocal = (date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const hoyLocal = () => formatFechaLocal(new Date());
