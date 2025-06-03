import { nexusAxios } from '@/configs/axios.config';
import {
  AdministrativeProceduresForm,
  CreateFormValues,
} from '../types/administrative-form.types';

// API endpoints
const API_ENDPOINT = '/official-forms';

/**
 * Create a new administrative procedures form
 * @param formData Form data to create
 * @returns Created form
 */
export const createForm = async (
  formData: CreateFormValues
): Promise<AdministrativeProceduresForm> => {
  const response = await nexusAxios.post(`${API_ENDPOINT}/create`, formData);
  return response.data;
};

/**
 * Get published forms that are currently active (for students)
 * @returns List of published forms
 */
export const getPublishedForms = async (): Promise<
  AdministrativeProceduresForm[]
> => {
  const response = await nexusAxios.get(`${API_ENDPOINT}/published`);
  return response.data;
};

/**
 * Get all forms (admin only)
 */
export const getForms = async (): Promise<AdministrativeProceduresForm[]> => {
  const response = await nexusAxios.get(API_ENDPOINT);
  return response.data;
};

/**
 * Get form by ID
 * @param id Form ID
 * @returns Form with the given ID
 */
export const getFormById = async (
  id: string
): Promise<AdministrativeProceduresForm> => {
  const response = await nexusAxios.get(`${API_ENDPOINT}/${id}`);
  return response.data;
};

/**
 * Update an existing form (admin only)
 * @param id Form ID
 * @param formData Updated form data
 * @returns Updated form
 */
export const updateForm = async (
  id: string,
  formData: Partial<CreateFormValues>
): Promise<AdministrativeProceduresForm> => {
  const response = await nexusAxios.patch(`${API_ENDPOINT}/${id}`, formData);
  return response.data;
};

/**
 * Delete a form (super admin only)
 * @param id Form ID to delete
 */
export const deleteForm = async (id: string): Promise<void> => {
  await nexusAxios.delete(`${API_ENDPOINT}/${id}`);
};

/**
 * Activate a form (admin only)
 * @param id Form ID
 * @returns Updated form
 */
export const activateForm = async (
  id: string
): Promise<AdministrativeProceduresForm> => {
  const response = await nexusAxios.patch(`${API_ENDPOINT}/${id}/activate`);
  return response.data;
};

/**
 * Deactivate a form (admin only)
 * @param id Form ID
 * @returns Updated form
 */
export const deactivateForm = async (
  id: string
): Promise<AdministrativeProceduresForm> => {
  const response = await nexusAxios.patch(`${API_ENDPOINT}/${id}/deactivate`);
  return response.data;
};
