'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardBody, CardHeader, Input, Button, Progress, Switch } from "@heroui/react";
import { UserPlus, Mail, Lock, CreditCard, User, AlertCircle, CheckCircle2, BadgeCheck, CalendarRange, Layers3, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import api from '@/lib/api';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    studentId: '',
    password: '',
    isRetake: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/register', formData);
      setSuccess(response.data.message);
      setTimeout(() => router.push('/login'), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell flex items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="auth-orb left-[-100px] top-[-120px] h-72 w-72 bg-emerald-200/50" />
      <div className="auth-orb right-[-80px] top-[12%] h-72 w-72 bg-sky-200/50" />
      <div className="auth-orb bottom-[-140px] right-[18%] h-80 w-80 bg-indigo-200/45" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mx-auto grid w-full max-w-6xl items-stretch gap-6 lg:grid-cols-[0.95fr_1.05fr]"
      >
        <div className="page-surface hidden flex-col justify-between p-10 text-slate-900 lg:flex">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
              <UserPlus className="text-white" size={22} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-600">Join Talora</p>
              <h2 className="text-2xl font-black tracking-tight">Create your student profile</h2>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Course groups', value: 'Auto-linked', icon: Layers3 },
              { label: 'Deadlines', value: 'Tracked', icon: CalendarRange },
              { label: 'Verification', value: 'Student details', icon: BadgeCheck },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm">
                  <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500">{item.label}</p>
                    <p className="text-lg font-bold text-slate-900">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Card className="surface-card p-2 lg:p-3">
          <CardHeader className="flex flex-col items-start gap-4 px-6 pb-6 pt-8 sm:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">
              <UserPlus size={14} />
              Student Registration
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Create your account</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">Register once and use Talora to manage your academic groups.</p>
            </div>
          </CardHeader>

          <CardBody className="px-6 pb-8 sm:px-8">
            {success ? (
              <div className="flex flex-col items-center text-center space-y-4 py-8">
                <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Registration Successful!</h2>
                <p className="text-sm text-slate-600">{success}</p>
                <Progress
                  size="sm"
                  isIndeterminate
                  className="mt-4 max-w-xs"
                  color="success"
                  label="Redirecting to login..."
                />
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSignup}>
                {error && (
                  <div className="flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  <Input
                    name="fullName"
                    label="Full Name"
                    placeholder="e.g. John Doe"
                    variant="bordered"
                    isRequired
                    startContent={<User className="text-gray-400" size={18} />}
                    value={formData.fullName}
                    onValueChange={(v) => setFormData({...formData, fullName: v})}
                    classNames={{ label: "text-slate-700 font-medium", inputWrapper: "bg-white/80 hover:border-indigo-400 focus-within:!border-indigo-600" }}
                  />

                  <Input
                    name="email"
                    type="email"
                    label="Gmail Address"
                    placeholder="yourname@gmail.com"
                    variant="bordered"
                    isRequired
                    startContent={<Mail className="text-gray-400" size={18} />}
                    value={formData.email}
                    onValueChange={(v) => setFormData({...formData, email: v})}
                    classNames={{ label: "text-slate-700 font-medium", inputWrapper: "bg-white/80 hover:border-indigo-400 focus-within:!border-indigo-600" }}
                  />

                  <Input
                    name="studentId"
                    label="Student No."
                    placeholder="25007XXXXX"
                    variant="bordered"
                    isRequired
                    startContent={<CreditCard className="text-gray-400" size={18} />}
                    value={formData.studentId}
                    onValueChange={(v) => setFormData({...formData, studentId: v})}
                    classNames={{ label: "text-slate-700 font-medium", inputWrapper: "bg-white/80 hover:border-indigo-400 focus-within:!border-indigo-600" }}
                  />

                  <Input
                    name="password"
                    type="password"
                    label="Password"
                    placeholder="Create a strong password"
                    variant="bordered"
                    isRequired
                    startContent={<Lock className="text-gray-400" size={18} />}
                    value={formData.password}
                    onValueChange={(v) => setFormData({...formData, password: v})}
                    classNames={{ label: "text-slate-700 font-medium", inputWrapper: "bg-white/80 hover:border-indigo-400 focus-within:!border-indigo-600" }}
                  />

                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-amber-100 p-2 text-amber-600">
                        <GraduationCap size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Retake Student?</p>
                        <p className="text-xs text-slate-500">Enable if repeating this unit</p>
                      </div>
                    </div>
                    <Switch
                      isSelected={formData.isRetake}
                      onValueChange={(v) => setFormData({...formData, isRetake: v})}
                      color="warning"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  color="primary"
                  className="mt-2 h-12 w-full rounded-xl bg-emerald-600 text-base font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700"
                  isLoading={loading}
                  startContent={!loading && <UserPlus size={20} />}
                >
                  Create Account
                </Button>

                <div className="pt-2 text-center">
                  <span className="text-sm text-slate-500">Already have an account? </span>
                  <Link href="/login" className="text-sm font-bold text-indigo-600 hover:underline underline-offset-4">
                    Sign in
                  </Link>
                </div>
              </form>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}
