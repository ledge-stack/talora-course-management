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
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>User Directory &amp; Roles</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.875rem' }}>
            Manage platform users, their global role assignments, and account access.
          </p>
        </div>
      </header>

      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, maxWidth: '600px' }}>
          <input
            type="text"
            placeholder="Search by name, email or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, padding: '0.625rem 1rem', borderRadius: '8px', background: 'var(--color-bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--color-text-primary)', outline: 'none', fontSize: '0.875rem' }}
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ padding: '0.625rem 1rem', borderRadius: '8px', background: 'var(--color-bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--color-text-primary)', outline: 'none', fontSize: '0.875rem' }}
          >
            <option value="ALL">All Roles</option>
            <option value="PLATFORM_ADMIN">Platform Admin</option>
            <option value="CLASS_REPRESENTATIVE">Class Rep</option>
            <option value="GROUP_LEADER">Group Leader</option>
            <option value="STUDENT">Student</option>
          </select>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'var(--color-bg-base)', borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Name</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Email</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Roles</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Status</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading users...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No users found.</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border-subtle)', opacity: user.isActive ? 1 : 0.6 }}>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-primary)' }}>
                    <div style={{ fontWeight: 500 }}>{user.fullName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{user.studentNumber || 'No ID'}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-secondary)' }}>{user.email}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {user.roles.map(r => (
                        <span key={r.role} className="badge" style={{
                          background: r.role === 'PLATFORM_ADMIN' ? 'var(--color-danger-bg)' : 'var(--color-primary-transparent)',
                          color: r.role === 'PLATFORM_ADMIN' ? 'var(--color-danger)' : 'var(--color-primary)'
                        }}>
                          {r.role}{r.role === 'CLASS_REPRESENTATIVE' && r.classId ? '' : r.role === 'CLASS_REPRESENTATIVE' ? ' ⚠️' : ''}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className="badge" style={{
                      background: user.isActive ? 'rgba(16, 185, 129, 0.1)' : 'var(--color-danger-bg)',
                      color: user.isActive ? 'var(--color-success)' : 'var(--color-danger)'
                    }}>
                      {user.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleToggleActive(user)} className="btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                        {user.isActive ? 'Suspend' : 'Activate'}
                      </button>
                      <button onClick={() => openEditModal(user)} className="btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                        Edit Roles
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2rem' }}>
            <h2 style={{ marginTop: 0, marginBottom: '0.25rem' }}>Edit Roles</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{editingUser.fullName}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
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
                      <span style={{ fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>{role.replace(/_/g, ' ')}</span>
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
                          style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', background: 'var(--color-bg-base)', border: entry?.classId ? '1px solid var(--border-subtle)' : '1px solid var(--color-danger)', color: 'var(--color-text-primary)', outline: 'none', fontSize: '0.875rem' }}
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

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setEditingUser(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleRoleSave} disabled={savingRoles}>
                {savingRoles ? 'Saving...' : 'Save Roles'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
