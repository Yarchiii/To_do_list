import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import { makeVar, useReactiveVar } from 'react-reactive-var';
import { merge } from 'lodash';
import { useState } from 'react';
import { ApiAuth } from '../api/axios.ts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiCacheKeys } from '../api/query-client.ts';

const isLoginModalOpen = makeVar(false);

export const LoginModal = merge(() => {
  const queryClient = useQueryClient();
  const isOpen = useReactiveVar(isLoginModalOpen);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  const { mutate, isPending } = useMutation({
    mutationKey: ApiCacheKeys.Login,
    mutationFn: ApiAuth.loginFn,
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ApiCacheKeys.Me });
      onClose();
    },
  });

  const onClose = () => {
    setLogin('');
    setPassword('');
    isLoginModalOpen(false);
  };

  const onLogin = async () => mutate({ login, password })
  const onLoginChange: React.ChangeEventHandler<HTMLInputElement> = (e) => setLogin(e.target.value);
  const onPasswordChange: React.ChangeEventHandler<HTMLInputElement> = (e) => setPassword(e.target.value);

  return (
    <Modal isOpen={isOpen} backdrop="blur" onClose={isPending ? undefined : onClose}>
      <ModalContent>
        <ModalHeader>Вход</ModalHeader>
        <ModalBody>
          <Input labelPlacement='outside' isDisabled={isPending} value={login} onChange={onLoginChange} label="Логин" placeholder="Логин"/>
          <Input labelPlacement='outside' isDisabled={isPending} value={password} type="password" onChange={onPasswordChange} label="Пароль" placeholder="Пароль"/>
        </ModalBody>
        <ModalFooter>
          <Button isDisabled={isPending} onClick={onClose} variant='flat'>Отмена</Button>
          <Button isLoading={isPending} color="success" onClick={onLogin}>Войти</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}, {
  open: () => isLoginModalOpen(true),
  close: () => isLoginModalOpen(false),
});
