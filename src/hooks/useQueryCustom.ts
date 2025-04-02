import { useQuery, UseQueryOptions, UseQueryResult, QueryKey } from 'react-query';
import { AxiosRequestConfig } from "axios"
import {MainAxiosInstance} from 'services/mainAxios';

type IRequestOptions<TData> = {
	endpoint: string,
	options?: AxiosRequestConfig & { body?: unknown, mode?: string },
	onSuccess?: (data: TData) => unknown,
} | string;

function useQueryCustom<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey>(queryKey: TQueryKey, requestDetails: IRequestOptions<TData>, options?: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>): UseQueryResult<TData, TError> {
	return useQuery(queryKey, async ({ signal }) => {
		try {
			let res;
			if (typeof requestDetails === 'string') {
				res = await MainAxiosInstance(`${requestDetails}`, { signal })
			}
			else {
				const body = requestDetails.options?.body;
				res = await MainAxiosInstance(`${requestDetails.endpoint}`, {
					...requestDetails.options,
					params: requestDetails.options?.method === 'get' || !requestDetails.options?.method ? body : null,
					data: requestDetails.options?.method !== 'get' ? body : null,
					signal
				});
			}

			let data = res?.data;
			if (typeof requestDetails === 'object' && requestDetails?.onSuccess) {
				const tempData = requestDetails.onSuccess(data) as any;

				data = tempData ? tempData : data;
			}

			return data;
		} catch (err: any) {
			throw err;
		}
	}, { retry: false, ...options });
}

export default useQueryCustom;
