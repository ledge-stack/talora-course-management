'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button, Input, Textarea, Chip, Divider, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { MessageSquare, Plus, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import api from '@/lib/api';

export default function ComplaintsPortal() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ subject: "", description: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/complaints/my');
      setComplaints(response.data);
    } catch (err) {
      console.error('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmit = async () => {
    if (!formData.subject || !formData.description) return;
    setSubmitting(true);
    try {
      await api.post('/complaints', formData);
      setIsOpen(false);
      setFormData({ subject: "", description: "" });
      fetchComplaints();
    } catch (err) {
      alert('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'danger';
      case 'in_review': return 'warning';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  if (loading) return <Spinner color="primary" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3 text-slate-900">
           <MessageSquare size={24} />
           <h2 className="text-xl font-black">My Complaints & Feedback</h2>
        </div>
        <Button
          color="primary"
          startContent={<Plus size={18} />}
          className="font-bold bg-indigo-600 shadow-lg shadow-indigo-100 rounded-xl"
          onClick={() => setIsOpen(true)}
        >
          File New Complaint
        </Button>
      </div>

      <div className="grid gap-4">
        {complaints.map((c) => (
          <Card key={c.id} className="border-none shadow-sm rounded-2xl">
            <CardBody className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                   <h3 className="font-bold text-slate-800">{c.subject}</h3>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                     Filed {new Date(c.createdAt).toLocaleDateString()}
                   </span>
                </div>
                <Chip size="sm" variant="flat" color={getStatusColor(c.status)} className="font-bold uppercase text-[9px]">
                  {c.status.replace('_', ' ')}
                </Chip>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">{c.description}</p>
            </CardBody>
          </Card>
        ))}

        {complaints.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 text-center">
             <CheckCircle2 className="text-emerald-300 mb-2" size={40} />
             <p className="text-sm font-bold text-slate-400">Everything looks great! No issues reported.</p>
          </div>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} backdrop="blur">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-2 text-indigo-600">
                 <AlertCircle size={20} />
                 <span>New Support Ticket</span>
              </ModalHeader>
              <ModalBody className="space-y-4">
                <Input
                  label="Subject"
                  placeholder="Summary of the issue"
                  variant="bordered"
                  value={formData.subject}
                  onValueChange={(v) => setFormData({...formData, subject: v})}
                  classNames={{ inputWrapper: "rounded-xl" }}
                />
                <Textarea
                  label="Description"
                  placeholder="Provide details for the Class Representative"
                  variant="bordered"
                  minRows={4}
                  value={formData.description}
                  onValueChange={(v) => setFormData({...formData, description: v})}
                  classNames={{ inputWrapper: "rounded-xl" }}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose} className="font-bold">Cancel</Button>
                <Button
                  color="primary"
                  className="bg-indigo-600 font-bold"
                  isLoading={submitting}
                  onClick={handleSubmit}
                >
                  Submit Complaint
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
