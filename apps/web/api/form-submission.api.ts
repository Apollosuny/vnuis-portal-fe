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

/**
 * Get form submission by ID
 * @param id Submission ID
 * @returns Form submission with the given ID
 */
export const getSubmissionById = async (
  id: string
): Promise<AdministrativeProceduresFormSubmission> => {
  const response = await nexusAxios.get(`${API_ENDPOINT}/${id}`);
  return response.data;
};

/**
 * Approve a form submission
 * @param id Submission ID
 * @param remarks Optional remarks for the approval
 * @returns The updated form submission
 */
export const approveFormSubmission = async (
  id: string,
  remarks?: string
): Promise<AdministrativeProceduresFormSubmission> => {
  const response = await nexusAxios.post(`${API_ENDPOINT}/${id}/approve`, {
    remarks,
  });
  return response.data;
};

/**
 * Reject a form submission
 * @param id Submission ID
 * @param remarks Rejection reason (required)
 * @returns The updated form submission
 */
export const rejectFormSubmission = async (
  id: string,
  remarks: string
): Promise<AdministrativeProceduresFormSubmission> => {
  const response = await nexusAxios.post(`${API_ENDPOINT}/${id}/reject`, {
    remarks,
  });
  return response.data;
};
