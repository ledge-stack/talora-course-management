'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ClassSettingsModal from './ClassSettingsModal';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [showRequestsFor, setShowRequestsFor] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showRenameGroup, setShowRenameGroup] = useState<{ id: string, name: string } | null>(null);
  const [newGroupName, setNewGroupName] = useState('');

  const [showMembersGroup, setShowMembersGroup] = useState<string | null>(null);
  const [groupMembers, setGroupMembers] = useState<{ id: string, fullName: string, studentNumber: string, isLeader: boolean }[]>([]);

  const [showTransferLeadership, setShowTransferLeadership] = useState<string | null>(null);

  const filteredGroups = groups.filter(g => {
    const matchesSearch = 
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      g.leader.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' ? true : g.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLockGroup = async (groupId: string) => {
    if (!confirm('Lock this group? Students will no longer be able to join.')) return;
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
      alert(err.message);
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

  return (
    <>
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'visible' }} onClick={() => setOpenDropdownId(null)}>
        <div className="toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <svg style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input 
                type="text" 
                placeholder="Search groups or leaders..." 
                className="input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
            
            <select 
              className="select" 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ paddingRight: '2.5rem', width: '160px' }}
            >
              <option value="all">All Statuses</option>
              <option value="FORMING">Forming</option>
              <option value="COMPLETE">Complete</option>
              <option value="INCOMPLETE">Incomplete</option>
              <option value="LOCKED">Locked</option>
            </select>

            {isRep && (
              <button 
                className="btn-ghost" 
                onClick={() => setShowSettingsModal(true)}
                style={{ padding: '0 0.75rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center' }}
                title="Class Group Restrictions"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              </button>
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

        <div className="table-responsive-wrapper" style={{ marginTop: '1rem', paddingBottom: '4rem' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '25%' }}>Group Name</th>
                <th style={{ width: '25%' }}>Leader</th>
                <th style={{ width: '20%' }}>Members</th>
                <th style={{ width: '15%' }}>Status</th>
                <th style={{ width: '15%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                    No groups match your current filters.
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
                          {group.name}
                          {isOwnGroup && <span className="badge badge-success">Your Group</span>}
                          
                          {canManage ? (
                            <button 
                              onClick={(e) => handleToggleOpen(group.id, group.isOpen, e)}
                              className={`badge ${group.isOpen ? 'badge-primary' : 'badge-subtle'}`}
                              style={{ cursor: 'pointer', border: 'none', background: group.isOpen ? 'var(--color-primary-transparent)' : 'rgba(255,255,255,0.05)' }}
                              title="Click to toggle group open/closed"
                            >
                              {group.isOpen ? 'Open' : 'Invite Only'}
                            </button>
                          ) : (
                            <span className={`badge ${group.isOpen ? 'badge-primary' : 'badge-subtle'}`}>
                              {group.isOpen ? 'Open' : 'Invite Only'}
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
                              <span>{groupRequests.length} Request{groupRequests.length !== 1 ? 's' : ''}</span>
                            </button>
                          )}
                        </div>
                      </td>
                      <td style={{ color: 'var(--color-text-primary)' }}>{group.leader}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ flex: 1, height: '6px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: 'var(--color-primary)', width: `${(group.membersCount / group.capacity) * 100}%` }} />
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', minWidth: '32px' }}>
                            {group.membersCount} / {group.capacity}
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
                            {!isUserInGroup ? (group.isOpen ? 'Join' : 'Request to Join') : 'Transfer Here'}
                          </button>
                        )}
                        
                        {isOwnGroup && currentUserId && (
                          <button 
                            className="btn-ghost"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', marginRight: '0.5rem', color: 'var(--color-error)' }}
                            onClick={() => handleLeaveGroup(group.id)}
                            disabled={loading}
                          >
                            Leave Group
                          </button>
                        )}

                        {canManage && (
                          <>
                            <button 
                              className="btn-ghost" 
                              style={{ padding: '0.4rem', color: 'var(--color-text-muted)' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(openDropdownId === group.id ? null : group.id);
                              }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                            </button>
                            {openDropdownId === group.id && (
                              <div 
                                style={{ 
                                  position: 'absolute', 
                                  right: '1.5rem', 
                                  ...(filteredGroups.findIndex(g => g.id === group.id) >= Math.max(0, filteredGroups.length - 2) && filteredGroups.length > 1 ? { bottom: '2.5rem' } : { top: '2.5rem' }),
                                  background: 'var(--color-bg-surface)', 
                                  border: '1px solid var(--border-subtle)', 
                                  borderRadius: '8px', 
                                  padding: '0.5rem', 
                                  display: 'flex', 
                                  flexDirection: 'column', 
                                  gap: '0.25rem',
                                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15)',
                                  zIndex: 50,
                                  minWidth: '150px',
                                  textAlign: 'left'
                                }}
                                onClick={e => e.stopPropagation()}
                              >
                                {groupRequests.length > 0 && (
                                  <button className="btn-ghost" style={{ padding: '0.5rem', fontSize: '0.8125rem', justifyContent: 'flex-start', color: 'var(--color-primary)' }} onClick={() => { setShowRequestsFor(group.id); setOpenDropdownId(null); }}>
                                    View Join Requests
                                  </button>
                                )}
                                <button className="btn-ghost" style={{ padding: '0.5rem', fontSize: '0.8125rem', justifyContent: 'flex-start' }} onClick={() => { setShowRenameGroup({ id: group.id, name: group.name }); setNewGroupName(group.name); setOpenDropdownId(null); }}>
                                  Rename Group
                                </button>
                                <button className="btn-ghost" style={{ padding: '0.5rem', fontSize: '0.8125rem', justifyContent: 'flex-start' }} onClick={() => { handleFetchMembers(group.id, 'view'); setOpenDropdownId(null); }}>
                                  View Members
                                </button>
                                <button className="btn-ghost" style={{ padding: '0.5rem', fontSize: '0.8125rem', justifyContent: 'flex-start' }} onClick={() => { handleFetchMembers(group.id, 'transfer'); setOpenDropdownId(null); }}>
                                  Transfer Leadership
                                </button>
                                {group.status !== 'LOCKED' && (
                                  <button className="btn-ghost" style={{ padding: '0.5rem', fontSize: '0.8125rem', justifyContent: 'flex-start', color: 'var(--color-warning)' }} onClick={() => { handleLockGroup(group.id); setOpenDropdownId(null); }}>
                                    Lock Group
                                  </button>
                                )}
                              </div>
                            )}
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

      {showRequestsFor && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={() => setShowRequestsFor(null)}
        >
          <div 
            className="modal-content"
            style={{ background: 'var(--color-bg-surface)', padding: '1.5rem', width: '90%', maxWidth: '500px', borderRadius: '12px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Pending Join Requests</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
            style={{ background: 'var(--color-bg-surface)', padding: '1.5rem', width: '90%', maxWidth: '400px', borderRadius: '12px' }}
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

      {showMembersGroup && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={() => setShowMembersGroup(null)}
        >
          <div 
            className="modal-content"
            style={{ background: 'var(--color-bg-surface)', padding: '1.5rem', width: '90%', maxWidth: '400px', borderRadius: '12px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Group Members</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {groupMembers.map(m => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--color-text-primary)' }}>{m.fullName}</span>
                  {m.isLeader ? (
                    <span className="badge badge-primary">Leader</span>
                  ) : (
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>{m.studentNumber}</span>
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowMembersGroup(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showTransferLeadership && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={() => setShowTransferLeadership(null)}
        >
          <div 
            className="modal-content"
            style={{ background: 'var(--color-bg-surface)', padding: '1.5rem', width: '90%', maxWidth: '400px', borderRadius: '12px' }}
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
    </>
  );
}
