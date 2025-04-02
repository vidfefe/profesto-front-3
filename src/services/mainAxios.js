import axios from "axios";
import { getToken, getRefreshToken, deleteToken, saveStorageObject } from "../utils/storage";
import { setAccessDeniedObj } from 'redux/errorSlice';
import store from 'redux/store';
import { zonedTimeToUtc } from 'date-fns-tz'


const dateTransformer = data => {
  if (data instanceof Date) {
    // do your specific formatting here
    return zonedTimeToUtc(data, 'UTC')
  };
  if (Array.isArray(data)) {
    return data.map(val => dateTransformer(val))
  };
  if (typeof data === "object" && data !== null && !(data instanceof FormData)) {
    return Object.fromEntries(Object.entries(data).map(([key, val]) =>
      [key, dateTransformer(val)]))
  };
  return data;
};



const MainAxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BASE_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "Accept-Language": `ka`
  },
  transformRequest: [dateTransformer].concat(axios.defaults.transformRequest)
});

const updateAxiosHeaders = (newLocale) => {
  MainAxiosInstance.defaults.headers['Accept-Language'] = newLocale;
  MainAxiosInstance.defaults.headers.common['Accept-Language'] = newLocale;
};

const controller = new AbortController();

export const setAuthorizationToken = (token, lang) => {
  MainAxiosInstance.defaults.headers.Authorization = `Bearer ${token}`;
};

//Add a request interceptor
MainAxiosInstance.interceptors.request.use(
  (config) => {
    const signal = controller.signal
    const token = getToken();

    if (token) {
      config.headers["Authorization"] = 'Bearer ' + token;
    }
    const cfg = {
      signal,
      ...config,
    };

    return cfg;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//Add a response interceptor for refresh token > multiple requests
let isTokenRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  })

  failedQueue = [];
};

MainAxiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isTokenRefreshing) {
        try {
          await new Promise((resolve, reject) => { failedQueue.push({ resolve, reject }); });
          return await MainAxiosInstance(originalRequest);
        } catch (err) {
          return await Promise.reject(err);
        }
      };

      originalRequest._retry = true;
      isTokenRefreshing = true;

      const refreshToken = getRefreshToken();
      return new Promise((resolve, reject) => {
        axios.post(`${process.env.REACT_APP_AUTH_API_URL}auth/refresh_token`, null, {
          headers: {
            Authorization: `Bearer ${refreshToken}`
          }
        }).then(({ data }) => {
          saveStorageObject('token', data.token);
          saveStorageObject('refresh_token', data.refresh_token);
          processQueue(null, data.token);
          resolve(MainAxiosInstance(originalRequest));
        }).catch((err) => {
          processQueue(err, null);
          deleteToken();
          window.location.reload();
          reject(err);
        }).finally(() => { isTokenRefreshing = false })
      });
    } else if (error?.response?.status === 402) {
      store.dispatch(setAccessDeniedObj(error?.response.data.errors[0]));
    };

    return Promise.reject(error);
});

export { MainAxiosInstance, updateAxiosHeaders };


