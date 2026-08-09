'use client';

import { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input
} from "@heroui/react";
import { Calendar } from "lucide-react";
import api from '@/lib/api';

interface SetDeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: any;
  onSuccess: () => void;
}

export default function SetDeadlineModal({ isOpen, onClose, course, onSuccess }: SetDeadlineModalProps) {
  const [deadline, setDeadline] = useState(course?.submissionDeadline ? new Date(course.submissionDeadline).toISOString().slice(0, 16) : '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/admin/set-deadline', {
        courseUnitId: course.id,
        deadline
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      alert('Failed to update deadline');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} backdrop="blur">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Update Submission Deadline</ModalHeader>
            <ModalBody className="py-4">
              <p className="text-sm text-gray-500 mb-4">Setting deadline for <span className="font-bold text-gray-800">{course?.code}</span></p>
              <Input
                type="datetime-local"
                label="New Deadline"
                variant="bordered"
                value={deadline}
                onValueChange={setDeadline}
                startContent={<Calendar size={18} className="text-gray-400" />}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>Cancel</Button>
              <Button color="primary" className="bg-indigo-600 font-bold" isLoading={loading} onClick={handleSubmit}>
                Save Deadline
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
