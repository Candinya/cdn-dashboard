import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { Badge, Button, ButtonGroup, Group, Pagination, Table, Title } from '@mantine/core';
import API from '@/api';
import { authTokenAtom } from '@/atoms/authToken';

interface LastSeenStatProps {
  lastSeen: number;
}
const LastSeenStat = ({ lastSeen }: LastSeenStatProps) => {
  const currentTs = new Date().getTime() / 1000; // 当前时间戳（秒）
  const deltaTs = currentTs - lastSeen;

  return deltaTs < 600 ? ( // 600 秒， 10 分钟
    <Badge color="green">在线</Badge>
  ) : deltaTs < 3600 ? ( // 3600 秒， 1 小时
    <Badge color="yellow">等待中</Badge>
  ) : (
    // 再多就是离线了
    <Badge color="red">离线</Badge>
  );
};

const Instance = () => {
  const authToken = useAtomValue(authTokenAtom);
  const [currentPage, setCurrentPage] = useState(1);

  const { isPending, isError, data } = useQuery({
    queryKey: ['instance', 'list', currentPage],
    queryFn: () => API.InstanceAPI.GetInstanceList(authToken!, currentPage),
  });

  return (
    <>
      <Group>
        <Title order={2}>实例</Title>
        <Button color="green">新增</Button>
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
                    <LastSeenStat lastSeen={el.last_seen} />
                  </Table.Td>
                  <Table.Td>
                    <ButtonGroup>
                      <Button color="yellow">编辑</Button>
                      <Button color="red">删除</Button>
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
    </>
  );
};

export default Instance;
