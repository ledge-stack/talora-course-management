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
  Switch
} from "@heroui/react";
import { Plus, BookOpen, Users, Hash } from "lucide-react";
import api from '@/lib/api';

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCourseModal({ isOpen, onClose, onSuccess }: AddCourseModalProps) {
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    minGroupSize: '1',
    maxGroupSize: '5',
    allowsSwaps: true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/admin/course', formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} backdrop="blur">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center gap-2">
              <Plus className="text-indigo-600" />
              <span>Create New Course Unit</span>
            </ModalHeader>
            <ModalBody className="space-y-4 py-4">
              <Input
                label="Course Code"
                placeholder="e.g. CS202"
                variant="bordered"
                startContent={<Hash size={18} className="text-gray-400" />}
                value={formData.code}
                onValueChange={(v) => setFormData({...formData, code: v})}
              />
              <Input
                label="Course Title"
                placeholder="e.g. Operating Systems"
                variant="bordered"
                startContent={<BookOpen size={18} className="text-gray-400" />}
                value={formData.title}
                onValueChange={(v) => setFormData({...formData, title: v})}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Min Size"
                  variant="bordered"
                  value={formData.minGroupSize}
                  onValueChange={(v) => setFormData({...formData, minGroupSize: v})}
                />
                <Input
                  type="number"
                  label="Max Size"
                  variant="bordered"
                  value={formData.maxGroupSize}
                  onValueChange={(v) => setFormData({...formData, maxGroupSize: v})}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-xl">
                <span className="text-sm font-medium text-gray-700">Allow Group Swaps</span>
                <Switch
                  isSelected={formData.allowsSwaps}
                  onValueChange={(v) => setFormData({...formData, allowsSwaps: v})}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>Cancel</Button>
              <Button color="primary" className="bg-indigo-600 font-bold" isLoading={loading} onClick={handleSubmit}>
                Create Course
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
