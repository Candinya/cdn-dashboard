import { useEffect, useState } from 'react';
import { IconDiamondFilled, IconLogout, IconUserScan } from '@tabler/icons-react';
import { useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { Avatar, Group, Menu, rem, Text, UnstyledButton } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { authTokenAtom } from '@/atoms/authToken';
import { selfInfoAtom } from '@/atoms/selfInfo';
import UserModal from '@/components/modals/UserModal';

const menuIconStyle = { width: rem(14), height: rem(14) };

const Self = () => {
  const [authToken, setAuthToken] = useAtom(authTokenAtom);
  const nav = useNavigate();

  const [{ data: selfInfo, isPending, isError, error }] = useAtom(selfInfoAtom);

  useEffect(() => {
    // 初始化时候加载用户信息
    if (!authToken) {
      nav('/login');
      return; // 不再进行后续处理
    }
  }, [authToken]);

  useEffect(() => {
    if (isError) {
      notifications.show({
        color: 'red',
        title: '用户信息拉取失败',
        message: error.message,
      });

      nav('/login');
    }
  }, [isError]);

  const logout = () => {
    setAuthToken(null);
    nav('/login');
  };

  const openLogoutConfirmModal = () =>
    modals.openConfirmModal({
      title: '退出登录',
      children: <Text size="sm">您确认要退出登录吗？</Text>,
      labels: { confirm: '退出登录', cancel: '取消' },
      confirmProps: { color: 'red' },
      onConfirm: logout,
    });

  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);

  return (
    <>
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <UnstyledButton>
            <Avatar color="blue" name={selfInfo?.name} />
          </UnstyledButton>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>
            <Group gap="xs">
              <Text>{selfInfo?.name}</Text>
              {selfInfo?.is_admin && (
                <Group c="yellow.4">
                  <IconDiamondFilled style={menuIconStyle} />
                </Group>
              )}
            </Group>
          </Menu.Label>
          <Menu.Item
            leftSection={<IconUserScan style={menuIconStyle} />}
            onClick={() => setIsInfoModalOpen(true)}
          >
            编辑基本信息
          </Menu.Item>

          {/*<Menu.Divider />*/}
          {/*<Menu.Label>系统操作</Menu.Label>*/}
          <Menu.Item
            color="red"
            leftSection={<IconLogout style={menuIconStyle} />}
            onClick={openLogoutConfirmModal}
          >
            退出登录
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      {/*编辑个人信息窗口*/}
      <UserModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        userId={selfInfo?.id || null}
      />
    </>
  );
};

export default Self;
