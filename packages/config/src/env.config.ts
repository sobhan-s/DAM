import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('../../', '.env') });
// console.log("-------",process.env.AUTH_SERVICE_URI);

export const env_config_variable = {
  SERVICE_URI: {
    AUTH: process.env.AUTH_SERVICE_URI,
  },
  PORT: {
    MAIN_PORT: parseInt(process.env.MAIN_PORT || '8000', 10),
    AUTH: parseInt(process.env.AUTH_PORT || '8001', 10),
  },
};
