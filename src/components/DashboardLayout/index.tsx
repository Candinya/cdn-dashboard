import type { PropsWithChildren } from 'react';
import { AppShell, Burger, Group, ScrollArea, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Self from '@/components/DashboardLayout/Self';
import Logo from '@/components/Logo';
import Nav from './Nav';

interface DashboardLayoutProps extends PropsWithChildren {}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: { base: 60, md: 70, lg: 80 } }}
      navbar={{
        width: { base: 200, md: 300, lg: 400 },
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Group justify="space-between" style={{ flex: 1 }}>
            <Group>
              <Logo />
              <Title order={2} size={36}>
                CDN
              </Title>
            </Group>
            <Group ml="xl">
              <Self />
            </Group>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar>
        <ScrollArea>
          <Nav />
        </ScrollArea>
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};

export default DashboardLayout;
