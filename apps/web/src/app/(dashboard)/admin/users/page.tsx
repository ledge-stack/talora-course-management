'use client';

import React, { useState, useEffect } from 'react';

type RoleType = 'PLATFORM_ADMIN' | 'CLASS_REPRESENTATIVE' | 'GROUP_LEADER' | 'STUDENT';

interface UserRole {
  role: RoleType;
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editRoles, setEditRoles] = useState<RoleType[]>([]);
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

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, roleFilter]);

  const handleRoleSave = async () => {
    if (!editingUser) return;
    setSavingRoles(true);
    try {
      const res = await fetch(`/api/v1/users/${editingUser.id}/roles`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roles: editRoles })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save roles');
      
      // Update local state
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, roles: editRoles.map(r => ({ role: r })) } : u));
      setEditingUser(null);
    } catch (err: any) {
      alert(err.message);
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
      alert(err.message);
    }
  };

  const roleOptions: RoleType[] = ['PLATFORM_ADMIN', 'CLASS_REPRESENTATIVE', 'GROUP_LEADER', 'STUDENT'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>User Directory & Roles</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.875rem' }}>
            Manage platform users, their global role assignments, and account access.
          </p>
        </div>
      </header>

      {/* Toolbar */}
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

      {/* Data Table */}
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
                          {r.role}
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
                      <button 
                        onClick={() => handleToggleActive(user)}
                        className="btn-secondary" 
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        {user.isActive ? 'Suspend' : 'Activate'}
                      </button>
                      <button 
                        onClick={() => {
                          setEditingUser(user);
                          setEditRoles(user.roles.map(r => r.role));
                        }}
                        className="btn-primary" 
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        Edit Roles
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
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Edit Roles: {editingUser.fullName}</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {roleOptions.map(role => (
                <label key={role} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={editRoles.includes(role)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setEditRoles([...editRoles, role]);
                      } else {
                        setEditRoles(editRoles.filter(r => r !== role));
                      }
                    }}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>{role}</span>
                </label>
              ))}
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
