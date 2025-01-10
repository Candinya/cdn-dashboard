import { appendQuery, BackendUri } from './common';

export interface AdditionalFileContent {
  content: File | null;
}

export interface AdditionalFileInfo {
  name: string;
  filename?: string;
}

export type AdditionalFileInfoInput = AdditionalFileContent & AdditionalFileInfo;

export interface AdditionalFileInfoWithID extends AdditionalFileInfoInput {
  id: number;
}

export interface AdditionalFileInfoList {
  limit: number;
  page_max: number;
  list: AdditionalFileInfoWithID[];
}

const GetAdditionalFileList = async (
  authToken: string,
  page: number = 1,
  limit: number = 20
): Promise<AdditionalFileInfoList> => {
  const endpoint = BackendUri + '/additional-file/list';
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

const GetAdditionalFileInfo = async (
  authToken: string,
  id: number
): Promise<AdditionalFileInfoWithID> => {
  const endpoint = BackendUri + `/additional-file/info/${id}`;
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

const CreateAdditionalFile = async (
  authToken: string,
  input: AdditionalFileInfoInput
): Promise<AdditionalFileInfoWithID> => {
  const formData = new FormData();
  formData.append('name', input.name);
  if (input.filename) {
    formData.append('filename', input.filename);
  }
  if (input.content) {
    formData.append('content', input.content);
  }

  const endpoint = BackendUri + `/additional-file/create`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    body: formData,
  }).then((res) =>
    res.ok
      ? res.json()
      : res.json().then((res) => {
          throw new Error(res.message);
        })
  );
  return res;
};

const UpdateAdditionalFileInfo = async (
  authToken: string,
  id: number,
  input: AdditionalFileInfo
): Promise<AdditionalFileInfoWithID> => {
  const endpoint = BackendUri + `/additional-file/info/${id}`;
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

const DownloadAdditionalFile = async (authToken: string, id: number): Promise<Blob> => {
  const endpoint = BackendUri + `/additional-file/download/${id}`;
  const res = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  }).then((res) =>
    res.ok
      ? res.blob()
      : res.json().then((res) => {
          throw new Error(res.message);
        })
  );
  return res;
};

const ReplaceAdditionalFile = async (
  authToken: string,
  id: number,
  input: AdditionalFileContent
): Promise<AdditionalFileInfoWithID> => {
  const formData = new FormData();
  if (input.content) {
    formData.append('content', input.content);
  }

  const endpoint = BackendUri + `/additional-file/replace/${id}`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    body: formData,
  }).then((res) =>
    res.ok
      ? res.json()
      : res.json().then((res) => {
          throw new Error(res.message);
        })
  );
  return res;
};

const DeleteAdditionalFile = async (authToken: string, id: number): Promise<void> => {
  const endpoint = BackendUri + `/additional-file/delete/${id}`;
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

const AdditionalFileAPI = {
  GetAdditionalFileList,
  GetAdditionalFileInfo,
  CreateAdditionalFile,
  UpdateAdditionalFileInfo,
  DownloadAdditionalFile,
  ReplaceAdditionalFile,
  DeleteAdditionalFile,
};

export default AdditionalFileAPI;
