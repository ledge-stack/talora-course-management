'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  User,
  Divider
} from "@heroui/react";
import { ArrowLeftRight, Users } from "lucide-react";
import api from '@/lib/api';

interface MoveStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: any;
  onSuccess: () => void;
}

export default function MoveStudentModal({ isOpen, onClose, course, onSuccess }: MoveStudentModalProps) {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedToGroup, setSelectedToGroup] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && course) {
      fetchMembers();
    }
  }, [isOpen, course]);

  const fetchMembers = async () => {
    try {
      const response = await api.get(`/admin/course/${course.id}/members`);
      setGroups(response.data);
    } catch (err) {
      console.error('Failed to fetch members');
    }
  };

  const allMembers = groups.flatMap(g =>
    g.memberships.map((m: any) => ({
      ...m.user,
      groupId: g.id,
      groupNumber: g.groupNumber
    }))
  );

  const handleMove = async () => {
    if (!selectedUser || !selectedToGroup) return;

    const userObj = allMembers.find(m => m.id.toString() === selectedUser);
    if (!userObj) return;

    setLoading(true);
    try {
      await api.post('/admin/move-student', {
        userId: parseInt(selectedUser),
        fromGroupId: userObj.groupId,
        toGroupId: parseInt(selectedToGroup)
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Move failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} backdrop="blur" size="lg">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center gap-2">
              <ArrowLeftRight className="text-orange-500" />
              <span>Manual Student Relocation</span>
            </ModalHeader>
            <ModalBody className="py-4 space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">1. Select Student</label>
                <Select
                  placeholder="Choose a student from this course"
                  variant="bordered"
                  selectedKeys={selectedUser ? [selectedUser] : []}
                  onSelectionChange={(keys) => setSelectedUser(Array.from(keys)[0] as string)}
                >
                  {allMembers.map((m) => (
                    <SelectItem key={m.id.toString()} textValue={m.fullName}>
                      <div className="flex items-center gap-2">
                        <User
                          name={m.fullName}
                          description={`Group ${m.groupNumber}`}
                          avatarProps={{ size: "sm", src: `https://i.pravatar.cc/150?u=${m.studentId}` }}
                        />
                      </div>
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">2. Target Destination</label>
                <Select
                  placeholder="Select target group"
                  variant="bordered"
                  selectedKeys={selectedToGroup ? [selectedToGroup] : []}
                  onSelectionChange={(keys) => setSelectedToGroup(Array.from(keys)[0] as string)}
                >
                  {groups.map((g) => (
                    <SelectItem key={g.id.toString()} textValue={`Group ${g.groupNumber}`}>
                      <div className="flex items-center justify-between w-full">
                        <span>Group {g.groupNumber}</span>
                        <span className="text-[10px] text-gray-400">{g.memberships.length} members</span>
                      </div>
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>Cancel</Button>
              <Button color="warning" className="font-bold" isLoading={loading} onClick={handleMove}>
                Relocate Student
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
