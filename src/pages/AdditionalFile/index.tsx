import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { Button, ButtonGroup, Code, Group, Pagination, Table, Text, Title } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import API from '@/api';
import { AdditionalFileInfoWithID } from '@/api/additional-file';
import { authTokenAtom } from '@/atoms/authToken';
import AdditionalFileModal from '@/components/modals/AdditionalFileModal';

const AdditionalFile = () => {
  const authToken = useAtomValue(authTokenAtom);
  const [currentPage, setCurrentPage] = useState(1);

  const queryClient = useQueryClient();

  const { isPending, isError, data } = useQuery({
    queryKey: ['additional-file', 'list', currentPage],
    queryFn: () => API.AdditionalFileAPI.GetAdditionalFileList(authToken!, currentPage),
  });
  const { mutate: doDelete } = useMutation({
    mutationKey: ['additional-file', 'delete'],
    mutationFn: (id: number) => {
      return API.AdditionalFileAPI.DeleteAdditionalFile(authToken!, id);
    },
    onSuccess: () => {
      refreshList();
      notifications.show({
        color: 'green',
        message: '额外文件删除成功',
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

  const downloadFile = async (info: AdditionalFileInfoWithID) => {
    const blob = await API.AdditionalFileAPI.DownloadAdditionalFile(authToken!, info.id);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', info.filename || `file-${info.id}`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  };

  const refreshList = () => {
    // 刷新列表
    queryClient.refetchQueries({
      queryKey: ['additional-file', 'list'],
    });
  };

  const deleteById = (info: AdditionalFileInfoWithID) =>
    modals.openConfirmModal({
      title: '删除额外文件',
      centered: true,
      children: (
        <Text size="sm">
          您确认要删除额外文件 <Code>{info.name}</Code> 吗？
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
        <Title order={2}>额外文件</Title>
        <Button color="green" onClick={create}>
          新增
        </Button>
      </Group>

      <Table highlightOnHover mt="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>名称</Table.Th>
            <Table.Th>文件名</Table.Th>
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
                  <Table.Td>{el.filename}</Table.Td>
                  <Table.Td>
                    <ButtonGroup>
                      <Button color="blue" onClick={() => downloadFile(el)}>
                        下载
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

      <AdditionalFileModal
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

export default AdditionalFile;
