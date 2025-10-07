import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@/shared/types';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // Se a resposta já tem a estrutura correta (com success), não modificar
        if (data && typeof data === 'object' && 'success' in data) {
          return {
            ...data,
            timestamp: new Date().toISOString(),
          };
        }
        
        // Caso contrário, aplicar a estrutura padrão
        return {
          success: true,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}

