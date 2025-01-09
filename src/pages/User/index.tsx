import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import {
  Badge,
  Button,
  ButtonGroup,
  Code,
  Group,
  Pagination,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import API from '@/api';
import type { UserInfoWithID } from '@/api/user';
import { authTokenAtom } from '@/atoms/authToken';
import UserModal from '@/components/modals/UserModal';

const User = () => {
  const authToken = useAtomValue(authTokenAtom);
  const [currentPage, setCurrentPage] = useState(1);

  const queryClient = useQueryClient();

  const { isPending, isError, data } = useQuery({
    queryKey: ['user', 'list', currentPage],
    queryFn: () => API.UserAPI.GetUserList(authToken!, currentPage),
  });
  const { mutate: doDeleteUser, isPending: isDeletingUser } = useMutation({
    mutationKey: ['user', 'delete'],
    mutationFn: (userId: number) => {
      return API.UserAPI.DeleteUser(authToken!, userId);
    },
    onSuccess: () => {
      refreshList();
    },
  });

  const [isEditingUser, setIsEditingUser] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserInfoWithID | null>(null);

  const createUser = () => {
    setEditingUser(null);
    setIsEditingUser(true);
  };

  const editUser = (userInfo: UserInfoWithID) => {
    setEditingUser(userInfo);
    setIsEditingUser(true);
  };

  const refreshList = () => {
    // 刷新列表
    queryClient.refetchQueries({
      queryKey: ['user', 'list'],
    });
  };

  const deleteUser = (userInfo: UserInfoWithID) =>
    modals.openConfirmModal({
      title: '删除用户',
      centered: true,
      children: (
        <Text size="sm">
          您确认要删除用户 <Code>{userInfo.username}</Code> 吗？
        </Text>
      ),
      labels: { confirm: '确认删除', cancel: '取消' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        doDeleteUser(userInfo.id);
      },
    });

  return (
    <>
      <Group>
        <Title order={2}>用户</Title>
        <Button color="green" onClick={createUser}>
          新增
        </Button>
      </Group>

      <Table highlightOnHover mt="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>用户名</Table.Th>
            <Table.Th>权限</Table.Th>
            <Table.Th>名字</Table.Th>
            <Table.Th>操作</Table.Th>
          </Table.Tr>
        </Table.Thead>
        {isPending ? (
          <Table.Caption>加载中…</Table.Caption>
        ) : isError ? (
          <Table.Caption>加载失败</Table.Caption>
        ) : !data?.list.length ? (
          <Table.Caption>这里空空如也</Table.Caption>
        ) : (
          <>
            <Table.Tbody>
              {data.list.map((el) => (
                <Table.Tr key={el.id}>
                  <Table.Td>{el.username}</Table.Td>
                  <Table.Td>
                    {el.is_admin ? (
                      <Badge color="yellow" size="lg">
                        管理
                      </Badge>
                    ) : (
                      <Badge color="gray" size="lg">
                        用户
                      </Badge>
                    )}
                  </Table.Td>
                  <Table.Td>{el.name}</Table.Td>
                  <Table.Td>
                    <ButtonGroup>
                      <Button color="yellow" onClick={() => editUser(el)}>
                        编辑
                      </Button>
                      <Button color="red" onClick={() => deleteUser(el)} loading={isDeletingUser}>
                        删除
                      </Button>
                    </ButtonGroup>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
            <Table.Caption>
              <Pagination total={data.page_max} value={currentPage} onChange={setCurrentPage} />
            </Table.Caption>
          </>
        )}
      </Table>

      <UserModal
        isOpen={isEditingUser}
        onClose={() => {
          setIsEditingUser(false);
          refreshList();
        }}
        user={editingUser}
        userId={editingUser?.id || null}
      />
    </>
  );
};

export default User;
