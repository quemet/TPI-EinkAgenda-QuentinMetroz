import envSchema from '../schemas/env.schema';
import dotenv from 'dotenv';

dotenv.config();

const rawEnv = envSchema.parse(process.env);

export const env = {
  DB: {
    HOST: rawEnv.DB_HOST,
    PORT: rawEnv.DB_PORT,
    USER: rawEnv.DB_USER,
    PASSWORD: rawEnv.DB_PASSWORD,
    NAME: rawEnv.DB_NAME,
    SYNC_MODE: rawEnv.DB_SYNC_MODE,
  },
  JWT: {
    SECRET: rawEnv.JWT_SECRET,
    EXPIRES_IN: rawEnv.JWT_EXPIRES_IN,
  },
  SERVER: {
    PORT: rawEnv.PORT,
    CORS: rawEnv.CORS_ORIGIN,
  },
  NODE_ENV: rawEnv.NODE_ENV,
};
