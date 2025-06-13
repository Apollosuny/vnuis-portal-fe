'use client';

import { useEffect, useState } from 'react';
import { AdministrativeProceduresForm } from '@/types/administrative-form.types';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import {
  ArrowLeft,
  Pencil,
  FileText,
  Download,
  Trash2,
  Eye,
  RefreshCw,
  X,
} from 'lucide-react';
import { ROUTES } from '@/constants/router';
import { getFormById, updateForm, updateFormPdf } from '@/api/form.api';
import { useFormPdfUpload } from '@/hooks/useFormPdfUpload';
import { toast } from 'sonner';
import { FileUpload } from '@/components/ui/file-upload';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@workspace/ui/components/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Separator } from '@workspace/ui/components/separator';

export const FormDetailClient = () => {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState<AdministrativeProceduresForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPdfUpload, setShowPdfUpload] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPdfUpdating, setIsPdfUpdating] = useState(false);
  const {
    isUploading,
    uploadProgress,
    pdfUrl,
    pdfFile,
    pdfPath,
    pdfFileName,
    uploadPdf,
    resetPdfUpload,
    loadExistingPdf,
  } = useFormPdfUpload(params.id as string);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const formData = await getFormById(params.id as string);
        setForm(formData);

        // Load existing PDF data into the hook if available
        if (formData.pdfUrl) {
          await loadExistingPdf(params.id as string);
        }
      } catch (error) {
        console.error('Error fetching form:', error);
        toast.error('Failed to load form details');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchForm();
    }
  }, [params.id, loadExistingPdf]);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  // Function to handle PDF upload
  const handlePdfUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a PDF file first');
      return;
    }

    try {
      setIsPdfUpdating(true);
      const uploadResult = await uploadPdf(selectedFile, params.id as string);

      if (uploadResult) {
        // Update the form in the database with the PDF details
        await updateFormPdf(params.id as string, {
          pdfUrl: uploadResult.expectedUrl,
          pdfPath: uploadResult.filePath,
          pdfFileName: selectedFile.name,
        });

        // Update the form in our state with the new PDF info
        setForm((prevForm) => {
          if (!prevForm) return null;
          return {
            ...prevForm,
            pdfUrl: uploadResult.expectedUrl || null,
            pdfPath: uploadResult.filePath || null,
            pdfFileName: selectedFile.name || null,
          };
        });

        // Refresh the form data to ensure we have the latest state
        const refreshedForm = await getFormById(params.id as string);
        setForm(refreshedForm);

        toast.success('PDF attached successfully');
        setShowPdfUpload(false);
      }
    } catch (error) {
      console.error('Error updating form with PDF:', error);
      toast.error('Failed to attach PDF to form');
    } finally {
      setIsPdfUpdating(false);
    }
  };

  // Function to remove the PDF attachment
  const handleRemovePdf = async () => {
    try {
      setIsPdfUpdating(true);

      // Update the form in the database to remove the PDF
      await updateFormPdf(params.id as string, {
        pdfUrl: null,
        pdfPath: null,
        pdfFileName: null,
      });

      // Update our local state
      setForm((prevForm) => {
        if (!prevForm) return null;
        return {
          ...prevForm,
          pdfUrl: null,
          pdfPath: null,
          pdfFileName: null,
        };
      });

      // Reset the PDF upload state
      resetPdfUpload();
      setSelectedFile(null);

      // Refresh the form data to ensure we have the latest state
      const refreshedForm = await getFormById(params.id as string);
      setForm(refreshedForm);

      toast.success('PDF attachment removed');
    } catch (error) {
      console.error('Error removing PDF attachment:', error);
      toast.error('Failed to remove PDF attachment');
    } finally {
      setIsPdfUpdating(false);
    }
  };

  // Function to handle the file selection
  const handleFileSelection = (file: File | null) => {
    setSelectedFile(file);
  };

  if (!form) {
    return (
      <div className='text-center py-8'>
        <p className='text-muted-foreground'>Form not found</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <Button
          variant='ghost'
          onClick={() => router.push(ROUTES.FORMS)}
          className='flex items-center gap-2'
        >
          <ArrowLeft className='h-4 w-4' />
          Back to Forms
        </Button>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            onClick={() => setShowPdfUpload(!showPdfUpload)}
            className='flex items-center gap-2'
          >
            <FileText className='h-4 w-4' />
            {showPdfUpload ? 'Hide PDF Upload' : 'Manage PDF Attachment'}
          </Button>
          <Button
            onClick={() => router.push(`/dashboard/forms/${params.id}/edit`)}
            className='flex items-center gap-2'
          >
            <Pencil className='h-4 w-4' />
            Edit Form
          </Button>
        </div>
      </div>

      <div className='bg-background rounded-xl shadow-lg p-8 border border-border'>
        <div className='space-y-6'>
          <div>
            <h1 className='text-2xl font-bold text-foreground'>{form.name}</h1>
            <p className='text-muted-foreground mt-2'>{form.description}</p>
          </div>

          <div className='grid grid-cols-2 gap-6'>
            <div>
              <h3 className='text-sm font-medium text-muted-foreground'>
                Form Type
              </h3>
              <p className='mt-1 text-foreground'>{form.type}</p>
            </div>
            <div>
              <h3 className='text-sm font-medium text-muted-foreground'>
                Slug
              </h3>
              <p className='mt-1 text-foreground'>{form.slug}</p>
            </div>
            <div>
              <h3 className='text-sm font-medium text-muted-foreground'>
                Status
              </h3>
              <p className='mt-1'>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    form.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {form.isActive ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>
            <div>
              <h3 className='text-sm font-medium text-muted-foreground'>
                Settings
              </h3>
              <div className='mt-1 space-y-1'>
                <p className='text-sm text-foreground'>
                  {form.allowEditAfterSubmit ? '✓' : '✗'} Allow Edit After
                  Submit
                </p>
                <p className='text-sm text-foreground'>
                  {form.requireApproval ? '✓' : '✗'} Require Approval
                </p>
              </div>
            </div>
          </div>

          {/* PDF Attachment Section */}
          <div className='mt-8'>
            <h2 className='text-lg font-semibold text-foreground mb-4'>
              PDF Attachment
            </h2>
            {form.pdfUrl ? (
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-base'>Attached Document</CardTitle>
                  <CardDescription>
                    PDF document attached to this form for students to view and
                    download
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='flex items-center gap-4'>
                    <FileText className='h-8 w-8 text-primary' />
                    <div className='overflow-hidden'>
                      <p className='font-medium truncate'>
                        {form.pdfFileName || 'Form Document'}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        PDF Document
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className='flex justify-end gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setShowPdfViewer(true)}
                    className='gap-2'
                  >
                    <Eye className='h-4 w-4' />
                    View
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => window.open(form.pdfUrl as string, '_blank')}
                    className='gap-2'
                  >
                    <Download className='h-4 w-4' />
                    Download
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleRemovePdf}
                    className='gap-2 text-destructive hover:bg-destructive/10'
                    disabled={isPdfUpdating}
                  >
                    {isPdfUpdating ? (
                      <RefreshCw className='h-4 w-4 animate-spin' />
                    ) : (
                      <Trash2 className='h-4 w-4' />
                    )}
                    Remove
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-base'>No PDF Attached</CardTitle>
                  <CardDescription>
                    Attach a PDF document to provide additional information to
                    students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='flex items-center justify-center py-6 border border-dashed rounded-md'>
                    <Button
                      variant='outline'
                      onClick={() => setShowPdfUpload(true)}
                      className='gap-2'
                    >
                      <FileText className='h-4 w-4' />
                      Attach PDF Document
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Separator className='my-8' />

          <div className='mt-8'>
            <h2 className='text-lg font-semibold text-foreground mb-4'>
              Questions
            </h2>
            <div className='space-y-6'>
              {form.data.questions.map((question, index) => (
                <div
                  key={question.id}
                  className='bg-background border border-border rounded-lg p-6'
                >
                  <div className='space-y-4'>
                    <div>
                      <span className='text-sm text-muted-foreground'>
                        Question {index + 1}
                      </span>
                      <h3 className='text-foreground font-medium mt-1'>
                        {question.title}
                      </h3>
                    </div>
                    <div>
                      <span className='text-sm text-muted-foreground'>
                        Type
                      </span>
                      <p className='text-foreground mt-1 capitalize'>
                        {question.type}
                      </p>
                    </div>
                    {['multiple-choice', 'checkbox', 'select'].includes(
                      question.type
                    ) && (
                      <div>
                        <span className='text-sm text-muted-foreground'>
                          Options
                        </span>
                        <ul className='mt-2 space-y-2'>
                          {question.answers.map((answer, answerIndex) => (
                            <li key={answer.id} className='text-foreground'>
                              {answerIndex + 1}. {answer.content}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PDF Upload Dialog */}
      <Dialog open={showPdfUpload} onOpenChange={setShowPdfUpload}>
        <DialogContent className='sm:max-w-[700px]'>
          <DialogHeader>
            <DialogTitle>Manage PDF Attachment</DialogTitle>
            <DialogDescription>
              Upload a PDF document to attach to this form. Students will be
              able to download this PDF.
            </DialogDescription>
          </DialogHeader>

          <div className='py-4'>
            <FileUpload
              accept='application/pdf'
              maxSize={10485760} // 10MB
              onChange={handleFileSelection}
              value={form.pdfUrl || ''}
              label='Upload PDF'
              description='Drag and drop a PDF file here or click to browse'
              showPreview={true}
            />
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setShowPdfUpload(false)}>
              Cancel
            </Button>
            <Button
              variant='default'
              onClick={handlePdfUpload}
              disabled={isUploading || !selectedFile || isPdfUpdating}
              className='gap-2'
            >
              {isUploading && <RefreshCw className='h-4 w-4 animate-spin' />}
              Attach PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PDF Viewer Dialog */}
      <Dialog open={showPdfViewer} onOpenChange={setShowPdfViewer}>
        <DialogContent className='sm:max-w-[800px] sm:h-[80vh] p-0 flex flex-col'>
          <div className='p-4 flex items-center justify-between border-b'>
            <DialogTitle>{form.pdfFileName || 'Form PDF'}</DialogTitle>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setShowPdfViewer(false)}
            >
              <X className='h-4 w-4' />
            </Button>
          </div>

          <div className='flex-grow relative overflow-auto'>
            {form.pdfUrl ? (
              <iframe
                src={`${form.pdfUrl}#toolbar=1`}
                className='w-full h-full'
                title='PDF Viewer'
              />
            ) : (
              <div className='flex items-center justify-center h-full'>
                <p className='text-muted-foreground'>No PDF available</p>
              </div>
            )}
          </div>

          <div className='p-4 border-t flex justify-end gap-2'>
            {form.pdfUrl && (
              <Button
                variant='outline'
                onClick={() => window.open(form.pdfUrl as string, '_blank')}
                className='gap-2'
              >
                <Download className='h-4 w-4' />
                Download PDF
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
