import { appendQuery, BackendUri } from './common';

export interface SiteInfoInput {
  name: string;
  origin: string;
  cert_id: number | null;
  template_id: number;
  template_values: string[];
}

export interface SiteInfoWithID extends SiteInfoInput {
  id: number;
}

export interface SiteInfoList {
  limit: number;
  page_max: number;
  list: SiteInfoWithID[];
}

const GetSiteList = async (
  authToken: string,
  page: number = 1,
  limit: number = 20
): Promise<SiteInfoList> => {
  const endpoint = BackendUri + '/site/list';
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

const GetSiteInfo = async (authToken: string, id: number): Promise<SiteInfoWithID> => {
  const endpoint = BackendUri + `/site/info/${id}`;
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

const CreateSite = async (authToken: string, input: SiteInfoInput): Promise<SiteInfoWithID> => {
  const endpoint = BackendUri + `/site/create`;
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

const UpdateSiteInfo = async (
  authToken: string,
  id: number,
  input: SiteInfoInput
): Promise<SiteInfoWithID> => {
  const endpoint = BackendUri + `/site/info/${id}`;
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

const DeleteSite = async (authToken: string, id: number): Promise<void> => {
  const endpoint = BackendUri + `/site/delete/${id}`;
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

const SiteAPI = {
  GetSiteList,
  GetSiteInfo,
  CreateSite,
  UpdateSiteInfo,
  DeleteSite,
};

export default SiteAPI;
