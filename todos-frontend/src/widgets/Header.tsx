import { FC } from 'react';
import { Button, Spinner } from '@nextui-org/react';
import { RegisterModal } from '../modals/RegisterModal.tsx';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiAuth } from '../api/axios.ts';
import { ApiCacheKeys } from '../api/query-client.ts';
import { LoginModal } from '../modals/LoginModal.tsx';
import TodoLogo from '/todo-icon.svg';
import { LogIn, LogOut, UserRoundPlus } from 'lucide-react';

export const Header: FC = () => {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery({
    queryKey: ApiCacheKeys.Me,
    queryFn: ApiAuth.meFn,
  });

  const onLogout = async () => {
    localStorage.removeItem('token');
    await queryClient.resetQueries({ queryKey: ApiCacheKeys.Me });
  };

  return (
    <header className="flex gap-3 items-center justify-between bg-green-950 px-10 py-3">
      <h1 className="flex gap-3 items-center"><img className="w-7" src={TodoLogo} alt="website todos logo"/>Напоминания</h1>
      <div className="grow"/>
      {isLoading
        ? <Spinner/>
        : user
          ? <>
            <span>{user.name}</span>
            <Button startContent={<LogOut size='1rem'/>} onClick={onLogout} size="sm" variant="flat">Выйти</Button>
          </> : <>
            <Button startContent={<LogIn size="1rem"/>} onClick={LoginModal.open} size="sm" variant="flat">Вход</Button>
            <Button startContent={<UserRoundPlus size="1rem"/>} onClick={RegisterModal.open} size="sm" variant="flat">Регистрация</Button>
          </>}
    </header>
  );
};
