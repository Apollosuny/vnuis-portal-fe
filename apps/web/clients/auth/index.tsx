'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Label } from '@workspace/ui/components/label';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { useAuth } from '@/hooks/useAuth';
import { Controller } from 'react-hook-form';
import { useUserStore } from '@/stores/user.store';

const LoginPage: React.FC = () => {
  const { jwt, jwtRefresh, isAuthenticated, user } = useUserStore();
  const { onLogin, control, errors, handleSubmit, shouldDisableButton } =
    useAuth();

  return (
    <div className='h-screen w-full relative overflow-hidden'>
      {/* Video background */}
      <video
        className='absolute top-0 left-0 w-full h-full object-cover'
        src='/assets/video/main-bg.mp4'
        autoPlay
        muted
        loop
      />

      <div className='absolute inset-0' />

      {/* Form */}
      <div className='fixed inset-0 z-10 flex items-center justify-center'>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className='w-full max-w-sm p-6'
        >
          <Card>
            <CardHeader>
              <CardTitle className='text-center text-xl'>Login</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <Controller
                name='username'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <div>
                    <Label htmlFor='username'>Username</Label>
                    <Input
                      id='username'
                      type='text'
                      placeholder='Enter your username'
                      value={value}
                      onChange={onChange}
                      className='mt-1 w-full'
                    />
                    {errors.username && (
                      <p className='text-red-500 text-sm mt-1'>
                        {errors.username.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Controller
                name='password'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <div>
                    <Label htmlFor='password'>Password</Label>
                    <Input
                      id='password'
                      type='password'
                      placeholder='Enter your password'
                      value={value}
                      onChange={onChange}
                      className='mt-1 w-full'
                    />
                    {errors.password && (
                      <p className='text-red-500 text-sm mt-1'>
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </CardContent>
            <CardFooter className='flex flex-col gap-2'>
              <Button
                onClick={() => handleSubmit(onLogin)()}
                disabled={shouldDisableButton}
                className='w-full cursor-pointer'
              >
                Login
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
