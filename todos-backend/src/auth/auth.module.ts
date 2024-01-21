import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppConfig } from '../common/app-config';
import { JwtGuard } from './guards/jwt.guard';
import { AccessTokenStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: AppConfig.jwtSecret,
      signOptions: {
        expiresIn: AppConfig.jwtExpires,
      },
      verifyOptions: {
        ignoreExpiration: false,
      },
    }),
    PassportModule,
  ],
  providers: [AuthService, JwtGuard, AccessTokenStrategy],
  controllers: [AuthController]
})
export class AuthModule {}
