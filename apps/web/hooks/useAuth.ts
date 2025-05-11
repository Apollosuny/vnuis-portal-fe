import { login } from '@/api/auth.api';
import { useUserStore } from '@/stores/user.store';
import { handleApiError } from '@/utils/errorHandler';
import { useMemo, useState } from 'react';
import { object, string } from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

export type LoginValues = {
  username: string;
  password: string;
};

const schema = object().shape({
  username: string().required('Username is required'),
  password: string().required('Password is required'),
});

export const useAuth = (onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const { setJwt, setJwtRefresh, setUser, setIsAuthenticated } = useUserStore();

  const {
    control,
    formState: { errors, isValid, isDirty },
    handleSubmit,
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  const shouldDisableButton = useMemo(
    () => isLoading || !isDirty || !isValid,
    [isLoading, isValid, isDirty]
  );

  const onLogin = async (data: LoginValues) => {
    try {
      setIsLoading(true);
      const res = await login(data.username, data.password);
      if (res.jwt) {
        setJwt(res.jwt);
        setJwtRefresh(res.jwtRefresh);
        setUser(res.user);
        setIsAuthenticated(true);
        onSuccess?.();
      }
    } catch (error) {
      handleApiError(error, 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    control,
    handleSubmit,
    onLogin,
    isLoading,
    shouldDisableButton,
    errors,
  };
};
