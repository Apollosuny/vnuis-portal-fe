// This file contains API endpoints for form submissions
import { nexusAxios } from '@/configs/axios.config';
import {
  AdministrativeProceduresFormSubmission,
  SubmitFormValues,
  FormSubmissionResult,
} from '../types/form-submission.types';

// API endpoint
const API_ENDPOINT = '/official-forms-submissions';

/**
 * Submit a form
 * @param formId Form ID
 * @param submitData Form submission data
 * @returns The created form submission
 */
export const submitForm = async (
  formId: string,
  submitData: SubmitFormValues
): Promise<AdministrativeProceduresFormSubmission> => {
  const response = await nexusAxios.post(
    `${API_ENDPOINT}/${formId}/submit`,
    submitData
  );
  return response.data;
};

/**
 * Get all submissions for the current user
 * @returns List of form submissions for the current user
 */
export const getUserFormSubmissions = async (): Promise<
  AdministrativeProceduresFormSubmission[]
> => {
  const response = await nexusAxios.get(`${API_ENDPOINT}/user`);
  return response.data;
};

/**
 * Get all submissions for a specific form (admin only)
 * @param formId Form ID
 * @returns List of form submissions for the given form
 */
export const getFormSubmissions = async (
  formId: string
): Promise<AdministrativeProceduresFormSubmission[]> => {
  const response = await nexusAxios.get(`${API_ENDPOINT}/form/${formId}`);
  return response.data;
};
