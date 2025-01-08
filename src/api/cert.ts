import { appendQuery, BackendUri } from './common';

export interface CertInfoInput {
  name: string;
  domains: string[];
  provider: string | null;

  certificate: string | null;
  private_key: string | null;
  intermediate_certificate: string | null;

  csr: string | null;
}

export interface CertInfoWithExpiresAt extends CertInfoInput {
  expires_at: number;
}

export interface CertInfoWithID extends CertInfoWithExpiresAt {
  id: number;
}

export interface CertInfoList {
  limit: number;
  page_max: number;
  list: CertInfoWithID[];
}

const GetCertList = async (
  authToken: string,
  page: number = 1,
  limit: number = 20
): Promise<CertInfoList> => {
  const endpoint = BackendUri + '/cert/list';
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

const GetCertInfo = async (authToken: string, id: number): Promise<CertInfoWithID> => {
  const endpoint = BackendUri + `/cert/info/${id}`;
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

const CreateCert = async (authToken: string, input: CertInfoInput): Promise<CertInfoWithID> => {
  const endpoint = BackendUri + `/cert/create`;
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

const UpdateCertInfo = async (
  authToken: string,
  id: number,
  input: CertInfoInput
): Promise<CertInfoWithID> => {
  const endpoint = BackendUri + `/cert/info/${id}`;
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

const RenewCert = async (authToken: string, id: number): Promise<CertInfoWithID> => {
  const endpoint = BackendUri + `/cert/renew/${id}`;
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

const DeleteCert = async (authToken: string, id: number): Promise<void> => {
  const endpoint = BackendUri + `/cert/delete/${id}`;
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

const CertAPI = {
  GetCertList,
  GetCertInfo,
  CreateCert,
  UpdateCertInfo,
  RenewCert,
  DeleteCert,
};

export default CertAPI;
