# Solana Smart Contract Integration Guide for Next.js

Complete guide for integrating Solana smart contract into Next.js applications for blockchain document signing and approval.

## Table of Contents

1. [Installing Dependencies](#installing-dependencies)
2. [Wallet Provider Configuration](#wallet-provider-configuration)
3. [Contract Configuration](#contract-configuration)
4. [Custom Hooks](#custom-hooks)
5. [React Components](#react-components)
6. [Utils Functions](#utils-functions)
7. [Error Handling](#error-handling)
8. [Production Considerations](#production-considerations)

## Installing Dependencies

```bash
npm install @coral-xyz/anchor @solana/web3.js @solana/wallet-adapter-base @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets
```

## Wallet Provider Configuration

### 1. Create Wallet Context Provider

```typescript
// components/providers/WalletProvider.tsx
'use client';

import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';

// Import CSS cho wallet modal
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletContextProviderProps {
  children: React.ReactNode;
}

export function WalletContextProvider({
  children,
}: WalletContextProviderProps) {
  // Configure network (devnet or mainnet-beta)
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
  const endpoint = useMemo(() => {
    if (network === 'mainnet-beta') {
      return (
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('mainnet-beta')
      );
    }
    return clusterApiUrl('devnet');
  }, [network]);

  // Configure wallets
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
```

### 2. Configure in app layout

```typescript
// app/layout.tsx
import { WalletContextProvider } from '@/components/providers/WalletProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body>
        <WalletContextProvider>{children}</WalletContextProvider>
      </body>
    </html>
  );
}
```

## Contract Configuration

### 1. Contract Configuration File

```typescript
// lib/contract/config.ts
import { PublicKey } from '@solana/web3.js';

export const CONTRACT_CONFIG = {
  PROGRAM_ID: new PublicKey('7xMFfY7wEggjbVTQvtLYXcnAsNBFxiBDSx6ohtuxSYXt'),
  NETWORK: process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet',
  MAX_FORM_ID_LENGTH: 64,
  MAX_METADATA_LENGTH: 256,
} as const;

export const SEEDS = {
  ADMIN_CONFIG: 'admin_config',
  FORM_APPROVAL: 'form_approval',
} as const;

// Contract IDL type definitions
export interface FormApproval {
  formId: string;
  formHash: number[];
  signer: PublicKey;
  approvedAt: number;
  metadata: string;
  bump: number;
}

export interface AdminConfig {
  authority: PublicKey;
  admins: PublicKey[];
  adminCount: number;
  bump: number;
}
```

### 2. Contract Instance

```typescript
// lib/contract/instance.ts
import * as anchor from '@coral-xyz/anchor';
import { PublicKey, Connection } from '@solana/web3.js';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { CONTRACT_CONFIG } from './config';

// Import IDL (from target/idl/sign_document_contract.json)
import idl from './idl/sign_document_contract.json';

export function getProgram(connection: Connection, wallet?: AnchorWallet) {
  if (!wallet) {
    // Read-only program instance
    const provider = new anchor.AnchorProvider(connection, {} as AnchorWallet, {
      commitment: 'confirmed',
    });
    return new anchor.Program(
      idl as anchor.Idl,
      CONTRACT_CONFIG.PROGRAM_ID,
      provider
    );
  }

  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });

  return new anchor.Program(
    idl as anchor.Idl,
    CONTRACT_CONFIG.PROGRAM_ID,
    provider
  );
}

export function getPDAs(formId?: string) {
  const [adminConfigPda, adminConfigBump] = PublicKey.findProgramAddressSync(
    [Buffer.from('admin_config')],
    CONTRACT_CONFIG.PROGRAM_ID
  );

  let formApprovalPda: PublicKey | null = null;
  let formApprovalBump: number | null = null;

  if (formId) {
    [formApprovalPda, formApprovalBump] = PublicKey.findProgramAddressSync(
      [Buffer.from('form_approval'), Buffer.from(formId)],
      CONTRACT_CONFIG.PROGRAM_ID
    );
  }

  return {
    adminConfigPda,
    adminConfigBump,
    formApprovalPda,
    formApprovalBump,
  };
}
```

## Custom Hooks

### 1. useContract Hook

```typescript
// hooks/useContract.ts
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { getProgram } from '@/lib/contract/instance';

export function useContract() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const program = useMemo(() => {
    return getProgram(connection, wallet.wallet?.adapter as any);
  }, [connection, wallet.wallet?.adapter]);

  return {
    program,
    connection,
    wallet,
    isConnected: wallet.connected,
    publicKey: wallet.publicKey,
  };
}
```

### 2. useAdminConfig Hook

```typescript
// hooks/useAdminConfig.ts
import { useState, useEffect, useCallback } from 'react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { useContract } from './useContract';
import { getPDAs } from '@/lib/contract/instance';
import { AdminConfig } from '@/lib/contract/config';

export function useAdminConfig() {
  const { program, wallet, isConnected } = useContract();
  const [adminConfig, setAdminConfig] = useState<AdminConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { adminConfigPda } = getPDAs();

  // Fetch admin config
  const fetchAdminConfig = useCallback(async () => {
    if (!program) return;

    setLoading(true);
    setError(null);

    try {
      const config = await program.account.adminConfig.fetch(adminConfigPda);
      setAdminConfig(config as AdminConfig);
    } catch (err) {
      setError('Failed to fetch admin config');
      console.error('Error fetching admin config:', err);
    } finally {
      setLoading(false);
    }
  }, [program, adminConfigPda]);

  // Initialize admin config
  const initializeAdminConfig = useCallback(async () => {
    if (!program || !wallet.publicKey || !isConnected) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const tx = await program.methods
        .initializeAdminConfig()
        .accounts({
          adminConfig: adminConfigPda,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      await fetchAdminConfig();
      return tx;
    } catch (err) {
      const errorMsg = 'Failed to initialize admin config';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [
    program,
    wallet.publicKey,
    isConnected,
    adminConfigPda,
    fetchAdminConfig,
  ]);

  // Add admin
  const addAdmin = useCallback(
    async (adminPublicKey: PublicKey) => {
      if (!program || !wallet.publicKey || !isConnected) {
        throw new Error('Wallet not connected');
      }

      setLoading(true);
      setError(null);

      try {
        const tx = await program.methods
          .addAdmin(adminPublicKey)
          .accounts({
            adminConfig: adminConfigPda,
            authority: wallet.publicKey,
          })
          .rpc();

        await fetchAdminConfig();
        return tx;
      } catch (err) {
        const errorMsg = 'Failed to add admin';
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [program, wallet.publicKey, isConnected, adminConfigPda, fetchAdminConfig]
  );

  // Remove admin
  const removeAdmin = useCallback(
    async (adminPublicKey: PublicKey) => {
      if (!program || !wallet.publicKey || !isConnected) {
        throw new Error('Wallet not connected');
      }

      setLoading(true);
      setError(null);

      try {
        const tx = await program.methods
          .removeAdmin(adminPublicKey)
          .accounts({
            adminConfig: adminConfigPda,
            authority: wallet.publicKey,
          })
          .rpc();

        await fetchAdminConfig();
        return tx;
      } catch (err) {
        const errorMsg = 'Failed to remove admin';
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [program, wallet.publicKey, isConnected, adminConfigPda, fetchAdminConfig]
  );

  // Check if current user is admin
  const isAdmin = useMemo(() => {
    if (!adminConfig || !wallet.publicKey) return false;

    for (let i = 0; i < adminConfig.adminCount; i++) {
      if (adminConfig.admins[i].equals(wallet.publicKey)) {
        return true;
      }
    }
    return false;
  }, [adminConfig, wallet.publicKey]);

  useEffect(() => {
    fetchAdminConfig();
  }, [fetchAdminConfig]);

  return {
    adminConfig,
    loading,
    error,
    isAdmin,
    fetchAdminConfig,
    initializeAdminConfig,
    addAdmin,
    removeAdmin,
  };
}
```

### 3. useFormApproval Hook

```typescript
// hooks/useFormApproval.ts
import { useState, useCallback } from 'react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { useContract } from './useContract';
import { getPDAs } from '@/lib/contract/instance';
import { FormApproval } from '@/lib/contract/config';
import { hashFormData } from '@/lib/utils/crypto';

export function useFormApproval() {
  const { program, wallet, isConnected } = useContract();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sign form submission
  const signFormSubmission = useCallback(
    async (formId: string, formData: string, metadata?: string) => {
      if (!program || !wallet.publicKey || !isConnected) {
        throw new Error('Wallet not connected');
      }

      setLoading(true);
      setError(null);

      try {
        const { adminConfigPda, formApprovalPda } = getPDAs(formId);
        const formHash = hashFormData(formData);

        const tx = await program.methods
          .signFormSubmission(formId, Array.from(formHash), metadata || null)
          .accounts({
            formApproval: formApprovalPda,
            adminConfig: adminConfigPda,
            admin: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        return tx;
      } catch (err) {
        const errorMsg = 'Failed to sign form submission';
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [program, wallet.publicKey, isConnected]
  );

  // Update form approval
  const updateFormApproval = useCallback(
    async (formId: string, newMetadata: string) => {
      if (!program || !wallet.publicKey || !isConnected) {
        throw new Error('Wallet not connected');
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
            admin: wallet.publicKey,
          })
          .rpc();

        return tx;
      } catch (err) {
        const errorMsg = 'Failed to update form approval';
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [program, wallet.publicKey, isConnected]
  );

  // Verify form approval
  const verifyFormApproval = useCallback(
    async (formId: string, formData: string): Promise<boolean> => {
      if (!program) {
        throw new Error('Program not initialized');
      }

      setLoading(true);
      setError(null);

      try {
        const { formApprovalPda } = getPDAs(formId);
        const formHash = hashFormData(formData);

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
    [program]
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

        const formApproval = await program.account.formApproval.fetch(
          formApprovalPda
        );
        return formApproval as FormApproval;
      } catch (err) {
        setError('Failed to get form approval details');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [program]
  );

  return {
    loading,
    error,
    signFormSubmission,
    updateFormApproval,
    verifyFormApproval,
    getFormApprovalDetails,
  };
}
```

## React Components

### 1. WalletButton Component

```typescript
// components/WalletButton.tsx
'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function WalletButton() {
  return (
    <div className='flex items-center'>
      <WalletMultiButton className='!bg-blue-600 hover:!bg-blue-700' />
    </div>
  );
}
```

### 2. AdminPanel Component

```typescript
// components/AdminPanel.tsx
'use client';

import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useAdminConfig } from '@/hooks/useAdminConfig';

export function AdminPanel() {
  const {
    adminConfig,
    loading,
    error,
    isAdmin,
    initializeAdminConfig,
    addAdmin,
    removeAdmin,
  } = useAdminConfig();

  const [newAdminAddress, setNewAdminAddress] = useState('');
  const [removeAdminAddress, setRemoveAdminAddress] = useState('');

  const handleInitialize = async () => {
    try {
      await initializeAdminConfig();
      alert('Admin config initialized successfully!');
    } catch (err) {
      alert('Failed to initialize admin config');
    }
  };

  const handleAddAdmin = async () => {
    try {
      const adminPubkey = new PublicKey(newAdminAddress);
      await addAdmin(adminPubkey);
      setNewAdminAddress('');
      alert('Admin added successfully!');
    } catch (err) {
      alert('Failed to add admin');
    }
  };

  const handleRemoveAdmin = async () => {
    try {
      const adminPubkey = new PublicKey(removeAdminAddress);
      await removeAdmin(adminPubkey);
      setRemoveAdminAddress('');
      alert('Admin removed successfully!');
    } catch (err) {
      alert('Failed to remove admin');
    }
  };

  if (loading) {
    return <div className='text-center'>Loading...</div>;
  }

  if (error) {
    return <div className='text-red-500'>Error: {error}</div>;
  }

  return (
    <div className='bg-white p-6 rounded-lg shadow-md'>
      <h2 className='text-2xl font-bold mb-4'>Admin Panel</h2>

      {!adminConfig ? (
        <div className='mb-6'>
          <p className='mb-4'>
            Admin configuration not found. Please initialize it first.
          </p>
          <button
            onClick={handleInitialize}
            className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
            disabled={loading}
          >
            Initialize Admin Config
          </button>
        </div>
      ) : (
        <>
          <div className='mb-6'>
            <h3 className='text-lg font-semibold mb-2'>
              Current Admins ({adminConfig.adminCount})
            </h3>
            <ul className='space-y-2'>
              {Array.from({ length: adminConfig.adminCount }).map(
                (_, index) => (
                  <li key={index} className='bg-gray-100 p-2 rounded'>
                    {adminConfig.admins[index].toString()}
                  </li>
                )
              )}
            </ul>
          </div>

          {isAdmin && (
            <>
              <div className='mb-6'>
                <h3 className='text-lg font-semibold mb-2'>Add Admin</h3>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    value={newAdminAddress}
                    onChange={(e) => setNewAdminAddress(e.target.value)}
                    placeholder='Admin public key'
                    className='flex-1 p-2 border rounded'
                  />
                  <button
                    onClick={handleAddAdmin}
                    className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700'
                    disabled={loading || !newAdminAddress}
                  >
                    Add Admin
                  </button>
                </div>
              </div>

              <div className='mb-6'>
                <h3 className='text-lg font-semibold mb-2'>Remove Admin</h3>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    value={removeAdminAddress}
                    onChange={(e) => setRemoveAdminAddress(e.target.value)}
                    placeholder='Admin public key to remove'
                    className='flex-1 p-2 border rounded'
                  />
                  <button
                    onClick={handleRemoveAdmin}
                    className='bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700'
                    disabled={loading || !removeAdminAddress}
                  >
                    Remove Admin
                  </button>
                </div>
              </div>
            </>
          )}

          {!isAdmin && (
            <div className='text-yellow-600 bg-yellow-100 p-4 rounded'>
              You are not an admin. You can only view the configuration.
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

### 3. FormApprovalComponent

```typescript
// components/FormApprovalComponent.tsx
'use client';

import { useState } from 'react';
import { useFormApproval } from '@/hooks/useFormApproval';
import { useAdminConfig } from '@/hooks/useAdminConfig';

export function FormApprovalComponent() {
  const {
    signFormSubmission,
    verifyFormApproval,
    getFormApprovalDetails,
    loading,
    error,
  } = useFormApproval();
  const { isAdmin } = useAdminConfig();

  const [formId, setFormId] = useState('');
  const [formData, setFormData] = useState('');
  const [metadata, setMetadata] = useState('');
  const [verificationResult, setVerificationResult] = useState<boolean | null>(
    null
  );
  const [approvalDetails, setApprovalDetails] = useState<any>(null);

  const handleSignForm = async () => {
    try {
      const tx = await signFormSubmission(formId, formData, metadata);
      alert(`Form signed successfully! Transaction: ${tx}`);
    } catch (err) {
      alert('Failed to sign form');
    }
  };

  const handleVerifyForm = async () => {
    try {
      const result = await verifyFormApproval(formId, formData);
      setVerificationResult(result);
    } catch (err) {
      alert('Failed to verify form');
    }
  };

  const handleGetDetails = async () => {
    try {
      const details = await getFormApprovalDetails(formId);
      setApprovalDetails(details);
    } catch (err) {
      alert('Failed to get form details');
    }
  };

  return (
    <div className='bg-white p-6 rounded-lg shadow-md'>
      <h2 className='text-2xl font-bold mb-4'>Form Approval</h2>

      <div className='space-y-4 mb-6'>
        <div>
          <label className='block text-sm font-medium mb-1'>Form ID</label>
          <input
            type='text'
            value={formId}
            onChange={(e) => setFormId(e.target.value)}
            className='w-full p-2 border rounded'
            placeholder='Enter form ID'
          />
        </div>

        <div>
          <label className='block text-sm font-medium mb-1'>Form Data</label>
          <textarea
            value={formData}
            onChange={(e) => setFormData(e.target.value)}
            className='w-full p-2 border rounded h-32'
            placeholder='Enter form data to hash'
          />
        </div>

        <div>
          <label className='block text-sm font-medium mb-1'>
            Metadata (Optional)
          </label>
          <input
            type='text'
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            className='w-full p-2 border rounded'
            placeholder='Additional metadata'
          />
        </div>
      </div>

      <div className='flex gap-2 mb-6'>
        {isAdmin && (
          <button
            onClick={handleSignForm}
            className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
            disabled={loading || !formId || !formData}
          >
            Sign Form
          </button>
        )}

        <button
          onClick={handleVerifyForm}
          className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700'
          disabled={loading || !formId || !formData}
        >
          Verify Form
        </button>

        <button
          onClick={handleGetDetails}
          className='bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700'
          disabled={loading || !formId}
        >
          Get Details
        </button>
      </div>

      {verificationResult !== null && (
        <div
          className={`p-4 rounded mb-4 ${
            verificationResult
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          Verification Result: {verificationResult ? 'Valid' : 'Invalid'}
        </div>
      )}

      {approvalDetails && (
        <div className='bg-gray-100 p-4 rounded'>
          <h3 className='font-semibold mb-2'>Approval Details</h3>
          <p>
            <strong>Form ID:</strong> {approvalDetails.formId}
          </p>
          <p>
            <strong>Signer:</strong> {approvalDetails.signer.toString()}
          </p>
          <p>
            <strong>Approved At:</strong>{' '}
            {new Date(approvalDetails.approvedAt * 1000).toLocaleString()}
          </p>
          <p>
            <strong>Metadata:</strong> {approvalDetails.metadata || 'None'}
          </p>
        </div>
      )}

      {error && (
        <div className='text-red-500 bg-red-100 p-4 rounded'>
          Error: {error}
        </div>
      )}
    </div>
  );
}
```

## Utils Functions

### 1. Crypto Utils

```typescript
// lib/utils/crypto.ts
import * as crypto from 'crypto';

export function hashFormData(formData: string): Buffer {
  return crypto.createHash('sha256').update(formData).digest();
}

export function validateFormId(formId: string): boolean {
  return formId.length > 0 && formId.length <= 64;
}

export function validateMetadata(metadata: string): boolean {
  return metadata.length <= 256;
}
```

### 2. Format Utils

```typescript
// lib/utils/format.ts
import { PublicKey } from '@solana/web3.js';

export function shortenAddress(address: string | PublicKey, chars = 4): string {
  const addressStr = typeof address === 'string' ? address : address.toString();
  return `${addressStr.slice(0, chars)}...${addressStr.slice(-chars)}`;
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

export function formatTransactionUrl(
  signature: string,
  network: string = 'devnet'
): string {
  const baseUrl =
    network === 'mainnet-beta'
      ? 'https://explorer.solana.com'
      : `https://explorer.solana.com/?cluster=${network}`;

  return `${baseUrl}/tx/${signature}`;
}
```

## Error Handling

### 1. Error Types

```typescript
// lib/errors/contract-errors.ts
export enum ContractError {
  UNAUTHORIZED_ADMIN = 'UnauthorizedAdmin',
  ADMIN_ALREADY_EXISTS = 'AdminAlreadyExists',
  ADMIN_NOT_FOUND = 'AdminNotFound',
  CANNOT_REMOVE_LAST_ADMIN = 'CannotRemoveLastAdmin',
  INVALID_FORM_HASH = 'InvalidFormHash',
  FORM_ID_TOO_LONG = 'FormIdTooLong',
  METADATA_TOO_LONG = 'MetadataTooLong',
}

export function parseContractError(error: any): string {
  const errorString = error.toString();

  if (errorString.includes('UnauthorizedAdmin')) {
    return 'You are not authorized to perform this action';
  }

  if (errorString.includes('AdminAlreadyExists')) {
    return 'This admin already exists';
  }

  if (errorString.includes('AdminNotFound')) {
    return 'Admin not found';
  }

  if (errorString.includes('CannotRemoveLastAdmin')) {
    return 'Cannot remove the last admin';
  }

  if (errorString.includes('InvalidFormHash')) {
    return 'Invalid form hash provided';
  }

  if (errorString.includes('FormIdTooLong')) {
    return 'Form ID is too long (max 64 characters)';
  }

  if (errorString.includes('MetadataTooLong')) {
    return 'Metadata is too long (max 256 characters)';
  }

  return 'An unknown error occurred';
}
```

### 2. Error Context

```typescript
// hooks/useError.ts
import { useState, useCallback } from 'react';
import { parseContractError } from '@/lib/errors/contract-errors';

export function useError() {
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((err: any) => {
    const errorMessage = parseContractError(err);
    setError(errorMessage);
    console.error('Contract error:', err);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    setError,
    handleError,
    clearError,
  };
}
```

## Production Considerations

### 1. Environment Variables

```env
# .env.local
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_URL=https://your-rpc-endpoint.com
```

### 2. Security Best Practices

1. **Validation**: Always validate input before sending to contract
2. **Error Handling**: Handle errors gracefully and don't expose sensitive information
3. **Rate Limiting**: Implement rate limiting for transactions
4. **Wallet Security**: Educate users about wallet security

### 3. Performance Optimizations

1. **Connection Pooling**: Use connection pooling for RPC calls
2. **Caching**: Cache contract data when possible
3. **Lazy Loading**: Load components lazily when needed
4. **Optimistic Updates**: Update UI optimistically for better UX

### 4. Monitoring and Logging

```typescript
// lib/monitoring/logger.ts
export class ContractLogger {
  static logTransaction(signature: string, action: string) {
    console.log(`Transaction ${action}: ${signature}`);
    // Send to your logging service
  }

  static logError(error: any, context: string) {
    console.error(`Error in ${context}:`, error);
    // Send to your error tracking service
  }
}
```

## Usage Example

### Main Page

```typescript
// app/page.tsx
'use client';

import { WalletButton } from '@/components/WalletButton';
import { AdminPanel } from '@/components/AdminPanel';
import { FormApprovalComponent } from '@/components/FormApprovalComponent';
import { useWallet } from '@solana/wallet-adapter-react';

export default function Home() {
  const { connected } = useWallet();

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold'>Document Signing DApp</h1>
        <WalletButton />
      </div>

      {connected ? (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          <AdminPanel />
          <FormApprovalComponent />
        </div>
      ) : (
        <div className='text-center'>
          <p className='text-lg mb-4'>Please connect your wallet to continue</p>
        </div>
      )}
    </div>
  );
}
```

## Conclusion

This guide provides a complete foundation for integrating Solana smart contract into Next.js applications. Customize according to your specific project needs and always test thoroughly before deploying to production.

Main features implemented:

- ✅ Wallet connection and management
- ✅ Admin configuration management
- ✅ Form signing and approval
- ✅ Form verification
- ✅ Error handling and validation
- ✅ TypeScript support
- ✅ Responsive UI components

For further expansion, consider:

- WebSocket listeners for real-time updates
- File upload and IPFS integration
- Advanced admin permissions
- Audit logs and reporting
- Mobile app support with React Native
