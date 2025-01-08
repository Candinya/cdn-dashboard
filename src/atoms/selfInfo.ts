import { atomWithQuery } from 'jotai-tanstack-query';
import API from '@/api';
import { authTokenAtom } from '@/atoms/authToken';

export const selfInfoAtom = atomWithQuery((get) => ({
  queryKey: ['user', 'self'],
  queryFn: async () => {
    const authToken = get(authTokenAtom);
    if (authToken) {
      return await API.UserAPI.GetSelfInfo(authToken);
    } else {
      return null;
    }
  },
}));
