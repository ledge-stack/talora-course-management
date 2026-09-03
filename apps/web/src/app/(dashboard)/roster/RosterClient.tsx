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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flex: 1, alignItems: 'center' }}>
          
          {/* Search — ruled style */}
          <div style={{ position: 'relative', maxWidth: '340px', width: '100%' }}>
            <svg style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input 
              type="text" 
              placeholder="Search register by name or ID..." 
              className="input-line"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '1.75rem', fontSize: '0.875rem' }}
            />
          </div>
          
          {/* Filter — ruled style */}
          <div style={{ position: 'relative', width: '160px' }}>
            <select 
              className="input-line" 
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              style={{ fontSize: '0.875rem', cursor: 'pointer', appearance: 'none' }}
            >
              <option value="all">All Status</option>
              <option value="unassigned">Unassigned Only</option>
              {uniqueGroups.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <svg style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
      </div>

      <div className="ledger-panel hidden lg:block" style={{ overflowX: 'auto' }}>
        <table className="roster-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: '16%' }}>Reg / Student ID</th>
              <th style={{ width: '28%' }}>Name</th>
              <th style={{ width: '26%' }}>Contact Info</th>
              <th style={{ width: '15%' }}>Group Status</th>
              <th style={{ width: '15%', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-display)', fontSize: '1.125rem' }}>
                  No students found in the register.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => {
                const isUnassigned = student.group === 'Unassigned';
                return (
                  <tr key={student.id} className={isUnassigned ? 'highlight-row' : ''}>
                    <td className="reg-number" style={{ color: 'var(--color-text-primary)' }}>{student.id}</td>
                    
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 500 }}>{student.name}</span>
                        {student.isRetaker && <span className="stamp stamp-danger">Retaker</span>}
                        {student.tookGapYear && <span className="stamp stamp-warning" style={{ color: 'var(--color-warning)', border: '1.5px solid var(--color-warning)' }}>Gap Year</span>}
                      </div>
                    </td>

                    <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>
                      <div style={{ marginBottom: '0.25rem' }}>{student.email}</div>
                      {student.phoneNumber && (
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-text-muted)' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                          {student.phoneNumber}
                        </div>
                      )}
                    </td>

                    <td>
                      {isUnassigned ? (
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
                              if (window.confirm(`Are you sure you want to completely strike ${student.name} from the class register?`)) {
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
                            title="Strike from Register"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Compact List View */}
      <div className="block lg:hidden ledger-panel" style={{ background: 'var(--color-glass-panel)' }}>
        {filteredStudents.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            No students found.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredStudents.map((student) => {
              const isUnassigned = student.group === 'Unassigned';
              return (
                <div key={student.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border-rule)', borderLeft: isUnassigned ? '3px solid var(--color-primary)' : '3px solid transparent' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{student.name}</span>
                      <span className="reg-number" style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{student.id}</span>
                    </div>
                    <div>
                      {isUnassigned ? (
                        <span className="badge badge-warning" style={{ fontSize: '0.65rem', padding: '0.125rem 0.375rem' }}>Unassigned</span>
                      ) : (
                        <span className="badge badge-subtle" style={{ fontSize: '0.65rem', padding: '0.125rem 0.375rem' }}>{student.group}</span>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{student.email}</span>
                      {student.phoneNumber && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{student.phoneNumber}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {student.isRetaker && <span className="stamp stamp-danger" style={{ fontSize: '0.6rem', padding: '0.125rem' }}>Retaker</span>}
                      {student.tookGapYear && <span className="stamp stamp-warning" style={{ fontSize: '0.6rem', padding: '0.125rem' }}>Gap Year</span>}
                    </div>
                  </div>
                  
                  {canEdit && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border-subtle)', gap: '0.5rem' }}>
                      <GapYearToggle userId={student.userId} isGapYear={student.tookGapYear} canEdit={canEdit} />
                      <button 
                        className="btn-ghost" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--color-danger)' }}
                        onClick={async () => {
                          if (window.confirm(`Are you sure you want to completely strike ${student.name}?`)) {
                            if (!offeringId) return toast.error('No offering selected');
                            const res = await fetch(`/api/v1/offerings/${offeringId}/enrollments/${student.userId}`, { method: 'DELETE' });
                            if (res.ok) window.location.reload();
                            else alert('Failed to remove student');
                          }
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
