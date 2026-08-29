'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import ClassSettingsModal from './ClassSettingsModal';
import AssignUngroupedDnD from './AssignUngroupedDnD';

type Group = {
  id: string;
  name: string;
  leader: string;
  leaderPhone?: string | null;
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
  studentNumber?: string;
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
  const [localGroups, setLocalGroups] = useState<Group[]>(groups);
  React.useEffect(() => {
    setLocalGroups(groups);
  }, [groups]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top?: number; bottom?: number; left: number } | null>(null);
  const MENU_WIDTH = 180;
  const [showRequestsFor, setShowRequestsFor] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showRenameGroup, setShowRenameGroup] = useState<{ id: string, name: string } | null>(null);
  const [newGroupName, setNewGroupName] = useState('');

  const [showReserveSpot, setShowReserveSpot] = useState<string | null>(null);
  const [reserveStudentNumber, setReserveStudentNumber] = useState('');

  const [showMembersGroup, setShowMembersGroup] = useState<string | null>(null);
  const [groupMembers, setGroupMembers] = useState<{ id: string, fullName: string, studentNumber: string, phoneNumber?: string | null, isLeader: boolean }[]>([]);

  const [showTransferLeadership, setShowTransferLeadership] = useState<string | null>(null);

  const [showUngrouped, setShowUngrouped] = useState(false);
  const [ungroupedStudents, setUngroupedStudents] = useState<any[]>([]);
  const [selectedGroupForStudent, setSelectedGroupForStudent] = useState<Record<string, string>>({});

  // Close dropdown when user scrolls or clicks outside
  useEffect(() => {
    const close = () => { setOpenDropdownId(null); setDropdownPos(null); };
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, []);

  const filteredGroups = localGroups.filter(g => {
    const matchesSearch = 
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      g.leader.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' ? true : g.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

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
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForceAssign = async (studentId: string, groupId: string) => {
    if (!groupId) return alert('Select a group first');
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
      alert(err.message);
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
      alert(data.message);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAutoAssign = async () => {
    if (!offeringId) return;
    if (!confirm('Are you sure you want to randomly assign ALL ungrouped students? This action cannot be undone.')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/offerings/${offeringId}/groups/bulk-auto-assign`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to bulk assign');
      alert(data.message);
      setShowUngrouped(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId: string, e: React.MouseEvent, isOpen: boolean) => {
    e.stopPropagation();
    
    if (!isOpen) {
      const reason = prompt("This group is Invite Only. Please provide a reason for requesting to join (or transfer):");
      if (!reason) return;
      
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
        alert("Request sent successfully.");
        router.refresh();
      } catch (err: any) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setLocalGroups(prev => prev.map(g => g.id === groupId ? { ...g, membersCount: g.membersCount + 1 } : g));
    try {
      const res = await fetch(`/api/v1/groups/${groupId}/members`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to join group');
      alert('Joined group successfully.');
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOpen = async (groupId: string, currentIsOpen: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalGroups(prev => prev.map(g => g.id === groupId ? { ...g, isOpen: !currentIsOpen } : g));
    try {
      const res = await fetch(`/api/v1/groups/${groupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOpen: !currentIsOpen })
      });
      if (!res.ok) throw new Error('Failed to toggle open status');
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddByStudentNumber = async (groupId: string) => {
    const studentNumber = prompt('Enter the student number to add to this group:');
    if (!studentNumber) return;
    setLoading(true);
    setLocalGroups(prev => prev.map(g => g.id === groupId ? { ...g, membersCount: g.membersCount + 1 } : g));
    try {
      const res = await fetch(`/api/v1/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentNumber })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add student');
      alert('Student added successfully!');
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
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
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to leave this group?')) return;
    setLoading(true);
    setLocalGroups(prev => prev.map(g => g.id === groupId ? { ...g, membersCount: Math.max(0, g.membersCount - 1) } : g));
    try {
      const res = await fetch(`/api/v1/groups/${groupId}/members/${currentUserId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to leave group');
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (groupId: string, memberId: string) => {
    if (!confirm('Are you sure you want to remove this member from the group?')) return;
    setLoading(true);
    setLocalGroups(prev => prev.map(g => g.id === groupId ? { ...g, membersCount: Math.max(0, g.membersCount - 1) } : g));
    try {
      const res = await fetch(`/api/v1/groups/${groupId}/members/${memberId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to remove member');
      setGroupMembers(prev => prev.filter(m => m.id !== memberId));
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRenameGroup || !newGroupName.trim()) return;
    setLoading(true);
    setLocalGroups(prev => prev.map(g => g.id === showRenameGroup.id ? { ...g, name: newGroupName } : g));
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
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReserveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReserveSpot || !reserveStudentNumber.trim()) return;
    setLoading(true);
    setLocalGroups(prev => prev.map(g => g.id === showReserveSpot ? { ...g, membersCount: g.membersCount + 1 } : g));
    try {
      const res = await fetch(`/api/v1/groups/${showReserveSpot}/placeholders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentNumber: reserveStudentNumber })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reserve spot');
      setShowReserveSpot(null);
      setReserveStudentNumber('');
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLockGroup = async (groupId: string) => {
    if (!confirm('Lock this group? Students will no longer be able to join.')) return;
    setLoading(true);
    setLocalGroups(prev => prev.map(g => g.id === groupId ? { ...g, status: 'LOCKED' } : g));
    try {
      const res = await fetch(`/api/v1/groups/${groupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLocked: true })
      });
      if (!res.ok) throw new Error('Failed to lock group');
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group? All members will be removed and groups will be renumbered.')) return;
    setLoading(true);
    // Optimistic UI update
    setLocalGroups(prev => prev.filter(g => g.id !== groupId));
    try {
      const res = await fetch(`/api/v1/groups/${groupId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete group');
      router.refresh();
    } catch (err: any) {
      alert(err.message);
      router.refresh(); // Revert optimistic update on failure
    } finally {
      setLoading(false);
    }
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
      alert(err.message);
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
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (!offeringId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/offerings/${offeringId}/groups/export`);
      if (!res.ok) throw new Error('Failed to export data');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Attempt to get filename from Content-Disposition
      const disposition = res.headers.get('Content-Disposition');
      let filename = `groups_list_${offeringId}.xlsx`;
      if (disposition && disposition.indexOf('filename=') !== -1) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
        if (matches != null && matches[1]) { 
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      a.download = filename;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'visible' }} onClick={() => setOpenDropdownId(null)}>
        <div className="toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
            <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '150px' }}>
              <svg style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input 
                type="text" 
                placeholder="Search groups" 
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
              <option value="all">All statuses</option>
              <option value="FORMING">Forming</option>
              <option value="COMPLETE">Complete</option>
              <option value="INCOMPLETE">Incomplete</option>
              <option value="LOCKED">Locked</option>
            </select>

            {isRep && (
              <div className="flex gap-2 w-full md:w-auto shrink-0">
                <button 
                  className="btn-secondary flex-1 md:flex-none flex items-center justify-center gap-2" 
                  onClick={handleExportExcel}
                  disabled={loading}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  Export Excel
                </button>
                <button 
                  className="btn-secondary flex-1 md:flex-none flex items-center justify-center gap-2" 
                  onClick={handleFetchUngrouped}
                  disabled={loading}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  Assign ungrouped
                </button>
                <button 
                  className="btn-ghost flex items-center justify-center px-3 text-text-secondary" 
                  onClick={() => setShowSettingsModal(true)}
                  title="Class group restrictions"
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
                Auto-assign me
              </button>
            )}
          </div>
        </div>

        <div className="table-responsive-wrapper" style={{ marginTop: '1rem', paddingBottom: '10rem' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '25%' }}>Group</th>
                <th style={{ width: '25%' }}>Leader</th>
                <th style={{ width: '20%' }}>Roll call</th>
                <th style={{ width: '15%' }}>Status</th>
                <th style={{ width: '15%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                    {localGroups.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted opacity-50 mb-2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        <p className="text-text-primary font-medium">No groups in this course yet.</p>
                        <p className="text-sm max-w-md mx-auto leading-relaxed">
                          If you're looking for your groups, check that you have the right course selected using the course switcher at the top right of the screen.
                        </p>
                      </div>
                    ) : (
                      "No groups match your current filters."
                    )}
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group) => {
                  const groupRequests = pendingRequests.filter(r => (r.targetGroupId || r.groupId) === group.id);
                  const canManage = isRep || currentUserId === group.leaderId;
                  const isOwnGroup = userGroupId === group.id;

                  return (
                    <tr key={group.id} className={isOwnGroup ? 'highlight-row' : ''}>
                      <td style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="font-display">{group.name}</span>
                          {isOwnGroup && <span className="leader-tag" style={{ color: 'var(--color-accent-teal)', background: 'var(--color-accent-teal-bg)' }}>Your group</span>}
                          
                          {canManage ? (
                            <button 
                              onClick={(e) => handleToggleOpen(group.id, group.isOpen, e)}
                              className={`badge ${group.isOpen ? 'badge-primary' : 'badge-subtle'}`}
                              style={{ cursor: 'pointer', border: 'none', background: group.isOpen ? 'var(--color-primary-transparent)' : 'rgba(255,255,255,0.05)' }}
                              title="Click to toggle group open/closed"
                            >
                              {group.isOpen ? 'Open' : 'Invite only'}
                            </button>
                          ) : (
                            <span className={`badge ${group.isOpen ? 'badge-primary' : 'badge-subtle'}`}>
                              {group.isOpen ? 'Open' : 'Invite only'}
                            </span>
                          )}

                          {canManage && groupRequests.length > 0 && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowRequestsFor(group.id);
                              }}
                              className="badge badge-warning"
                              style={{ cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                              <span>{groupRequests.length} request{groupRequests.length !== 1 ? 's' : ''}</span>
                            </button>
                          )}
                        </div>
                      </td>
                      <td style={{ color: 'var(--color-text-primary)' }}>
                        <div style={{ fontWeight: 500 }}>{group.leader}</div>
                        {group.leaderPhone && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.125rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                            {group.leaderPhone}
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="roster-dots">
                          {Array.from({ length: Math.min(group.capacity, 10) }).map((_, i) => (
                            <span
                              key={i}
                              className={`roster-dot ${i < group.membersCount ? `filled ${group.membersCount >= (minGroupSize || 1) ? 'complete' : ''}` : ''}`}
                            />
                          ))}
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginLeft: '0.375rem', fontFamily: 'var(--font-mono)' }}>
                            {group.membersCount}/{group.capacity}
                          </span>
                        </div>
                      </td>
                      <td>
                        {group.status === 'COMPLETE' && <span className="badge badge-success">Complete</span>}
                        {group.status === 'FORMING' && <span className="badge badge-primary">Forming</span>}
                        {group.status === 'INCOMPLETE' && <span className="badge badge-warning">Incomplete</span>}
                        {group.status === 'LOCKED' && <span className="badge badge-subtle">Locked</span>}
                      </td>
                      <td style={{ textAlign: 'right', position: 'relative' }}>
                        {currentUserId && group.membersCount < group.capacity && group.status !== 'LOCKED' && !isOwnGroup && (
                          <button 
                            className="btn-secondary"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', marginRight: '0.5rem' }}
                            onClick={(e) => handleJoinGroup(group.id, e, group.isOpen)}
                            disabled={loading}
                          >
                            {!isUserInGroup ? (group.isOpen ? 'Join' : 'Request to join') : 'Transfer here'}
                          </button>
                        )}
                        
                        {isOwnGroup && currentUserId && (
                          <button 
                            className="btn-ghost"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', marginRight: '0.5rem', color: 'var(--color-error)' }}
                            onClick={() => handleLeaveGroup(group.id)}
                            disabled={loading}
                          >
                            Leave group
                          </button>
                        )}

                        {canManage && (
                          <>
                            <button 
                              className="btn-ghost" 
                              style={{ padding: '0.4rem', color: 'var(--color-text-muted)' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (openDropdownId === group.id) {
                                  setOpenDropdownId(null);
                                  setDropdownPos(null);
                                } else {
                                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                  const estimatedMenuHeight = 220;
                                  const spaceBelow = window.innerHeight - rect.bottom;
                                  const openUpward = spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight;
                                  // Right-align menu with button, clamped so it never leaves the viewport
                                  const rawLeft = rect.right - MENU_WIDTH;
                                  const clampedLeft = Math.max(8, Math.min(rawLeft, window.innerWidth - MENU_WIDTH - 8));
                                  setDropdownPos({
                                    top: openUpward ? undefined : rect.bottom + 4,
                                    bottom: openUpward ? window.innerHeight - rect.top + 4 : undefined,
                                    left: clampedLeft,
                                  });
                                  setOpenDropdownId(group.id);
                                }
                              }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Portal dropdown — renders outside table so it's never clipped */}
      {openDropdownId && dropdownPos && (() => {
        const group = localGroups.find(g => g.id === openDropdownId);
        if (!group) return null;
        const groupRequests = pendingRequests.filter(r => (r.targetGroupId || r.groupId) === group.id);
        
        if (typeof document === 'undefined') return null;

        return createPortal(
          <div
            style={{
              position: 'fixed',
              top: dropdownPos.top,
              bottom: dropdownPos.bottom,
              left: dropdownPos.left,
              width: MENU_WIDTH,
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
              zIndex: 9999,
              minWidth: '175px',
              textAlign: 'left',
            }}
            onClick={e => e.stopPropagation()}
          >
            {groupRequests.length > 0 && (
              <button className="btn-ghost" style={{ padding: '0.5rem', fontSize: '0.8125rem', justifyContent: 'flex-start', color: 'var(--color-primary)' }}
                onClick={() => { setShowRequestsFor(group.id); setOpenDropdownId(null); setDropdownPos(null); }}>
                View join requests
              </button>
            )}
            <button className="btn-ghost" style={{ padding: '0.5rem', fontSize: '0.8125rem', justifyContent: 'flex-start' }}
              onClick={() => { handleFetchMembers(group.id, 'view'); setOpenDropdownId(null); setDropdownPos(null); }}>
              View members
            </button>
            <button className="btn-ghost" style={{ padding: '0.5rem', fontSize: '0.8125rem', justifyContent: 'flex-start' }}
              onClick={() => { handleFetchMembers(group.id, 'transfer'); setOpenDropdownId(null); setDropdownPos(null); }}>
              Transfer leadership
            </button>
            {group.status !== 'LOCKED' && group.membersCount < group.capacity && (
              <>
                <button className="btn-ghost" style={{ padding: '0.5rem', fontSize: '0.8125rem', justifyContent: 'flex-start' }}
                  onClick={() => { handleAddByStudentNumber(group.id); setOpenDropdownId(null); setDropdownPos(null); }}>
                  Add member by ID
                </button>
                <button className="btn-ghost" style={{ padding: '0.5rem', fontSize: '0.8125rem', justifyContent: 'flex-start' }}
                  onClick={() => { setShowReserveSpot(group.id); setOpenDropdownId(null); setDropdownPos(null); }}>
                  Reserve spot
                </button>
              </>
            )}
            {group.status !== 'LOCKED' && (
              <button className="btn-ghost" style={{ padding: '0.5rem', fontSize: '0.8125rem', justifyContent: 'flex-start', color: 'var(--color-warning)' }}
                onClick={() => { handleLockGroup(group.id); setOpenDropdownId(null); setDropdownPos(null); }}>
                Lock group
              </button>
            )}
            {(isRep || group.leaderId === currentUserId) && (
              <button className="btn-ghost" style={{ padding: '0.5rem', fontSize: '0.8125rem', justifyContent: 'flex-start', color: 'var(--color-danger)' }}
                onClick={() => { handleDeleteGroup(group.id); setOpenDropdownId(null); setDropdownPos(null); }}>
                Delete group
              </button>
            )}
          </div>,
          document.body
        );
      })()}

      {typeof document !== 'undefined' && createPortal(
        <>
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
                    <div key={req.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ flex: '1 1 200px' }}>
                        <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{req.studentName}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                          {req.studentNumber ? `${req.studentNumber} · ` : ''}{req.studentEmail}
                        </div>
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
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                            {m.studentNumber} {m.phoneNumber && `· 📞 ${m.phoneNumber}`}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {m.isLeader ? (
                            <span className="badge badge-primary">Leader</span>
                          ) : (
                            canManageActiveGroup && (
                              <button 
                                className="btn-ghost" 
                                style={{ padding: '0.25rem', color: 'var(--color-error)' }}
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

          {showReserveSpot && (
            <div 
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
              onClick={() => setShowReserveSpot(null)}
            >
              <div 
                className="modal-content"
                style={{ background: 'var(--color-bg-surface)', padding: '1.5rem', width: '90%', maxWidth: '400px', borderRadius: '12px', maxHeight: '90dvh', overflowY: 'auto' }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 style={{ marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Reserve Spot</h3>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem', fontSize: '0.875rem' }}>Reserve a spot for a student who hasn't joined Talora yet.</p>
                <form onSubmit={handleReserveSubmit}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label className="label">Student Number</label>
                    <input 
                      type="text" 
                      className="input" 
                      value={reserveStudentNumber}
                      onChange={(e) => setReserveStudentNumber(e.target.value)}
                      autoFocus
                      required
                      placeholder="e.g. 21/U/1234"
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button type="button" className="btn-secondary" onClick={() => setShowReserveSpot(null)}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={loading}>Reserve</button>
                  </div>
                </form>
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
            <AssignUngroupedDnD
              ungroupedStudents={ungroupedStudents}
              groups={groups.filter(g => g.status !== 'LOCKED')}
              loading={loading}
              onClose={() => setShowUngrouped(false)}
              onBulkAssign={handleBulkAutoAssign}
              onAssign={async (studentId, groupId) => {
                await handleForceAssign(studentId, groupId);
              }}
            />
          )}
        </>,
        document.body
      )}
    </>
  );
}
