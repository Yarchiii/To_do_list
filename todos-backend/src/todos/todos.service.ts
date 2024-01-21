import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { isBoolean } from 'lodash';
import { TodoUpsertDto } from './dtos/todo-upsert.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as uuid from 'uuid';
import { Prisma } from '@prisma/client';

@Injectable()
export class TodosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get todo by id for current authorized user
   * @param userId - Current authorized user id
   * @param todoId - Todo id for getting
   * @returns Todo by id for current authorized user
   */
  async todoById(userId: string, todoId: string) {
    // Validate
    if (!uuid.validate(todoId)) {
      throw new BadRequestException('Неверный ID напоминания');
    }
    return this.prisma.todo.findUniqueOrThrow({ where: { id: todoId, userId } }).catch(() => {
      throw new NotFoundException('Напоминание не найдено');
    });
  }

  /**
   * Get all todos for current authorized user
   * @param userId - Current authorized user id
   * @returns All todos for current authorized user
   */
  async todos(userId: string) {
    return this.prisma.todo.findMany({
      where: { userId },
      orderBy: [{ targetDate: Prisma.SortOrder.asc }, { createdAt: Prisma.SortOrder.asc }],
    });
  }

  /**
   * Create or update todo
   * @param userId - Current authorized user id
   * @param todoUpsertDto - DTO for creating or updating todo
   * @returns Created or updated todo
   */
  async todoUpsert(userId: string, todoUpsertDto: TodoUpsertDto) {
    const todoId = todoUpsertDto.todoId;
    const input = {
      title: todoUpsertDto.title,
      targetDate: new Date(todoUpsertDto.targetDate),
      completed: todoUpsertDto.completed,
    };
    // Validate
    const errors: string[] = [];
    if (todoId) {
      if (!uuid.validate(todoId)) {
        errors.push('Неверный ID напоминания');
      } else {
        await this.prisma.todo.findUniqueOrThrow({ where: { id: todoId, userId } }).catch(() => {
          errors.push('Напоминание не найдено');
        });
      }
    }
    if (!input.title || input.title.length < 3) {
      errors.push('Название должно быть не менее 3 символов');
    }
    if (!input.targetDate || isNaN(new Date(input.targetDate).getTime())) {
      errors.push('Дата выполнения обязательна');
    }
    if (!isBoolean(input.completed)) {
      errors.push('Завершено ли - должно быть boolean');
    }
    if (errors.length) {
      throw new BadRequestException(`Неверный ввод: ${errors.join('; ')}.`);
    }
    // Upsert todo
    return this.prisma.todo.upsert({
      where: { id: todoId || uuid.v4() },
      create: {
        ...input,
        user: { connect: { id: userId } },
      },
      update: input,
    });
  }

  /**
   * Update todo completed
   * @param userId - Current authorized user id
   * @param todoId - Todo id for updating
   * @returns Updated todo
   */
  async todoSwitchCompleted(userId: string, todoId: string) {
    // Validate
    if (!uuid.validate(todoId)) {
      throw new BadRequestException('Неверный ID напоминания');
    }
    const todo = await this.prisma.todo.findUniqueOrThrow({ where: { id: todoId, userId } }).catch(() => {
      throw new NotFoundException('Напоминание не найдено');
    });
    // Update
    return this.prisma.todo.update({
      where: { id: todoId },
      data: { completed: !todo.completed },
    });
  }

  /**
   * Delete todo
   * @param todoId - Todo id for deleting
   * @param userId - Current authorized user id
   * @returns Deleted todo
   */
  async todoDelete(userId: string, todoId: string) {
    // Validate
    if (!uuid.validate(todoId)) {
      throw new BadRequestException('Неверный ID напоминания');
    }
    await this.prisma.todo.findUniqueOrThrow({ where: { id: todoId, userId: userId } }).catch(() => {
      throw new NotFoundException('Напоминание не найдено');
    });
    // Delete
    return this.prisma.todo.delete({ where: { id: todoId } });
  }
}
