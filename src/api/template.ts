import { appendQuery, BackendUri } from './common';

export interface TemplateInfoInput {
  name: string;
  description: string;
  content: string;
  variables: string[];
}

export interface TemplateInfoWithID extends TemplateInfoInput {
  id: number;
}

export interface TemplateInfoList {
  limit: number;
  page_max: number;
  list: TemplateInfoWithID[];
}

const GetTemplateList = async (
  authToken: string,
  page: number = 1,
  limit: number = 20
): Promise<TemplateInfoList> => {
  const endpoint = BackendUri + '/template/list';
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

const GetTemplateInfo = async (authToken: string, id: number): Promise<TemplateInfoWithID> => {
  const endpoint = BackendUri + `/template/info/${id}`;
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

const CreateTemplate = async (
  authToken: string,
  input: TemplateInfoInput
): Promise<TemplateInfoWithID> => {
  const endpoint = BackendUri + `/template/create`;
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

const UpdateTemplateInfo = async (
  authToken: string,
  id: number,
  input: TemplateInfoInput
): Promise<TemplateInfoWithID> => {
  const endpoint = BackendUri + `/template/info/${id}`;
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

const DeleteTemplate = async (authToken: string, id: number): Promise<void> => {
  const endpoint = BackendUri + `/template/delete/${id}`;
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

const TemplateAPI = {
  GetTemplateList,
  GetTemplateInfo,
  CreateTemplate,
  UpdateTemplateInfo,
  DeleteTemplate,
};

export default TemplateAPI;
