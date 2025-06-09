import { useState, useCallback, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { getProvider, getProgram } from '@/lib/blockchain/anchor-setup';
import { Idl } from '@coral-xyz/anchor';
import {
  getAdminConfigPDA,
  getFormApprovalPDA,
  createFormHash,
  validateFormId,
  validateMetadata,
  handleBlockchainError,
} from '@/lib/blockchain/contract-utils';
import { toast } from 'sonner';
import { Program } from '@coral-xyz/anchor';
import { IDL } from '@/lib/blockchain/anchor-setup';
import { WalletName } from '@solana/wallet-adapter-base';

type ProgramType = Program<Idl>;

interface FormApprovalHookResult {
  loading: boolean;
  error: string | null;
  signFormSubmission: (
    formId: string,
    formData: any,
    metadata?: string
  ) => Promise<{ tx: string; formApprovalPda: PublicKey }>;
  updateFormApproval: (formId: string, metadata: string) => Promise<string>;
  verifyFormApproval: (formId: string, formData: any) => Promise<boolean>;
  getFormApprovalDetails: (formId: string) => Promise<FormApproval | null>;
  isWalletConnected: boolean;
  connectWallet: () => void;
}

export interface FormApproval {
  formId: string;
  formHash: number[];
  signer: PublicKey;
  approvedAt: number;
  metadata: string;
  bump: number;
}

export function useSignDocumentContract(): FormApprovalHookResult {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { connected, publicKey, select } = wallet;

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const program = useMemo(() => {
    if (!connected || !publicKey) return null;
    const provider = getProvider(wallet, connection);
    const program = getProgram(provider);
    return program as any;
  }, [connected, publicKey, connection, wallet]);

  // Helper function for PDAs
  const getPDAs = useCallback((formId: string) => {
    const [adminConfigPda] = getAdminConfigPDA();
    const [formApprovalPda] = getFormApprovalPDA(formId);
    return { adminConfigPda, formApprovalPda };
  }, []);

  // Sign form submission
  const signFormSubmission = useCallback(
    async (formId: string, formData: any, metadata?: string) => {
      if (!program || !publicKey) {
        throw new Error('Wallet not connected');
      }

      // Validation
      if (!validateFormId(formId)) {
        throw new Error('Form ID is too long');
      }
      if (metadata && !validateMetadata(metadata)) {
        throw new Error('Metadata is too long');
      }

      setLoading(true);
      setError(null);

      try {
        const { adminConfigPda, formApprovalPda } = getPDAs(formId);
        const formHash = createFormHash(formData);

        const tx = await program.methods
          .signFormSubmission(formId, Array.from(formHash), metadata || null)
          .accounts({
            formApproval: formApprovalPda,
            adminConfig: adminConfigPda,
            admin: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        return { tx, formApprovalPda };
      } catch (err) {
        const errorMsg = handleBlockchainError(err);
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [program, publicKey, getPDAs]
  );

  // Update form approval metadata
  const updateFormApproval = useCallback(
    async (formId: string, newMetadata: string) => {
      if (!program || !publicKey) {
        throw new Error('Wallet not connected');
      }

      if (!validateMetadata(newMetadata)) {
        throw new Error('Metadata is too long');
      }

      setLoading(true);
      setError(null);

      try {
        const { adminConfigPda, formApprovalPda } = getPDAs(formId);

        const tx = await program.methods
          .updateFormApproval(formId, newMetadata)
          .accounts({
            formApproval: formApprovalPda,
            adminConfig: adminConfigPda,
            admin: publicKey,
          })
          .rpc();

        return tx;
      } catch (err) {
        const errorMsg = handleBlockchainError(err);
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [program, publicKey, getPDAs]
  );

  // Verify form approval
  const verifyFormApproval = useCallback(
    async (formId: string, formData: any): Promise<boolean> => {
      if (!program) {
        throw new Error('Program not initialized');
      }

      setLoading(true);
      setError(null);

      try {
        const { formApprovalPda } = getPDAs(formId);
        const formHash = createFormHash(formData);

        const result = await program.methods
          .verifyFormApproval(formId, Array.from(formHash))
          .accounts({
            formApproval: formApprovalPda,
          })
          .view();

        return result;
      } catch (err) {
        setError('Failed to verify form approval');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [program, getPDAs]
  );

  // Get form approval details
  const getFormApprovalDetails = useCallback(
    async (formId: string): Promise<FormApproval | null> => {
      if (!program) {
        throw new Error('Program not initialized');
      }

      setLoading(true);
      setError(null);

      try {
        const { formApprovalPda } = getPDAs(formId);

        const formApproval =
          await program.account.formApproval.fetch(formApprovalPda);
        return formApproval as FormApproval;
      } catch (err) {
        setError('Failed to get form approval details');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [program, getPDAs]
  );

  // Helper function to connect wallet
  const connectWallet = useCallback(() => {
    if (select) select('Phantom' as WalletName);
    else toast.error('Wallet adapter not initialized');
  }, [select]);

  return {
    loading,
    error,
    signFormSubmission,
    updateFormApproval,
    verifyFormApproval,
    getFormApprovalDetails,
    isWalletConnected: !!connected,
    connectWallet,
  };
}
