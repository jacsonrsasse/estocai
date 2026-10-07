import { AuthService } from '#shared-modules/auth/auth.service';
import { JwtAuthGuard } from '#shared-modules/auth/guard/jwt-auth.guard';
import { EnvService } from '#shared-modules/env/env.service';
import { Global, Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ClsModule } from 'nestjs-cls';

@Global()
@Module({
  imports: [
    ClsModule.forRoot({ global: true, middleware: { mount: true } }),
    JwtModule.registerAsync({
      global: true,
      useFactory: (envService: EnvService): JwtModuleOptions => ({
        secret: envService.get('security.jwtSecret'),
        signOptions: {
          expiresIn: envService.get('security.jwtExpiresInSeconds'),
        },
      }),
      inject: [EnvService],
    }),
  ],
  providers: [AuthService, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
