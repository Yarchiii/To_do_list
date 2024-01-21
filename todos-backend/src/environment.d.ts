declare namespace NodeJS {
  type ProcessEnv = {
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES: string;
    PORT?: string;
  };
}
