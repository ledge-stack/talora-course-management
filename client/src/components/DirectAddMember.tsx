'use client';

import { useState } from 'react';
import { Card, CardBody, Input, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { UserPlus, Search, Hash } from "lucide-react";
import api from '@/lib/api';

interface DirectAddMemberProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  courseCode: string;
  onSuccess: () => void;
}

export default function DirectAddMember({ isOpen, onClose, groupId, courseCode, onSuccess }: DirectAddMemberProps) {
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      await api.post('/groups/add-member', { groupId, targetStudentId: studentId });
      onSuccess();
      onClose();
      setStudentId("");
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} backdrop="blur">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-indigo-600">
                <UserPlus size={20} />
                <span>Direct Member Addition</span>
              </div>
              <p className="text-xs font-normal text-gray-500">Adding to {courseCode} team</p>
            </ModalHeader>
            <ModalBody>
              <Input
                label="Student ID"
                placeholder="Enter exact student number"
                variant="bordered"
                startContent={<Hash size={18} className="text-gray-400" />}
                value={studentId}
                onValueChange={setStudentId}
                classNames={{ inputWrapper: "rounded-xl" }}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose} className="font-bold">Cancel</Button>
              <Button
                color="primary"
                className="bg-indigo-600 font-bold shadow-lg shadow-indigo-100"
                isLoading={loading}
                onClick={handleAdd}
              >
                Add to Group
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
