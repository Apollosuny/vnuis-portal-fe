'use client';

import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { BadgeCheck, FileText, Filter, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Badge } from '@workspace/ui/components/badge';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/router';

// Mock data for forms
const mockForms = [
  {
    id: 'form-1',
    name: 'Leave Request Form',
    type: 'PROCEDURES',
    status: 'PENDING',
    submittedBy: 'John Doe',
    submittedAt: '2025-05-18T10:30:00Z',
    student: { id: 'student-1', name: 'John Doe', studentId: 'STU20210001' },
  },
  {
    id: 'form-2',
    name: 'Curriculum Change Request',
    type: 'PROCEDURES',
    status: 'APPROVED',
    submittedBy: 'Jane Smith',
    submittedAt: '2025-05-17T14:20:00Z',
    student: { id: 'student-2', name: 'Jane Smith', studentId: 'STU20210012' },
  },
  {
    id: 'form-3',
    name: 'Scholarship Application',
    type: 'PROCEDURES',
    status: 'REJECTED',
    submittedBy: 'Mike Johnson',
    submittedAt: '2025-05-16T09:45:00Z',
    student: {
      id: 'student-3',
      name: 'Mike Johnson',
      studentId: 'STU20210034',
    },
  },
  {
    id: 'form-4',
    name: 'Dorm Application Form',
    type: 'PROCEDURES',
    status: 'PENDING',
    submittedBy: 'Sarah Williams',
    submittedAt: '2025-05-15T16:30:00Z',
    student: {
      id: 'student-4',
      name: 'Sarah Williams',
      studentId: 'STU20220056',
    },
  },
  {
    id: 'form-5',
    name: 'Exam Reschedule Request',
    type: 'PROCEDURES',
    status: 'PENDING',
    submittedBy: 'Alex Brown',
    submittedAt: '2025-05-15T11:20:00Z',
    student: { id: 'student-5', name: 'Alex Brown', studentId: 'STU20210078' },
  },
];

const FormsPanel: React.FC = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter forms based on search term and status
  const filteredForms = mockForms.filter((form) => {
    const matchesSearch =
      form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.student.studentId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || form.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Render badge based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Badge
            variant='outline'
            className='text-emerald-500 border-emerald-500 bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-400 dark:bg-emerald-400/10'
          >
            Approved
          </Badge>
        );
      case 'REJECTED':
        return <Badge variant='destructive'>Rejected</Badge>;
      case 'PENDING':
        return (
          <Badge
            variant='outline'
            className='text-amber-500 border-amber-500 bg-amber-500/10 dark:text-amber-400 dark:border-amber-400 dark:bg-amber-400/10'
          >
            Pending
          </Badge>
        );
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center'>
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center'>
          <div className='relative'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              type='text'
              placeholder='Search forms...'
              className='pl-8 w-[280px]'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className='flex items-center gap-2'>
            <Filter className='h-4 w-4 text-muted-foreground' />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-[140px]'>
                <SelectValue placeholder='Filter by status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>All Status</SelectItem>
                <SelectItem value='PENDING'>Pending</SelectItem>
                <SelectItem value='APPROVED'>Approved</SelectItem>
                <SelectItem value='REJECTED'>Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          className='flex items-center gap-2'
          onClick={() => router.push(ROUTES.CREATE_FORM)}
        >
          <Plus className='size-4' />
          <span>Create Form</span>
        </Button>
      </div>

      <Card>
        <CardHeader className='px-6'>
          <div className='flex justify-between items-center'>
            <CardTitle className='flex items-center gap-2'>
              <FileText className='size-5' />
              <span>Administrative Procedure Forms</span>
            </CardTitle>
            <Badge className='bg-primary'>{filteredForms.length} Forms</Badge>
          </div>
        </CardHeader>
        <CardContent className='px-6'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Form Name</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Submitted On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredForms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell className='font-medium'>{form.name}</TableCell>
                  <TableCell>
                    <div className='flex flex-col'>
                      <span>{form.student.name}</span>
                      <span className='text-xs text-muted-foreground'>
                        {form.student.studentId}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(form.submittedAt)}</TableCell>
                  <TableCell>{getStatusBadge(form.status)}</TableCell>
                  <TableCell className='text-right'>
                    <Button variant='outline' size='sm'>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className='px-6 border-t flex justify-between'>
          <div className='text-sm text-muted-foreground'>
            Showing {filteredForms.length} of {mockForms.length} forms
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' disabled>
              Previous
            </Button>
            <Button variant='outline' size='sm' disabled>
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FormsPanel;
