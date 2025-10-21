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
    console.log(
      'Authorization header:',
      request.headers.authorization ? 'Present' : 'Missing'
    );

    if (isPublic) {
      console.log('Public endpoint, allowing access');
      return true;
    }

    console.log('Protected endpoint, validating JWT...');
    return super.canActivate(context);
  }
}
