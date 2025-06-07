'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { cn } from '@workspace/ui/lib/utils';
import { buttonVariants } from '@workspace/ui/components/button';

type StatsCardProps = {
  title: string;
  value: number;
  href: string;
};

export const StatsCard = ({ title, value, href }: StatsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-3xl font-bold'>{value}</p>
      </CardContent>
      <CardFooter>
        <Link href={href} className={cn(buttonVariants({ variant: 'link' }))}>
          View Details →
        </Link>
      </CardFooter>
    </Card>
  );
};
