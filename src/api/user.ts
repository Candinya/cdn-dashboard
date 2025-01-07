import { appendQuery, BackendUri } from '@/api/common';

export interface UserInfoInput {
  name: string;
}

export interface UserInfoFull extends UserInfoInput {
  username: string;
  is_admin: boolean;
}

export interface UserInfoWithID extends UserInfoFull {
  id: number;
}

export interface UserInfoCreate extends UserInfoFull {
  password: string;
}

export interface UserInfoList {
  limit: number;
  page_max: number;
  list: UserInfoWithID[];
}

const GetSelfInfo = async (authToken: string): Promise<UserInfoWithID> => {
  const endpoint = BackendUri + '/user/info';
  const res = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  }).then((res) =>
    res.ok
      ? res.json()
      : res.json().then((res) => {
          throw new Error(res.message);
        })
  );
  return res;
};

const GetUserList = async (
  authToken: string,
  page: number = 1,
  limit: number = 20
): Promise<UserInfoList> => {
  const endpoint = BackendUri + '/user/list';
  const res = await fetch(
    appendQuery(endpoint, {
      page,
      limit,
    }),
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  ).then((res) =>
    res.ok
      ? res.json()
      : res.json().then((res) => {
          throw new Error(res.message);
        })
  );
  return res;
};

const GetUserInfo = async (authToken: string, id: number): Promise<UserInfoWithID> => {
  const endpoint = BackendUri + `/user/info/${id}`;
  const res = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  }).then((res) =>
    res.ok
      ? res.json()
      : res.json().then((res) => {
          throw new Error(res.message);
        })
  );
  return res;
};

const CreateUser = async (authToken: string, input: UserInfoCreate): Promise<UserInfoWithID> => {
  const endpoint = BackendUri + `/user/create`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  }).then((res) =>
    res.ok
      ? res.json()
      : res.json().then((res) => {
          throw new Error(res.message);
        })
  );
  return res;
};

const UpdateUserInfo = async (
  authToken: string,
  id: number,
  input: UserInfoInput
): Promise<UserInfoWithID> => {
  const endpoint = BackendUri + `/user/info/${id}`;
  const res = await fetch(endpoint, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  }).then((res) =>
    res.ok
      ? res.json()
      : res.json().then((res) => {
          throw new Error(res.message);
        })
  );
  return res;
};

const UpdateUserUsername = async (
  authToken: string,
  id: number,
  username: string
): Promise<UserInfoWithID> => {
  const endpoint = BackendUri + `/user/username/${id}`;
  const res = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
    }),
  }).then((res) =>
    res.ok
      ? res.json()
      : res.json().then((res) => {
          throw new Error(res.message);
        })
  );
  return res;
};

const UpdateUserPassword = async (
  authToken: string,
  id: number,
  password: string
): Promise<void> => {
  const endpoint = BackendUri + `/user/password/${id}`;
  await fetch(endpoint, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      password,
    }),
  }).then((res) =>
    res.ok
      ? null
      : res.json().then((res) => {
          throw new Error(res.message);
        })
  );
  return;
};

const UpdateUserRole = async (
  authToken: string,
  id: number,
  is_admin: boolean
): Promise<UserInfoWithID> => {
  const endpoint = BackendUri + `/user/role/${id}`;
  const res = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      is_admin,
    }),
  }).then((res) =>
    res.ok
      ? res.json()
      : res.json().then((res) => {
          throw new Error(res.message);
        })
  );
  return res;
};

const DeleteUser = async (authToken: string, id: number): Promise<void> => {
  const endpoint = BackendUri + `/user/delete/${id}`;
  await fetch(endpoint, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  }).then((res) =>
    res.ok
      ? null
      : res.json().then((res) => {
          throw new Error(res.message);
        })
  );
  return;
};

const UserAPI = {
  GetSelfInfo,
  GetUserList,
  GetUserInfo,
  CreateUser,
  UpdateUserInfo,
  UpdateUserUsername,
  UpdateUserPassword,
  UpdateUserRole,
  DeleteUser,
};

export default UserAPI;
