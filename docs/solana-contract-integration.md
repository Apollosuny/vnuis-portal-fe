# Solana Smart Contract Integration Guide

## Overview

This guide explains how to integrate the **Sign Document Contract** smart contract deployed on Solana devnet into a Next.js application.

## Smart Contract Information

- **Program ID**: `7xMFfY7wEggjbVTQvtLYXcnAsNBFxiBDSx6ohtuxSYXt`
- **Network**: Devnet
- **Deploy Transaction**: `2iyTKTJbHXLisia6pxbk8QmXpZ39xFXufrmzVxa5R92Je2NcTHk...`

## Installing Dependencies

```bash
npm install @solana/web3.js @coral-xyz/anchor @solana/wallet-adapter-base @solana/wallet-adapter-react @solana/wallet-adapter-wallets @solana/wallet-adapter-react-ui
```

## 1. Wallet Provider Configuration

Create the file `components/WalletProvider.tsx`:

```typescript
'use client';

import { FC, ReactNode, useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Import CSS for wallet modal
require('@solana/wallet-adapter-react-ui/styles.css');

interface Props {
  children: ReactNode;
}

const WalletContextProvider: FC<Props> = ({ children }) => {
  // Use devnet
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

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
};

export default WalletContextProvider;
```

## 2. Anchor Program Configuration

Create the file `lib/anchor-setup.ts`:

```typescript
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';

// Program ID of the smart contract
export const PROGRAM_ID = new PublicKey(
  '7xMFfY7wEggjbVTQvtLYXcnAsNBFxiBDSx6ohtuxSYXt'
);

// IDL of the smart contract (copy from target/idl/sign_document_contract.json)
export const IDL = {
  version: '0.1.0',
  name: 'sign_document_contract',
  instructions: [
    {
      name: 'initializeAdminConfig',
      accounts: [
        { name: 'adminConfig', isMut: true, isSigner: false },
        { name: 'authority', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: 'addAdmin',
      accounts: [
        { name: 'adminConfig', isMut: true, isSigner: false },
        { name: 'authority', isMut: false, isSigner: true },
      ],
      args: [{ name: 'admin', type: 'publicKey' }],
    },
    {
      name: 'removeAdmin',
      accounts: [
        { name: 'adminConfig', isMut: true, isSigner: false },
        { name: 'authority', isMut: false, isSigner: true },
      ],
      args: [{ name: 'admin', type: 'publicKey' }],
    },
    {
      name: 'signFormSubmission',
      accounts: [
        { name: 'formApproval', isMut: true, isSigner: false },
        { name: 'adminConfig', isMut: false, isSigner: false },
        { name: 'admin', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [
        { name: 'formId', type: 'string' },
        { name: 'formHash', type: { array: ['u8', 32] } },
        { name: 'metadata', type: { option: 'string' } },
      ],
    },
    {
      name: 'updateFormApproval',
      accounts: [
        { name: 'formApproval', isMut: true, isSigner: false },
        { name: 'adminConfig', isMut: false, isSigner: false },
        { name: 'admin', isMut: false, isSigner: true },
      ],
      args: [
        { name: 'formId', type: 'string' },
        { name: 'metadata', type: 'string' },
      ],
    },
    {
      name: 'verifyFormApproval',
      accounts: [{ name: 'formApproval', isMut: false, isSigner: false }],
      args: [
        { name: 'formId', type: 'string' },
        { name: 'formHash', type: { array: ['u8', 32] } },
      ],
      returns: 'bool',
    },
    {
      name: 'getFormApprovalDetails',
      accounts: [{ name: 'formApproval', isMut: false, isSigner: false }],
      args: [{ name: 'formId', type: 'string' }],
      returns: {
        tuple: ['string', { array: ['u8', 32] }, 'publicKey', 'i64', 'string'],
      },
    },
  ],
  accounts: [
    {
      name: 'AdminConfig',
      type: {
        kind: 'struct',
        fields: [
          { name: 'admins', type: { array: ['publicKey', 10] } },
          { name: 'bump', type: 'u8' },
        ],
      },
    },
    {
      name: 'FormApproval',
      type: {
        kind: 'struct',
        fields: [
          { name: 'formId', type: 'string' },
          { name: 'formHash', type: { array: ['u8', 32] } },
          { name: 'signer', type: 'publicKey' },
          { name: 'approvedAt', type: 'i64' },
          { name: 'metadata', type: 'string' },
        ],
      },
    },
  ],
  errors: [
    { code: 6000, name: 'FormIdTooLong', msg: 'Form ID is too long' },
    { code: 6001, name: 'MetadataTooLong', msg: 'Metadata is too long' },
    { code: 6002, name: 'FormAlreadyApproved', msg: 'Form already approved' },
    { code: 6003, name: 'UnauthorizedAdmin', msg: 'Unauthorized admin' },
    { code: 6004, name: 'AdminAlreadyExists', msg: 'Admin already exists' },
    { code: 6005, name: 'AdminNotFound', msg: 'Admin not found' },
    {
      code: 6006,
      name: 'MaxAdminsReached',
      msg: 'Maximum number of admins reached',
    },
    { code: 6007, name: 'InvalidFormHash', msg: 'Invalid form hash' },
    {
      code: 6008,
      name: 'CannotRemoveLastAdmin',
      msg: 'Cannot remove the last admin',
    },
  ],
};

// Helper function to create a provider
export function getProvider(wallet: any, connection: Connection) {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });
  return provider;
}

// Helper function to create a program instance
export function getProgram(provider: AnchorProvider) {
  return new Program(IDL as any, PROGRAM_ID, provider);
}
```

## 3. Utility Functions

Create the file `lib/contract-utils.ts`:

```typescript
import { PublicKey } from '@solana/web3.js';
import { PROGRAM_ID } from './anchor-setup';
import crypto from 'crypto';

// Seeds for PDA
export const ADMIN_CONFIG_SEED = 'admin_config';
export const FORM_APPROVAL_SEED = 'form_approval';

// Create PDA for admin config
export function getAdminConfigPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(ADMIN_CONFIG_SEED)],
    PROGRAM_ID
  );
}

// Create PDA for form approval
export function getFormApprovalPDA(formId: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(FORM_APPROVAL_SEED), Buffer.from(formId)],
    PROGRAM_ID
  );
}

// Create SHA-256 hash from form data
export function createFormHash(formData: any): Uint8Array {
  const dataString = JSON.stringify(formData);
  const hash = crypto.createHash('sha256').update(dataString).digest();
  return new Uint8Array(hash);
}

// Convert string to bytes array
export function stringToBytes(str: string): number[] {
  return Array.from(Buffer.from(str, 'utf8'));
}

// Validation helpers
export const CONFIG = {
  MAX_FORM_ID_LENGTH: 64,
  MAX_METADATA_LENGTH: 256,
  MAX_ADMINS: 10,
};

export function validateFormId(formId: string): boolean {
  return formId.length <= CONFIG.MAX_FORM_ID_LENGTH;
}

export function validateMetadata(metadata: string): boolean {
  return metadata.length <= CONFIG.MAX_METADATA_LENGTH;
}
```

## 4. Custom Hooks

Create the file `hooks/useSignDocumentContract.ts`:

```typescript
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { useMemo } from 'react';
import { getProvider, getProgram } from '@/lib/anchor-setup';
import {
  getAdminConfigPDA,
  getFormApprovalPDA,
  createFormHash,
  validateFormId,
  validateMetadata,
} from '@/lib/contract-utils';

export function useSignDocumentContract() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const program = useMemo(() => {
    if (!wallet.connected || !wallet.publicKey) return null;

    const provider = getProvider(wallet, connection);
    return getProgram(provider);
  }, [wallet.connected, wallet.publicKey, connection]);

  // Initialize admin configuration
  const initializeAdminConfig = async () => {
    if (!program || !wallet.publicKey) throw new Error('Wallet not connected');

    const [adminConfigPda] = getAdminConfigPDA();

    try {
      const tx = await program.methods
        .initializeAdminConfig()
        .accounts({
          adminConfig: adminConfigPda,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return tx;
    } catch (error) {
      console.error('Error initializing admin config:', error);
      throw error;
    }
  };

  // Add new admin
  const addAdmin = async (adminPublicKey: PublicKey) => {
    if (!program || !wallet.publicKey) throw new Error('Wallet not connected');

    const [adminConfigPda] = getAdminConfigPDA();

    try {
      const tx = await program.methods
        .addAdmin(adminPublicKey)
        .accounts({
          adminConfig: adminConfigPda,
          authority: wallet.publicKey,
        })
        .rpc();

      return tx;
    } catch (error) {
      console.error('Error adding admin:', error);
      throw error;
    }
  };

  // Remove admin
  const removeAdmin = async (adminPublicKey: PublicKey) => {
    if (!program || !wallet.publicKey) throw new Error('Wallet not connected');

    const [adminConfigPda] = getAdminConfigPDA();

    try {
      const tx = await program.methods
        .removeAdmin(adminPublicKey)
        .accounts({
          adminConfig: adminConfigPda,
          authority: wallet.publicKey,
        })
        .rpc();

      return tx;
    } catch (error) {
      console.error('Error removing admin:', error);
      throw error;
    }
  };

  // Sign form submission
  const signFormSubmission = async (
    formId: string,
    formData: any,
    metadata?: string
  ) => {
    if (!program || !wallet.publicKey) throw new Error('Wallet not connected');

    // Validation
    if (!validateFormId(formId)) {
      throw new Error('Form ID is too long');
    }
    if (metadata && !validateMetadata(metadata)) {
      throw new Error('Metadata is too long');
    }

    const [adminConfigPda] = getAdminConfigPDA();
    const [formApprovalPda] = getFormApprovalPDA(formId);
    const formHash = createFormHash(formData);

    try {
      const tx = await program.methods
        .signFormSubmission(formId, Array.from(formHash), metadata || null)
        .accounts({
          formApproval: formApprovalPda,
          adminConfig: adminConfigPda,
          admin: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return { tx, formApprovalPda };
    } catch (error) {
      console.error('Error signing form:', error);
      throw error;
    }
  };

  // Update form approval metadata
  const updateFormApproval = async (formId: string, metadata: string) => {
    if (!program || !wallet.publicKey) throw new Error('Wallet not connected');

    if (!validateMetadata(metadata)) {
      throw new Error('Metadata is too long');
    }

    const [adminConfigPda] = getAdminConfigPDA();
    const [formApprovalPda] = getFormApprovalPDA(formId);

    try {
      const tx = await program.methods
        .updateFormApproval(formId, metadata)
        .accounts({
          formApproval: formApprovalPda,
          adminConfig: adminConfigPda,
          admin: wallet.publicKey,
        })
        .rpc();

      return tx;
    } catch (error) {
      console.error('Error updating form approval:', error);
      throw error;
    }
  };

  // Verify form approval
  const verifyFormApproval = async (formId: string, formData: any) => {
    if (!program) throw new Error('Program not initialized');

    const [formApprovalPda] = getFormApprovalPDA(formId);
    const formHash = createFormHash(formData);

    try {
      const result = await program.methods
        .verifyFormApproval(formId, Array.from(formHash))
        .accounts({
          formApproval: formApprovalPda,
        })
        .view();

      return result;
    } catch (error) {
      console.error('Error verifying form:', error);
      throw error;
    }
  };

  // Get form approval details
  const getFormApprovalDetails = async (formId: string) => {
    if (!program) throw new Error('Program not initialized');

    const [formApprovalPda] = getFormApprovalPDA(formId);

    try {
      const [id, hash, signer, approvedAt, metadata] = await program.methods
        .getFormApprovalDetails(formId)
        .accounts({
          formApproval: formApprovalPda,
        })
        .view();

      return {
        formId: id,
        formHash: hash,
        signer,
        approvedAt: approvedAt.toNumber(),
        metadata,
      };
    } catch (error) {
      console.error('Error getting form details:', error);
      throw error;
    }
  };

  // Get admin config
  const getAdminConfig = async () => {
    if (!program) throw new Error('Program not initialized');

    const [adminConfigPda] = getAdminConfigPDA();

    try {
      const adminConfig =
        await program.account.adminConfig.fetch(adminConfigPda);
      return adminConfig;
    } catch (error) {
      console.error('Error fetching admin config:', error);
      throw error;
    }
  };

  // Get form approval account
  const getFormApproval = async (formId: string) => {
    if (!program) throw new Error('Program not initialized');

    const [formApprovalPda] = getFormApprovalPDA(formId);

    try {
      const formApproval =
        await program.account.formApproval.fetch(formApprovalPda);
      return formApproval;
    } catch (error) {
      console.error('Error fetching form approval:', error);
      throw error;
    }
  };

  return {
    program,
    initializeAdminConfig,
    addAdmin,
    removeAdmin,
    signFormSubmission,
    updateFormApproval,
    verifyFormApproval,
    getFormApprovalDetails,
    getAdminConfig,
    getFormApproval,
  };
}
```

## 5. React Components

### Admin Management Component

Create the file `components/AdminManagement.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
import { useSignDocumentContract } from '@/hooks/useSignDocumentContract';

export default function AdminManagement() {
  const { connected } = useWallet();
  const { initializeAdminConfig, addAdmin, removeAdmin, getAdminConfig } =
    useSignDocumentContract();

  const [adminConfig, setAdminConfig] = useState<any>(null);
  const [newAdminAddress, setNewAdminAddress] = useState('');
  const [loading, setLoading] = useState(false);

  // Load admin config
  const loadAdminConfig = async () => {
    try {
      const config = await getAdminConfig();
      setAdminConfig(config);
    } catch (error) {
      console.error('Error loading admin config:', error);
    }
  };

  useEffect(() => {
    if (connected) {
      loadAdminConfig();
    }
  }, [connected]);

  const handleInitialize = async () => {
    setLoading(true);
    try {
      await initializeAdminConfig();
      await loadAdminConfig();
      alert('Admin config initialized successfully!');
    } catch (error) {
      alert(`Error: ${error}`);
    }
    setLoading(false);
  };

  const handleAddAdmin = async () => {
    if (!newAdminAddress) return;

    setLoading(true);
    try {
      const adminPubkey = new PublicKey(newAdminAddress);
      await addAdmin(adminPubkey);
      await loadAdminConfig();
      setNewAdminAddress('');
      alert('Admin added successfully!');
    } catch (error) {
      alert(`Error: ${error}`);
    }
    setLoading(false);
  };

  const handleRemoveAdmin = async (adminAddress: string) => {
    setLoading(true);
    try {
      const adminPubkey = new PublicKey(adminAddress);
      await removeAdmin(adminPubkey);
      await loadAdminConfig();
      alert('Admin removed successfully!');
    } catch (error) {
      alert(`Error: ${error}`);
    }
    setLoading(false);
  };

  if (!connected) {
    return (
      <div className='p-6'>
        <h2 className='text-2xl font-bold mb-4'>Admin Management</h2>
        <p className='mb-4'>Please connect your wallet to manage admins.</p>
        <WalletMultiButton />
      </div>
    );
  }

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <h2 className='text-2xl font-bold mb-6'>Admin Management</h2>

      <div className='mb-6'>
        <WalletMultiButton />
      </div>

      {!adminConfig ? (
        <div className='bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6'>
          <p className='text-yellow-700'>
            Admin configuration not found. Initialize it first.
          </p>
          <button
            onClick={handleInitialize}
            disabled={loading}
            className='mt-2 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50'
          >
            {loading ? 'Initializing...' : 'Initialize Admin Config'}
          </button>
        </div>
      ) : (
        <>
          <div className='bg-white shadow rounded-lg p-6 mb-6'>
            <h3 className='text-lg font-semibold mb-4'>
              Current Admins ({adminConfig.adminCount})
            </h3>
            <div className='space-y-2'>
              {Array.from({ length: adminConfig.adminCount }, (_, i) => (
                <div
                  key={i}
                  className='flex items-center justify-between p-3 bg-gray-50 rounded'
                >
                  <span className='font-mono text-sm'>
                    {adminConfig.admins[i].toString()}
                  </span>
                  <button
                    onClick={() =>
                      handleRemoveAdmin(adminConfig.admins[i].toString())
                    }
                    disabled={loading || adminConfig.adminCount <= 1}
                    className='bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50'
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className='bg-white shadow rounded-lg p-6'>
            <h3 className='text-lg font-semibold mb-4'>Add New Admin</h3>
            <div className='flex gap-4'>
              <input
                type='text'
                value={newAdminAddress}
                onChange={(e) => setNewAdminAddress(e.target.value)}
                placeholder='Admin public key'
                className='flex-1 border rounded px-3 py-2'
              />
              <button
                onClick={handleAddAdmin}
                disabled={loading || !newAdminAddress}
                className='bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50'
              >
                {loading ? 'Adding...' : 'Add Admin'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

### Form Signing Component

Create the file `components/FormSigning.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useSignDocumentContract } from '@/hooks/useSignDocumentContract';

export default function FormSigning() {
  const { connected } = useWallet();
  const { signFormSubmission, verifyFormApproval, getFormApprovalDetails } =
    useSignDocumentContract();

  const [formId, setFormId] = useState('');
  const [formData, setFormData] = useState('');
  const [metadata, setMetadata] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const handleSignForm = async () => {
    if (!formId || !formData) return;

    setLoading(true);
    try {
      const parsedFormData = JSON.parse(formData);
      const result = await signFormSubmission(
        formId,
        parsedFormData,
        metadata || undefined
      );
      alert(`Form signed successfully! Transaction: ${result.tx}`);

      // Clear form
      setFormId('');
      setFormData('');
      setMetadata('');
    } catch (error) {
      alert(`Error: ${error}`);
    }
    setLoading(false);
  };

  const handleVerifyForm = async () => {
    if (!formId || !formData) return;

    setLoading(true);
    try {
      const parsedFormData = JSON.parse(formData);
      const isValid = await verifyFormApproval(formId, parsedFormData);
      const details = await getFormApprovalDetails(formId);

      setVerificationResult({
        isValid,
        details,
      });
    } catch (error) {
      alert(`Error: ${error}`);
      setVerificationResult(null);
    }
    setLoading(false);
  };

  if (!connected) {
    return (
      <div className='p-6'>
        <h2 className='text-2xl font-bold mb-4'>Form Signing</h2>
        <p className='mb-4'>Please connect your wallet to sign forms.</p>
        <WalletMultiButton />
      </div>
    );
  }

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <h2 className='text-2xl font-bold mb-6'>Form Signing & Verification</h2>

      <div className='mb-6'>
        <WalletMultiButton />
      </div>

      <div className='grid md:grid-cols-2 gap-6'>
        {/* Sign Form */}
        <div className='bg-white shadow rounded-lg p-6'>
          <h3 className='text-lg font-semibold mb-4'>Sign Form</h3>

          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>Form ID</label>
              <input
                type='text'
                value={formId}
                onChange={(e) => setFormId(e.target.value)}
                placeholder='Enter form ID'
                className='w-full border rounded px-3 py-2'
                maxLength={64}
              />
            </div>

            <div>
              <label className='block text-sm font-medium mb-2'>
                Form Data (JSON)
              </label>
              <textarea
                value={formData}
                onChange={(e) => setFormData(e.target.value)}
                placeholder='{"student_id": "123", "course": "Math", "grade": "A"}'
                rows={4}
                className='w-full border rounded px-3 py-2'
              />
            </div>

            <div>
              <label className='block text-sm font-medium mb-2'>
                Metadata (Optional)
              </label>
              <input
                type='text'
                value={metadata}
                onChange={(e) => setMetadata(e.target.value)}
                placeholder='Additional metadata'
                className='w-full border rounded px-3 py-2'
                maxLength={256}
              />
            </div>

            <button
              onClick={handleSignForm}
              disabled={loading || !formId || !formData}
              className='w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:opacity-50'
            >
              {loading ? 'Signing...' : 'Sign Form'}
            </button>
          </div>
        </div>

        {/* Verify Form */}
        <div className='bg-white shadow rounded-lg p-6'>
          <h3 className='text-lg font-semibold mb-4'>Verify Form</h3>

          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>Form ID</label>
              <input
                type='text'
                value={formId}
                onChange={(e) => setFormId(e.target.value)}
                placeholder='Enter form ID to verify'
                className='w-full border rounded px-3 py-2'
              />
            </div>

            <div>
              <label className='block text-sm font-medium mb-2'>
                Form Data (JSON)
              </label>
              <textarea
                value={formData}
                onChange={(e) => setFormData(e.target.value)}
                placeholder='Enter form data to verify'
                rows={4}
                className='w-full border rounded px-3 py-2'
              />
            </div>

            <button
              onClick={handleVerifyForm}
              disabled={loading || !formId || !formData}
              className='w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50'
            >
              {loading ? 'Verifying...' : 'Verify Form'}
            </button>

            {verificationResult && (
              <div
                className={`p-4 rounded ${
                  verificationResult.isValid
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <h4 className='font-semibold mb-2'>
                  {verificationResult.isValid ? '✅ Valid' : '❌ Invalid'}
                </h4>
                {verificationResult.isValid && (
                  <div className='text-sm space-y-1'>
                    <p>
                      <strong>Signer:</strong>{' '}
                      {verificationResult.details.signer.toString()}
                    </p>
                    <p>
                      <strong>Approved At:</strong>{' '}
                      {new Date(
                        verificationResult.details.approvedAt * 1000
                      ).toLocaleString()}
                    </p>
                    <p>
                      <strong>Metadata:</strong>{' '}
                      {verificationResult.details.metadata}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

## 6. Layout Integration

Update `app/layout.tsx`:

```typescript
import './globals.css';
import WalletContextProvider from '@/components/WalletProvider';

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

## 7. Main Page

Update `app/page.tsx`:

```typescript
import AdminManagement from '@/components/AdminManagement';
import FormSigning from '@/components/FormSigning';

export default function Home() {
  return (
    <main className='min-h-screen bg-gray-50'>
      <div className='container mx-auto py-8'>
        <h1 className='text-3xl font-bold text-center mb-8'>
          Solana Document Signing System
        </h1>

        <div className='space-y-8'>
          <AdminManagement />
          <FormSigning />
        </div>
      </div>
    </main>
  );
}
```

## 8. Advanced Features

### Real-time Updates with WebSocket

```typescript
// lib/websocket-listener.ts
import { Connection } from '@solana/web3.js';
import { getFormApprovalPDA } from './contract-utils';

export function listenToFormApprovals(
  connection: Connection,
  onFormApproved: (formId: string, data: any) => void
) {
  // Listen to account changes
  const subscriptions: number[] = [];

  const subscribe = (formId: string) => {
    const [formApprovalPda] = getFormApprovalPDA(formId);

    const subscription = connection.onAccountChange(
      formApprovalPda,
      (accountInfo) => {
        // Parse and emit form approval data
        onFormApproved(formId, accountInfo);
      }
    );

    subscriptions.push(subscription);
  };

  const unsubscribe = () => {
    subscriptions.forEach((sub) => connection.removeAccountChangeListener(sub));
  };

  return { subscribe, unsubscribe };
}
```

### Error Handling

```typescript
// lib/error-handler.ts
export function handleContractError(error: any): string {
  if (error.code) {
    switch (error.code) {
      case 6000:
        return 'Form ID is too long (max 64 characters)';
      case 6001:
        return 'Metadata is too long (max 256 characters)';
      case 6003:
        return 'You are not authorized to perform this action';
      case 6004:
        return 'Admin already exists';
      case 6005:
        return 'Admin not found';
      case 6007:
        return 'Invalid form hash';
      case 6008:
        return 'Cannot remove the last admin';
      default:
        return error.message || 'Unknown error occurred';
    }
  }
  return error.message || 'Transaction failed';
}
```

## 9. Testing

Create the file `__tests__/contract.test.ts`:

```typescript
import { describe, it, expect } from '@jest/globals';
import {
  createFormHash,
  validateFormId,
  validateMetadata,
} from '@/lib/contract-utils';

describe('Contract Utils', () => {
  it('should create consistent hash for same data', () => {
    const data = { student: 'John', grade: 'A' };
    const hash1 = createFormHash(data);
    const hash2 = createFormHash(data);

    expect(hash1).toEqual(hash2);
  });

  it('should validate form ID length', () => {
    expect(validateFormId('short')).toBe(true);
    expect(validateFormId('a'.repeat(64))).toBe(true);
    expect(validateFormId('a'.repeat(65))).toBe(false);
  });

  it('should validate metadata length', () => {
    expect(validateMetadata('short')).toBe(true);
    expect(validateMetadata('a'.repeat(256))).toBe(true);
    expect(validateMetadata('a'.repeat(257))).toBe(false);
  });
});
```

## 10. Deployment and Production

### Environment Variables

Create the file `.env.local`:

```bash
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_PROGRAM_ID=7xMFfY7wEggjbVTQvtLYXcnAsNBFxiBDSx6ohtuxSYXt
```

### Production Considerations

1. **Network Selection**: Switch from devnet to mainnet when deploying to production
2. **Error Handling**: Implement comprehensive error handling and user feedback
3. **Loading States**: Add loading indicators for better UX
4. **Wallet Integration**: Support multiple wallet types
5. **Security**: Validate inputs on both client and server side
6. **Performance**: Cache contract data when possible

## Conclusion

This guide provides a foundation for integrating a Solana smart contract into a Next.js application. You can extend the components and hooks to fit the specific requirements of your project.

**Key Points:**

- ✅ Wallet connection and management
- ✅ Smart contract interaction
- ✅ Form signing and verification
- ✅ Admin management
- ✅ Error handling
- ✅ Real-time updates
- ✅ Testing setup

**Next Steps:**

1. Customize UI/UX according to design requirements
2. Add more validation and security checks
3. Implement audit logging
4. Add notification system
5. Deploy to production on mainnet
