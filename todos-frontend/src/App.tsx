import { Header } from './widgets/Header.tsx';
import { TodosList } from './widgets/TodosList.tsx';
import { useQuery } from '@tanstack/react-query';
import { ApiCacheKeys } from './api/query-client.ts';
import { ApiAuth } from './api/axios.ts';
import { HomeForGuest } from './widgets/HomeForGuest.tsx';
import { Spinner } from '@nextui-org/react';

export const App = () => {
  const { data: user, isLoading } = useQuery({
    queryKey: ApiCacheKeys.Me,
    queryFn: ApiAuth.meFn,
  });

  return (
    <>
      <Header/>
      {isLoading
        ? <Spinner/>
        : user
          ? <TodosList/>
          : <HomeForGuest/>}
    </>
  );
};
