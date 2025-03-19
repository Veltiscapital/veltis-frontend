import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import routes from './routes';
import './App.css';

function App() {
  const router = createBrowserRouter(routes);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
