declare module "vitest" {
  export interface ProvidedContext {
    integrationDatabaseUrl: string;
    integrationRedisUrl: string;
  }
}

export {};
