import { useMutation, UseMutationOptions, UseMutationResult, MutationKey } from 'react-query';
import { AxiosRequestConfig } from "axios"
import { MainAxiosInstance } from 'services/mainAxios';
import { getMutationErrorPayload } from 'utils/response';


type IRequestOptions<TData> = {
    endpoint: string,
    options?: AxiosRequestConfig & { body?: string, mode?: string },
    onSuccess?: (data: TData) => unknown,
} | string;

function useMutationCustom<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(mutationKey: MutationKey, requestDetails: IRequestOptions<TData>, options?: UseMutationOptions<TData, TError, TVariables, TContext>): UseMutationResult<TData, TError, TVariables> {
    return useMutation(async (dataToSend) => {
        try {
            const res = typeof requestDetails === 'string' ?
                await MainAxiosInstance(`${requestDetails}`)
                : await MainAxiosInstance(`${requestDetails.endpoint}`, {
                    ...requestDetails.options,
                    data: dataToSend,
                    headers: { "Content-Type": "application/json", },
                });

            let data = res.data;
            if (typeof requestDetails === 'object' && requestDetails?.onSuccess) {
                const tempData = requestDetails.onSuccess(data) as any;

                data = tempData ? tempData : data;
            }

            return data;
        } catch (err: any) {
            throw getMutationErrorPayload(err);
        }
    }, { retry: false, mutationKey, ...options });
}

export default useMutationCustom;
