import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
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
    DatabaseModule,
    SharedModule,
    AuthModule,
    CommunityModule,
    DonationModule,
  ],
  controllers: [],
  providers: [
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
