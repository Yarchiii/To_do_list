import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { Factory, TestUtils } from './utils';
import request, { SuperAgentTest } from 'supertest';
import { User } from '@prisma/client';
import { omit } from 'lodash';
import { LoginDto } from '../src/auth/dtos/login.dto';

describe('Users Auth', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let agent: SuperAgentTest;

  let agentUser1: SuperAgentTest;
  let user1: User;

  beforeAll(async () => {
    app = await TestUtils.createTestingApp();
    prisma = await app.resolve(PrismaService);
    agent = request.agent(app.getHttpServer());
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
    [agentUser1, user1] = await TestUtils.authorizeNewUser(prisma, app);
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await app.close();
  });

  it('Register & Check user info', async () => {
    expect(await prisma.user.count()).toEqual(1);
    const registerDto = Factory.User();
    let token = '';
    await agent.post('/auth/register').send(registerDto).expect((res) => {
      token = res.text;
      expect(typeof token).toBe('string');
    });
    const user = await prisma.user.findUnique({ where: { login: registerDto.login } })!;
    expect(user?.login).toEqual(registerDto.login);
    await agent.get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send()
      .expect((res) => {
        const user2 = res.body as Omit<User, 'password'>;
        expect(user2).not.toHaveProperty('password');
        expect(user2).toEqual(omit(user, 'password'));
      });
    expect(await prisma.user.count()).toEqual(2);
  });

  it('Login & Check user info', async () => {
    expect(await prisma.user.count()).toEqual(1);
    const loginDto: LoginDto = { login: user1.login, password: user1.password };
    const user = await prisma.user.findUnique({ where: { login: loginDto.login } })!;
    expect(user?.login).toEqual(loginDto.login);
    await agentUser1.post('/auth/login').send(loginDto).expect((res) => {
      const token = res.text;
      expect(typeof token).toBe('string');
    });
    await agentUser1.get('/auth/me').send().expect((res) => {
      const user2 = res.body as Omit<User, 'password'>;
      expect(user2).not.toHaveProperty('password');
      expect(user2).toEqual(omit(user, 'password'));
    });
    expect(await prisma.user.count()).toEqual(1);
  });
});
