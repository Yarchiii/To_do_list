import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    }
  }
});

export abstract class ApiCacheKeys {
  static Me = ['me'];
  static Login = ['login'];
  static Register = ['register'];
  static Todo = (todoId: string) => ['todo', todoId];
  static Todos = ['todos'];
  static TodoUpsert = (todoId?: string) => ['todo-upsert', todoId];
  static TodoSwitch = (todoId: string) => ['todo-switch', todoId];
  static DeleteTodo = (todoId: string) => ['delete-todo', todoId];
}
