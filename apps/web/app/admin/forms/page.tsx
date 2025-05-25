'use client';

import { FormsListClient } from '@/clients/admin/forms/FormsListClient';
import { AdminGuard } from '@/components/guards/admin.guard';

export default function FormsPage() {
  return <FormsListClient />;
}
