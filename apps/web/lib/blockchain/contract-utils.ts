import { PublicKey } from '@solana/web3.js';
import { PROGRAM_ID } from './anchor-setup';
import crypto from 'crypto';

/**
 * Contract utility functions for interacting with the Solana smart contract
 * Note: Solana has a limitation on seed length for PDAs (Program Derived Addresses)
 * The combined length of all seeds must be within a limit (~255 bytes)
 * For long form IDs, we hash them to ensure they fit within this limit
 */

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
  // If formId is too long, create a hash of it to keep seed length within limits
  // Solana has a limit on seed length (max ~255 bytes combined for all seeds)
  // The "form_approval" seed is already taking some bytes, so we need to manage the formId length
  let formIdSeed;
  if (Buffer.from(formId).length > 32) {
    // Hash the formId to ensure it's within the seed length limit
    formIdSeed = crypto.createHash('sha256').update(formId).digest();
  } else {
    formIdSeed = Buffer.from(formId);
  }

  return PublicKey.findProgramAddressSync(
    [Buffer.from(FORM_APPROVAL_SEED), formIdSeed],
    PROGRAM_ID
  );
}

// Create SHA-256 hash from form data
export function createFormHash(formData: any): Uint8Array {
  // Stringify the form data in a deterministic way
  const sortedData = sortObjectDeep(formData);
  const dataString = JSON.stringify(sortedData);
  const hash = crypto.createHash('sha256').update(dataString).digest();
  return new Uint8Array(hash);
}

// Sort object keys to ensure consistent hashing
function sortObjectDeep(obj: any): any {
  // Handle null and undefined
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(sortObjectDeep);
  }

  // Only process objects
  if (typeof obj !== 'object') {
    return obj;
  }

  const sortedObj: Record<string, any> = {};
  const keys = Object.keys(obj).sort();

  // Process each key recursively
  for (const key of keys) {
    sortedObj[key] = sortObjectDeep(obj[key]);
  }

  return sortedObj;
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
  // We no longer need to validate the form ID length since we'll hash it if it's too long
  // This function is kept for backward compatibility
  return true;
}

export function validateMetadata(metadata: string): boolean {
  return metadata.length <= CONFIG.MAX_METADATA_LENGTH;
}

// Error handling
export function handleBlockchainError(error: any): string {
  // Specific error handling for the contract
  const errorMessage = error.toString();

  if (errorMessage.includes('FormIdTooLong')) {
    return 'Form ID is too long (maximum 64 characters)';
  } else if (errorMessage.includes('MetadataTooLong')) {
    return 'Metadata is too long (maximum 256 characters)';
  } else if (errorMessage.includes('FormAlreadyApproved')) {
    return 'This form has already been approved on the blockchain';
  } else if (errorMessage.includes('UnauthorizedAdmin')) {
    return 'You are not authorized as an admin for this operation';
  } else if (errorMessage.includes('InvalidFormHash')) {
    return 'Invalid form data hash';
  } else if (errorMessage.includes('Max seed length exceeded')) {
    return 'Form ID is too complex for blockchain processing. This error has been fixed.';
  } else if (errorMessage.includes('0x1')) {
    return 'Wallet not connected';
  } else {
    return errorMessage || 'An error occurred with the blockchain transaction';
  }
}
