import * as fs from 'fs';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';
import { NestFactory, Reflector } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from '@/app.module';
import { ResultInterceptor } from '@/shared/infrastructure/interceptors/result.interceptor';
import { GlobalExceptionsFilter } from '@/shared/infrastructure/filters/global-exceptions.filter';
import { RolesSerializerInterceptor } from '@/shared/infrastructure/interceptors/roles-serializer.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger();
  const configService = app.get(ConfigService);
  app.setGlobalPrefix('api');
  const reflector = app.get(Reflector);
  app.use(cookieParser.default());
  app.enableCors({
    origin: configService.get('FRONTEND_URL'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new GlobalExceptionsFilter());
  app.useGlobalInterceptors(
    new RolesSerializerInterceptor(reflector),
    new ResultInterceptor(),
  );
  app.useStaticAssets(join(process.cwd(), 'images'), {
    prefix: '/public/',
  });
  const uploadPath = join(process.cwd(), 'images', 'profile-pictures');
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  const port = configService.get('PORT') || 3000;
  await app.listen(port);
  logger.log(`App running on port ${port}`);
}
bootstrap();
