import { Student } from '@/types/user.types';
import { nexusAxios } from '../configs/axios.config';
import { IUser } from '../types/user.type';

export const login = async (
  username: string,
  password: string
): Promise<{
  jwt: string;
  jwtRefresh: string;
  user: IUser;
}> => {
  const res = await nexusAxios.post('/auth/local', {
    username,
    password,
  });
  return res.data;
};

/**
 * Refresh JWT token using refresh token
 * @param refreshToken - The refresh token to use
 * @returns Promise with new tokens
 */
export const refreshToken = async (
  refreshToken: string
): Promise<{
  jwt: string;
}> => {
  const res = await nexusAxios.get('/auth/refresh', {
    headers: {
      Authorization: refreshToken,
    },
  });
  return res.data;
};

export const getStudentProfile = async (): Promise<Student> => {
  const res = await nexusAxios.get('/student/me');
  return res.data;
};
