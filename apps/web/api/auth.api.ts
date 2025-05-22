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
