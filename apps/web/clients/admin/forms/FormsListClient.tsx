'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusIcon } from 'lucide-react';
import { getForms } from '@/api/form.api';
import { AdministrativeProceduresForm } from '@/types/administrative-form.types';
import { toast } from 'sonner';
import { Button } from '@workspace/ui/components/button';

export const FormsListClient = () => {
  const [forms, setForms] = useState<AdministrativeProceduresForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadForms = async () => {
      try {
        setIsLoading(true);
        const formsData = await getForms();
        setForms(formsData);
      } catch (error) {
        console.error('Error loading forms:', error);
        toast.error('Failed to load forms');
      } finally {
        setIsLoading(false);
      }
    };

    loadForms();
  }, []);

  return (
    <div className='container mx-auto py-4'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Administrative Forms</h1>
        <Link href='/admin/forms/create'>
          <Button className='flex items-center gap-1'>
            <PlusIcon className='h-4 w-4' />
            Create Form
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className='flex justify-center py-8'>
          <div className='animate-pulse flex space-x-4'>
            <div className='flex-1 space-y-4 py-1'>
              <div className='h-4 bg-gray-200 rounded w-3/4'></div>
              <div className='space-y-2'>
                <div className='h-4 bg-gray-200 rounded'></div>
                <div className='h-4 bg-gray-200 rounded w-5/6'></div>
              </div>
            </div>
          </div>
        </div>
      ) : forms.length > 0 ? (
        <div className='bg-white rounded-lg shadow overflow-hidden'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Name
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Type
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Status
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Questions
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Requires Approval
                </th>
                <th scope='col' className='relative px-6 py-3'>
                  <span className='sr-only'>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {forms.map((form) => (
                <tr key={form.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm font-medium text-gray-900'>
                      {form.name}
                    </div>
                    <div className='text-sm text-gray-500'>{form.slug}</div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-gray-900'>{form.type}</div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        form.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {form.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {form.data.questions.length}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {form.requireApproval ? 'Yes' : 'No'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                    <Link
                      href={`/admin/forms/${form.id}`}
                      className='text-blue-600 hover:text-blue-900 mr-4'
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/forms/${form.id}/edit`}
                      className='text-indigo-600 hover:text-indigo-900'
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className='bg-white p-6 text-center border rounded-lg shadow-sm'>
          <p className='text-gray-500 mb-4'>No forms have been created yet.</p>
          <Link href='/admin/forms/create'>
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
