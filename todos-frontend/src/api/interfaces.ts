export interface IUser {
  id: string;
  name: string;
  login: string;
}

export interface IRegisterDto extends Pick<IUser, 'name' | 'login'> {
  password: string;
}

export interface ILoginDto extends Pick<IRegisterDto, 'login' | 'password'> {}

export interface ITodo {
  id: string;
  title: string;
  completed: boolean;
  targetDate: string;
  userId: string;
  createdAt: string;
}

export interface ITodoUpsertDto extends Pick<ITodo, 'title' | 'completed' | 'targetDate'> {
  todoId?: string;
}
