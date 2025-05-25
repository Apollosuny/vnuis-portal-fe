'use client';

import { AuthenticatedGuard } from '@/components/guards/authenticated.guard';
import { Button } from '@workspace/ui/components/button';
import { toast } from 'sonner';

export default function Page() {
  return (
    <AuthenticatedGuard>
      <div className='flex items-center justify-center min-h-svh'>
        <div className='flex flex-col items-center justify-center gap-4'>
          <h1 className='text-2xl font-bold'>Hello World</h1>
          <Button size='sm' onClick={() => toast('Hello world')}>
            Button
          </Button>
        </div>
      </div>
    </AuthenticatedGuard>
  );
}
