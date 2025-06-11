import { nexusAxios } from '@/configs/axios.config';
import { FormApproval } from '@/hooks/useSignDocumentContract';

// API endpoint - Updated to use consolidated endpoints
const API_ENDPOINT = '/blockchain/signatures/form';

/**
 * Record a blockchain transaction for a form submission
 * @param submissionId Form submission ID
 * @param transactionId Blockchain transaction ID
 * @param formApprovalData Form approval data from blockchain
 * @returns The updated blockchain record
 */
export const recordBlockchainApproval = async (
  submissionId: string,
  transactionId: string,
  formApprovalData?: Partial<FormApproval>
) => {
  const response = await nexusAxios.post(`${API_ENDPOINT}-approvals`, {
    submissionId,
    transactionId,
    formApprovalData: formApprovalData || null,
    approvedAt: new Date().toISOString(),
  });
  return response.data;
};

/**
 * Get blockchain signature record for a form submission
 * @param submissionId Form submission ID
 * @returns The blockchain approval record if found
 */
export const getBlockchainApprovalBySubmissionId = async (
  submissionId: string
) => {
  try {
    const response = await nexusAxios.get(`${API_ENDPOINT}/${submissionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching blockchain approval record:', error);
    return null;
  }
};

/**
 * Verify blockchain signature for a form submission
 * @param submissionId Form submission ID
 * @param formData Form data to verify
 * @returns True if the verification is successful
 */
export const verifyBlockchainApproval = async (
  submissionId: string,
  formData: any
) => {
  try {
    const response = await nexusAxios.post(
      `${API_ENDPOINT}/${submissionId}/verify`,
      {
        formData,
      }
    );
    return response.data.isValid;
  } catch (error) {
    console.error('Error verifying blockchain signature:', error);
    return false;
  }
};
