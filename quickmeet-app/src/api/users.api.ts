import { apiClient as api } from './client';

export const registerPushToken = async (token: string): Promise<void> => {
  await api.post('/users/me/push-token', { token });
};
