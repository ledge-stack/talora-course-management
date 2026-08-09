'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardBody, CardHeader, Input, Button, Checkbox } from "@heroui/react";
import { Mail, Lock, LogIn, AlertCircle, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import api from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell flex items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="auth-orb left-[-120px] top-[-120px] h-72 w-72 bg-indigo-200/50" />
      <div className="auth-orb right-[-80px] top-[15%] h-64 w-64 bg-sky-200/50" />
      <div className="auth-orb bottom-[-120px] left-[20%] h-80 w-80 bg-emerald-200/40" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mx-auto grid w-full max-w-6xl items-stretch gap-6 lg:grid-cols-[1.05fr_0.95fr]"
      >
        <div className="page-surface hidden flex-col justify-between p-10 text-slate-900 lg:flex">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Sparkles className="text-white" size={22} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-indigo-500">Talora</p>
              <h1 className="text-2xl font-black tracking-tight">University Course Management</h1>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Student workflow</p>
              <h2 className="mt-3 max-w-md text-4xl font-black leading-tight tracking-tight">
                Keep your groups, submissions, and deadlines in one place.
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Secure access', value: 'SSO ready', icon: ShieldCheck },
                { label: 'Faster sign-in', value: 'One step', icon: ArrowRight },
                { label: 'Fresh workspace', value: 'Semester view', icon: Sparkles },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm">
                    <Icon size={18} className="text-indigo-600" />
                    <p className="mt-3 text-sm font-semibold text-slate-500">{item.label}</p>
                    <p className="text-lg font-bold text-slate-900">{item.value}</p>
                  </div>
                );
              })}
            </div>

            <p className="max-w-lg text-sm leading-6 text-slate-600">
              Sign in to review your course allocations, submit work, and track swap requests from a single dashboard.
            </p>
          </div>
        </div>

        <Card className="surface-card p-2 lg:p-3">
          <CardHeader className="flex flex-col items-start gap-4 px-6 pb-6 pt-8 sm:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-indigo-600">
              <LogIn size={14} />
              Secure Sign In
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Welcome back</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">Use your student email to continue to Talora.</p>
            </div>
          </CardHeader>
          <CardBody className="px-6 pb-8 sm:px-8">
            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <Input
                type="email"
                label="Email Address"
                labelPlacement="outside"
                placeholder="Enter your Gmail"
                variant="bordered"
                isRequired
                startContent={<Mail className="text-gray-400" size={18} />}
                value={email}
                onValueChange={setEmail}
                classNames={{
                  label: "text-slate-700 font-medium",
                  inputWrapper: "h-12 border-slate-200 hover:border-indigo-400 focus-within:!border-indigo-600 bg-white/80"
                }}
              />

              <Input
                type="password"
                label="Password"
                labelPlacement="outside"
                placeholder="Enter your password"
                variant="bordered"
                isRequired
                startContent={<Lock className="text-gray-400" size={18} />}
                value={password}
                onValueChange={setPassword}
                classNames={{
                  label: "text-slate-700 font-medium",
                  inputWrapper: "h-12 border-slate-200 hover:border-indigo-400 focus-within:!border-indigo-600 bg-white/80"
                }}
              />

              <div className="flex items-center justify-between gap-4">
                <Checkbox size="sm" classNames={{ label: "text-sm text-slate-500" }}>Remember me</Checkbox>
                <Link href="#" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                color="primary"
                className="h-12 w-full rounded-xl bg-indigo-600 text-base font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700"
                isLoading={loading}
                startContent={!loading && <LogIn size={20} />}
              >
                Sign In
              </Button>

              <div className="pt-2 text-center">
                <span className="text-sm text-slate-500">Don't have an account? </span>
                <Link href="/signup" className="text-sm font-bold text-indigo-600 hover:underline underline-offset-4">
                  Create one
                </Link>
              </div>
            </form>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}
