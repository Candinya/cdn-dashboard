import { useEffect, useState } from 'react';
import { IconDeviceFloppy, IconLoader, IconPencil } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAtom, useAtomValue } from 'jotai';
import {
  ActionIcon,
  Button,
  Code,
  Flex,
  Group,
  Modal,
  PasswordInput,
  rem,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import API from '@/api';
import { UserInfoCreate, UserInfoInput } from '@/api/user';
import { authTokenAtom } from '@/atoms/authToken';
import { selfInfoAtom } from '@/atoms/selfInfo';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number | null; // null 表示创建新用户
}
const UserModal = ({ isOpen, onClose, userId }: UserModalProps) => {
  // 状态管理
  const [{ data: selfInfo }] = useAtom(selfInfoAtom);
  const authToken = useAtomValue(authTokenAtom);

  // 详细信息拉取请求
  const { data: userInfo } = useQuery({
    queryKey: ['user', 'info', userId],
    queryFn: async () => {
      if (userId) {
        return await API.UserAPI.GetUserInfo(authToken!, userId);
      } else {
        return null;
      }
    },
  });

  // 请求管理
  const queryClient = useQueryClient();

  // 主表单
  const userInfoForm = useForm<UserInfoInput>({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
    },
  });

  // 不跟随主表单变化的项
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // 当用户信息变更时的操作
  useEffect(() => {
    if (userInfo) {
      userInfoForm.setInitialValues({
        name: userInfo.name,
      });
      userInfoForm.reset();

      setUsername(userInfo.username);
      setPassword('--keep-unchanged--');
      setIsAdmin(userInfo.is_admin);
    } else {
      userInfoForm.setInitialValues({
        name: '',
      });
      userInfoForm.reset();

      setUsername('');
      setPassword('');
      setIsAdmin(false);
    }
  }, [userInfo, isOpen]);

  // 锁定不跟随主表单的项
  const [isFormUnlocked, setIsFormUnlocked] = useState<boolean>(false);
  const [isUsernameUnlocked, setIsUsernameUnlocked] = useState<boolean>(false);
  const [isPasswordUnlocked, setIsPasswordUnlocked] = useState<boolean>(false);

  // 开启时的初始化操作
  useEffect(() => {
    // 初始化时非新建则锁定
    if (isOpen) {
      setIsFormUnlocked(!userId);
      setIsUsernameUnlocked(false);
      setIsPasswordUnlocked(false);
    }
  }, [isOpen]);

  // 提交不随主表单变化的项
  const { isPending: isUpdatingUsername, mutate: updateUsername } = useMutation({
    mutationKey: ['user', 'update', userId, 'username'],
    mutationFn: (newUsername: string) => {
      return API.UserAPI.UpdateUserUsername(authToken!, userId!, newUsername);
    },
    onSuccess: (newUserInfo) => {
      if (userId === selfInfo?.id) {
        queryClient.refetchQueries({
          queryKey: ['user', 'self'],
        });
      }
      setIsUsernameUnlocked(false);
      notifications.show({
        color: 'green',
        title: '用户名更新成功',
        message: (
          <Text size="xs">
            以后要用 <Code>{newUserInfo.username}</Code> 登录啦
          </Text>
        ),
      });
    },
    onError: (e) => {
      notifications.show({
        color: 'red',
        title: '用户名更新失败',
        message: e.message,
      });
    },
  });
  const { isPending: isUpdatingPassword, mutate: updatePassword } = useMutation({
    mutationKey: ['user', 'update', userId, 'password'],
    mutationFn: (newPassword: string) => {
      return API.UserAPI.UpdateUserPassword(authToken!, userId!, newPassword);
    },
    onSuccess: () => {
      setIsPasswordUnlocked(false);
      notifications.show({
        color: 'green',
        title: '用户密码更新成功',
        message: <Text size="xs">记得保护好密码哦</Text>,
      });
    },
    onError: (e) => {
      notifications.show({
        color: 'red',
        title: '用户密码更新失败',
        message: e.message,
      });
    },
  });
  const { isPending: isUpdatingRole, mutate: updateRole } = useMutation({
    mutationKey: ['user', 'update', userId, 'role'],
    mutationFn: (newIsAdmin: boolean) => {
      return API.UserAPI.UpdateUserRole(authToken!, userId!, newIsAdmin);
    },
    onSuccess: (newUserInfo) => {
      if (userId === selfInfo?.id) {
        queryClient.refetchQueries({
          queryKey: ['user', 'self'],
        });
      }
      setIsAdmin(newUserInfo.is_admin);
      notifications.show({
        color: 'green',
        title: '用户权限更新成功',
        message: (
          <Text size="xs">
            用户现在是 <Code>{newUserInfo.is_admin ? '管理员' : '一般用户'}</Code>
          </Text>
        ),
      });
    },
    onError: (e) => {
      notifications.show({
        color: 'red',
        title: '用户权限更新失败',
        message: e.message,
      });
    },
  });

  // 提交主表单：更新用户信息
  const { isPending: isUpdatingUserInfo, mutate: updateInfo } = useMutation({
    mutationKey: ['user', 'update', userId, 'info'],
    mutationFn: (input: UserInfoInput) => {
      // 更新，那么只需要更新 input
      return API.UserAPI.UpdateUserInfo(authToken!, userId!, input);
    },
    onSuccess: (newUserInfo) => {
      if (userId === selfInfo?.id) {
        queryClient.refetchQueries({
          queryKey: ['user', 'self'],
        });
      }
      notifications.show({
        color: 'green',
        title: '用户信息更新成功',
        message: (
          <Text size="xs">
            新的名字是 <Code>{newUserInfo.name}</Code>
          </Text>
        ),
      });
      onClose();
    },
    onError: (e) => {
      notifications.show({
        color: 'red',
        title: '用户信息更新失败',
        message: e.message,
      });
    },
  });

  // 提交主表单：创建用户
  const { isPending: isCreatingUser, mutate: createUser } = useMutation({
    mutationKey: ['user', 'create'],
    mutationFn: (user: UserInfoCreate) => {
      return API.UserAPI.CreateUser(authToken!, user);
    },
    onSuccess: (newUserInfo) => {
      notifications.show({
        color: 'green',
        title: '用户创建成功',
        message: (
          <Text size="xs">
            成功创建了登录名为 <Code>{newUserInfo.name}</Code> 的用户 (#{newUserInfo.id})
          </Text>
        ),
      });
      onClose();
    },
    onError: (e) => {
      notifications.show({
        color: 'red',
        title: '用户创建失败',
        message: e.message,
      });
    },
  });

  const submitForm = (input: UserInfoInput) => {
    if (!userId) {
      // 创建用户
      createUser({
        ...input,
        username,
        password,
        is_admin: isAdmin,
      });
    } else {
      // 更新信息
      updateInfo(input);
    }
  };

  // 表单结构
  return (
    <Modal opened={isOpen} onClose={onClose} title={userId ? `编辑用户 #${userId}` : '创建新用户'}>
      <Flex direction="column" gap="sm">
        <Flex direction="row" gap="sm">
          <Group
            grow
            style={{
              flexGrow: 1,
            }}
          >
            <TextInput
              label="用户名"
              disabled={!!userId && !isUsernameUnlocked}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Group>
          {
            // 只在编辑模式下启用
            userId && (
              <Group align="end">
                {isUsernameUnlocked ? (
                  <ActionIcon
                    size="lg"
                    loading={isUpdatingUsername}
                    onClick={() => updateUsername(username)}
                  >
                    <IconDeviceFloppy />
                  </ActionIcon>
                ) : (
                  <ActionIcon color="green" size="lg" onClick={() => setIsUsernameUnlocked(true)}>
                    <IconPencil />
                  </ActionIcon>
                )}
              </Group>
            )
          }
        </Flex>

        <Flex direction="row" gap="sm">
          <Group
            grow
            style={{
              flexGrow: 1,
            }}
          >
            <PasswordInput
              label="密码"
              disabled={!!userId && !isPasswordUnlocked}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Group>
          {
            // 只在编辑模式下启用
            userId && (
              <Group align="end">
                {isPasswordUnlocked ? (
                  <ActionIcon
                    size="lg"
                    loading={isUpdatingPassword}
                    onClick={() => updatePassword(password)}
                  >
                    <IconDeviceFloppy />
                  </ActionIcon>
                ) : (
                  <ActionIcon
                    color="green"
                    size="lg"
                    onClick={() => {
                      setIsPasswordUnlocked(true);
                      setPassword('');
                    }}
                  >
                    <IconPencil />
                  </ActionIcon>
                )}
              </Group>
            )
          }
        </Flex>

        <Switch
          label="管理员"
          size="md"
          disabled={!selfInfo?.is_admin || isUpdatingRole}
          thumbIcon={isUpdatingRole && <IconLoader style={{ width: rem(12), height: rem(12) }} />}
          checked={isAdmin}
          onClick={() => {
            if (!userId) {
              // 切换状态，但不用发出请求
              setIsAdmin(!isAdmin);
            } else {
              // 发出权限变更请求
              updateRole(!isAdmin);
            }
          }}
        />

        <form onSubmit={userInfoForm.onSubmit(submitForm)}>
          <TextInput
            label="名字"
            disabled={!isFormUnlocked}
            {...userInfoForm.getInputProps('name')}
          />

          <Group justify="end" mt="sm">
            {isFormUnlocked ? (
              <Button
                leftSection={<IconDeviceFloppy size={14} />}
                type="submit"
                disabled={!userInfoForm.isTouched}
                loading={isUpdatingUserInfo || isCreatingUser}
              >
                保存
              </Button>
            ) : (
              <Button
                color="green"
                leftSection={<IconPencil size={14} />}
                onClick={(ev) => {
                  ev.preventDefault();
                  setIsFormUnlocked(true);
                }}
                // disabled={userId !== selfInfo?.id && !selfInfo?.is_admin} // 非管理员没法列出用户列表，这种情况应该不会出现，可以注释掉
              >
                编辑
              </Button>
            )}
          </Group>
        </form>
      </Flex>
    </Modal>
  );
};

export default UserModal;
