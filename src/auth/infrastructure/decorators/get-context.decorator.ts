import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CommandMetadata } from '@/shared/application/dto/command-metadata.dto';

export const GetContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CommandMetadata => {
    const request = ctx.switchToHttp().getRequest();
    return {
      ip: request['x-forwarded-for'] || request.ip,
      userAgent: request.headers['user-agent'],
      refreshToken: request.cookies['refresh-token'],
    };
  },
);
