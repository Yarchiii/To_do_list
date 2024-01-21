import { useEffect, useState } from 'react';
import { makeVar, useReactiveVar } from 'react-reactive-var';
import { isString, merge } from 'lodash';
import { Button, Checkbox, CheckboxProps, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiCacheKeys } from '../api/query-client.ts';
import { ApiTodos } from '../api/axios.ts';
import { toDatePicker } from '../common/to-date-picker.ts';
import dayjs from 'dayjs';

const isTodoEditModalOpen = makeVar(false as boolean | string);

export const TodoEditModal = merge(() => {
  const queryClient = useQueryClient();
  const isOpenOrTodoId = useReactiveVar(isTodoEditModalOpen);
  const isEditing = isString(isOpenOrTodoId);
  const { data: todo } = useQuery({
    queryKey: ApiCacheKeys.Todo(isEditing ? isOpenOrTodoId : ''),
    queryFn: () => ApiTodos.todoFn(isEditing ? isOpenOrTodoId : ''),
    enabled: isEditing,
  });
  const { mutate, isPending } = useMutation({
    mutationFn: ApiTodos.todoUpsertFn,
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ApiCacheKeys.Todos });
      onClose();
    },
  });
  const [title, setTitle] = useState('');
  const [completed, setCompleted] = useState(false);
  const [targetDate, setTargetDate] = useState(dayjs().format('YYYY-MM-DDTHH:mm'));

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setCompleted(todo.completed);
      setTargetDate(toDatePicker(todo.targetDate));
    }
  }, [todo]);

  const onClose = () => {
    setTitle('');
    setCompleted(false);
    setTargetDate(dayjs().format('YYYY-MM-DDTHH:mm'));
    isTodoEditModalOpen(false);
  };

  const onSave = async () => mutate({
    title,
    completed,
    targetDate: new Date(targetDate).toISOString(),
    todoId: isEditing ? isOpenOrTodoId : undefined,
  });
  const onTitleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => setTitle(e.target.value);
  const onCompletedChange: CheckboxProps['onValueChange'] = (isChecked) => setCompleted(isChecked);
  const onTargetDateChange: React.ChangeEventHandler<HTMLInputElement> = (e) => setTargetDate(e.target.value);

  return (
    <Modal isOpen={!!isOpenOrTodoId} backdrop="blur" onClose={isPending ? undefined : onClose}>
      <ModalContent>
        <ModalHeader>
          {isOpenOrTodoId === true ? 'Добавить напоминание' : 'Редактировать напоминание'}
        </ModalHeader>
        <ModalBody>
          <Input labelPlacement='outside' isDisabled={isPending} value={title} onChange={onTitleChange} label="Название" placeholder="Название"/>
          <Input value={targetDate} onChange={onTargetDateChange} labelPlacement="outside" type="datetime-local" label="Дата" placeholder=" "/>
          {isEditing && <Checkbox isDisabled={isPending} isSelected={completed} onValueChange={onCompletedChange}>Завершено</Checkbox>}
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} disabled={isPending} variant='flat'>Отмена</Button>
          <Button onClick={onSave} isLoading={isPending} color="success" variant="flat">Сохранить</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

}, {
  create: () => isTodoEditModalOpen(true),
  edit: (todoId: string) => isTodoEditModalOpen(todoId),
  close: () => isTodoEditModalOpen(false),
});
