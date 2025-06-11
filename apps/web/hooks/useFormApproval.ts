import { useState, useCallback } from 'react';
import { useSignDocumentContract } from './useSignDocumentContract';
import {
  approveFormSubmission as approveFormSubmissionApi,
  rejectFormSubmission as rejectFormSubmissionApi,
} from '@/api/form-submission.api';
import { recordBlockchainApproval } from '@/api/blockchain-approval.api';
import { toast } from 'sonner';
import { PublicKey } from '@solana/web3.js';

interface UseFormApprovalHookResult {
  isLoading: boolean;
  blockchainLoading: boolean;
  error: string | null;
  approveFormSubmission: (
    id: string,
    data: any,
    options: FormApprovalOptions
  ) => Promise<any>;
  rejectFormSubmission: (id: string, remarks: string) => Promise<any>;
  isWalletConnected: boolean;
  connectWallet: () => void;
}

interface FormApprovalOptions {
  useBlockchain: boolean;
  remarks?: string;
  metadata?: string;
}

export function useFormApproval(): UseFormApprovalHookResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    signFormSubmission,
    loading: blockchainLoading,
    error: blockchainError,
    isWalletConnected,
    connectWallet,
  } = useSignDocumentContract();

  const approveFormSubmission = useCallback(
    async (id: string, formData: any, options: FormApprovalOptions) => {
      setIsLoading(true);
      setError(null);

      try {
        // First handle blockchain signing if enabled
        let txInfo = null;

        if (options.useBlockchain) {
          if (!isWalletConnected) {
            toast.error(
              'Wallet is not connected. Please connect your wallet to sign on blockchain.'
            );
            throw new Error('Wallet not connected');
          }

          // Submit the form data to blockchain FIRST
          try {
            const { tx, formApprovalPda } = await signFormSubmission(
              id, // Using submission ID as formId for uniqueness
              formData,
              options.metadata ||
                `Form submission ${id} approved at ${new Date().toISOString()}`
            );

            // Store transaction info for later database recording
            txInfo = {
              tx,
              formApprovalPda,
              timestamp: Date.now(),
            };
          } catch (blockchainErr: any) {
            console.error('Blockchain signing error:', blockchainErr);
            // Do not proceed with database approval if blockchain signing fails
            toast.error(`Blockchain signing failed: ${blockchainErr.message}`);
            throw new Error(
              `Blockchain signing failed: ${blockchainErr.message}`
            );
          }
        }

        // Only after successful blockchain signing (if required), approve the form in database
        const approvedSubmission = await approveFormSubmissionApi(
          id,
          options.remarks
        );

        // If blockchain was used, record the transaction in our database
        if (options.useBlockchain && txInfo) {
          if (!approvedSubmission.handleByOperatorId) {
            throw new Error('Missing operator ID for blockchain approval');
          }

          await recordBlockchainApproval(id, txInfo.tx, {
            formId: id,
            signer: new PublicKey(approvedSubmission.handleByOperatorId),
            approvedAt: txInfo.timestamp,
            metadata: options.metadata || '',
          });

          toast.success('Form approved and signed on blockchain successfully!');
        } else {
          toast.success('Form approved successfully.');
        }

        return approvedSubmission;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to approve form submission';
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isWalletConnected, signFormSubmission, recordBlockchainApproval]
  );

  const rejectFormSubmission = useCallback(
    async (id: string, remarks: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const rejectedSubmission = await rejectFormSubmissionApi(id, remarks);
        toast.success('Form submission rejected successfully.');
        return rejectedSubmission;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to reject form submission';
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    isLoading,
    blockchainLoading,
    error: error || blockchainError,
    approveFormSubmission,
    rejectFormSubmission,
    isWalletConnected,
    connectWallet,
  };
}
