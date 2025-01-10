import { appendQuery, BackendUri } from './common';

export interface InstanceInfoInput {
  name: string;
  pre_config: string;
  is_manual_mode: boolean;
  site_ids: number[];
  additional_file_ids: number[];
}

export interface InstanceInfoFull extends InstanceInfoInput {
  last_seen: number;
}

export interface InstanceInfoWithID extends InstanceInfoFull {
  id: number;
}

export interface InstanceInfoWithToken extends InstanceInfoWithID {
  token: string;
}

export interface InstanceInfoList {
  limit: number;
  page_max: number;
  list: InstanceInfoWithID[];
}

const GetInstanceList = async (
  authToken: string,
  page: number = 1,
  limit: number = 20
): Promise<InstanceInfoList> => {
  const endpoint = BackendUri + '/instance/list';
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

const GetInstanceInfo = async (authToken: string, id: number): Promise<InstanceInfoWithID> => {
  const endpoint = BackendUri + `/instance/info/${id}`;
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

const CreateInstance = async (
  authToken: string,
  input: InstanceInfoInput
): Promise<InstanceInfoWithToken> => {
  const endpoint = BackendUri + `/instance/create`;
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

const UpdateInstanceInfo = async (
  authToken: string,
  id: number,
  input: InstanceInfoInput
): Promise<InstanceInfoWithID> => {
  const endpoint = BackendUri + `/instance/info/${id}`;
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

const RegenerateInstanceToken = async (
  authToken: string,
  id: number
): Promise<InstanceInfoWithToken> => {
  const endpoint = BackendUri + `/instance/rotate-token/${id}`;
  const res = await fetch(endpoint, {
    method: 'POST',
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

const DeleteInstance = async (authToken: string, id: number): Promise<void> => {
  const endpoint = BackendUri + `/instance/delete/${id}`;
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

const InstanceAPI = {
  GetInstanceList,
  GetInstanceInfo,
  CreateInstance,
  UpdateInstanceInfo,
  RegenerateInstanceToken,
  DeleteInstance,
};

export default InstanceAPI;
