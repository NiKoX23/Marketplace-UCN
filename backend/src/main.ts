import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  const allowedOrigins = [
    process.env.FRONTEND_URL ?? 'http://localhost:5173',
  ];
  // Agregar origen alternativo si está configurado
  if (process.env.FRONTEND_URL_ALT) {
    allowedOrigins.push(process.env.FRONTEND_URL_ALT);
  }

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    secure: false,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Servidor corriendo en puerto ${port}`);
}
bootstrap();