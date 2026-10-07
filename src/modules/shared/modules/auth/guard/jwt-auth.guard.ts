import { AuthService } from '#shared-modules/auth/auth.service';
import { CLS_USER_ID_KEY } from '#shared-modules/auth/cls.keys';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly clsService: ClsService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (token === null) {
      throw new UnauthorizedException('Missing bearer token');
    }

    try {
      const payload = this.authService.verifyAccessToken(token);
      this.clsService.set(CLS_USER_ID_KEY, payload.sub);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' && token ? token : null;
  }
}
