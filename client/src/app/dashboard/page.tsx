'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Skeleton,
  Divider,
  Chip,
  User,
  Progress,
  Tabs,
  Tab,
  Badge
} from "@heroui/react";
import {
  Users,
  FileUp,
  ArrowLeftRight,
  Calendar,
  AlertCircle,
  Plus,
  BookOpen,
  Clock,
  CheckCircle2,
  LayoutDashboard,
  ClipboardList,
  MessageSquare,
  Search,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from '@/lib/api';
import MainNavbar from '@/components/MainNavbar';
import SwapRequestModal from '@/components/SwapRequestModal';
import SubmissionModal from '@/components/SubmissionModal';
import SwapInbox from '@/components/SwapInbox';
import ApplicationManager from '@/components/ApplicationManager';
import TemplateConfig from '@/components/TemplateConfig';
import Timetable from '@/components/Timetable';
import ComplaintsPortal from '@/components/ComplaintsPortal';
import VacancyFinder from '@/components/VacancyFinder';
import DirectAddMember from '@/components/DirectAddMember';

const timeToneClasses = {
  danger: 'bg-rose-50 text-rose-700 ring-rose-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
} as const;

export default function DashboardPage() {
  const [memberships, setMemberships] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isDirectAddOpen, setIsDirectAddOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const fetchData = async () => {
    try {
      const [groupsRes, coursesRes] = await Promise.all([
        api.get('/groups/my-groups'),
        api.get('/courses')
      ]);
      setMemberships(groupsRes.data);
      setAllCourses(coursesRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    fetchData();
  }, [router]);

  const handleSubmitClick = (group: any) => {
    setSelectedGroup(group);
    setIsSubmitModalOpen(true);
  };

  const handleDirectAddClick = (group: any) => {
    setSelectedGroup(group);
    setIsDirectAddOpen(true);
  };

  const handleAutoAssign = async (courseId: string) => {
    try {
      await api.post('/groups/auto-assign', { courseUnitId: courseId });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Auto-assignment failed');
    }
  };

  const getTimeRemaining = (deadline: string | null) => {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - new Date().getTime();
    if (diff <= 0) return { label: 'Deadline Passed', color: 'danger' as const, percent: 100 };
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const percent = Math.max(0, 100 - (days / 14) * 100);
    if (days <= 2) return { label: `${days}d left`, color: 'danger' as const, percent };
    if (days <= 5) return { label: `${days}d left`, color: 'warning' as const, percent };
    return { label: `${days}d left`, color: 'success' as const, percent };
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <MainNavbar />
      <div className="max-w-[1320px] mx-auto px-4 py-8">
        <Skeleton className="h-48 rounded-3xl mb-8" />
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-3xl" />)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-shell min-h-screen pb-12">
      <MainNavbar />

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mx-auto max-w-[1320px] px-4 py-8 lg:px-8"
      >
        <div className="page-surface mb-8 p-6 sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">University Dashboard</h1>
              <p className="text-slate-500 font-medium mt-1">Welcome back, {user?.fullName}</p>
            </div>
            <Chip
              variant="shadow"
              color={user?.role === 'class_rep' ? 'secondary' : user?.role === 'group_leader' ? 'primary' : 'default'}
              className="font-bold uppercase tracking-widest text-[10px]"
            >
              {user?.role?.replace('_', ' ')}
            </Chip>
          </div>
        </div>

        <Tabs
          aria-label="Dashboard Sections"
          variant="underlined"
          color="primary"
          classNames={{
            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
            cursor: "w-full bg-indigo-600",
            tab: "max-w-fit px-0 h-12",
            tabContent: "group-data-[selected=true]:text-indigo-600 font-bold"
          }}
        >
          <Tab
            key="overview"
            title={
              <div className="flex items-center gap-2">
                <LayoutDashboard size={18} />
                <span>My Groups</span>
              </div>
            }
          >
            <div className="pt-8 space-y-12">
              <SwapInbox />

              <div>
                <div className="flex items-center gap-3 mb-6">
                   <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                      <Users size={18} />
                   </div>
                   <h2 className="text-xl font-black text-slate-900">Active Memberships</h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {memberships.map((item, index) => {
                    const timeInfo = getTimeRemaining(item.group.courseUnit.submissionDeadline);
                    const toneClass = timeInfo ? timeToneClasses[timeInfo.color] : '';
                    const isLeader = item.group.leaderId === user?.id;

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="group rounded-[32px] border-none shadow-sm hover:shadow-xl transition-all duration-300">
                          <CardHeader className="flex justify-between items-start p-6 bg-gradient-to-br from-indigo-50/50 to-white">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1">
                                {item.group.courseUnit.code}
                              </span>
                              <h3 className="text-lg font-bold text-slate-800 leading-tight">
                                {item.group.courseUnit.title}
                              </h3>
                            </div>
                            <Chip variant="flat" color="primary" size="sm" className="font-bold border-indigo-100">
                              Group #{item.group.groupNumber}
                            </Chip>
                          </CardHeader>
                          <Divider />
                          <CardBody className="p-6">
                            {timeInfo && (
                              <div className="mb-8">
                                <div className="flex justify-between items-end mb-2">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deadline</span>
                                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-black ring-1 uppercase ${toneClass}`}>
                                    {timeInfo.label}
                                  </span>
                                </div>
                                <Progress value={timeInfo.percent} color={timeInfo.color} size="sm" className="h-1.5" />
                              </div>
                            )}

                            <div className="space-y-4">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Team</p>
                              {item.group.memberships?.map((m: any) => (
                                <div key={m.user.studentId} className="flex items-center justify-between">
                                  <User
                                    name={m.user.fullName}
                                    description={m.user.studentId}
                                    avatarProps={{
                                      size: "sm",
                                      src: `https://i.pravatar.cc/150?u=${m.user.studentId}`,
                                      isBordered: item.group.leaderId === m.user.id,
                                      color: item.group.leaderId === m.user.id ? "primary" : "default"
                                    }}
                                  />
                                  {m.isRetake && <Chip size="sm" variant="flat" color="warning" className="h-5 text-[9px] font-bold">RETAKE</Chip>}
                                </div>
                              ))}
                            </div>

                            <div className="mt-8 grid grid-cols-1 gap-2">
                              {isLeader && (
                                <Button
                                  size="sm"
                                  color="primary"
                                  className="font-bold bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 h-10"
                                  startContent={<FileUp size={18} />}
                                  onClick={() => handleSubmitClick(item.group)}
                                >
                                  Submit Assignment
                                </Button>
                              )}
                              <div className="grid grid-cols-2 gap-2">
                                {isLeader && (
                                  <Button
                                    size="sm"
                                    variant="flat"
                                    color="primary"
                                    className="font-bold rounded-2xl h-10"
                                    startContent={<Plus size={18} />}
                                    onClick={() => handleDirectAddClick(item.group)}
                                  >
                                    Add Member
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="flat"
                                  color="secondary"
                                  className={`font-bold rounded-2xl h-10 ${!isLeader ? 'col-span-2' : ''}`}
                                  startContent={<MessageSquare size={18} />}
                                  onClick={() => window.open(item.group.whatsappLink, '_blank')}
                                  isDisabled={!item.group.whatsappLink}
                                >
                                  WhatsApp
                                </Button>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Tab>

          {(user?.role === 'group_leader' || user?.role === 'class_rep') && (
            <Tab
              key="management"
              title={
                <div className="flex items-center gap-2">
                  <Settings size={18} />
                  <span>Leader Tools</span>
                </div>
              }
            >
              <div className="pt-8 space-y-12">
                <div>
                   <div className="flex items-center gap-3 mb-6">
                      <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                         <ClipboardList size={18} />
                      </div>
                      <h2 className="text-xl font-black text-slate-900">Application Requests</h2>
                   </div>
                   <ApplicationManager />
                </div>

                <TemplateConfig />
              </div>
            </Tab>
          )}

          <Tab
            key="finder"
            title={
              <div className="flex items-center gap-2">
                <Search size={18} />
                <span>Find Groups</span>
              </div>
            }
          >
            <div className="pt-8">
              <VacancyFinder />
            </div>
          </Tab>

          <Tab
            key="timetable"
            title={
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>Timetable</span>
              </div>
            }
          >
            <div className="pt-8">
              <Timetable />
            </div>
          </Tab>

          <Tab
            key="support"
            title={
              <div className="flex items-center gap-2">
                <AlertCircle size={18} />
                <span>Support</span>
              </div>
            }
          >
            <div className="pt-8">
              <ComplaintsPortal />
            </div>
          </Tab>
        </Tabs>
      </motion.main>

      {selectedGroup && (
        <>
          <SubmissionModal
            isOpen={isSubmitModalOpen}
            onClose={() => setIsSubmitModalOpen(false)}
            groupId={selectedGroup.id}
            courseCode={selectedGroup.courseUnit.code}
          />
          <DirectAddMember
            isOpen={isDirectAddOpen}
            onClose={() => setIsDirectAddOpen(false)}
            groupId={selectedGroup.id}
            courseCode={selectedGroup.courseUnit.code}
            onSuccess={fetchData}
          />
        </>
      )}
    </div>
  );
}
