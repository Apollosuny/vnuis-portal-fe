'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
import { Checkbox } from '@workspace/ui/components/checkbox';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileText,
  ClockIcon,
  User,
  Calendar,
  Loader2,
  Wallet,
} from 'lucide-react';
import { getSubmissionById } from '@/api/form-submission.api';
import { formatDate } from '@/utils/date-utils';
import { toast } from 'sonner';
import { FormSubmissionStatus } from '@/types/enums';
import { AdministrativeProceduresFormSubmission } from '@/types/form-submission.types';
import { useFormApproval } from '@/hooks/useFormApproval';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const FormSubmissionDetailClient = ({ id }: { id: string }) => {
  const router = useRouter();
  const [submission, setSubmission] =
    useState<AdministrativeProceduresFormSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(
    null
  );
  const [actionLoading, setActionLoading] = useState(false);
  const [remarks, setRemarks] = useState<string>('');
  const [useBlockchain, setUseBlockchain] = useState(false);

  const {
    approveFormSubmission,
    rejectFormSubmission,
    isWalletConnected,
    connectWallet,
    isLoading: formApprovalLoading,
    blockchainLoading,
  } = useFormApproval();

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const data = await getSubmissionById(id);
        setSubmission(data);
      } catch (err) {
        console.error('Error fetching submission:', err);
        setError('Failed to load submission details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  const openActionDialog = (action: 'approve' | 'reject') => {
    setActionType(action);
    setDialogOpen(true);
  };

  const handleAction = async () => {
    if (!actionType || !submission) return;
    setActionLoading(true);

    try {
      let updatedSubmission;

      if (actionType === 'approve') {
        if (useBlockchain && !isWalletConnected) {
          toast.error('Please connect your wallet to sign with blockchain');
          connectWallet();
          setActionLoading(false);
          return;
        }

        try {
          // Use the integrated form approval hook
          updatedSubmission = await approveFormSubmission(
            submission.id,
            submission.result || {},
            {
              useBlockchain,
              remarks,
              metadata: `Form ${submission.form?.name} approved for ${submission.student?.name || 'student'} at ${new Date().toISOString()}`,
            }
          );

          // Force refetch submission to get the latest data
          const refreshedSubmission = await getSubmissionById(submission.id);
          if (refreshedSubmission) {
            setSubmission(refreshedSubmission);
          } else {
            setSubmission(updatedSubmission);
          }
        } catch (err) {
          console.error('Error approving submission:', err);
          toast.error('Failed to approve submission. Please try again.');
          setActionLoading(false);
          return;
        }
      } else {
        // For rejection
        if (!remarks.trim()) {
          toast.error('Please provide a reason for rejection');
          setActionLoading(false);
          return;
        }

        try {
          // Use the form approval hook for consistency
          updatedSubmission = await rejectFormSubmission(
            submission.id,
            remarks
          );

          // Force refetch submission to get the latest data
          const refreshedSubmission = await getSubmissionById(submission.id);
          if (refreshedSubmission) {
            setSubmission(refreshedSubmission);
          } else {
            setSubmission(updatedSubmission);
          }
        } catch (err) {
          console.error('Error rejecting submission:', err);
          toast.error('Failed to reject submission. Please try again.');
          setActionLoading(false);
          return;
        }
      }

      // Reset fields
      setRemarks('');
      setUseBlockchain(false);
    } catch (err) {
      console.error(`Error ${actionType}ing submission:`, err);
      toast.error(`Failed to ${actionType} submission. Please try again.`);
    } finally {
      setDialogOpen(false);
      setActionType(null);
      setActionLoading(false);
    }
  };

  const renderStatusBadge = (status: string) => {
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

  if (loading) {
    return (
      <div className='flex justify-center items-center py-12'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <Card className='border-destructive'>
        <CardHeader>
          <CardTitle className='text-destructive'>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error || 'Submission not found'}</p>
        </CardContent>
        <CardFooter>
          <Button variant='outline' onClick={handleBack}>
            Go Back
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <>
      <div className='space-y-4 md:space-y-6'>
        {/* Mobile Title */}
        <div className='block md:hidden mb-4'>
          <h1 className='text-xl font-semibold text-gray-900 dark:text-white'>
            Submission Details
          </h1>
          <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
            View and manage form submission
          </p>
        </div>

        <div className='flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center'>
          <Button
            variant='ghost'
            onClick={handleBack}
            className='px-2 w-full sm:w-auto'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            <span className='hidden sm:inline'>Back to Submissions</span>
            <span className='sm:hidden'>Back</span>
          </Button>
        </div>

        {/* Submission Overview Card */}
        <Card>
          <CardHeader className='border-b px-4 md:px-6'>
            <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4'>
              <div className='flex-1 min-w-0'>
                <CardTitle className='flex items-center gap-2 text-lg md:text-xl break-words'>
                  <FileText className='h-4 w-4 md:h-5 md:w-5 flex-shrink-0' />
                  <span className='truncate'>
                    {submission.form?.name || 'Form Submission'}
                  </span>
                </CardTitle>
                <CardDescription className='mt-1 text-xs md:text-sm break-all'>
                  Submission ID: {submission.id}
                </CardDescription>
              </div>
              <div className='flex-shrink-0'>
                {renderStatusBadge(submission.status)}
              </div>
            </div>
          </CardHeader>

          <CardContent className='pt-4 md:pt-6 px-4 md:px-6'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6'>
              {/* Student Information */}
              <div className='space-y-4'>
                <h3 className='font-medium flex items-center gap-2'>
                  <User className='h-4 w-4 text-muted-foreground' />
                  Student Information
                </h3>
                <div className='bg-muted/40 rounded-md p-4 space-y-3'>
                  <div>
                    <p className='text-sm text-muted-foreground'>Name</p>
                    <p className='font-medium'>
                      {submission.student?.name ||
                        (submission.student?.firstName &&
                        submission.student?.lastName
                          ? `${submission.student.firstName} ${submission.student.lastName}`
                          : 'N/A')}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Student ID</p>
                    <p className='font-medium'>
                      {submission.student?.studentId || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Email</p>
                    <p className='font-medium'>
                      {submission.student?.email || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Submission Dates */}
              <div className='space-y-4'>
                <h3 className='font-medium flex items-center gap-2'>
                  <Calendar className='h-4 w-4 text-muted-foreground' />
                  Submission Timeline
                </h3>
                <div className='bg-muted/40 rounded-md p-4 space-y-3'>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Submitted On
                    </p>
                    <p className='font-medium'>
                      {formatDate(submission.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Last Updated
                    </p>
                    <p className='font-medium'>
                      {formatDate(submission.updatedAt)}
                    </p>
                  </div>
                  <div>
                    <span className='text-sm text-muted-foreground'>
                      Status
                    </span>
                    <div className='font-medium flex items-center gap-2'>
                      {renderStatusBadge(submission.status)}
                      {submission.status === FormSubmissionStatus.PENDING && (
                        <span className='text-sm text-muted-foreground'>
                          (Awaiting review)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Answers */}
            <div className='mt-8 space-y-4'>
              <h3 className='font-medium flex items-center gap-2'>
                <ClockIcon className='h-4 w-4 text-muted-foreground' />
                Form Responses
              </h3>

              <Card className='border border-dashed'>
                <CardContent className='pt-6'>
                  {submission.result &&
                  Array.isArray(submission.result.answers) &&
                  submission.result.answers.length > 0 ? (
                    <div className='space-y-6'>
                      {submission.result.answers.map((item, index) => {
                        const question = submission.form?.data?.questions?.find(
                          (q) => q.id === item.questionId
                        );
                        return (
                          <div
                            key={item.questionId}
                            className='pb-4 border-b last:border-0 last:pb-0'
                          >
                            <div className='font-medium mb-2'>
                              {question?.title ||
                                `Unknown Question (${item.questionId})`}
                            </div>
                            <div className='bg-muted/40 p-3 rounded'>
                              {item.answer}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className='text-center py-6 text-muted-foreground'>
                      No responses available for this submission
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </CardContent>

          <CardFooter className='border-t pt-6 flex justify-between'>
            <Button variant='outline' onClick={handleBack}>
              <ArrowLeft className='mr-2 h-4 w-4' /> Back
            </Button>
            <div className='flex gap-2'>
              {submission.status === FormSubmissionStatus.PENDING && (
                <>
                  <Button
                    variant='default'
                    className='bg-emerald-600 hover:bg-emerald-700'
                    onClick={() => openActionDialog('approve')}
                  >
                    Approve Submission
                  </Button>
                  <Button
                    variant='destructive'
                    onClick={() => openActionDialog('reject')}
                  >
                    Reject Submission
                  </Button>
                </>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' ? 'Approve' : 'Reject'} this submission?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'approve'
                ? 'This will approve the form submission and notify the student.'
                : 'This will reject the form submission and notify the student.'}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className='py-4 space-y-4'>
            <label htmlFor='remarks' className='block text-sm font-medium mb-2'>
              {actionType === 'approve'
                ? 'Comments (optional)'
                : 'Reason for rejection'}
            </label>
            <textarea
              id='remarks'
              rows={3}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={
                actionType === 'approve'
                  ? 'Add any additional comments...'
                  : 'Please provide a reason for rejection...'
              }
              required={actionType === 'reject'}
            />

            {actionType === 'approve' && (
              <div className='mt-4'>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='use-blockchain'
                    checked={useBlockchain}
                    onCheckedChange={(checked) => setUseBlockchain(!!checked)}
                  />
                  <div className='grid gap-1'>
                    <label
                      htmlFor='use-blockchain'
                      className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                    >
                      Sign with blockchain
                    </label>
                    <p className='text-xs text-muted-foreground'>
                      This will create an immutable record of this approval on
                      Solana blockchain
                    </p>
                  </div>
                </div>

                {useBlockchain && !isWalletConnected && (
                  <div className='mt-2 bg-yellow-50 p-2 rounded-md flex items-center justify-between'>
                    <p className='text-xs text-yellow-700'>
                      You need to connect a wallet to sign with blockchain
                    </p>
                    <Button
                      variant='secondary'
                      size='sm'
                      onClick={connectWallet}
                      type='button'
                      className='flex items-center space-x-1'
                    >
                      <Wallet className='w-3 h-3' />
                      <span>Connect Wallet</span>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={
                actionLoading ||
                formApprovalLoading ||
                blockchainLoading ||
                (actionType === 'reject' && !remarks.trim()) ||
                (useBlockchain && !isWalletConnected)
              }
              className={
                actionType === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : ''
              }
            >
              {actionLoading || formApprovalLoading || blockchainLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  {useBlockchain
                    ? 'Processing Blockchain Transaction...'
                    : 'Processing...'}
                </>
              ) : actionType === 'approve' ? (
                useBlockchain ? (
                  'Approve & Sign on Blockchain'
                ) : (
                  'Approve'
                )
              ) : (
                'Reject'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FormSubmissionDetailClient;
