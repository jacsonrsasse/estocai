import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

export interface AccessTokenPayload {
  sub: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  generateAccessToken(userId: string): string {
    return this.jwtService.sign({ sub: userId } satisfies AccessTokenPayload);
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    return this.jwtService.verify<AccessTokenPayload>(token);
  }
}
