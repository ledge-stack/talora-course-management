'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Input, Button, Chip, User, Divider, Spinner } from "@heroui/react";
import { Users, Plus, X, Save, ShieldCheck } from "lucide-react";
import api from '@/lib/api';

export default function TemplateConfig() {
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setLoadingSaving] = useState(false);
  const [newStudentId, setNewStudentId] = useState("");

  const fetchTemplate = async () => {
    try {
      const response = await api.get('/groups/template');
      setTemplate(response.data);
    } catch (err) {
      console.error('Failed to fetch template');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplate();
  }, []);

  const handleSave = async () => {
    setLoadingSaving(true);
    try {
      await api.post('/groups/template', {
        templateName: template?.templateName || "My Default Team",
        memberIds: template?.members?.map((m: any) => m.userId) || []
      });
      alert('Template saved successfully!');
    } catch (err) {
      alert('Save failed');
    } finally {
      setLoadingSaving(false);
    }
  };

  const addByStudentId = async () => {
    if (!newStudentId) return;
    try {
      // Find student by ID (this endpoint should be available in a real app, assuming it returns user obj)
      const response = await api.get(`/auth/student/${newStudentId}`);
      const user = response.data;

      const members = template?.members || [];
      if (members.find((m: any) => m.userId === user.id)) return;

      setTemplate({
        ...template,
        members: [...members, { userId: user.id, fullName: user.fullName, studentId: user.studentId }]
      });
      setNewStudentId("");
    } catch (err) {
      alert('Student not found');
    }
  };

  const removeMember = (userId: string) => {
    setTemplate({
      ...template,
      members: template.members.filter((m: any) => m.userId !== userId)
    });
  };

  if (loading) return <Spinner color="primary" />;

  return (
    <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
      <CardHeader className="flex flex-col items-start gap-4 p-6 sm:p-8 bg-gradient-to-br from-indigo-50/50 to-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">Default Team Template</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Auto-populate new course groups</p>
          </div>
        </div>
      </CardHeader>
      <Divider />
      <CardBody className="p-6 sm:p-8">
        <div className="space-y-6">
          <Input
            label="Template Name"
            placeholder="e.g. The Dream Team"
            variant="bordered"
            value={template?.templateName || ""}
            onValueChange={(v) => setTemplate({ ...template, templateName: v })}
            classNames={{ inputWrapper: "rounded-2xl" }}
          />

          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Core Members</p>
            <div className="space-y-3">
              {template?.members?.map((m: any) => (
                <div key={m.userId} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                   <User
                     name={m.fullName}
                     description={m.studentId}
                     avatarProps={{ size: "sm", src: `https://i.pravatar.cc/150?u=${m.studentId}` }}
                   />
                   <Button isIconOnly size="sm" variant="light" color="danger" onClick={() => removeMember(m.userId)}>
                     <X size={16} />
                   </Button>
                </div>
              ))}
              {(!template?.members || template.members.length === 0) && (
                <p className="text-sm text-slate-400 italic text-center py-4">No members added yet.</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Add member by Student ID"
              variant="bordered"
              size="sm"
              value={newStudentId}
              onValueChange={setNewStudentId}
              classNames={{ inputWrapper: "rounded-xl" }}
            />
            <Button color="primary" variant="flat" isIconOnly onClick={addByStudentId}>
              <Plus size={20} />
            </Button>
          </div>

          <Button
            color="primary"
            className="w-full h-12 font-bold bg-indigo-600 shadow-lg shadow-indigo-100 rounded-2xl"
            startContent={<Save size={20} />}
            isLoading={saving}
            onClick={handleSave}
          >
            Save Template Config
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
