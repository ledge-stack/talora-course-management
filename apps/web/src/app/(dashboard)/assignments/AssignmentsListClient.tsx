'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ViewAssignmentButton from './ViewAssignmentButton';
import EditAssignmentModal from './EditAssignmentModal';

type SortColumn = 'title' | 'type' | 'dueDate' | 'submissions';
type SortDirection = 'asc' | 'desc';

export default function AssignmentsListClient({ assignments, totalEnrolled, canManage }: { assignments: any[], totalEnrolled: number, canManage?: boolean }) {
  const router = useRouter();
  const [sortCol, setSortCol] = useState<SortColumn>('dueDate');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  const [editingAssignment, setEditingAssignment] = useState<any>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assignment? All submissions will also be deleted. This action cannot be undone.")) return;
    
    try {
      const res = await fetch(`/api/v1/assignments/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete assignment');
      }
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSort = (col: SortColumn) => {
    if (sortCol === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  const getSortIcon = (col: SortColumn) => {
    if (sortCol !== col) return <span style={{ opacity: 0.3 }}>↕</span>;
    return sortDir === 'asc' ? '↑' : '↓';
  };

  const getStampVariant = (type: string) => {
    switch(type) {
      case 'HOMEWORK': return 'stamp-violet';
      case 'PROJECT': return 'stamp-warning';
      case 'EXAM': return 'stamp-danger';
      default: return '';
    }
  };

  const sortedAssignments = [...assignments].sort((a, b) => {
    let valA = a[sortCol];
    let valB = b[sortCol];
    
    // Convert dates for proper sorting
    if (sortCol === 'dueDate') {
      valA = new Date(a.rawDueDate).getTime();
      valB = new Date(b.rawDueDate).getTime();
    } else if (sortCol === 'submissions') {
      valA = a.submissionsCount;
      valB = b.submissionsCount;
    }

    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="ledger-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* Sort UI for mobile / header area */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '1.25rem 1.5rem 0', gap: '0.75rem' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sort by</div>
        <select 
          className="input-line"
          value={`${sortCol}-${sortDir}`}
          onChange={(e) => {
            const [c, d] = e.target.value.split('-');
            setSortCol(c as SortColumn);
            setSortDir(d as SortDirection);
          }}
          style={{ width: 'auto', fontSize: '0.8125rem', padding: '0.25rem 0' }}
        >
          <option value="dueDate-asc">Due Date (Earliest)</option>
          <option value="dueDate-desc">Due Date (Latest)</option>
          <option value="title-asc">Title (A-Z)</option>
          <option value="submissions-desc">Submissions (High to Low)</option>
          <option value="type-asc">Type</option>
        </select>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '30%', cursor: 'pointer' }} onClick={() => handleSort('title')}>
                Brief <span style={{ marginLeft: '0.25rem' }}>{getSortIcon('title')}</span>
              </th>
              <th style={{ width: '15%', cursor: 'pointer' }} onClick={() => handleSort('type')}>
                Type <span style={{ marginLeft: '0.25rem' }}>{getSortIcon('type')}</span>
              </th>
              <th style={{ width: '20%', cursor: 'pointer' }} onClick={() => handleSort('dueDate')}>
                Deadline <span style={{ marginLeft: '0.25rem' }}>{getSortIcon('dueDate')}</span>
              </th>
              <th style={{ width: '20%', cursor: 'pointer' }} onClick={() => handleSort('submissions')}>
                Submissions <span style={{ marginLeft: '0.25rem' }}>{getSortIcon('submissions')}</span>
              </th>
              <th style={{ width: '15%', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAssignments.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-display)', fontSize: '1.125rem' }}>
                  No assignments posted yet.
                </td>
              </tr>
            ) : (
              sortedAssignments.map((assignment) => {
                const progress = totalEnrolled > 0 ? (assignment.submissionsCount / totalEnrolled) * 100 : 0;
                
                return (
                  <tr key={assignment.id}>
                    <td>
                      <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>
                        {assignment.title}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as any}>
                        {assignment.description || 'No description provided.'}
                      </div>
                    </td>
                    <td>
                      <span className={`stamp ${getStampVariant(assignment.type)}`}>{assignment.type}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: assignment.isPast ? 600 : 400, color: assignment.isPast ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>
                          {assignment.dueDate}
                        </span>
                        {assignment.isPast && <span className="stamp stamp-danger">Past Due</span>}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', maxWidth: '140px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>
                          <span>{assignment.submissionsCount} / {totalEnrolled}</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="progress-track" style={{ height: '4px' }}>
                          <div className="progress-fill" style={{ width: `${progress}%`, background: progress === 100 ? 'var(--color-success)' : 'var(--color-primary)' }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', alignItems: 'center' }}>
                        {canManage && (
                          <>
                            <button 
                              className="btn-ghost" 
                              style={{ padding: '0.4rem', color: 'var(--color-text-secondary)' }}
                              onClick={() => setEditingAssignment(assignment)}
                              title="Edit Assignment"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                            </button>
                            <button 
                              className="btn-ghost" 
                              style={{ padding: '0.4rem', color: 'var(--color-danger)' }}
                              onClick={() => handleDelete(assignment.id)}
                              title="Delete Assignment"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                          </>
                        )}
                        <ViewAssignmentButton id={assignment.id} />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {editingAssignment && (
        <EditAssignmentModal 
          assignment={editingAssignment} 
          onClose={() => setEditingAssignment(null)} 
        />
      )}
    </div>
  );
}
