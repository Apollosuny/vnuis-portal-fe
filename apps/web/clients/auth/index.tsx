'use client';

import React from 'react';
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
import { User, Lock, Loader2 } from 'lucide-react';

const LoginPage: React.FC = () => {
  const {
    isLoading,
    onLogin,
    control,
    errors,
    handleSubmit,
    shouldDisableButton,
  } = useAuth();

  return (
    <div className='h-screen w-full relative overflow-hidden'>
      {/* Video background */}
      <video
        className='absolute top-0 left-0 w-full h-full object-cover'
        src='https://res.cloudinary.com/du1rup47p/video/upload/v1751036967/18069235-uhd_3840_2160_24fps_odx4zg.mp4'
        autoPlay
        muted
        loop
      />

      {/* Overlay for blur effect */}
      <div className='absolute inset-0 bg-black/20 backdrop-blur-md' />

      {/* Form */}
      <div className='fixed inset-0 z-10 flex items-center justify-center p-4 sm:p-6 lg:p-8'>
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
          className='w-full max-w-sm sm:max-w-md lg:max-w-lg p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl shadow-2xl bg-white/30 backdrop-blur-2xl border border-white/40 relative'
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className='flex justify-center mb-4 sm:mb-6'
          >
            <img
              src='https://res.cloudinary.com/du1rup47p/image/upload/v1751039621/logo_q0tmvc.png'
              alt='Project Logo'
              className='h-16 sm:h-20 lg:h-24 w-auto drop-shadow-2xl rounded-xl sm:rounded-2xl bg-white/90 p-2 sm:p-3 border border-white/60'
            />
          </motion.div>
          <Card className='bg-transparent shadow-none border-none'>
            <CardHeader>
              <CardTitle className='text-center text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-800 drop-shadow'>
                Login
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 sm:space-y-6'>
              <Controller
                name='username'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    <Label
                      htmlFor='username'
                      className='font-semibold text-gray-700 text-sm sm:text-base'
                    >
                      Username
                    </Label>
                    <motion.div
                      className='relative mt-1 sm:mt-2'
                      whileHover={{ scale: 1.02 }}
                      whileFocus={{ scale: 1.02 }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                      }}
                    >
                      <Input
                        id='username'
                        type='text'
                        placeholder='Enter your username'
                        value={value}
                        onChange={onChange}
                        className='px-4 sm:px-6 py-3 sm:py-5 w-full bg-white/90 backdrop-blur-sm border border-blue-200/40 focus:border-blue-600 focus:ring-2 focus:ring-blue-100/50 hover:border-blue-400 transition-all duration-300 ease-in-out rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md text-base sm:text-xl placeholder:text-gray-400 font-normal'
                      />
                    </motion.div>
                    {errors.username && (
                      <p className='text-red-500 text-sm mt-1'>
                        {errors.username.message}
                      </p>
                    )}
                  </motion.div>
                )}
              />
              <Controller
                name='password'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                  >
                    <Label
                      htmlFor='password'
                      className='font-semibold text-gray-700 text-sm sm:text-base'
                    >
                      Password
                    </Label>
                    <motion.div
                      className='relative mt-1 sm:mt-2'
                      whileHover={{ scale: 1.02 }}
                      whileFocus={{ scale: 1.02 }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                      }}
                    >
                      <Input
                        id='password'
                        type='password'
                        placeholder='Enter your password'
                        value={value}
                        onChange={onChange}
                        className='px-4 sm:px-6 py-3 sm:py-5 w-full bg-white/90 backdrop-blur-sm border border-blue-200/40 focus:border-blue-600 focus:ring-2 focus:ring-blue-100/50 hover:border-blue-400 transition-all duration-300 ease-in-out rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md text-base sm:text-xl placeholder:text-gray-400 font-normal'
                      />
                    </motion.div>
                    {errors.password && (
                      <p className='text-red-500 text-sm mt-1'>
                        {errors.password.message}
                      </p>
                    )}
                  </motion.div>
                )}
              />
            </CardContent>
            <CardFooter className='flex flex-col gap-3 sm:gap-4 mt-4 sm:mt-6'>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className='relative group'
              >
                {' '}
                {/* Enhanced Glow effect */}
                <div className='absolute -inset-1 bg-gradient-to-r from-gray-800 via-slate-800 to-gray-900 rounded-2xl sm:rounded-3xl blur-lg opacity-20 group-hover:opacity-40 transition-all duration-500'></div>
                {/* Secondary glow for depth */}
                <div className='absolute -inset-0.5 bg-gradient-to-r from-gray-600 via-slate-600 to-gray-700 rounded-2xl sm:rounded-3xl blur-sm opacity-15 group-hover:opacity-30 transition-all duration-500'></div>
                <Button
                  onClick={() => handleSubmit(onLogin)()}
                  disabled={shouldDisableButton}
                  className='relative w-full bg-gradient-to-r from-gray-900 via-slate-900 to-gray-950 hover:from-black hover:via-slate-950 hover:to-black backdrop-blur-xl border border-gray-300/20 hover:border-white/30 text-white font-bold text-lg sm:text-xl py-4 sm:py-6 px-6 sm:px-8 rounded-2xl sm:rounded-3xl shadow-2xl hover:shadow-gray-900/30 transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group transform hover:scale-[1.02] active:scale-[0.98]'
                >
                  {/* Animated gradient overlay */}
                  <div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>

                  {/* Enhanced glass shine effect */}
                  <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out'></div>

                  {/* Subtle inner glow */}
                  <div className='absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/10 rounded-2xl sm:rounded-3xl'></div>

                  {/* Content */}
                  <div className='relative z-10'>
                    {isLoading ? (
                      <div className='flex items-center justify-center gap-2 sm:gap-3'>
                        <Loader2 className='w-5 h-5 sm:w-6 sm:h-6 animate-spin text-white' />
                        <span className='text-white font-semibold text-sm sm:text-base drop-shadow-lg'>
                          Signing in...
                        </span>
                      </div>
                    ) : (
                      <span className='text-white drop-shadow-lg font-bold tracking-wide'>
                        Login
                      </span>
                    )}
                  </div>
                </Button>
              </motion.div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
