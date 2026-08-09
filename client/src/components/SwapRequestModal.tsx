'use client';

import { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Alert
} from "@heroui/react";
import { ArrowLeftRight, User, Hash, AlertCircle, CheckCircle2 } from "lucide-react";
import api from '@/lib/api';

interface SwapRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseUnitId: number;
  myGroupId: number;
  courseCode: string;
}

export default function SwapRequestModal({ isOpen, onClose, courseUnitId, myGroupId, courseCode }: SwapRequestModalProps) {
  const [targetUserId, setTargetUserId] = useState('');
  const [targetGroupId, setTargetGroupId] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'danger' | null, message: string }>({ type: null, message: '' });

  const handleSubmit = async () => {
    if (!targetUserId || !targetGroupId) return;

    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      await api.post('/groups/swap-request', {
        courseUnitId,
        requesterGroupId: myGroupId,
        targetUserId: parseInt(targetUserId),
        targetGroupId: parseInt(targetGroupId),
      });
      setStatus({ type: 'success', message: 'Swap request sent successfully! Waiting for peer approval.' });
      setTimeout(onClose, 3000);
    } catch (err: any) {
      setStatus({ type: 'danger', message: err.response?.data?.message || 'Failed to send request' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      backdrop="blur"
      className="max-w-md"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-indigo-600">
                <ArrowLeftRight size={20} />
                <span>Group Swap Request</span>
              </div>
              <p className="text-xs font-normal text-gray-500">Initiate a swap for {courseCode}</p>
            </ModalHeader>
            <ModalBody className="py-6">
              {status.type && (
                <div className={`flex items-center gap-2 p-3 text-sm rounded-lg mb-4 ${
                  status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
                  {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{status.message}</span>
                </div>
              )}

              <div className="space-y-4">
                <Input
                  type="number"
                  label="Target Student DB ID"
                  placeholder="Enter peer's internal ID"
                  variant="bordered"
                  startContent={<User size={18} className="text-gray-400" />}
                  value={targetUserId}
                  onValueChange={setTargetUserId}
                  description="Ask your peer for their internal ID from their profile."
                />
                <Input
                  type="number"
                  label="Target Group ID"
                  placeholder="Enter their group's internal ID"
                  variant="bordered"
                  startContent={<Hash size={18} className="text-gray-400" />}
                  value={targetGroupId}
                  onValueChange={setTargetGroupId}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose} className="font-bold">
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleSubmit}
                isLoading={loading}
                className="font-bold bg-indigo-600"
              >
                Send Request
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
