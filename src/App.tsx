/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ModuleProvider } from './contexts/ModuleContext';
import Layout from './components/Layout';
import Home from './components/Home';
import ModuleDetails from './components/ModuleDetails';
import Calendar from './components/Calendar';
import Analytics from './components/Analytics';
import Profile from './components/Profile';
import Login from './components/Login';
import Todo from './components/Todo';
import LandingPage from './components/LandingPage';
import { useAIReminders } from './hooks/useAIReminders';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  if (!session) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  const { session } = useAuth();
  const isAuthenticated = !!session;
  useAIReminders();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isAuthenticated ? <ProtectedRoute><Layout /></ProtectedRoute> : <LandingPage />}>
          <Route index element={<Home />} />
          <Route path="insights" element={<Analytics />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="todo" element={<Todo />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/module/:id" element={<ProtectedRoute><ModuleDetails /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
