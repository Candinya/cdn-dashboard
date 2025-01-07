import {
  IconCertificate,
  IconCloudComputing,
  IconFile,
  IconTemplate,
  IconUser,
  IconWorldWww,
} from '@tabler/icons-react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { NavLink } from '@mantine/core';

const navs = [
  {
    path: '/instance',
    label: '实例',
    icon: IconCloudComputing,
  },
  {
    path: '/site',
    label: '站点',
    icon: IconWorldWww,
  },
  {
    path: '/cert',
    label: '证书',
    icon: IconCertificate,
  },
  {
    path: '/template',
    label: '模板',
    icon: IconTemplate,
  },
  {
    path: '/additional-file',
    label: '额外文件',
    icon: IconFile,
  },
  {
    path: '/user',
    label: '用户',
    icon: IconUser,
  },
];

const Nav = () => {
  const location = useLocation();

  return (
    <>
      {navs.map((route) => (
        <NavLink
          key={route.path}
          label={route.label}
          leftSection={<route.icon stroke={1.5} />}
          component={RouterNavLink}
          to={route.path}
          active={location.pathname === route.path}
        />
      ))}
    </>
  );
};

export default Nav;
