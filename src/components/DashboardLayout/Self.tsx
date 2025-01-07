import { useEffect, useState } from 'react';
import { IconInfoCircle, IconKey, IconLogout, IconUserScan } from '@tabler/icons-react';
import { useAtom } from 'jotai/index';
import { useNavigate } from 'react-router-dom';
import { Avatar, Menu, rem, Text, UnstyledButton } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import API from '@/api';
import type { UserInfoWithID } from '@/api/user';
import { authTokenAtom } from '@/atoms/authToken';

const menuIconStyle = { width: rem(14), height: rem(14) };

const Self = () => {
  const [authToken, setAuthToken] = useAtom(authTokenAtom);
  const nav = useNavigate();

  const [selfInfo, setSelfInfo] = useState<UserInfoWithID | null>(null);

  const loadUserInfo = async (token: string) => {
    try {
      const selfInfo = await API.UserAPI.GetSelfInfo(token);
      setSelfInfo(selfInfo);
    } catch (e: any) {
      notifications.show({
        color: 'red',
        title: '用户信息拉取失败',
        message: e.message,
      });

      nav('/login');
    }
  };

  useEffect(() => {
    // 初始化时候加载用户信息
    if (!authToken) {
      nav('/login');
      return; // 不再进行后续处理
    }

    // 设置用户信息
    loadUserInfo(authToken);
  }, [authToken]);

  const logout = () => {
    setAuthToken(null);
    nav('/login');
  };

  const openLogoutConfirmModal = () =>
    modals.openConfirmModal({
      title: '退出登录',
      centered: true,
      children: <Text size="sm">您确认要退出登录吗？</Text>,
      labels: { confirm: '退出登录', cancel: '取消' },
      confirmProps: { color: 'red' },
      onConfirm: logout,
    });

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <UnstyledButton>
          <Avatar color="blue" name={selfInfo?.name} />
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{selfInfo?.name}</Menu.Label>
        <Menu.Item leftSection={<IconInfoCircle style={menuIconStyle} />}>编辑基本信息</Menu.Item>
        <Menu.Item leftSection={<IconUserScan style={menuIconStyle} />}>编辑用户名</Menu.Item>
        <Menu.Item leftSection={<IconKey style={menuIconStyle} />}>编辑密码</Menu.Item>

        <Menu.Divider />
        <Menu.Label>系统操作</Menu.Label>
        <Menu.Item
          color="red"
          leftSection={<IconLogout style={menuIconStyle} />}
          onClick={openLogoutConfirmModal}
        >
          退出登录
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default Self;
