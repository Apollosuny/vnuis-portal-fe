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
 * Get all forms with optional filtering
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
