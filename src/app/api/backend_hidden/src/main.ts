import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { abortOnError: false });
  app.enableCors({
    origin: true,
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  });
  app.use(cookieParser());
  await app.listen(5001);
}
bootstrap();
