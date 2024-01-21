/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IJWTPayload } from '../interfaces/jwt-payload.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { AppConfig } from '../../common/app-config';
import { User } from '@prisma/client';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly prismaService: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: AppConfig.jwtSecret,
      passReqToCallback: true,
    });
  }

  /**
   * Method automatically callable after access token
   *    validation for additional checks of the current session.
   */
  async validate(req: Request, payload: IJWTPayload, done: Function): Promise<User> {
    return this.prismaService.user.findUniqueOrThrow({
      where: {
        id: payload.userId,
      },
    }).catch(() => {
      throw new UnauthorizedException('Current session user not found');
    });
  }
}