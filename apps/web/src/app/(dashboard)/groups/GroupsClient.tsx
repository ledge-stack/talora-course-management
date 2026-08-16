'use client';

import React, { useState } from 'react';

type Group = {
  id: string;
  name: string;
  leader: string;
  membersCount: number;
  status: string;
  capacity: number;
};

export default function GroupsClient({ groups }: { groups: Group[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const filteredGroups = groups.filter(g => {
    const matchesSearch = 
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      g.leader.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' ? true : g.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }} onClick={() => setOpenDropdownId(null)}>
      <div className="toolbar">
        <div style={{ display: 'flex', gap: '0.75rem', flex: 1 }}>
          <div style={{ position: 'relative', maxWidth: '320px', width: '100%' }}>
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
            style={{ paddingRight: '2.5rem' }}
          >
            <option value="all">All Statuses</option>
            <option value="FORMING">Forming</option>
            <option value="COMPLETE">Complete</option>
            <option value="INCOMPLETE">Incomplete</option>
            <option value="LOCKED">Locked</option>
          </select>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
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
              filteredGroups.map((group) => (
                <tr key={group.id}>
                  <td style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{group.name}</td>
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
                        <button className="btn-ghost" style={{ padding: '0.5rem', fontSize: '0.8125rem', justifyContent: 'flex-start' }} onClick={() => { alert('View Members not yet implemented'); setOpenDropdownId(null); }}>
                          View Members
                        </button>
                        <button className="btn-ghost" style={{ padding: '0.5rem', fontSize: '0.8125rem', justifyContent: 'flex-start' }} onClick={() => { alert('Transfer Leadership not yet implemented'); setOpenDropdownId(null); }}>
                          Transfer Leadership
                        </button>
                        <button className="btn-ghost" style={{ padding: '0.5rem', fontSize: '0.8125rem', justifyContent: 'flex-start', color: 'var(--color-warning)' }} onClick={() => { alert('Lock Group not yet implemented'); setOpenDropdownId(null); }}>
                          Lock Group
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
