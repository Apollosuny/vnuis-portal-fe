// Types for administrative procedures form based on the backend schema

export type Answer = {
  id: number;
  type: string; // 'option' or other types
  content: string;
};

export type Question = {
  id: number;
  title: string;
  type: string; // 'text', 'multiple-choice', 'textarea', etc.
  answers: Answer[];
};

export type FormData = {
  questions: Question[];
};

export type AdministrativeProceduresForm = {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: string;
  isActive: boolean;
  fileUrl?: string | null;
  pdfUrl?: string | null;
  pdfPath?: string | null;
  pdfFileName?: string | null;
  allowEditAfterSubmit: boolean;
  requireApproval: boolean;
  data: FormData;
  metadata?: Record<string, any> | null;
  createdByOperatorId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateFormValues = {
  name: string;
  slug: string;
  description: string;
  type: string;
  isActive: boolean;
  fileUrl?: string;
  allowEditAfterSubmit: boolean;
  requireApproval: boolean;
  data: FormData;
};
