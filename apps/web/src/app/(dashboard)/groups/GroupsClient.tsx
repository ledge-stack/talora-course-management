'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ClassSettingsModal from './ClassSettingsModal';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'sonner';
import { ConfirmModal, PromptModal } from '@/components/ui/Modals';

type Group = {
  id: string;
  name: string;
  leader: string;
  leaderId: string;
  membersCount: number;
  status: string;
  capacity: number;
  isOpen: boolean;
};

type PendingRequest = {
  id: string;
  groupId: string;
  targetGroupId?: string | null;
  groupLeaderId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  reason: string;
};

export default function GroupsClient({ 
  groups,
  isUserInGroup,
  userGroupId,
  currentUserId,
  isRep,
  offeringId,
  pendingRequests = [],
  minGroupSize,
  maxGroupSize
}: { 
  groups: Group[],
  isUserInGroup?: boolean,
  userGroupId?: string | null,
  currentUserId?: string,
  isRep?: boolean,
  offeringId?: string,
  pendingRequests?: PendingRequest[],
  minGroupSize?: number,
  maxGroupSize?: number
}) {
  const router = useRouter();
  const [promptState, setPromptState] = useState<{ isOpen: boolean; title: string; description?: string; onSubmit: (val: string) => void; }>({ isOpen: false, title: '', onSubmit: () => {} });
  const [confirmState, setConfirmState] = useState<{ isOpen: boolean; title: string; description?: string; onConfirm: () => void; destructive?: boolean; }>({ isOpen: false, title: '', onConfirm: () => {} });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showRequestsFor, setShowRequestsFor] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showRenameGroup, setShowRenameGroup] = useState<{ id: string, name: string } | null>(null);
  const [newGroupName, setNewGroupName] = useState('');

  const [showMembersGroup, setShowMembersGroup] = useState<string | null>(null);
  const [groupMembers, setGroupMembers] = useState<{ id: string, fullName: string, studentNumber: string, isLeader: boolean }[]>([]);

  const [showTransferLeadership, setShowTransferLeadership] = useState<string | null>(null);

  const [showUngrouped, setShowUngrouped] = useState(false);
  const [ungroupedStudents, setUngroupedStudents] = useState<any[]>([]);
  const [selectedGroupForStudent, setSelectedGroupForStudent] = useState<Record<string, string>>({});

  const filteredGroups = groups.filter(g => {
    const matchesSearch = 
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      g.leader.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' ? true : g.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleFetchUngrouped = async () => {
    if (!offeringId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/offerings/${offeringId}/students/ungrouped`);
      const data = await res.json();
      if (!res.ok) throw new Error('Failed to fetch ungrouped students');
      setUngroupedStudents(data.data);
      setShowUngrouped(true);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForceAssign = async (studentId: string, groupId: string) => {
    if (!groupId) return toast.error('Select a group first');
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      });
      if (!res.ok) {
         const data = await res.json();
         throw new Error(data.message || 'Failed to assign');
      }
      // Refresh list locally
      setUngroupedStudents(prev => prev.filter(s => s.id !== studentId));
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoAssign = async () => {
    if (!offeringId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/v1/groups/auto-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offeringId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to auto-assign');
      toast.error(data.message);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId: string, e: React.MouseEvent, isOpen: boolean) => {
    e.stopPropagation();
    
    if (!isOpen) {
      setPromptState({
        isOpen: true,
        title: 'Request to Join',
        description: 'This group is Invite Only. Please provide a reason for requesting to join (or transfer):',
        onSubmit: async (reason) => {
          setLoading(true);
          try {
            const res = await fetch(`/api/v1/group-change-requests`, { 
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                groupId: userGroupId ? userGroupId : groupId, 
                targetGroupId: userGroupId ? groupId : null, 
                reason 
              })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to send request');
            toast.success("Request sent successfully.");
            router.refresh();
          } catch (err: any) {
            toast.error(err.message);
          } finally {
            setLoading(false);
          }
        }
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/v1/groups/${groupId}/members`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to join group');
      toast.success('Joined group successfully.');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOpen = async (groupId: string, currentIsOpen: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/v1/groups/${groupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOpen: !currentIsOpen })
      });
      if (!res.ok) throw new Error('Failed to toggle open status');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAddByStudentNumber = async (groupId: string) => {
    setPromptState({
      isOpen: true,
      title: 'Add Student',
      description: 'Enter the student number to add to this group:',
      onSubmit: async (studentNumber) => {
        setLoading(true);
        try {
          const res = await fetch(`/api/v1/groups/${groupId}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentNumber })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to add student');
          toast.success('Student added successfully!');
          router.refresh();
        } catch (err: any) {
          toast.error(err.message);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleProcessRequest = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/group-change-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to process request');
      
      const remainingForGroup = pendingRequests.filter(r => r.id !== requestId && (r.targetGroupId || r.groupId) === showRequestsFor);
      if (remainingForGroup.length === 0) {
        setShowRequestsFor(null);
      }
      
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    setConfirmState({
      isOpen: true,
      title: 'Leave Group',
      description: 'Are you sure you want to leave this group?',
      destructive: true,
      onConfirm: async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/v1/groups/${groupId}/members/${currentUserId}`, {
            method: 'DELETE'
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to leave group');
          router.refresh();
        } catch (err: any) {
          toast.error(err.message);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleRemoveMember = async (groupId: string, memberId: string) => {
    setConfirmState({
      isOpen: true,
      title: 'Remove Member',
      description: 'Are you sure you want to remove this member from the group?',
      destructive: true,
      onConfirm: async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/v1/groups/${groupId}/members/${memberId}`, {
            method: 'DELETE'
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to remove member');
          setGroupMembers(prev => prev.filter(m => m.id !== memberId));
          router.refresh();
        } catch (err: any) {
          toast.error(err.message);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRenameGroup || !newGroupName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/groups/${showRenameGroup.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName })
      });
      if (!res.ok) throw new Error('Failed to rename group');
      setShowRenameGroup(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLockGroup = async (groupId: string) => {
    setConfirmState({
      isOpen: true,
      title: 'Lock Group',
      description: 'Lock this group? Students will no longer be able to join.',
      destructive: true,
      onConfirm: async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/v1/groups/${groupId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isLocked: true })
          });
          if (!res.ok) throw new Error('Failed to lock group');
          router.refresh();
        } catch (err: any) {
          toast.error(err.message);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleFetchMembers = async (groupId: string, mode: 'view' | 'transfer') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/groups/${groupId}/members/list`);
      const data = await res.json();
      if (!res.ok) throw new Error('Failed to fetch members');
      setGroupMembers(data.data);
      if (mode === 'view') setShowMembersGroup(groupId);
      if (mode === 'transfer') setShowTransferLeadership(groupId);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTransferLeadership = async (newLeaderId: string) => {
    if (!showTransferLeadership) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/groups/${showTransferLeadership}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaderId: newLeaderId })
      });
      if (!res.ok) throw new Error('Failed to transfer leadership');
      setShowTransferLeadership(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex-1 flex flex-col overflow-visible">
        <div className="toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
            <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '150px' }}>
              <svg style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input 
                type="text" 
                placeholder="Search groups..." 
                className="input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.5rem', width: '100%' }}
              />
            </div>
            
            <select 
              className="select" 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ flex: '0 0 auto', minWidth: '140px' }}
            >
              <option value="all">All Statuses</option>
              <option value="FORMING">Forming</option>
              <option value="COMPLETE">Complete</option>
              <option value="INCOMPLETE">Incomplete</option>
              <option value="LOCKED">Locked</option>
            </select>

            {isRep && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button 
                  className="btn-secondary" 
                  onClick={handleFetchUngrouped}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  disabled={loading}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  Assign Ungrouped
                </button>
                <button 
                  className="btn-ghost" 
                  onClick={() => setShowSettingsModal(true)}
                  style={{ padding: '0 0.75rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center' }}
                  title="Class Group Restrictions"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                </button>
              </div>
            )}

            {!isUserInGroup && currentUserId && (
              <button 
                className="btn-primary" 
                onClick={handleAutoAssign}
                disabled={loading}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                Auto-Assign Me
              </button>
            )}
          </div>
        </div>

        <div className="hidden lg:block bg-bg-surface border border-border-subtle rounded-xl overflow-x-auto shadow-sm mt-4 mb-16">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-border-subtle bg-bg-surface-hover/30">
                <th className="py-4 px-6 font-semibold text-sm text-text-secondary w-1/4">Group Name</th>
                <th className="py-4 px-6 font-semibold text-sm text-text-secondary w-1/4">Leader</th>
                <th className="py-4 px-6 font-semibold text-sm text-text-secondary w-1/5">Members</th>
                <th className="py-4 px-6 font-semibold text-sm text-text-secondary w-[15%]">Status</th>
                <th className="py-4 px-6 font-semibold text-sm text-text-secondary text-right w-[15%]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-text-muted">
                    No groups match your current filters.
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group) => {
                  const groupRequests = pendingRequests.filter(r => (r.targetGroupId || r.groupId) === group.id);
                  const canManage = isRep || currentUserId === group.leaderId;
                  const isOwnGroup = userGroupId === group.id;

                  return (
                    <tr key={group.id} className={`border-b border-border-subtle hover:bg-bg-surface-hover/50 transition-colors ${isOwnGroup ? 'bg-primary/5' : ''}`}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 font-medium text-text-primary">
                          {group.name}
                          {isOwnGroup && <Badge variant="success">Your Group</Badge>}
                          
                          {canManage ? (
                            <button 
                              onClick={(e) => handleToggleOpen(group.id, group.isOpen, e)}
                              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${group.isOpen ? 'text-primary border-primary/30 bg-primary/10' : 'text-text-muted border-border-subtle hover:bg-bg-surface-hover'}`}
                              title="Click to toggle group open/closed"
                            >
                              {group.isOpen ? 'Open' : 'Invite Only'}
                            </button>
                          ) : (
                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${group.isOpen ? 'text-primary border-primary/30 bg-primary/10' : 'text-text-muted border-border-subtle'}`}>
                              {group.isOpen ? 'Open' : 'Invite Only'}
                            </span>
                          )}

                          {canManage && groupRequests.length > 0 && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowRequestsFor(group.id);
                              }}
                              className="text-xs font-semibold bg-warning/20 text-warning px-2 py-0.5 rounded-md hover:bg-warning/30 transition-colors ml-2"
                            >
                              {groupRequests.length} Request{groupRequests.length !== 1 ? 's' : ''}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-text-primary">{group.leader}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-border-subtle rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${(group.membersCount / group.capacity) * 100}%` }} />
                          </div>
                          <span className="text-xs text-text-secondary min-w-[32px]">
                            {group.membersCount} / {group.capacity}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {group.status === 'COMPLETE' && <Badge variant="success">Complete</Badge>}
                        {group.status === 'FORMING' && <Badge variant="info">Forming</Badge>}
                        {group.status === 'INCOMPLETE' && <Badge variant="warning">Incomplete</Badge>}
                        {group.status === 'LOCKED' && <Badge variant="default">Locked</Badge>}
                      </td>
                      <td className="py-4 px-6 text-right flex items-center justify-end gap-2">
                        {currentUserId && group.membersCount < group.capacity && group.status !== 'LOCKED' && !isOwnGroup && (
                          <button 
                            className="btn-secondary py-1 px-3 text-xs"
                            onClick={(e) => handleJoinGroup(group.id, e, group.isOpen)}
                            disabled={loading}
                          >
                            {!isUserInGroup ? (group.isOpen ? 'Join' : 'Request to Join') : 'Transfer Here'}
                          </button>
                        )}
                        
                        {isOwnGroup && currentUserId && (
                          <button 
                            className="btn-ghost py-1 px-3 text-xs text-danger"
                            onClick={() => handleLeaveGroup(group.id)}
                            disabled={loading}
                          >
                            Leave Group
                          </button>
                        )}

                        {canManage && (
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                              <button className="btn-ghost p-1.5 text-text-muted">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                              </button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                              <DropdownMenu.Content 
                                className="bg-bg-surface border border-border-subtle p-1 flex flex-col shadow-lg z-50 min-w-[150px] rounded-lg"
                                sideOffset={4}
                                align="end"
                              >
                                {groupRequests.length > 0 && (
                                  <DropdownMenu.Item asChild>
                                    <button className="text-sm px-3 py-2 text-primary hover:bg-primary/10 rounded-md w-full text-left" onClick={() => setShowRequestsFor(group.id)}>
                                      View Join Requests
                                    </button>
                                  </DropdownMenu.Item>
                                )}
                                <DropdownMenu.Item asChild>
                                  <button className="text-sm px-3 py-2 text-text-primary hover:bg-bg-surface-hover rounded-md w-full text-left" onClick={() => handleFetchMembers(group.id, 'view')}>
                                    View Members
                                  </button>
                                </DropdownMenu.Item>
                                <DropdownMenu.Item asChild>
                                  <button className="text-sm px-3 py-2 text-text-primary hover:bg-bg-surface-hover rounded-md w-full text-left" onClick={() => handleFetchMembers(group.id, 'transfer')}>
                                    Transfer Leadership
                                  </button>
                                </DropdownMenu.Item>
                                {group.status !== 'LOCKED' && group.membersCount < group.capacity && (
                                  <DropdownMenu.Item asChild>
                                    <button className="text-sm px-3 py-2 text-text-primary hover:bg-bg-surface-hover rounded-md w-full text-left" onClick={() => handleAddByStudentNumber(group.id)}>
                                      Add Member by ID
                                    </button>
                                  </DropdownMenu.Item>
                                )}
                                {group.status !== 'LOCKED' && (
                                  <DropdownMenu.Item asChild>
                                    <button className="text-sm px-3 py-2 text-warning hover:bg-warning/10 rounded-md w-full text-left" onClick={() => handleLockGroup(group.id)}>
                                      Lock Group
                                    </button>
                                  </DropdownMenu.Item>
                                )}
                              </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                          </DropdownMenu.Root>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden flex flex-col gap-4 mt-4 mb-16">
          {filteredGroups.length === 0 ? (
            <div className="text-center p-8 text-text-muted bg-bg-surface rounded-xl border border-border-subtle">
              No groups match your current filters.
            </div>
          ) : (
            filteredGroups.map(group => {
              const groupRequests = pendingRequests.filter(r => (r.targetGroupId || r.groupId) === group.id);
              const canManage = isRep || currentUserId === group.leaderId;
              const isOwnGroup = userGroupId === group.id;

              return (
                <Card key={group.id} className={`p-4 flex flex-col gap-3 ${isOwnGroup ? 'border-primary' : ''}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-text-primary">{group.name}</span>
                        {isOwnGroup && <Badge variant="success">Your Group</Badge>}
                        {canManage && groupRequests.length > 0 && (
                          <button 
                            onClick={() => setShowRequestsFor(group.id)}
                            className="text-xs font-semibold bg-warning/20 text-warning px-2 py-0.5 rounded-md hover:bg-warning/30 transition-colors"
                          >
                            {groupRequests.length} Request{groupRequests.length !== 1 ? 's' : ''}
                          </button>
                        )}
                      </div>
                      <div className="text-sm text-text-secondary mt-1">{group.leader}</div>
                    </div>
                    
                    {/* actions: DropdownMenu */}
                    {canManage && (
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button className="btn-ghost p-1.5 text-text-muted">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content 
                            className="bg-bg-surface border border-border-subtle p-3 flex flex-col gap-1 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.5)] z-50 fixed inset-x-0 bottom-0 rounded-t-2xl w-full !transform-none pb-8 will-change-transform"
                          >
                            <div className="w-12 h-1 bg-border-subtle rounded-full mx-auto mb-3" />
                            {groupRequests.length > 0 && (
                              <DropdownMenu.Item asChild>
                                <button className="text-base px-4 py-3 text-primary hover:bg-bg-surface-hover rounded-xl w-full text-left" onClick={() => setShowRequestsFor(group.id)}>
                                  View Join Requests
                                </button>
                              </DropdownMenu.Item>
                            )}
                            <DropdownMenu.Item asChild>
                              <button className="text-base px-4 py-3 text-text-primary hover:bg-bg-surface-hover rounded-xl w-full text-left" onClick={() => handleFetchMembers(group.id, 'view')}>
                                View Members
                              </button>
                            </DropdownMenu.Item>
                            <DropdownMenu.Item asChild>
                              <button className="text-base px-4 py-3 text-text-primary hover:bg-bg-surface-hover rounded-xl w-full text-left" onClick={() => handleFetchMembers(group.id, 'transfer')}>
                                Transfer Leadership
                              </button>
                            </DropdownMenu.Item>
                            {group.status !== 'LOCKED' && group.membersCount < group.capacity && (
                              <DropdownMenu.Item asChild>
                                <button className="text-base px-4 py-3 text-text-primary hover:bg-bg-surface-hover rounded-xl w-full text-left" onClick={() => handleAddByStudentNumber(group.id)}>
                                  Add Member by ID
                                </button>
                              </DropdownMenu.Item>
                            )}
                            {group.status !== 'LOCKED' && (
                              <DropdownMenu.Item asChild>
                                <button className="text-base px-4 py-3 text-warning hover:bg-warning/10 rounded-xl w-full text-left" onClick={() => handleLockGroup(group.id)}>
                                  Lock Group
                                </button>
                              </DropdownMenu.Item>
                            )}
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    )}
                  </div>

                  {/* Group Progress & Status */}
                  <div className="flex items-center justify-between gap-4 text-sm mt-2">
                    <div className="flex-1 max-w-[200px]">
                      <div className="h-1.5 bg-border-subtle rounded-full overflow-hidden mb-1">
                        <div className="h-full bg-primary" style={{ width: `${(group.membersCount / group.capacity) * 100}%` }} />
                      </div>
                      <span className="text-xs text-text-secondary">{group.membersCount} / {group.capacity} Members</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {group.status === 'COMPLETE' && <Badge variant="success">Complete</Badge>}
                      {group.status === 'FORMING' && <Badge variant="info">Forming</Badge>}
                      {group.status === 'INCOMPLETE' && <Badge variant="warning">Incomplete</Badge>}
                      {group.status === 'LOCKED' && <Badge variant="default">Locked</Badge>}

                      {canManage ? (
                        <button onClick={(e) => handleToggleOpen(group.id, group.isOpen, e)} className={`text-[10px] uppercase font-bold tracking-wider mt-1 ${group.isOpen ? 'text-primary' : 'text-text-muted'}`}>
                          {group.isOpen ? 'Open' : 'Invite Only'}
                        </button>
                      ) : (
                        <span className={`text-[10px] uppercase font-bold tracking-wider mt-1 ${group.isOpen ? 'text-primary' : 'text-text-muted'}`}>
                          {group.isOpen ? 'Open' : 'Invite Only'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Primary Actions */}
                  {(currentUserId && group.membersCount < group.capacity && group.status !== 'LOCKED' && !isOwnGroup) || (isOwnGroup && currentUserId) ? (
                    <div className="mt-2 flex flex-col gap-2">
                      {currentUserId && group.membersCount < group.capacity && group.status !== 'LOCKED' && !isOwnGroup && (
                        <button className="btn-secondary w-full justify-center" onClick={(e) => handleJoinGroup(group.id, e, group.isOpen)} disabled={loading}>
                          {!isUserInGroup ? (group.isOpen ? 'Join' : 'Request to Join') : 'Transfer Here'}
                        </button>
                      )}
                      {isOwnGroup && currentUserId && (
                        <button className="btn-ghost text-danger w-full justify-center border border-danger/20" onClick={() => handleLeaveGroup(group.id)} disabled={loading}>
                          Leave Group
                        </button>
                      )}
                    </div>
                  ) : null}
                </Card>
              );
            })
          )}
        </div>
      </div>

      {showRequestsFor && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={() => setShowRequestsFor(null)}
        >
          <div 
            className="modal-content"
            style={{ background: 'var(--color-bg-surface)', padding: '1.5rem', width: '90%', maxWidth: '500px', borderRadius: '12px', maxHeight: '90dvh', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '1rem', color: 'var(--color-text-primary)', flexShrink: 0 }}>Pending Join Requests</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', paddingRight: '0.5rem', flex: 1 }}>
              {pendingRequests.filter(r => (r.targetGroupId || r.groupId) === showRequestsFor).map(req => (
                <div key={req.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{req.studentName}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{req.studentEmail}</div>
                    {req.reason && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', fontStyle: 'italic' }}>"{req.reason}"</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn-ghost" 
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}
                      onClick={() => handleProcessRequest(req.id, 'REJECTED')}
                      disabled={loading}
                    >
                      Reject
                    </button>
                    <button 
                      className="btn-primary" 
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}
                      onClick={() => handleProcessRequest(req.id, 'APPROVED')}
                      disabled={loading}
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowRequestsFor(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showRenameGroup && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={() => setShowRenameGroup(null)}
        >
          <div 
            className="modal-content"
            style={{ background: 'var(--color-bg-surface)', padding: '1.5rem', width: '90%', maxWidth: '400px', borderRadius: '12px', maxHeight: '90dvh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Rename Group</h3>
            <form onSubmit={handleRenameSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">New Group Name</label>
                <input 
                  type="text" 
                  className="input" 
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowRenameGroup(null)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMembersGroup && (() => {
        const activeGroup = groups.find(g => g.id === showMembersGroup);
        const canManageActiveGroup = activeGroup && (isRep || currentUserId === activeGroup.leaderId);
        
        return (
          <div 
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
            onClick={() => setShowMembersGroup(null)}
          >
            <div 
              className="modal-content"
              style={{ background: 'var(--color-bg-surface)', padding: '1.5rem', width: '90%', maxWidth: '400px', borderRadius: '12px', maxHeight: '90dvh', overflowY: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Group Members</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {groupMembers.map(m => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: 'var(--color-text-primary)' }}>{m.fullName}</span>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>{m.studentNumber}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {m.isLeader ? (
                        <span className="badge badge-primary">Leader</span>
                      ) : (
                        canManageActiveGroup && (
                          <button 
                            className="btn-ghost text-danger p-1 border border-transparent hover:border-danger/30 hover:bg-danger/10 rounded" 
                            onClick={() => handleRemoveMember(showMembersGroup, m.id)}
                            disabled={loading}
                            title="Remove Member"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-secondary" onClick={() => setShowMembersGroup(null)}>Close</button>
              </div>
            </div>
          </div>
        );
      })()}

      {showTransferLeadership && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={() => setShowTransferLeadership(null)}
        >
          <div 
            className="modal-content"
            style={{ background: 'var(--color-bg-surface)', padding: '1.5rem', width: '90%', maxWidth: '400px', borderRadius: '12px', maxHeight: '90dvh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Transfer Leadership</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem', fontSize: '0.875rem' }}>Select a member to transfer leadership to:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {groupMembers.filter(m => !m.isLeader).length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No other members to transfer to.</div>
              ) : (
                groupMembers.filter(m => !m.isLeader).map(m => (
                  <button 
                    key={m.id} 
                    className="btn-ghost"
                    style={{ justifyContent: 'flex-start', padding: '0.75rem', border: '1px solid var(--border-subtle)' }}
                    onClick={() => handleTransferLeadership(m.id)}
                    disabled={loading}
                  >
                    {m.fullName} ({m.studentNumber})
                  </button>
                ))
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowTransferLeadership(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showSettingsModal && offeringId && (
        <ClassSettingsModal
          offeringId={offeringId}
          currentMin={minGroupSize || 1}
          currentMax={maxGroupSize || 5}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {showUngrouped && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={() => setShowUngrouped(false)}
        >
          <div 
            className="modal-content"
            style={{ background: 'var(--color-bg-surface)', padding: '1.5rem', width: '90%', maxWidth: '600px', borderRadius: '12px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: 'var(--color-text-primary)' }}>Manage Ungrouped Students</h3>
              <span className="badge badge-primary">{ungroupedStudents.length} Students</span>
            </div>
            
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {ungroupedStudents.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>All students have been assigned to a group!</div>
              ) : (
                ungroupedStudents.map(student => (
                  <div key={student.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: '1 1 200px' }}>
                      <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{student.fullName}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{student.email}</div>
                      {student.pendingRequest && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Pending Application: {student.pendingRequest.targetGroupName}</span>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flex: '1 1 auto', justifyContent: 'flex-end' }}>
                      <select 
                        className="select" 
                        style={{ padding: '0.4rem', fontSize: '0.8125rem', minWidth: '150px' }}
                        value={selectedGroupForStudent[student.id] || ''}
                        onChange={(e) => setSelectedGroupForStudent(prev => ({ ...prev, [student.id]: e.target.value }))}
                      >
                        <option value="">Select Group...</option>
                        {groups.filter(g => g.membersCount < g.capacity && g.status !== 'LOCKED').map(g => (
                          <option key={g.id} value={g.id}>{g.name} ({g.membersCount}/{g.capacity})</option>
                        ))}
                      </select>
                      <button 
                        className="btn-primary" 
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}
                        onClick={() => handleForceAssign(student.id, selectedGroupForStudent[student.id])}
                        disabled={loading || !selectedGroupForStudent[student.id]}
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowUngrouped(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
      
      <PromptModal
        isOpen={promptState.isOpen}
        onClose={() => setPromptState(prev => ({ ...prev, isOpen: false }))}
        onSubmit={promptState.onSubmit}
        title={promptState.title}
        description={promptState.description}
      />

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        description={confirmState.description}
        destructive={confirmState.destructive}
      />
    </>
  );
}
