import { Button, Checkbox, Link, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@nextui-org/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiCacheKeys } from '../api/query-client.ts';
import { ApiTodos } from '../api/axios.ts';
import dayjs from 'dayjs';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { TodoEditModal } from '../modals/TodoEditModal.tsx';

export const TodosList = () => {
  const queryClient = useQueryClient();
  const { data: todos = [], isLoading } = useQuery({
    queryKey: ApiCacheKeys.Todos,
    queryFn: ApiTodos.todosFn,
  });

  const { mutate: todoSwitch, isPending: isLoadingSwitch } = useMutation({
    mutationFn: ApiTodos.todoSwitchFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ApiCacheKeys.Todos }),
  });

  const { mutate: todoDelete, isPending: isLoadingDelete } = useMutation({
    mutationFn: ApiTodos.deleteTodoFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ApiCacheKeys.Todos }),
  });

  return (
    <div className="w-[700px] mx-auto py-3 flex flex-col gap-3">
      <div className="flex justify-end gap-3">
        <Button startContent={<Plus size='1rem' />} size="sm" onClick={TodoEditModal.create}>Добавить</Button>
      </div>
      <Table isStriped>
        <TableHeader>
          <TableColumn>№</TableColumn>
          <TableColumn>Завершено</TableColumn>
          <TableColumn>Название</TableColumn>
          <TableColumn>Дата</TableColumn>
          <TableColumn>Действия</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent={<>
            У вас нет напоминаний, <Link className="cursor-pointer" onClick={TodoEditModal.create}>создайте</Link> первое!
          </>}
          loadingState={isLoading ? 'loading' : 'idle'}
          loadingContent={<Spinner/>}
        >
          {todos.map((todo, index) => (
            <TableRow key={todo.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                <Checkbox onValueChange={() => !isLoadingSwitch && todoSwitch(todo.id)} isSelected={todo.completed}/>
              </TableCell>
              <TableCell>{todo.title}</TableCell>
              <TableCell>{dayjs(todo.targetDate).format('HH:mm DD MMM YYYY, dddd')}</TableCell>
              <TableCell className="gap-1 justify-center items-center">
                <div className="flex justify-center gap-1">
                  <Pencil
                    onClick={() => TodoEditModal.edit(todo.id)}
                    className="text-gray-500 hover:text-primary transition cursor-pointer"
                    size='1.4rem'
                  />
                  <Trash2
                    onClick={() => !isLoadingDelete && todoDelete(todo.id)}
                    className="text-gray-500 hover:text-danger transition cursor-pointer"
                    size='1.4rem'
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
