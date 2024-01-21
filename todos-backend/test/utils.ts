import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import request, { SuperAgentTest } from 'supertest';
import { User } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import { TodoUpsertDto } from '../src/todos/dtos/todo-upsert.dto';
import { RegisterDto } from '../src/auth/dtos/register.dto';
import crypto from 'node:crypto';
import { isUndefined, omitBy } from 'lodash';

function randomString(length: number = 10) {
  const sha256 = crypto.createHash('sha256');
  sha256.update(Math.random().toString());
  return sha256.digest('hex').substring(0, length);
}

export const Factory = {
  User: (params?: Partial<RegisterDto>): RegisterDto => omitBy({
    login: params?.login ?? randomString(10),
    password: params?.password ?? randomString(10),
    name: params?.name ?? randomString(10),
  }, isUndefined) as RegisterDto,
  Todo: (params?: Partial<TodoUpsertDto>): TodoUpsertDto => omitBy({
    todoId: params?.todoId,
    title: params?.title ?? randomString(10),
    targetDate: params?.targetDate ?? new Date().toISOString(),
    completed: params?.completed ?? Math.random() > 0.5,
  }, isUndefined) as TodoUpsertDto,
};

export const TestUtils = {
  /**
   * Method for get a testing app instance
   */
  async createTestingApp() {
    const moduleFixture = await Test.createTestingModule({ imports: [AppModule] }).compile();

    const app = moduleFixture.createNestApplication({
      cors: {
        origin: true,
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      },
    });
    await app.init();
    return app;
  },


  async authorizeNewUser(
    prisma: PrismaService,
    app: INestApplication,
    [userCreateParams]: Parameters<typeof Factory.User> = [],
  ): Promise<[SuperAgentTest, User]> {
    const agent = request.agent(app.getHttpServer());
    const registerDto = Factory.User(userCreateParams);
    await agent.post('/auth/register').send(registerDto).expect((res) => {
      const token = res.text;
      expect(typeof token).toBe('string');
      agent.set('Authorization', `Bearer ${token}`);
    });
    const user: User = {
      id: (await prisma.user.findUniqueOrThrow({ where: { login: registerDto.login } })).id,
      ...registerDto,
    };
    return [agent, user] as const;
  },
};
