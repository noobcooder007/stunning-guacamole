import { NestFactory, Reflector } from '@nestjs/core';
import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ResultInterceptor } from './shared/infrastructure/interceptors/result.interceptor';
import { GlobalExceptionsFilter } from './shared/infrastructure/filters/global-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger();
  app.setGlobalPrefix('api');
  const reflector = app.get(Reflector);
  app.use(cookieParser.default());
  app.enableCors({
    origin: 'http://localhost:4200',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionsFilter());
  app.useGlobalInterceptors(
    new ResultInterceptor(),
    new ClassSerializerInterceptor(reflector),
  );
  await app.listen(+process.env.PORT);
  logger.log(`App running on port ${process.env.PORT}`);
}
bootstrap();
