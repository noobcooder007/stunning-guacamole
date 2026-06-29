import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
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
      envFilePath: '.env',
      isGlobal: true,
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
