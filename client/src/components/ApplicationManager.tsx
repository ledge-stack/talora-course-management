'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button, Avatar, Chip, Badge, Spinner } from "@heroui/react";
import { Check, X, Users, AlertCircle, Clock } from "lucide-react";
import api from '@/lib/api';

export default function ApplicationManager() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/groups/applications/pending');
      setApplications(response.data);
    } catch (err) {
      console.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleAction = async (applicationId: string, status: 'approved' | 'rejected') => {
    try {
      await api.post(`/groups/application/${applicationId}/respond`, { status });
      fetchApplications();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  if (loading) return <Spinner color="primary" />;

  if (applications.length === 0) return (
    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
       <Users className="text-slate-300 mb-2" size={40} />
       <p className="text-sm font-bold text-slate-400">No pending applications</p>
    </div>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {applications.map((app) => (
        <Card key={app.id} className="border-none shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden">
          <CardBody className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <Avatar
                  src={`https://i.pravatar.cc/150?u=${app.applicant.studentId}`}
                  className="w-12 h-12 rounded-xl"
                  isBordered
                  color={app.applicant.isRetake ? "warning" : "primary"}
                />
                <div>
                  <p className="text-sm font-black text-slate-900">{app.applicant.fullName}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{app.applicant.studentId}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Chip size="sm" variant="flat" color="primary" className="font-bold text-[9px]">
                  {app.group.courseUnit.code}
                </Chip>
                {app.applicant.isRetake && (
                  <Chip size="sm" variant="shadow" color="warning" className="font-bold text-[9px] h-5">RETAKE</Chip>
                )}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <Clock size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
              </div>
              <div className="text-[10px] font-bold text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
                GROUP #{app.group.groupNumber}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                color="primary"
                className="flex-1 font-bold bg-indigo-600 shadow-lg shadow-indigo-100 rounded-xl"
                startContent={<Check size={16} />}
                onClick={() => handleAction(app.id, 'approved')}
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="flat"
                color="danger"
                className="flex-1 font-bold rounded-xl"
                startContent={<X size={16} />}
                onClick={() => handleAction(app.id, 'rejected')}
              >
                Decline
              </Button>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
