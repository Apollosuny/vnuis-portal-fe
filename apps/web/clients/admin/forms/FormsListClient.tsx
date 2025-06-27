'use client';

import { PlusIcon } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getForms } from '@/api/form.api';
import { AdministrativeProceduresForm } from '@/types/administrative-form.types';
import { toast } from 'sonner';
import { Button } from '@workspace/ui/components/button';
import { ROUTES } from '@/constants/router';

export const FormsListClient = () => {
  const {
    data: forms = [] as AdministrativeProceduresForm[],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['forms'],
    queryFn: getForms,
    staleTime: 0, // Always treat as stale to ensure refetch on revisit
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  if (error) {
    console.error('Error loading forms:', error);
    toast.error('Failed to load forms');
  }

  return (
    <div className='space-y-4 md:space-y-6'>
      {/* Page Title */}
      <div className='block md:hidden mb-4'>
        <h1 className='text-xl font-semibold text-gray-900 dark:text-white'>
          Administrative Procedures
        </h1>
        <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
          Manage forms and procedures
        </p>
      </div>

      <div className='flex flex-col gap-4 md:flex-row md:justify-between md:items-center'>
        <div className='flex items-center gap-2'>
          {/* Any additional filters or controls can go here */}
        </div>
        <Link href='/dashboard/forms/create'>
          <Button className='flex items-center justify-center gap-1 w-full md:w-auto'>
            <PlusIcon className='h-4 w-4' />
            <span className='hidden sm:inline'>Create Form</span>
            <span className='sm:hidden'>Create</span>
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className='flex justify-center py-8'>
          <div className='animate-pulse flex space-x-4 w-full'>
            <div className='flex-1 space-y-4 py-1'>
              <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4'></div>
              <div className='space-y-2'>
                <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded'></div>
                <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6'></div>
              </div>
            </div>
          </div>
        </div>
      ) : forms.length > 0 ? (
        <>
          {/* Desktop Table View */}
          <div className='hidden lg:block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden'>
            <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
              <thead className='bg-gray-50 dark:bg-gray-700'>
                <tr>
                  {[
                    'Name',
                    'Type',
                    'Status',
                    'Questions',
                    'Requires Approval',
                  ].map((col) => (
                    <th
                      key={col}
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'
                    >
                      {col}
                    </th>
                  ))}
                  <th scope='col' className='relative px-6 py-3'>
                    <span className='sr-only'>Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
                {forms.map((form) => (
                  <tr
                    key={form.id}
                    className='hover:bg-gray-50 dark:hover:bg-gray-700'
                  >
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm font-medium text-gray-900 dark:text-white'>
                        {form.name}
                      </div>
                      <div className='text-sm text-gray-500 dark:text-gray-400'>
                        {form.slug}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-gray-900 dark:text-gray-200'>
                        {form.type}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          form.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}
                      >
                        {form.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                      {form.data?.questions?.length || 0}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                      {form.requireApproval ? 'Yes' : 'No'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <Link
                        href={`${ROUTES.FORMS}/${form.id}`}
                        className='text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 mr-4'
                      >
                        View
                      </Link>
                      <Link
                        href={`${ROUTES.FORMS}/${form.id}/edit`}
                        className='text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200'
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className='lg:hidden space-y-3'>
            {forms.map((form) => (
              <div
                key={form.id}
                className='bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4'
              >
                <div className='flex flex-col space-y-3'>
                  {/* Header with name and status */}
                  <div className='flex justify-between items-start'>
                    <div className='flex-1 min-w-0'>
                      <h3 className='text-sm font-medium text-gray-900 dark:text-white truncate'>
                        {form.name}
                      </h3>
                      <p className='text-xs text-gray-500 dark:text-gray-400 truncate'>
                        {form.slug}
                      </p>
                    </div>
                    <span
                      className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full flex-shrink-0 ${
                        form.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {form.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Details grid */}
                  <div className='grid grid-cols-2 gap-3 text-xs'>
                    <div>
                      <span className='text-gray-500 dark:text-gray-400'>
                        Type:
                      </span>
                      <p className='text-gray-900 dark:text-gray-200 font-medium'>
                        {form.type}
                      </p>
                    </div>
                    <div>
                      <span className='text-gray-500 dark:text-gray-400'>
                        Questions:
                      </span>
                      <p className='text-gray-900 dark:text-gray-200 font-medium'>
                        {form.data?.questions?.length || 0}
                      </p>
                    </div>
                    <div className='col-span-2'>
                      <span className='text-gray-500 dark:text-gray-400'>
                        Requires Approval:
                      </span>
                      <p className='text-gray-900 dark:text-gray-200 font-medium'>
                        {form.requireApproval ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='flex justify-end space-x-3 pt-2 border-t border-gray-100 dark:border-gray-700'>
                    <Link
                      href={`${ROUTES.FORMS}/${form.id}`}
                      className='text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 text-sm font-medium'
                    >
                      View
                    </Link>
                    <Link
                      href={`${ROUTES.FORMS}/${form.id}/edit`}
                      className='text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 text-sm font-medium'
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className='bg-white dark:bg-gray-800 p-6 text-center border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm'>
          <p className='text-gray-500 dark:text-gray-400 mb-4'>
            No forms have been created yet.
          </p>
          <Link href={ROUTES.CREATE_FORM} className='flex justify-center'>
            <Button className='flex items-center gap-1'>
              <PlusIcon className='h-4 w-4' />
              Create your first form
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};
