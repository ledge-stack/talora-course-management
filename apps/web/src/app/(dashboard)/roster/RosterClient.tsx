'use client';

import React, { useState } from 'react';
import { GapYearToggle } from './GapYearToggle';
import { toast } from 'sonner';

type Student = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
  group: string;
  isRetaker: boolean;
  tookGapYear: boolean;
};

export default function RosterClient({ students, canEdit, offeringId }: { students: Student[], canEdit: boolean, offeringId?: string }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');

  // Extract unique group names for the filter dropdown
  const uniqueGroups = Array.from(new Set(students.map(s => s.group))).filter(g => g !== 'Unassigned').sort();

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesGroup = 
      groupFilter === 'all' ? true :
      groupFilter === 'unassigned' ? student.group === 'Unassigned' :
      student.group === groupFilter;

    return matchesSearch && matchesGroup;
  });

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', padding: '1.5rem 1.5rem 0' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flex: 1 }}>
          <div style={{ position: 'relative', maxWidth: '320px', width: '100%' }}>
            <svg style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input 
              type="text" 
              placeholder="Search students by name, ID, or email..." 
              className="input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          
          <div style={{ position: 'relative' }}>
            <select 
              className="select" 
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              style={{ paddingRight: '2.5rem' }}
            >
              <option value="all">All Groups</option>
              <option value="unassigned">Unassigned Only</option>
              {uniqueGroups.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="table-responsive-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '15%' }}>Student ID</th>
              <th style={{ width: '25%' }}>Name</th>
              <th style={{ width: '30%' }}>Email Address</th>
              <th style={{ width: '15%' }}>Group Status</th>
              <th style={{ width: '15%', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  No students match your current filters.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td style={{ color: 'var(--color-text-primary)', fontWeight: 500, fontFamily: 'monospace' }}>{student.id}</td>
                  <td style={{ color: 'var(--color-text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {student.name}
                      {student.isRetaker && <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>Retaker</span>}
                      {student.tookGapYear && <span className="badge badge-subtle" style={{ fontSize: '0.65rem', border: '1px solid var(--color-text-muted)' }}>Gap Year</span>}
                    </div>
                  </td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>
                    <div>{student.email}</div>
                    {student.phoneNumber && (
                      <div style={{ fontSize: '0.75rem', marginTop: '0.125rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        {student.phoneNumber}
                      </div>
                    )}
                  </td>
                  <td>
                    {student.group === 'Unassigned' ? (
                      <span className="badge badge-warning">Unassigned</span>
                    ) : (
                      <span className="badge badge-subtle">{student.group}</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', alignItems: 'center' }}>
                      <GapYearToggle userId={student.userId} isGapYear={student.tookGapYear} canEdit={canEdit} />
                      {canEdit && (
                        <button 
                          className="btn-ghost" 
                          style={{ padding: '0.4rem', color: 'var(--color-danger)' }}
                          onClick={async () => {
                            if (window.confirm(`Are you sure you want to completely remove ${student.name} from the class roster?`)) {
                              if (!offeringId) return toast.error('No offering selected');
                              
                              const res = await fetch(`/api/v1/offerings/${offeringId}/enrollments/${student.userId}`, {
                                method: 'DELETE'
                              });
                              if (res.ok) {
                                window.location.reload();
                              } else {
                                const data = await res.json();
                                alert(data.message || 'Failed to remove student');
                              }
                            }
                          }}
                          title="Remove from Class"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
