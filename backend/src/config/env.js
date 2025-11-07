export const config = {
  PORT: process.env.PORT || 3008,
  DB: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // Añade esta opción para habilitar SSL.
    // `rejectUnauthorized: true` es más seguro y recomendado para producción.
    // Si usas certificados autofirmados en desarrollo, podrías necesitar cambiarlo a `false`.
    ssl: { rejectUnauthorized: true },
  },
};
