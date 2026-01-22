import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@/auth/auth.module';
import { CommunityModule } from '@/community/community.module';
import { DatabaseModule } from '@/database/database.module';
import { LoggerMiddleware } from '@/shared/infrastructure/middlewares/logging.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}.local`,
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    CommunityModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
