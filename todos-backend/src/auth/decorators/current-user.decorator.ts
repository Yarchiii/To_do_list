import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { User } from '@prisma/client';

/**
 * Decorator injects current jwt payload.
 */
export const CurrentUser = createParamDecorator(
  (key: keyof User | undefined, context: ExecutionContext) => {
    const user = context.switchToHttp().getRequest().user as User;
    if (!user) {
      throw new InternalServerErrorException('User not found in context');
    }
    return key ? user[key] : user;
  },
);
