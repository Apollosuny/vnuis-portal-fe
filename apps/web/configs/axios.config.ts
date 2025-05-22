import Axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000/api';

const axiosOptions = {
  baseURL: baseUrl,
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const nexusAxios = Axios.create(axiosOptions);

nexusAxios.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

nexusAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);
