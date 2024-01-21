import ms from 'ms';

class AppConfigClass {
  public readonly port: number = process.env.PORT ? +process.env.PORT : 5000;
  public readonly jwtSecret: string = process.env.JWT_SECRET;
  public readonly jwtExpires: string = process.env.JWT_EXPIRES;
  public readonly databaseUrl: string = process.env.DATABASE_URL;

  constructor() {
    const errors: string[] = [];
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 3) {
      errors.push('JWT_SECRET is required string with 3 or more characters');
    }
    if (!isFinite(ms(process.env.JWT_EXPIRES))) {
      errors.push('JWT_EXPIRES is required vercel/ms string (https://github.com/vercel/ms)');
    }
    if (!process.env.DATABASE_URL) {
      errors.push('DATABASE_URL is required');
    }
    if (process.env.PORT && (!isFinite(Number(process.env.PORT)) || Number(process.env.PORT) < 1 || Number(process.env.PORT) > 65535)) {
      errors.push('PORT must be a number in 1-65535 range');
    }
    if (errors.length > 0) {
      throw new Error(`Invalid configuration: ${errors.join('; ')}.`);
    }
  }
}

export const AppConfig = new AppConfigClass();
