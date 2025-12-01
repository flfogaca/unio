import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@/shared/constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log('=== JWT GUARD ===');
    console.log('Endpoint:', request.url);
    console.log('Is Public:', isPublic);
    const authHeader = request.headers.authorization;
    console.log(
      'Authorization header:',
      authHeader ? authHeader.substring(0, 30) + '...' : 'Missing'
    );

    if (isPublic) {
      console.log('Public endpoint, allowing access');
      return true;
    }

    console.log('Protected endpoint, validating JWT...');
    try {
      const result = await super.canActivate(context);
      console.log('✅ JWT validation result:', result);
      return result;
    } catch (error) {
      console.error('❌ JWT validation error:', error);
      throw error;
    }
  }
}
