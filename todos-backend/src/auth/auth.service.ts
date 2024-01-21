import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { IJWTPayloadCreate } from './interfaces/jwt-payload.interface';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { isString, merge } from 'lodash';
import { AppConfig } from '../common/app-config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    public readonly jwtService: JwtService,
  ) {}

  /**
   * Generate JWT token
   * @param accessTokenPayload - payload for JWT token
   * @param options - options for JWT token
   * @returns JWT token
   */
  public async generateJWT(accessTokenPayload: IJWTPayloadCreate, options: JwtSignOptions = {}) {
    return this.jwtService.sign(accessTokenPayload, merge({
      secret: AppConfig.jwtSecret,
      expiresIn: AppConfig.jwtExpires,
    }, options));
  }

  /**
   * Register new user
   * @param registerDto - login, name and password
   * @returns new user
   */
  public async register(registerDto: RegisterDto): Promise<User> {
    // Validate registerDto
    const errors = [];
    if (!registerDto.login || !isString(registerDto.login) || registerDto.login.length < 5) {
      errors.push('Логин не может быть меньше 5 символов');
    }
    if (await this.prisma.user.findUnique({ where: { login: registerDto.login } })) {
      errors.push('Пользователь с таким логином уже существует');
    }
    if (!registerDto.name || !isString(registerDto.name) || registerDto.name.length < 1) {
      errors.push('Имя не может быть пустым');
    }
    if (!registerDto.password || !isString(registerDto.password) || registerDto.password.length < 5) {
      errors.push('Пароль должен быть не менее 5 символов');
    }
    if (errors.length) {
      throw new BadRequestException(`Неверный ввод: ${errors.join('; ')}.`);
    }
    // Register
    return this.prisma.user.create({
      data: {
        login: registerDto.login,
        name: registerDto.name,
        password: await bcrypt.hash(registerDto.password, 10),
      },
    });
  }

  /**
   * Login user
   * @param loginDto - login and password
   * @returns jwt token
   */
  public async login(loginDto: LoginDto) {
    // Validate loginDto
    const errors = [];
    if (!loginDto.login || !isString(loginDto.login)) {
      errors.push('Логин обязателен');
    }
    if (!loginDto.password || !isString(loginDto.password)) {
      errors.push('Пароль обязателен');
    }
    if (errors.length) {
      throw new BadRequestException(`Неверный ввод: ${errors.join('; ')}.`);
    }
    // Check credentials
    const user = await this.prisma.user.findUniqueOrThrow({ where: { login: loginDto.login } }).catch(() => {
      throw new UnauthorizedException('Пользователь не найден');
    });
    if (!await bcrypt.compare(loginDto.password, user.password)) {
      throw new UnauthorizedException('Неверный пароль');
    }
    // Generate JWT
    return this.generateJWT({ userId: user.id });
  }
}
