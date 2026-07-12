'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      router.push('/login');
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="glass max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-red-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">
          You don't have permission to access this page. You will be redirected to the login page in a few seconds.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/login">
            <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500">
              <ArrowLeft className="w-4 h-4 mr-2" /> Go to Login
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full">Return to Home</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}