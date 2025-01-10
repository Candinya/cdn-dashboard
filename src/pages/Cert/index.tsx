import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import {
  Button,
  ButtonGroup,
  Code,
  Group,
  Pagination,
  Table,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import API from '@/api';
import { CertInfoWithID } from '@/api/cert';
import { authTokenAtom } from '@/atoms/authToken';
import CertModal from '@/components/modals/CertModal';
import { dateString, roughTimeSpace } from '@/utils/time';

const expireDate = (unixTs: number) => {
  const currentTs = Date.now() / 1000; // 当前时间戳（秒）
  const deltaTs = unixTs - currentTs;

  return deltaTs > 0 ? roughTimeSpace(deltaTs) + '后' : roughTimeSpace(-deltaTs) + '前';
};

const Cert = () => {
  const authToken = useAtomValue(authTokenAtom);
  const [currentPage, setCurrentPage] = useState(1);

  const queryClient = useQueryClient();

  const { isPending, isError, data } = useQuery({
    queryKey: ['cert', 'list', currentPage],
    queryFn: () => API.CertAPI.GetCertList(authToken!, currentPage),
  });
  const { mutate: doDelete } = useMutation({
    mutationKey: ['cert', 'delete'],
    mutationFn: (id: number) => {
      return API.CertAPI.DeleteCert(authToken!, id);
    },
    onSuccess: () => {
      refreshList();
      notifications.show({
        color: 'green',
        message: '证书删除成功',
      });
    },
  });
  const { mutate: renewById } = useMutation({
    mutationKey: ['cert', 'renew'],
    mutationFn: (id: number) => {
      return API.CertAPI.RenewCert(authToken!, id);
    },
    onSuccess: (newInfo) => {
      refreshList();
      notifications.show({
        color: 'green',
        title: '证书续期成功',
        message: (
          <Text size="xs">
            证书 <Code>{newInfo.name}</Code> 的新过期时间是 {expireDate(newInfo.expires_at)}
          </Text>
        ),
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
      queryKey: ['cert', 'list'],
    });
  };

  const deleteById = (info: CertInfoWithID) =>
    modals.openConfirmModal({
      title: '删除证书',
      centered: true,
      children: (
        <Text size="sm">
          您确认要删除证书 <Code>{info.name}</Code> 吗？
        </Text>
      ),
      labels: { confirm: '确认删除', cancel: '取消' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        doDelete(info.id);
      },
    });

  return (
    <>
      <Group>
        <Title order={2}>证书</Title>
        <Button color="green" onClick={create}>
          新增
        </Button>
      </Group>

      <Table highlightOnHover mt="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>名称</Table.Th>
            <Table.Th>域名</Table.Th>
            <Table.Th>过期时间</Table.Th>
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
                  <Table.Td>{el.domains.join(' ')}</Table.Td>
                  <Table.Td>
                    <Tooltip label={dateString(el.expires_at)} withArrow>
                      <span>{expireDate(el.expires_at)}</span>
                    </Tooltip>
                  </Table.Td>
                  <Table.Td>
                    <ButtonGroup>
                      <Button
                        color="green"
                        disabled={el.is_manual_mode}
                        onClick={() => renewById(el.id)}
                      >
                        续期
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

      <CertModal
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

export default Cert;
