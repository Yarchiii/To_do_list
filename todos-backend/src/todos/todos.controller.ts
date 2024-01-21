import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TodoUpsertDto } from './dtos/todo-upsert.dto';
import { TodosService } from './todos.service';

/**
 * Controller for todos
 */
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  /**
   * Get todo by id for current authorized user
   * @param userId - Current authorized user id
   * @param todoId - Todo id for getting
   * @returns Todo by id for current authorized user
   */
  @Get(':todoId')
  async todo(
    @CurrentUser('id') userId: string,
    @Param('todoId') todoId: string,
  ) {
    return this.todosService.todoById(userId, todoId);
  }

  /**
   * Get all todos for current authorized user
   * @param userId - Current authorized user id
   * @returns All todos for current authorized user
   */
  @Get()
  async todos(@CurrentUser('id') userId: string) {
    return this.todosService.todos(userId);
  }

  /**
   * Create or update todo
   * @param userId - Current authorized user id
   * @param todoUpsertDto - DTO for creating or updating todo
   * @returns Created or updated todo
   */
  @Post()
  async todoUpsert(
    @CurrentUser('id') userId: string,
    @Body() todoUpsertDto: TodoUpsertDto,
  ) {
    return this.todosService.todoUpsert(userId, todoUpsertDto);
  }

  @Patch('switch/:todoId')
  async todoSwitch(
    @CurrentUser('id') userId: string,
    @Param('todoId') todoId: string,
  ) {
    return this.todosService.todoSwitchCompleted(userId, todoId);
  }


  @Delete(':todoId')
  async todoDelete(
    @CurrentUser('id') userId: string,
    @Param('todoId') todoId: string,
  ) {
    return this.todosService.todoDelete(userId, todoId);
  }
}
