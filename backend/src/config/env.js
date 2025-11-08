import dotenv from "dotenv";
dotenv.config();

export const config = {
  PORT: process.env.PORT || 3008,
  DB: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
};