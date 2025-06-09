import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';

// Program ID of the smart contract from environment variable
export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID ||
    '7xMFfY7wEggjbVTQvtLYXcnAsNBFxiBDSx6ohtuxSYXt'
);

// IDL of the smart contract
export const IDL = {
  version: '0.1.0',
  name: 'sign_document_contract',
  instructions: [
    {
      name: 'initializeAdminConfig',
      accounts: [
        { name: 'adminConfig', isMut: true, isSigner: false },
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
          { name: 'bump', type: 'u8' },
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
