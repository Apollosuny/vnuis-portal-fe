'use client';

import { AdminGuard } from '@/components/guards/admin.guard';
import { FormCreationClient } from '@/clients/admin/forms/FormCreationClient';

export default function CreateFormPage() {
  return <FormCreationClient />;
}
