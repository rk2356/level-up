import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { ModuleProvider } from './contexts/ModuleContext';
import { CalendarProvider } from './contexts/CalendarContext';
import { NotificationProvider } from './contexts/NotificationContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ModuleProvider>
        <CalendarProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </CalendarProvider>
      </ModuleProvider>
    </AuthProvider>
  </StrictMode>,
);
