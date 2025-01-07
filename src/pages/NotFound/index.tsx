import { IconError404 } from '@tabler/icons-react';
import { Flex, LoadingOverlay, Text, Title } from '@mantine/core';

const NotFound = () => (
  <LoadingOverlay
    loaderProps={{
      children: (
        <Flex direction="column" align="center" gap="sm">
          <IconError404 size={60} />
          <Text>抱歉，没有找到您寻找的页面</Text>
        </Flex>
      ),
    }}
    visible
  />
);

export default NotFound;
