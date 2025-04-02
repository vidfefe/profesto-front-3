import { AxiosError } from 'axios';

export const getMutationErrorPayload = (err: AxiosError) => {
  let error = err.response?.data;
  if (!!error && typeof error === 'object') {
    error = {
      ...error,
      status: err.response!.status,
    };
  }
  return error;
};
