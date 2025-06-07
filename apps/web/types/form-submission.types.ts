// Types for administrative procedures form submissions

import { AdministrativeProceduresForm } from './administrative-form.types';
import { FormSubmissionStatus } from './enums';

export type FormSubmissionResult = Record<string, Record<string, any>>;

export type AdministrativeProceduresFormSubmission = {
  id: string;
  formId: string;
  studentId: string;
  status: FormSubmissionStatus;
  result: FormSubmissionResult;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  handleAt: string | null; // ISO date string
  remarks: string | null;
  handleByOperatorId: string | null;
  form?: AdministrativeProceduresForm;
  student?: {
    id: string;
    studentId: string;
    firstName: string;
    lastName: string;
    name?: string; // Derived field, computed from firstName + lastName
    email: string;
    avatarUrl?: string;
  };
};

export type SubmitFormValues = {
  result: FormSubmissionResult;
};
