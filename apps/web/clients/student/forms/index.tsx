'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs';
import {
  FileText,
  Filter,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeftRight,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import StudentDashboardLayout from '@/components/layouts/StudentDashboardLayout';
import { getForms } from '@/api/form.api';
import { getUserFormSubmissions } from '@/api/form-submission.api';
import { AdministrativeProceduresForm } from '@/types/administrative-form.types';
import { AdministrativeProceduresFormSubmission } from '@/types/form-submission.types';
import { FormSubmissionStatus } from '@/types/enums';
import { formatDate, formatRelativeTime } from '@/utils/date-utils';

// Mock form data
const formSubmissions = [
  {
    id: 'F-1001',
    name: 'Tuition Discount Application',
    submittedDate: 'May 20, 2025',
    updatedDate: 'May 22, 2025',
    status: 'Under Review',
    category: 'Financial',
    responseTime: '2-5 business days',
    comments: [
      {
        from: 'Financial Aid Office',
        date: 'May 22, 2025',
        message:
          'We require additional proof of income. Please upload to your student portal.',
      },
    ],
  },
  {
    id: 'F-982',
    name: 'Absence Report',
    submittedDate: 'May 15, 2025',
    updatedDate: 'May 18, 2025',
    status: 'Approved',
    category: 'Academic',
    responseTime: '1-3 business days',
    comments: [
      {
        from: 'Academic Affairs',
        date: 'May 18, 2025',
        message: 'Your absence has been approved. No further action needed.',
      },
    ],
  },
  {
    id: 'F-967',
    name: 'Course Transfer Request',
    submittedDate: 'April 5, 2025',
    updatedDate: 'April 10, 2025',
    status: 'Rejected',
    category: 'Academic',
    responseTime: '3-5 business days',
    comments: [
      {
        from: 'Department of Computer Science',
        date: 'April 8, 2025',
        message:
          'The requested course does not meet the equivalency requirements.',
      },
      {
        from: 'Registrar Office',
        date: 'April 10, 2025',
        message:
          'Transfer request has been denied. Please see departmental comments.',
      },
    ],
  },
  {
    id: 'F-943',
    name: 'Scholarship Application',
    submittedDate: 'March 10, 2025',
    updatedDate: 'March 15, 2025',
    status: 'Approved',
    category: 'Financial',
    responseTime: '5-7 business days',
    comments: [
      {
        from: 'Scholarship Committee',
        date: 'March 15, 2025',
        message:
          'Congratulations! Your application has been approved for the Academic Excellence Scholarship.',
      },
    ],
  },
];

// Available forms that students can submit
const availableForms = [
  {
    id: 'AF-001',
    name: 'Medical Exemption Request',
    category: 'Health & Wellness',
    description:
      'Request exemption from physical education activities or requirements due to medical conditions.',
    processingTime: '3-5 business days',
    requiredDocuments: [
      'Medical certificate',
      "Doctor's recommendation letter",
    ],
    deadline: 'None',
  },
  {
    id: 'AF-002',
    name: 'Study Abroad Application',
    category: 'Academic',
    description:
      'Apply for international exchange programs offered by the university.',
    processingTime: '10-14 business days',
    requiredDocuments: [
      'Academic transcript',
      'Statement of purpose',
      'Two recommendation letters',
    ],
    deadline: 'June 15, 2025',
  },
  {
    id: 'AF-003',
    name: 'Tuition Payment Plan',
    category: 'Financial',
    description:
      'Request installment payments for tuition fees instead of a single lump sum payment.',
    processingTime: '2-3 business days',
    requiredDocuments: ['Financial statement', 'Proof of income/hardship'],
    deadline: 'Two weeks before semester start',
  },
  {
    id: 'AF-004',
    name: 'Special Learning Accommodations',
    category: 'Academic',
    description:
      'Request special learning accommodations for disabilities or learning difficulties.',
    processingTime: '5-7 business days',
    requiredDocuments: ['Medical evaluation', 'Psychoeducational assessment'],
    deadline: 'None',
  },
  {
    id: 'AF-005',
    name: 'Dormitory Application',
    category: 'Housing',
    description:
      'Apply for on-campus dormitory housing for the upcoming semester.',
    processingTime: '7-10 business days',
    requiredDocuments: ['Student ID verification'],
    deadline: 'June 30, 2025',
  },
  {
    id: 'AF-006',
    name: 'Club Formation Request',
    category: 'Extracurricular',
    description:
      'Request to form a new student club or organization on campus.',
    processingTime: '14-21 business days',
    requiredDocuments: [
      'Club charter',
      'List of founding members',
      'Faculty advisor consent',
    ],
    deadline: 'September 15, 2025',
  },
];

// Form status filter options
const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'approved', label: 'Approved' },
  { value: 'under-review', label: 'Under Review' },
  { value: 'rejected', label: 'Rejected' },
];

// Form category filter options
const categoryFilters = [
  { value: 'all', label: 'All Categories' },
  { value: 'financial', label: 'Financial' },
  { value: 'academic', label: 'Academic' },
  { value: 'housing', label: 'Housing' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'extracurricular', label: 'Extracurricular' },
];

const FormsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('my-forms');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedForm, setSelectedForm] = useState<any>(null);

  // API data
  const [availableApiforms, setAvailableApiForms] = useState<
    AdministrativeProceduresForm[]
  >([]);
  const [userSubmissions, setUserSubmissions] = useState<
    AdministrativeProceduresFormSubmission[]
  >([]);
  const [loading, setLoading] = useState({
    forms: true,
    submissions: true,
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch available forms
        const formsData = await getForms();
        setAvailableApiForms(formsData);
        setLoading((prev) => ({ ...prev, forms: false }));

        // Fetch user submissions
        const submissionsData = await getUserFormSubmissions();
        setUserSubmissions(submissionsData);
        setLoading((prev) => ({ ...prev, submissions: false }));
      } catch (err) {
        console.error('Error fetching forms data:', err);
        setError('Failed to load forms data. Please try again later.');
        setLoading({ forms: false, submissions: false });
      }
    };

    fetchData();
  }, []);

  // For backward compatibility, continue to use mock data for categories and fields
  // that are not available in the API response
  const enhancedSubmissions = userSubmissions.map((submission) => {
    const mockEntry = formSubmissions.find(
      (mock) => mock.name.toLowerCase() === submission.form?.name.toLowerCase()
    );

    return {
      id: submission.id,
      name: submission.form?.name || 'Unknown Form',
      submittedDate: formatDate(submission.createdAt),
      updatedDate: formatDate(submission.updatedAt),
      status: mapStatusToDisplay(submission.status),
      category: mockEntry?.category || 'Other',
      responseTime: mockEntry?.responseTime || '3-5 business days',
      comments: mockEntry?.comments || [],
      // Keep original data for reference
      originalSubmission: submission,
    };
  });

  const enhancedAvailableForms = availableApiforms.map((form) => {
    const mockEntry = availableForms.find(
      (mock) => mock.name.toLowerCase() === form.name.toLowerCase()
    );

    return {
      id: form.id,
      name: form.name,
      category: mockEntry?.category || 'Academic',
      description: form.description,
      processingTime: mockEntry?.processingTime || '3-5 business days',
      requiredDocuments: mockEntry?.requiredDocuments || [
        'Student ID verification',
      ],
      deadline: mockEntry?.deadline || 'None',
      // Keep original data for reference
      originalForm: form,
    };
  });

  const filteredFormSubmissions = enhancedSubmissions.filter((form) => {
    const matchesStatus =
      selectedStatus === 'all' ||
      form.status.toLowerCase().replace(' ', '-') === selectedStatus;

    const matchesCategory =
      selectedCategory === 'all' ||
      form.category.toLowerCase() === selectedCategory;

    const matchesSearch =
      !searchQuery ||
      form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesCategory && matchesSearch;
  });

  const filteredAvailableForms = enhancedAvailableForms.filter((form) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      form.category.toLowerCase() === selectedCategory;

    const matchesSearch =
      !searchQuery ||
      form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Helper function to map from FormSubmissionStatus enum to display strings
  function mapStatusToDisplay(status: FormSubmissionStatus): string {
    switch (status) {
      case FormSubmissionStatus.PENDING:
        return 'Under Review';
      case FormSubmissionStatus.APPROVED:
        return 'Approved';
      case FormSubmissionStatus.REJECTED:
        return 'Rejected';
      case FormSubmissionStatus.CANCELLED:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case 'Under Review':
        return <Clock className='h-4 w-4 text-blue-500' />;
      case 'Rejected':
        return <XCircle className='h-4 w-4 text-red-500' />;
      default:
        return <ArrowLeftRight className='h-4 w-4 text-gray-500' />;
    }
  };

  const handleFormClick = (form: any) => {
    setSelectedForm(form);
  };

  const handleCloseDetail = () => {
    setSelectedForm(null);
  };

  const handleApplyFilters = () => {
    // In a real application, this would trigger API calls with the selected filters
    console.log('Applying filters:', {
      selectedStatus,
      selectedCategory,
      searchQuery,
    });
  };

  const handleFormSubmit = (form: AdministrativeProceduresForm) => {
    // In a real implementation, we would redirect to a form completion page
    // For now, just simulate a redirect by logging and alerting
    console.log('Submitting form:', form);

    // In production, we would use router.push to navigate to the form completion page
    // router.push(`/dashboard/student/forms/${form.id}/submit`);

    // For this demo, just alert
    alert(
      `Form submission page for ${form.name} would open here. You would navigate to /dashboard/student/forms/${form.id}/submit`
    );
  };

  return (
    <StudentDashboardLayout>
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <h1 className='text-2xl font-semibold'>Administrative Forms</h1>

          {/* Search and Filter Controls */}
          <div className='flex space-x-2'>
            <div className='relative'>
              <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-gray-400' />
              <input
                type='text'
                placeholder='Search forms...'
                className='pl-9 py-2 pr-4 border rounded-md w-48 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={loading.forms || loading.submissions}
              />
            </div>

            <div className='relative inline-block'>
              <select
                className='appearance-none pl-3 pr-8 py-2 border rounded-md w-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categoryFilters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
              <Filter className='absolute right-2.5 top-2.5 h-4 w-4 text-gray-400 pointer-events-none' />
            </div>

            {activeTab === 'my-forms' && (
              <div className='relative inline-block'>
                <select
                  className='appearance-none pl-3 pr-8 py-2 border rounded-md w-36 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  {statusFilters.map((filter) => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label}
                    </option>
                  ))}
                </select>
                <Filter className='absolute right-2.5 top-2.5 h-4 w-4 text-gray-400 pointer-events-none' />
              </div>
            )}

            <Button size='sm' onClick={handleApplyFilters}>
              Apply
            </Button>
          </div>
        </div>

        {!selectedForm ? (
          <Tabs
            defaultValue='my-forms'
            value={activeTab}
            onValueChange={setActiveTab}
            className='space-y-4'
          >
            <TabsList className='grid w-[400px] grid-cols-2'>
              <TabsTrigger value='my-forms'>My Form Submissions</TabsTrigger>
              <TabsTrigger value='available-forms'>Available Forms</TabsTrigger>
            </TabsList>

            <TabsContent value='my-forms' className='space-y-4'>
              {loading.submissions ? (
                <div className='flex flex-col items-center justify-center py-12 text-center'>
                  <Loader2 className='h-12 w-12 text-primary mb-4 animate-spin' />
                  <h3 className='text-lg font-medium text-gray-700'>
                    Loading your submissions...
                  </h3>
                </div>
              ) : error ? (
                <div className='flex flex-col items-center justify-center py-12 text-center'>
                  <XCircle className='h-12 w-12 text-red-500 mb-4' />
                  <h3 className='text-lg font-medium text-gray-700'>
                    Error loading form submissions
                  </h3>
                  <p className='text-gray-500 mt-2 max-w-sm'>{error}</p>
                </div>
              ) : filteredFormSubmissions.length > 0 ? (
                <div className='grid gap-4'>
                  {filteredFormSubmissions.map((form) => (
                    <Card
                      key={form.id}
                      className='hover:bg-gray-50 transition-colors cursor-pointer'
                      onClick={() => handleFormClick(form)}
                    >
                      <CardHeader className='pb-2'>
                        <div className='flex justify-between items-center'>
                          <div>
                            <CardTitle>{form.name}</CardTitle>
                            <CardDescription>
                              ID: {form.id} • Submitted: {form.submittedDate}
                            </CardDescription>
                          </div>
                          <div className='flex items-center space-x-1'>
                            {getStatusIcon(form.status)}
                            <span
                              className={`text-sm font-medium ${
                                form.status === 'Approved'
                                  ? 'text-green-500'
                                  : form.status === 'Rejected'
                                    ? 'text-red-500'
                                    : 'text-blue-500'
                              }`}
                            >
                              {form.status}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className='pb-2'>
                        <p className='text-sm text-gray-500'>
                          Category: {form.category}
                        </p>
                        <p className='text-sm text-gray-500'>
                          Last updated: {form.updatedDate}
                        </p>
                      </CardContent>
                      <CardFooter className='pt-0'>
                        <div className='flex justify-end w-full'>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='text-primary'
                          >
                            View Details <ArrowRight className='ml-1 h-4 w-4' />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center py-12 text-center'>
                  <FileText className='h-12 w-12 text-gray-300 mb-4' />
                  <h3 className='text-lg font-medium text-gray-700'>
                    No form submissions found
                  </h3>
                  <p className='text-gray-500 mt-2 max-w-sm'>
                    {searchQuery ||
                    selectedStatus !== 'all' ||
                    selectedCategory !== 'all'
                      ? 'Try changing your filters or search query'
                      : "You haven't submitted any forms yet. Check the 'Available Forms' tab to get started."}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value='available-forms' className='space-y-4'>
              {loading.forms ? (
                <div className='flex flex-col items-center justify-center py-12 text-center'>
                  <Loader2 className='h-12 w-12 text-primary mb-4 animate-spin' />
                  <h3 className='text-lg font-medium text-gray-700'>
                    Loading available forms...
                  </h3>
                </div>
              ) : error ? (
                <div className='flex flex-col items-center justify-center py-12 text-center'>
                  <XCircle className='h-12 w-12 text-red-500 mb-4' />
                  <h3 className='text-lg font-medium text-gray-700'>
                    Error loading available forms
                  </h3>
                  <p className='text-gray-500 mt-2 max-w-sm'>{error}</p>
                </div>
              ) : filteredAvailableForms.length > 0 ? (
                <div className='grid gap-4 md:grid-cols-2'>
                  {filteredAvailableForms.map((form) => (
                    <Card key={form.id}>
                      <CardHeader>
                        <CardTitle>{form.name}</CardTitle>
                        <CardDescription>{form.category}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className='text-sm mb-4'>{form.description}</p>
                        <div className='space-y-2 text-sm text-gray-500'>
                          <p>
                            <span className='font-medium'>
                              Required Documents:
                            </span>{' '}
                            {form.requiredDocuments.join(', ')}
                          </p>
                          <p>
                            <span className='font-medium'>
                              Processing Time:
                            </span>{' '}
                            {form.processingTime}
                          </p>
                          {form.deadline && (
                            <p>
                              <span className='font-medium'>Deadline:</span>{' '}
                              {form.deadline}
                            </p>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className='flex justify-end'>
                        <Button
                          onClick={() => handleFormSubmit(form.originalForm)}
                        >
                          Submit Form
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center py-12 text-center'>
                  <FileText className='h-12 w-12 text-gray-300 mb-4' />
                  <h3 className='text-lg font-medium text-gray-700'>
                    No available forms found
                  </h3>
                  <p className='text-gray-500 mt-2'>
                    Try clearing your search or filters
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className='space-y-4'>
            <Button variant='outline' onClick={handleCloseDetail}>
              <ArrowLeftRight className='mr-2 h-4 w-4' /> Back to Forms List
            </Button>

            <Card>
              <CardHeader>
                <div className='flex justify-between items-start'>
                  <div>
                    <CardTitle>{selectedForm.name}</CardTitle>
                    <CardDescription>
                      ID: {selectedForm.id} • Submitted:{' '}
                      {selectedForm.submittedDate}
                    </CardDescription>
                  </div>
                  <div className='flex items-center space-x-1 px-3 py-1 rounded-full border'>
                    {getStatusIcon(selectedForm.status)}
                    <span
                      className={`text-sm font-medium ${
                        selectedForm.status === 'Approved'
                          ? 'text-green-500'
                          : selectedForm.status === 'Rejected'
                            ? 'text-red-500'
                            : 'text-blue-500'
                      }`}
                    >
                      {selectedForm.status}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className='space-y-6'>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div>
                    <h3 className='text-sm font-medium text-gray-500'>
                      Form Details
                    </h3>
                    <div className='mt-2 space-y-2'>
                      <div className='flex justify-between py-2 border-b'>
                        <span className='text-gray-600'>Category</span>
                        <span className='font-medium'>
                          {selectedForm.category}
                        </span>
                      </div>
                      <div className='flex justify-between py-2 border-b'>
                        <span className='text-gray-600'>Submission Date</span>
                        <span className='font-medium'>
                          {selectedForm.originalSubmission
                            ? formatDate(
                                selectedForm.originalSubmission.createdAt
                              )
                            : selectedForm.submittedDate}
                        </span>
                      </div>
                      <div className='flex justify-between py-2 border-b'>
                        <span className='text-gray-600'>Last Updated</span>
                        <span className='font-medium'>
                          {selectedForm.originalSubmission
                            ? formatDate(
                                selectedForm.originalSubmission.updatedAt
                              )
                            : selectedForm.updatedDate}
                        </span>
                      </div>
                      <div className='flex justify-between py-2 border-b'>
                        <span className='text-gray-600'>Status</span>
                        <span
                          className={`font-medium ${
                            selectedForm.status === 'Approved'
                              ? 'text-green-500'
                              : selectedForm.status === 'Rejected'
                                ? 'text-red-500'
                                : 'text-blue-500'
                          }`}
                        >
                          {selectedForm.status}
                        </span>
                      </div>
                      <div className='flex justify-between py-2'>
                        <span className='text-gray-600'>Response Time</span>
                        <span className='font-medium'>
                          {selectedForm.responseTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className='text-sm font-medium text-gray-500'>
                      Timeline & Comments
                    </h3>
                    <div className='mt-2 border rounded-md'>
                      <div className='p-3 bg-gray-50 border-b'>
                        <p className='text-sm font-medium'>Form Submitted</p>
                        <p className='text-xs text-gray-500'>
                          {selectedForm.submittedDate}
                        </p>
                      </div>
                      {selectedForm.comments.map(
                        (comment: any, index: number) => (
                          <div
                            key={index}
                            className='p-3 border-b last:border-0'
                          >
                            <div className='flex justify-between mb-1'>
                              <p className='text-sm font-medium'>
                                {comment.from}
                              </p>
                              <p className='text-xs text-gray-500'>
                                {comment.date}
                              </p>
                            </div>
                            <p className='text-sm'>{comment.message}</p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {selectedForm.status === 'Under Review' && (
                  <div className='bg-blue-50 p-4 rounded-md'>
                    <h3 className='text-sm font-medium text-blue-800 mb-2'>
                      Awaiting Review
                    </h3>
                    <p className='text-sm text-blue-700'>
                      Your form is currently under review. You will be notified
                      once there's an update. Typical response time is{' '}
                      {selectedForm.responseTime}.
                    </p>
                  </div>
                )}

                {selectedForm.status === 'Approved' && (
                  <div className='bg-green-50 p-4 rounded-md'>
                    <h3 className='text-sm font-medium text-green-800 mb-2'>
                      Form Approved
                    </h3>
                    <p className='text-sm text-green-700'>
                      Your form has been approved. Please check the comments
                      section for any additional information or next steps.
                    </p>
                  </div>
                )}

                {selectedForm.status === 'Rejected' && (
                  <div className='bg-red-50 p-4 rounded-md'>
                    <h3 className='text-sm font-medium text-red-800 mb-2'>
                      Form Rejected
                    </h3>
                    <p className='text-sm text-red-700'>
                      Unfortunately, your form has been rejected. Please check
                      the comments section for the reason and any advice on
                      resubmission.
                    </p>
                  </div>
                )}
              </CardContent>

              <CardFooter className='flex justify-end space-x-2'>
                <Button variant='outline'>Download Form</Button>
                {selectedForm.status === 'Rejected' && (
                  <Button>Resubmit Form</Button>
                )}
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </StudentDashboardLayout>
  );
};

export default FormsPage;
