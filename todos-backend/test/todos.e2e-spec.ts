import { HttpStatus, INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';
import { Todo, User } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import { Factory, TestUtils } from './utils';
import { TodoUpsertDto } from '../src/todos/dtos/todo-upsert.dto';
import * as uuid from 'uuid';

describe('Todos', () => {
  let app: INestApplication;
  let [agentUser1, agentUser2]: SuperAgentTest[] = [];
  let [user1, user2]: User[] = [];
  let prisma: PrismaService;
  let [user1todo1, user1todo2]: Todo[] = [];
  let [user2todo1, user2todo2]: Todo[] = [];

  beforeAll(async () => {
    app = await TestUtils.createTestingApp();
    prisma = await app.resolve(PrismaService);
    [[agentUser1, user1], [agentUser2, user2]] = await Promise.all([
      TestUtils.authorizeNewUser(prisma, app),
      TestUtils.authorizeNewUser(prisma, app),
    ]);
  });

  beforeEach(async () => {
    await prisma.todo.deleteMany();
    [user1todo1, user1todo2, user2todo1, user2todo2] = await Promise.all([
      prisma.todo.create({ data: { ...Factory.Todo(), user: { connect: { id: user1.id } } } }),
      prisma.todo.create({ data: { ...Factory.Todo(), user: { connect: { id: user1.id } } } }),
      prisma.todo.create({ data: { ...Factory.Todo(), user: { connect: { id: user2.id } } } }),
      prisma.todo.create({ data: { ...Factory.Todo(), user: { connect: { id: user2.id } } } }),
    ]);
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.todo.deleteMany();
    await app.close();
  });

  it('Get all', async () => {
    await agentUser1.get('/todos')
      .expect((res) => {
        const todos = res.body as Todo[];
        user1todo1.createdAt = user1todo1.createdAt.toISOString() as any;
        user1todo2.createdAt = user1todo2.createdAt.toISOString() as any;
        user1todo1.targetDate = user1todo1.targetDate.toISOString() as any;
        user1todo2.targetDate = user1todo2.targetDate.toISOString() as any;
        expect(todos).toEqual(expect.arrayContaining([user1todo1, user1todo2]));
        expect(todos.length).toEqual(2);
      });
  });

  it('Get by id', async () => {
    await agentUser1.get(`/todos/${user1todo1.id}`)
      .expect((res) => {
        const todo = res.body as Todo;
        user1todo1.createdAt = user1todo1.createdAt.toISOString() as any;
        user1todo1.targetDate = user1todo1.targetDate.toISOString() as any;
        expect(todo).toEqual(user1todo1);
      });
  });

  it('Create', async () => {
    const todoDto: TodoUpsertDto = Factory.Todo();
    await agentUser1.post('/todos')
      .send(todoDto)
      .expect((res) => {
        const todo = res.body as Todo;
        expect(uuid.validate(todo.id)).toBeTruthy();
        expect(todo).toEqual(expect.objectContaining(todoDto));
        expect(todo.userId).toEqual(user1.id);
      });
    expect(await prisma.todo.count()).toEqual(5);
    expect(await prisma.todo.count({ where: { userId: user1.id } })).toEqual(3);
  });

  it('Update', async () => {
    const todoDto: TodoUpsertDto = Factory.Todo({ todoId: user2todo1.id });
    expect(await prisma.todo.findUnique({ where: { id: user2todo1.id } })).toBeTruthy();
    const todoExpected = {
      id: user2todo1.id,
      userId: user2.id,
      title: todoDto.title,
      completed: todoDto.completed,
    };
    await agentUser2.post(`/todos`)
      .send(todoDto)
      .expect((res) => {
        expect(res.status).toEqual(201);
        const todo = res.body as Todo;
        expect(todo).toEqual(expect.objectContaining(todoExpected));
      });
    const updatedTodo = await prisma.todo.findUnique({ where: { id: user2todo1.id } });
    expect(updatedTodo).toEqual(expect.objectContaining(todoExpected));
  });

  it('Delete', async () => {
    expect(await prisma.todo.findUnique({ where: { id: user2todo1.id } })).toBeTruthy();
    expect(await prisma.todo.count()).toEqual(4);
    expect(await prisma.todo.count({ where: { userId: user2.id } })).toEqual(2);
    await agentUser2.delete(`/todos/${user2todo1.id}`)
      .expect((res) => expect(res.status).toEqual(HttpStatus.OK));
    expect(await prisma.todo.findUnique({ where: { id: user2todo1.id } })).toBeFalsy();
    expect(await prisma.todo.count()).toEqual(3);
    expect(await prisma.todo.count({ where: { userId: user2.id } })).toEqual(1);
  });

  it('Switch completed', async () => {
    const previous = user2todo1.completed;
    expect(await prisma.todo.findUnique({ where: { id: user2todo1.id } })).toBeTruthy();
    await agentUser2.patch(`/todos/switch/${user2todo1.id}`)
      .expect((res) => expect(res.status).toEqual(HttpStatus.OK));
    expect((await prisma.todo.findUniqueOrThrow({ where: { id: user2todo1.id } })).completed).toEqual(!previous);
  });

  it('Get by id for another user', async () => {
    await agentUser1.get(`/todos/${user2todo1.id}`)
      .expect((res) => expect(res.status).toEqual(HttpStatus.NOT_FOUND));
  });

  it('Update for another user', async () => {
    const todoDto: TodoUpsertDto = Factory.Todo({ todoId: user2todo1.id });
    await agentUser1.post(`/todos`)
      .send(todoDto)
      .expect((res) => expect(res.status).toEqual(HttpStatus.BAD_REQUEST));
  });

  it('Delete for another user', async () => {
    expect(await prisma.todo.count()).toEqual(4);
    expect(await prisma.todo.count({ where: { userId: user1.id } })).toEqual(2);
    expect(await prisma.todo.count({ where: { userId: user2.id } })).toEqual(2);
    await agentUser1.delete(`/todos/${user2todo1.id}`)
      .expect((res) => expect(res.status).toEqual(HttpStatus.NOT_FOUND));
    expect(await prisma.todo.count()).toEqual(4);
    expect(await prisma.todo.count({ where: { userId: user1.id } })).toEqual(2);
    expect(await prisma.todo.count({ where: { userId: user2.id } })).toEqual(2);
  });

  it('Switch completed for another user', async () => {
    await agentUser1.patch(`/todos/switch/${user2todo1.id}`)
      .expect((res) => expect(res.status).toEqual(HttpStatus.NOT_FOUND));
  });

  it('Bad create input', async () => {
    await agentUser1.post('/todos')
      .send({ title: 'ab', completed: 123 })
      .expect((res) => expect(res.status).toEqual(HttpStatus.BAD_REQUEST));
  });
});
