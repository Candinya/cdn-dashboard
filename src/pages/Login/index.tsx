import { useState } from 'react';
import { useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Center,
  Container,
  Flex,
  Paper,
  PasswordInput,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import API from '@/api';
import { authTokenAtom } from '@/atoms/authToken';
import Logo from '@/components/Logo';

const Login = () => {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      username: '',
      password: '',
    },
  });

  const setAuthToken = useSetAtom(authTokenAtom);
  const nav = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const submitLogin = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const token = await API.AuthAPI.Login(username, password);
      setAuthToken(token);
      nav('/instance');
    } catch (e: any) {
      // 登录失败
      notifications.show({
        color: 'red',
        title: '登录失败',
        message: e.message,
      });
    }
    setIsLoading(false);
  };

  return (
    <Container size={420} my={40}>
      <Center>
        <Logo />
      </Center>

      <Title order={2} ta="center" mt="md" mb={50}>
        CDN 控制面板
      </Title>

      <Paper withBorder shadow="md" p={30} radius="md">
        <form
          onSubmit={form.onSubmit((values) => {
            submitLogin(values.username, values.password);
          })}
        >
          <TextInput
            required
            withAsterisk={false}
            label="用户名"
            size="md"
            {...form.getInputProps('username')}
          />
          <PasswordInput
            required
            withAsterisk={false}
            label="密码"
            mt="md"
            size="md"
            {...form.getInputProps('password')}
          />
          <Button fullWidth mt="xl" size="md" type="submit" loading={isLoading}>
            登录
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;
