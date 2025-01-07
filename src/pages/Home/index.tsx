import { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { LoadingOverlay } from '@mantine/core';
import { authTokenAtom } from '@/atoms/authToken';

const Home = () => {
  const authToken = useAtomValue(authTokenAtom);
  const nav = useNavigate();

  useEffect(() => {
    if (!authToken) {
      nav('/login');
    } else {
      nav('/instance');
    }
  }, []);

  return (
    <>
      <LoadingOverlay visible />
    </>
  );
};

export default Home;
