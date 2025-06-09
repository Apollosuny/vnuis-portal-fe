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
  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentApi.getStudents(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

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
    <div className='container mx-auto py-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Student Management</h1>
        <Button asChild>
          <Link href={`${ROUTES.STUDENTS}/create`}>
            <PlusIcon className='h-4 w-4 mr-2' />
            Add New Student
          </Link>
        </Button>
      </div>

      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>Student Directory</CardTitle>
          <CardDescription>
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
              className='block w-full p-2 pl-10 text-sm border border-input rounded-lg'
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
              <p className='text-lg text-gray-500'>No students found</p>
            </div>
          ) : (
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Major</TableHead>
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
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.major}</TableCell>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};
