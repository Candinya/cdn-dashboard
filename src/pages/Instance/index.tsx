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
import { notifications } from '@mantine/notifications';
import API from '@/api';
import type { InstanceInfoWithID } from '@/api/instance';
import { authTokenAtom } from '@/atoms/authToken';
import InstanceModal from '@/components/modals/InstanceModal';

interface LastSeenStatProps {
  isManualMode: boolean;
  lastSeen: number;
}
const LastSeenStat = ({ isManualMode, lastSeen }: LastSeenStatProps) => {
  const currentTs = Date.now() / 1000; // 当前时间戳（秒）
  const deltaTs = currentTs - lastSeen;

  return isManualMode ? (
    <Badge color="violet" size="lg">
      手动模式
    </Badge>
  ) : deltaTs < 600 ? ( // 600 秒， 10 分钟
    <Badge color="green" size="lg">
      在线
    </Badge>
  ) : deltaTs < 3600 ? ( // 3600 秒， 1 小时
    <Badge color="yellow" size="lg">
      等待中
    </Badge>
  ) : (
    // 再多就是离线了
    <Badge color="red" size="lg">
      离线
    </Badge>
  );
};

const Instance = () => {
  const authToken = useAtomValue(authTokenAtom);
  const [currentPage, setCurrentPage] = useState(1);

  const queryClient = useQueryClient();

  const { isPending, isError, data } = useQuery({
    queryKey: ['instance', 'list', currentPage],
    queryFn: () => API.InstanceAPI.GetInstanceList(authToken!, currentPage),
  });

  const { mutate: doRegenerateToken } = useMutation({
    mutationKey: ['instance', 'regenerate-token'],
    mutationFn: (id: number) => {
      return API.InstanceAPI.RegenerateInstanceToken(authToken!, id);
    },
    onSuccess: (newInfo) => {
      notifications.show({
        color: 'green',
        title: '实例令牌重新生成成功',
        message: (
          <Text size="xs">
            实例 <Code>{newInfo.name}</Code> 令牌重新生成成功
          </Text>
        ),
      });
      modals.openConfirmModal({
        title: '实例的新认证令牌',
        children: (
          <>
            <Text size="sm">实例的新认证令牌如下，请妥善保存，它不会再显示。</Text>
            <Code ta="center" mt="xs" block>
              {newInfo.token}
            </Code>
          </>
        ),
        labels: { confirm: '复制并关闭', cancel: '关闭' },
        onConfirm: () => {
          window.navigator.clipboard.writeText(newInfo.token);
        },
      });
    },
    onError: (e) => {
      notifications.show({
        color: 'red',
        title: '实例令牌重新生成失败',
        message: e.message,
      });
    },
  });
  const { mutate: doDelete } = useMutation({
    mutationKey: ['instance', 'delete'],
    mutationFn: (id: number) => {
      return API.InstanceAPI.DeleteInstance(authToken!, id);
    },
    onSuccess: () => {
      refreshList();
      notifications.show({
        color: 'green',
        message: '实例删除成功',
      });
    },
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const create = () => {
    setEditingId(null);
    setIsEditing(true);
  };

  const editById = (id: number) => {
    setEditingId(id);
    setIsEditing(true);
  };

  const refreshList = () => {
    // 刷新列表
    queryClient.refetchQueries({
      queryKey: ['instance', 'list'],
    });
  };

  const deleteById = (info: InstanceInfoWithID) =>
    modals.openConfirmModal({
      title: '删除实例',
      children: (
        <Text size="sm">
          您确认要删除实例 <Code>{info.name}</Code> 吗？
        </Text>
      ),
      labels: { confirm: '确认删除', cancel: '取消' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        doDelete(info.id);
      },
    });

  const regenerateToken = (info: InstanceInfoWithID) =>
    modals.openConfirmModal({
      title: '重新生成实例令牌',
      children: (
        <>
          <Text size="sm">
            您确认要重新生成实例 <Code>{info.name}</Code> 的令牌吗？
          </Text>
          <Text size="sm" c="red" fw={700} mt="xs">
            旧令牌将立刻失效，且无法恢复。
          </Text>
        </>
      ),
      labels: { confirm: '重新生成', cancel: '取消' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        doRegenerateToken(info.id);
      },
    });

  return (
    <>
      <Group>
        <Title order={2}>实例</Title>
        <Button color="green" onClick={create}>
          新增
        </Button>
      </Group>

      <Table highlightOnHover mt="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>名称</Table.Th>
            <Table.Th>在线状态</Table.Th>
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
                  <Table.Td>{el.name}</Table.Td>
                  <Table.Td>
                    <LastSeenStat isManualMode={el.is_manual_mode} lastSeen={el.last_seen} />
                  </Table.Td>
                  <Table.Td>
                    <ButtonGroup>
                      <Button color="indigo" onClick={() => regenerateToken(el)}>
                        重新生成令牌
                      </Button>
                      <Button color="yellow" onClick={() => editById(el.id)}>
                        编辑
                      </Button>
                      <Button color="red" onClick={() => deleteById(el)}>
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

      <InstanceModal
        isOpen={isEditing}
        onClose={() => {
          setIsEditing(false);
          refreshList();
        }}
        id={editingId}
      />
    </>
  );
};

export default Instance;
