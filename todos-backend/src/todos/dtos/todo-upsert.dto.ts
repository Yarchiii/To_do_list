/**
 * Data transfer object for creating a todo.
 */
export class TodoUpsertDto {
  todoId?: string;
  title: string;
  completed: boolean;
  targetDate: string; // ISO 8601 date string
}
