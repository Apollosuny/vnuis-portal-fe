import Axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE;

const axiosOptions = {
  baseURL: baseUrl,
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const nextusAxios = Axios.create(axiosOptions);

nextusAxios.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

nextusAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);
