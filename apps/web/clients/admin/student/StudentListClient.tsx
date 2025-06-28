'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  PlusIcon,
  Loader2Icon,
  SearchIcon,
  MoreVerticalIcon,
} from 'lucide-react';
import Link from 'next/link';
import { studentApi } from '@/api/student.api';
import { ROUTES } from '@/constants/router';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';

export const StudentListClient = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentApi.getStudents(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Extract students array from response
  const students = data?.items || [];

  // Filter students based on search term
  const filteredStudents = students.filter(
    (student) =>
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.major.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='container mx-auto py-4 px-4 md:py-6'>
      {/* Mobile Title */}
      <div className='sm:hidden mb-6'>
        <h1 className='text-xl font-bold text-gray-900 dark:text-gray-100'>
          Student Management
        </h1>
        <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
          Manage university students and their information
        </p>
      </div>

      {/* Desktop Header */}
      <div className='hidden sm:flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
            Student Management
          </h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>
            Manage university students and their information
          </p>
        </div>
        <Button asChild className='flex items-center gap-2'>
          <Link href={`${ROUTES.STUDENTS}/create`}>
            <PlusIcon className='h-4 w-4' />
            Add New Student
          </Link>
        </Button>
      </div>

      {/* Mobile Add Button */}
      <div className='sm:hidden mb-6'>
        <Button
          asChild
          className='w-full flex items-center justify-center gap-2'
        >
          <Link href={`${ROUTES.STUDENTS}/create`}>
            <PlusIcon className='h-4 w-4' />
            Add New Student
          </Link>
        </Button>
      </div>

      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className='text-lg sm:text-xl text-gray-900 dark:text-gray-100'>
            Student Directory
          </CardTitle>
          <CardDescription className='text-gray-600 dark:text-gray-400'>
            View and manage all students in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='relative mb-6'>
            <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
              <SearchIcon className='w-4 h-4 text-gray-500' />
            </div>
            <input
              type='text'
              className='block w-full p-3 pl-10 text-sm border border-input rounded-lg bg-background text-foreground'
              placeholder='Search students by name, ID, email or major...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className='flex justify-center items-center h-64'>
              <Loader2Icon className='h-8 w-8 animate-spin text-primary' />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className='text-center py-10 border rounded-lg'>
              <p className='text-lg text-gray-500 dark:text-gray-400'>
                {searchTerm
                  ? 'No students found matching your search'
                  : 'No students found'}
              </p>
              {searchTerm && (
                <p className='text-sm text-gray-400 dark:text-gray-500 mt-2'>
                  Try adjusting your search terms
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Mobile Cards View */}
              <div className='sm:hidden space-y-4'>
                {filteredStudents.map((student) => (
                  <Card
                    key={student.id}
                    className='border border-gray-200 dark:border-gray-700'
                  >
                    <CardContent className='p-4'>
                      <div className='space-y-3'>
                        <div className='flex items-start justify-between'>
                          <div className='flex-1 min-w-0'>
                            <h4 className='font-medium text-gray-900 dark:text-gray-100 truncate'>
                              {student.firstName} {student.lastName}
                            </h4>
                            <p className='text-sm text-gray-600 dark:text-gray-400'>
                              ID: {student.studentId}
                            </p>
                          </div>
                          <Badge
                            variant='outline'
                            className='ml-2 flex-shrink-0'
                          >
                            {student.enrollYear}
                          </Badge>
                        </div>

                        <div className='space-y-1 text-sm text-gray-600 dark:text-gray-400'>
                          <p className='break-words'>📧 {student.email}</p>
                          <p>🎓 {student.major}</p>
                        </div>

                        <div className='flex gap-2 pt-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            asChild
                            className='flex-1'
                          >
                            <Link
                              href={`${ROUTES.STUDENT_DETAIL}/${student.id}`}
                            >
                              View Details
                            </Link>
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            asChild
                            className='flex-1'
                          >
                            <Link
                              href={`${ROUTES.STUDENT_DETAIL}/${student.id}/edit`}
                            >
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className='hidden sm:block rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className='hidden md:table-cell'>
                        Email
                      </TableHead>
                      <TableHead className='hidden lg:table-cell'>
                        Major
                      </TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.studentId}</TableCell>
                        <TableCell className='font-medium'>
                          {student.firstName} {student.lastName}
                        </TableCell>
                        <TableCell className='hidden md:table-cell'>
                          {student.email}
                        </TableCell>
                        <TableCell className='hidden lg:table-cell'>
                          {student.major}
                        </TableCell>
                        <TableCell>
                          <Badge variant='outline'>{student.enrollYear}</Badge>
                        </TableCell>
                        <TableCell className='text-right'>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' size='icon'>
                                <MoreVerticalIcon className='h-4 w-4' />
                                <span className='sr-only'>Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`${ROUTES.STUDENT_DETAIL}/${student.id}`}
                                >
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`${ROUTES.STUDENT_DETAIL}/${student.id}/edit`}
                                >
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
