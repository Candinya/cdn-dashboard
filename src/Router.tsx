import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import AdditionalFile from '@/pages/AdditionalFile';
import Cert from '@/pages/Cert';
import Instance from '@/pages/Instance';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import Site from '@/pages/Site';
import Template from '@/pages/Template';
import User from '@/pages/User';
import Home from './pages/Home';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/user',
    element: (
      <DashboardLayout>
        <User />
      </DashboardLayout>
    ),
  },
  {
    path: '/instance',
    element: (
      <DashboardLayout>
        <Instance />
      </DashboardLayout>
    ),
  },
  {
    path: '/site',
    element: (
      <DashboardLayout>
        <Site />
      </DashboardLayout>
    ),
  },
  {
    path: '/template',
    element: (
      <DashboardLayout>
        <Template />
      </DashboardLayout>
    ),
  },
  {
    path: '/cert',
    element: (
      <DashboardLayout>
        <Cert />
      </DashboardLayout>
    ),
  },
  {
    path: '/additional-file',
    element: (
      <DashboardLayout>
        <AdditionalFile />
      </DashboardLayout>
    ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
