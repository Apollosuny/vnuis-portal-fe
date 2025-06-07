'use client';

import { AdministrativeProceduresFormSubmission } from '@/types/form-submission.types';
import { FormSubmissionStatus } from '@/types/enums';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { DataTable } from '@/components/data-table';
import { DateTime } from 'luxon';
import Link from 'next/link';
import { cn } from '@workspace/ui/lib/utils';
import { buttonVariants } from '@workspace/ui/components/button';

type RecentFormSubmissionsProps = {
  submissions: AdministrativeProceduresFormSubmission[];
};

const formatSubmissionDate = (date: string) => {
  return DateTime.fromISO(date).toFormat('dd/MM/yyyy HH:mm');
};

export const RecentFormSubmissions = ({
  submissions,
}: RecentFormSubmissionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Form Submissions</CardTitle>
      </CardHeader>
      <CardContent>
        {submissions.length === 0 ? (
          <p className='text-center text-muted-foreground'>
            No recent form submissions
          </p>
        ) : (
          <DataTable
            data={submissions}
            columns={[
              {
                accessorKey: 'student.name',
                header: 'Student',
              },
              {
                accessorKey: 'form.name',
                header: 'Form',
              },
              {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => (
                  <span
                    className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      {
                        'bg-yellow-100 text-yellow-800':
                          row.getValue('status') ===
                          FormSubmissionStatus.PENDING,
                        'bg-green-100 text-green-800':
                          row.getValue('status') ===
                          FormSubmissionStatus.APPROVED,
                        'bg-red-100 text-red-800':
                          row.getValue('status') ===
                          FormSubmissionStatus.REJECTED,
                      }
                    )}
                  >
                    {row.getValue('status')}
                  </span>
                ),
              },
              {
                accessorKey: 'createdAt',
                header: 'Submitted',
                cell: ({ row }) =>
                  formatSubmissionDate(row.getValue('createdAt')),
              },
            ]}
          />
        )}
      </CardContent>
      <CardFooter>
        <Link
          href='/admin-dashboard/forms'
          className={cn(buttonVariants({ variant: 'link' }))}
        >
          View All Form Submissions →
        </Link>
      </CardFooter>
    </Card>
  );
};
