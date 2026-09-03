'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

type RoleType = 'PLATFORM_ADMIN' | 'CLASS_REPRESENTATIVE' | 'GROUP_LEADER' | 'STUDENT';

interface UserRole {
  role: RoleType;
  classId?: string | null;
  class?: { id: string; name: string; year: number } | null;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  studentNumber: string | null;
  registrationNumber: string | null;
  isActive: boolean;
  createdAt: string;
  roles: UserRole[];
}

interface ClassCohort {
  id: string;
  name: string;
  year: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<ClassCohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  // editRoles: array of { role, classId }
  const [editRoles, setEditRoles] = useState<{ role: RoleType; classId?: string }[]>([]);
  const [savingRoles, setSavingRoles] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const url = new URL('/api/v1/users', window.location.origin);
      if (searchQuery) url.searchParams.append('q', searchQuery);
      if (roleFilter !== 'ALL') url.searchParams.append('role', roleFilter);
      const res = await fetch(url.toString());
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
      setUsers(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      // Use the offerings endpoint to get classes — or fetch directly
      const res = await fetch('/api/v1/offerings');
      const data = await res.json();
      // Extract unique classes from offerings
      const seen = new Set<string>();
      const uniqueClasses: ClassCohort[] = [];
      (data.data || []).forEach((o: any) => {
        if (o.class && !seen.has(o.class.id)) {
          seen.add(o.class.id);
          uniqueClasses.push(o.class);
        }
      });
      setClasses(uniqueClasses);
    } catch {
      // Non-critical — classes might not load
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { fetchUsers(); }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, roleFilter]);

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditRoles(user.roles.map(r => ({ role: r.role, classId: r.classId || undefined })));
  };

  const toggleRole = (role: RoleType, checked: boolean) => {
    if (checked) {
      setEditRoles(prev => [...prev, { role, classId: undefined }]);
    } else {
      setEditRoles(prev => prev.filter(r => r.role !== role));
    }
  };

  const setClassForRole = (role: RoleType, classId: string) => {
    setEditRoles(prev => prev.map(r => r.role === role ? { ...r, classId } : r));
  };

  const handleRoleSave = async () => {
    if (!editingUser) return;

    // Validate CLASS_REPRESENTATIVE has a classId
    const repEntry = editRoles.find(r => r.role === 'CLASS_REPRESENTATIVE');
    if (repEntry && !repEntry.classId) {
      toast.error('Please select a class for the Class Representative role.');
      return;
    }

    setSavingRoles(true);
    try {
      const res = await fetch(`/api/v1/users/${editingUser.id}/roles`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roles: editRoles })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save roles');

      setUsers(users.map(u => u.id === editingUser.id ? { ...u, roles: editRoles } : u));
      setEditingUser(null);
      toast.success('Roles updated successfully.');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingRoles(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    if (!confirm(`Are you sure you want to ${user.isActive ? 'suspend' : 'activate'} this user?`)) return;
    try {
      const res = await fetch(`/api/v1/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');
      setUsers(users.map(u => u.id === user.id ? { ...u, isActive: !user.isActive } : u));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteAccount = async (user: User) => {
    if (!confirm(`Are you absolutely sure you want to permanently DELETE ${user.fullName}'s account? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/v1/users/${user.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete account');
      setUsers(users.filter(u => u.id !== user.id));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const roleOptions: RoleType[] = ['PLATFORM_ADMIN', 'CLASS_REPRESENTATIVE', 'GROUP_LEADER', 'STUDENT'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: '0.375rem' }}>Platform admin</div>
          <h1>User directory</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.875rem' }}>
            Manage platform users, role assignments, and account access.
          </p>
        </div>
      </header>

      <div className="ledger-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, maxWidth: '600px' }}>
          <input
            type="text"
            placeholder="Search by name, email, or ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
            style={{ flex: 1 }}
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="select"
          >
            <option value="ALL">All roles</option>
            <option value="PLATFORM_ADMIN">Platform admin</option>
            <option value="CLASS_REPRESENTATIVE">Class rep</option>
            <option value="GROUP_LEADER">Group leader</option>
            <option value="STUDENT">Student</option>
          </select>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      <div className="ledger-panel" style={{ overflowX: 'auto' }}>
        <table className="data-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Roles</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading users…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No users found.</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} style={{ opacity: user.isActive ? 1 : 0.6 }}>
                  <td data-label="Name" style={{ color: 'var(--color-text-primary)' }}>
                    <div style={{ fontWeight: 500, fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>{user.fullName}</div>
                    <div className="reg-number">{user.studentNumber || 'No ID'}</div>
                  </td>
                  <td data-label="Email" style={{ color: 'var(--color-text-secondary)' }}>{user.email}</td>
                  <td data-label="Roles">
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {user.roles.map(r => (
                        <span key={r.role} className="badge" style={{
                          background: r.role === 'PLATFORM_ADMIN' ? 'var(--color-danger-bg)' : r.role === 'GROUP_LEADER' ? 'var(--color-accent-violet-bg)' : 'var(--color-primary-transparent)',
                          color: r.role === 'PLATFORM_ADMIN' ? 'var(--color-danger)' : r.role === 'GROUP_LEADER' ? 'var(--color-accent-violet)' : 'var(--color-primary)'
                        }}>
                          {r.role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())}{r.role === 'CLASS_REPRESENTATIVE' && !r.classId ? ' ⚠️' : ''}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td data-label="Status">
                    <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {user.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td data-label="Actions" style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleToggleActive(user)} className="btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                        {user.isActive ? 'Suspend' : 'Activate'}
                      </button>
                      <button onClick={() => openEditModal(user)} className="btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                        Edit roles
                      </button>
                      <button onClick={() => handleDeleteAccount(user)} className="btn-ghost" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', color: 'var(--color-danger)' }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Roles Modal */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '100%', maxWidth: '440px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Edit roles</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>{editingUser.fullName}</p>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {roleOptions.map(role => {
                const isChecked = editRoles.some(r => r.role === role);
                const entry = editRoles.find(r => r.role === role);
                return (
                  <div key={role}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => toggleRole(role, e.target.checked)}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span style={{ fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>{role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())}</span>
                    </label>

                    {/* Show class selector when CLASS_REPRESENTATIVE is checked */}
                    {role === 'CLASS_REPRESENTATIVE' && isChecked && (
                      <div style={{ marginTop: '0.5rem', marginLeft: '1.75rem' }}>
                        <label style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                          Assign to class <span style={{ color: 'var(--color-danger)' }}>*</span>
                        </label>
                        <select
                          value={entry?.classId || ''}
                          onChange={(e) => setClassForRole(role, e.target.value)}
                          className="select"
                          style={{ width: '100%', borderColor: entry?.classId ? undefined : 'var(--color-danger)' }}
                        >
                          <option value="">— Select a class —</option>
                          {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.year})</option>
                          ))}
                        </select>
                        {!entry?.classId && (
                          <p style={{ fontSize: '0.75rem', color: 'var(--color-danger)', marginTop: '0.25rem' }}>
                            Required: select the class this rep manages.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setEditingUser(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleRoleSave} disabled={savingRoles}>
                {savingRoles ? 'Saving…' : 'Save roles'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
