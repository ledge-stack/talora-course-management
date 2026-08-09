'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardBody, CardHeader, Spinner, Button } from "@heroui/react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import api from '@/lib/api';
import { Suspense } from 'react';

function VerifyContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    const verify = async () => {
      try {
        const response = await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(response.data.message);
        setTimeout(() => router.push('/login'), 3000);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The token may be invalid or expired.');
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f7fe] p-4">
      <Card className="w-full max-w-md p-4 shadow-xl border-none">
        <CardHeader className="flex flex-col items-center gap-2 pt-8">
          {status === 'loading' && (
            <div className="h-16 w-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 animate-pulse">
              <Loader2 size={32} className="animate-spin" />
            </div>
          )}
          {status === 'success' && (
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 border-2 border-green-200">
              <CheckCircle2 size={32} />
            </div>
          )}
          {status === 'error' && (
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 border-2 border-red-200">
              <AlertCircle size={32} />
            </div>
          )}
        </CardHeader>
        <CardBody className="text-center pb-8">
          <h2 className="text-2xl font-bold mb-2">
            {status === 'loading' && "Verifying Account"}
            {status === 'success' && "Account Verified!"}
            {status === 'error' && "Verification Failed"}
          </h2>
          <p className="text-gray-500 mb-6">
            {status === 'loading' && "Please wait while we activate your university account..."}
            {status !== 'loading' && message}
          </p>

          {status === 'error' && (
            <Button
              color="primary"
              className="font-bold bg-indigo-600"
              onClick={() => router.push('/login')}
            >
              Return to Login
            </Button>
          )}

          {status === 'success' && (
            <p className="text-xs text-green-600 font-medium">Redirecting you to login shortly...</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7fe]">
        <Spinner size="lg" color="primary" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
