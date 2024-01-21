import axios, { AxiosError } from 'axios';
import { ITodo, ITodoUpsertDto, IUser } from './interfaces.ts';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(res => res, (err: AxiosError) => {
  const token = localStorage.getItem('token');
  if (err.response?.status === 401) {
    if (token) {
      localStorage.removeItem('token');
      window.location.reload();
    }
  } else {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    toast.error(err.response?.data?.message || err.message);
  }
  throw err;
});

export abstract class ApiAuth {
  static async loginFn(dto: { login: string, password: string }) {
    const token = await api.post<string>('/auth/login', dto).then(res => res.data);
    localStorage.setItem('token', token);
  }

  static async registerFn(dto: { name: string, login: string, password: string }) {
    const token = await api.post<string>('/auth/register', dto).then(res => res.data);
    localStorage.setItem('token', token);
  }

  static async meFn(): Promise<IUser> {
    return api.get<IUser>('/auth/me').then(res => res.data);
  }
}

export abstract class ApiTodos {
  static async todoFn(todoId: string): Promise<ITodo> {
    return api.get<ITodo>(`/todos/${todoId}`).then(res => res.data);
  }

  static async todosFn(): Promise<ITodo[]> {
    return api.get<ITodo[]>('/todos').then(res => res.data);
  }

  static async todoUpsertFn(dto: ITodoUpsertDto): Promise<ITodo> {
    return api.post<ITodo>('/todos', dto).then(res => res.data);
  }

  static async todoSwitchFn(todoId: string): Promise<ITodo> {
    return api.patch<ITodo>(`/todos/switch/${todoId}`).then(res => res.data);
  }

  static async deleteTodoFn(todoId: string): Promise<ITodo> {
    return api.delete<ITodo>(`/todos/${todoId}`).then(res => res.data);
  }
}
