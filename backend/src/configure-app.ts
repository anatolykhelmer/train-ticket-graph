import type { INestApplication } from '@nestjs/common';

export function configureApp<T extends INestApplication>(app: T): T {
  app.enableCors();
  return app;
}
