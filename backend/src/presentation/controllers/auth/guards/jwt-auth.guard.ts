import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@/shared/constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    console.log('🛡️ JwtAuthGuard - Before super.canActivate');
    const result = await super.canActivate(context);
    console.log('🛡️ JwtAuthGuard - After super.canActivate, result:', result);

    if (result) {
      const req = context.switchToHttp().getRequest();
      console.log('🛡️ JwtAuthGuard - request.user:', request.user);
      console.log('🛡️ JwtAuthGuard - req.user:', req.user);
      if (!req.user && request.user) {
        req.user = request.user;
        console.log('🛡️ JwtAuthGuard - Copied request.user to req.user');
      }
      console.log('🛡️ JwtAuthGuard - Final req.user:', req.user);
    }

    return result as boolean;
  }
}
