import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { ThrottlerModule, ThrottlerGuard, minutes } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { DatabaseModule } from '@/database/database.module';
import { SharedModule } from '@/shared/shared.module';
import { AuthModule } from '@/auth/auth.module';
import { CommunityModule } from '@/community/community.module';
import { DonationModule } from '@/donation/donation.module';
import { LoggerMiddleware } from '@/shared/infrastructure/middlewares/logging.middleware';
import { AuditInterceptor } from '@/shared/infrastructure/interceptors/audit.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        `.env.${process.env.NODE_ENV ?? 'development'}.local`,
        '.env',
      ],
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_NAME: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        ENCRYPTION_KEY: Joi.string().required(),
        PEPPER: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        SETUP_KEY: Joi.string().required(),
        PORT: Joi.number().default(4321),
        // Se validan como string (no boolean) porque auth.controller.ts compara
        // configService.get('COOKIE_SECURE') === 'true' literalmente.
        COOKIE_SECURE: Joi.string().valid('true', 'false').default('false'),
        COOKIE_SAME_SITE: Joi.string()
          .valid('lax', 'strict', 'none')
          .default('lax'),
        FRONTEND_URL: Joi.string().required(),
        APP_URL: Joi.string().required(),
      }),
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: minutes(1),
        limit: 60,
      },
    ]),
    CacheModule.register({
      isGlobal: true,
      ttl: minutes(1),
      max: 200,
    }),
    DatabaseModule,
    SharedModule,
    AuthModule,
    CommunityModule,
    DonationModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
