import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.tsx';
import './index.css';
import './common/dayjs-configuration.ts';
import { queryClient } from './api/query-client.ts';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { RegisterModal } from './modals/RegisterModal.tsx';
import { LoginModal } from './modals/LoginModal.tsx';
import { TodoEditModal } from './modals/TodoEditModal.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App/>
      <Toaster
        richColors
        theme={'dark'}
        position="bottom-right"
        closeButton
      />
      <RegisterModal/>
      <LoginModal/>
      <TodoEditModal/>
    </QueryClientProvider>
  </React.StrictMode>,
);
