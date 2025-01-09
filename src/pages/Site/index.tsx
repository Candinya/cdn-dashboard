import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { Button, ButtonGroup, Group, Pagination, Table, Title } from '@mantine/core';
import API from '@/api';
import { authTokenAtom } from '@/atoms/authToken';

const Site = () => {
  const authToken = useAtomValue(authTokenAtom);
  const [currentPage, setCurrentPage] = useState(1);

  const { isPending, isError, data } = useQuery({
    queryKey: ['site', 'list', currentPage],
    queryFn: () => API.SiteAPI.GetSiteList(authToken!, currentPage),
  });

  return (
    <>
      <Group>
        <Title order={2}>站点</Title>
        <Button color="green">新增</Button>
      </Group>

      <Table highlightOnHover mt="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>名称</Table.Th>
            <Table.Th>源</Table.Th>
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
                  <Table.Td>{el.origin}</Table.Td>
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

export default Site;
