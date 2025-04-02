import axios from "axios";
import { getToken, deleteToken } from "../utils/storage";


//Function to update locale and header
const updateAxiosInstanceHeader = async (newLocale) => {
  axiosInstance.defaults.headers['Accept-Language'] = newLocale;
  axiosInstance.defaults.headers.common['Accept-Language'] = newLocale;
};

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_AUTH_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "Accept-Language": `ka`
  },
});



//Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  function (error) {
    const originalToken = getToken();
    if (error.response && error.response.status === 401 && originalToken) {
      deleteToken();
      window.location.reload();
    } else {
      return Promise.reject(error);
    }
  }
);

export { axiosInstance, updateAxiosInstanceHeader };
