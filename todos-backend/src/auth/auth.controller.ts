import { Body, Controller, Get, Post } from '@nestjs/common';
import { PublicEndpoint } from './decorators/public.decorator';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '@prisma/client';
import { omit } from 'lodash';

/**
 * Controller for users authorization
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Login user
   * @param loginDto - login and password
   * @returns jwt token
   */
  @Post('login')
  @PublicEndpoint()
  async login(@Body() loginDto: LoginDto): Promise<string> {
    return this.authService.login(loginDto);
  }

  /**
   * Register new user and login
   * @param registerDto - login, name and password
   * @returns jwt token
   */
  @Post('register')
  @PublicEndpoint()
  async register(@Body() registerDto: RegisterDto): Promise<string> {
    const user = await this.authService.register(registerDto);
    return this.authService.generateJWT({ userId: user.id });
  }

  /**
   * Get current authorized user
   * @param user - current authorized user from jwt guard context
   * @returns current authorized user
   */
  @Get('me')
  async me(@CurrentUser() user: User) {
    return omit(user, 'password');
  }
}
