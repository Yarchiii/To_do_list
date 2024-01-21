import { FC } from 'react';
import { Button } from '@nextui-org/react';
import { LoginModal } from '../modals/LoginModal.tsx';
import { RegisterModal } from '../modals/RegisterModal.tsx';
import { LogIn, UserRoundPlus } from 'lucide-react';

export const HomeForGuest: FC = () => {
  return (
    <div className="flex flex-col justify-center mx-auto mt-10">
      <h1 className="text-3xl text-center mb-1">Добро пожаловать!</h1>
      <p>Здесь вы сможете хранить свои напоминания</p>
      <div className="flex gap-3 justify-center items-center mt-5">
        <Button startContent={<LogIn size="1rem"/>} onClick={LoginModal.open} color="primary" variant="flat">Войдите</Button>
        или
        <Button startContent={<UserRoundPlus size="1rem"/>} onClick={RegisterModal.open} color="primary" variant="flat">Зарегистрируйтесь</Button>
      </div>
    </div>
  );
};