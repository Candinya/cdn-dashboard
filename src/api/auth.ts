import { BackendUri } from './common';

const Login = async (username: string, password: string): Promise<string> => {
  const endpoint = BackendUri + '/auth/login';
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
    }),
  }).then((res) =>
    res.ok
      ? res.json()
      : res.json().then((res) => {
          throw new Error(res.message);
        })
  );
  return res.token;
};

const AuthAPI = {
  Login,
};

export default AuthAPI;
