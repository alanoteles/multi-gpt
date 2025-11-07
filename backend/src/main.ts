import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const originEnv = process.env.FRONTEND_URL ?? 'http://localhost:5173';
  const allowedOrigins = originEnv
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
