'use client';

import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { useRouter } from 'next/navigation';
import { Filter, Search, FileText } from 'lucide-react';
import {
  getFormSubmissions,
  getAllFormSubmissions,
} from '@/api/form-submission.api';
import { getForms } from '@/api/form.api';
import { formatDate } from '@/utils/date-utils';
import { AdministrativeProceduresForm } from '@/types/administrative-form.types';
import { toast } from 'sonner';
import { AdministrativeProceduresFormSubmission } from '@/types/form-submission.types';
import { FormSubmissionStatus } from '@/types/enums';

export const FormSubmissionsClient = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState<AdministrativeProceduresForm[]>([]);
  const [submissions, setSubmissions] = useState<
    AdministrativeProceduresFormSubmission[]
  >([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedFormId, setSelectedFormId] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  // Fetch forms when component mounts
  useEffect(() => {
    const fetchForms = async () => {
      try {
        const formsData = await getForms();
        setForms(formsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching forms:', err);
        setError('Failed to load forms. Please try again later.');
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  // Fetch submissions when component mounts or selected form changes
  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        let submissionsData;

        if (selectedFormId && selectedFormId !== 'all') {
          // Fetch submissions for a specific form
          submissionsData = await getFormSubmissions(selectedFormId);
        } else {
          // Fetch all submissions across all forms
          submissionsData = await getAllFormSubmissions();
        }

        setSubmissions(submissionsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching submissions:', err);
        setError(
          selectedFormId !== 'all'
            ? 'Failed to load submissions for this form.'
            : 'Failed to load all submissions.'
        );
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [selectedFormId]);

  // Filter submissions based on search term and status
  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch =
      submission.student?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      submission.student?.studentId
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      submission.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((selectedFormId === 'all' || !selectedFormId) &&
        submission.form?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' || submission.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Helper function to format date
  const formatSubmissionDate = (dateString: string) => {
    return formatDate(dateString);
  };

  // Render badge based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case FormSubmissionStatus.APPROVED:
        return <Badge className='bg-emerald-500'>Approved</Badge>;
      case FormSubmissionStatus.REJECTED:
        return <Badge className='bg-destructive'>Rejected</Badge>;
      case FormSubmissionStatus.PENDING:
        return <Badge className='bg-amber-500'>Pending</Badge>;
      case FormSubmissionStatus.CANCELLED:
        return <Badge className='bg-slate-500'>Cancelled</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Handle viewing a submission
  const handleViewSubmission = (id: string) => {
    router.push(`/dashboard/forms/submissions/${id}`);
  };

  return (
    <div className='space-y-6'>
      {error && (
        <div className='bg-destructive/10 p-3 rounded-md text-destructive border border-destructive'>
          {error}
        </div>
      )}

      <div className='flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center'>
        <div className='flex flex-col sm:flex-row gap-4 w-full sm:w-auto'>
          <Select
            value={selectedFormId}
            onValueChange={(value) => setSelectedFormId(value)}
            disabled={loading || forms.length === 0}
          >
            <SelectTrigger className='w-full sm:w-[300px]'>
              <SelectValue placeholder='Select a form to filter submissions' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Forms</SelectItem>
              {forms.map((form) => (
                <SelectItem key={form.id} value={form.id}>
                  {form.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex flex-col sm:flex-row gap-4 w-full sm:w-auto'>
          <div className='relative w-full sm:w-auto'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              type='text'
              placeholder='Search student name or ID...'
              className='pl-8 w-full sm:w-[280px]'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading || submissions.length === 0}
            />
          </div>

          <div className='flex items-center gap-2'>
            <Filter className='h-4 w-4 text-muted-foreground' />
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
              disabled={loading || submissions.length === 0}
            >
              <SelectTrigger className='w-[140px]'>
                <SelectValue placeholder='Filter by status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>All Status</SelectItem>
                <SelectItem value={FormSubmissionStatus.PENDING}>
                  Pending
                </SelectItem>
                <SelectItem value={FormSubmissionStatus.APPROVED}>
                  Approved
                </SelectItem>
                <SelectItem value={FormSubmissionStatus.REJECTED}>
                  Rejected
                </SelectItem>
                <SelectItem value={FormSubmissionStatus.CANCELLED}>
                  Cancelled
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className='px-6'>
          <div className='flex justify-between items-center'>
            <CardTitle className='flex items-center gap-2'>
              <FileText className='size-5' />
              <span>Form Submissions</span>
            </CardTitle>
            <Badge className='bg-primary'>
              {filteredSubmissions.length} Submissions
            </Badge>
          </div>
        </CardHeader>

        <CardContent className='px-6'>
          {loading ? (
            <div className='flex justify-center items-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            </div>
          ) : submissions.length === 0 ? (
            <div className='text-center py-8 text-muted-foreground'>
              {selectedFormId !== 'all' ? (
                <p>No submissions found for this form</p>
              ) : (
                <p>No form submissions found in the system</p>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div className='flex flex-col'>
                        <span>
                          {submission.student
                            ? submission.student.name ||
                              `${submission.student.firstName} ${submission.student.lastName}`
                            : 'N/A'}
                        </span>
                        <span className='text-xs text-muted-foreground'>
                          {submission.student?.studentId || 'Unknown ID'}
                        </span>
                        {(selectedFormId === 'all' || !selectedFormId) &&
                          submission.form && (
                            <span className='text-xs font-medium text-primary mt-1'>
                              {submission.form.name}
                            </span>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatSubmissionDate(submission.createdAt)}
                    </TableCell>
                    <TableCell>
                      {formatSubmissionDate(submission.updatedAt)}
                    </TableCell>
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell className='text-right'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleViewSubmission(submission.id)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>

        <CardFooter className='px-6 border-t flex justify-between'>
          <div className='text-sm text-muted-foreground'>
            {forms.length > 0 && submissions.length > 0 && (
              <>
                Showing {filteredSubmissions.length} of {submissions.length}{' '}
                submissions
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FormSubmissionsClient;
