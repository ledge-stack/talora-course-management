'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ViewAssignmentButton from './ViewAssignmentButton';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

import EditAssignmentModal from './EditAssignmentModal';

type SortColumn = 'title' | 'type' | 'dueDate' | 'submissions';
type SortDirection = 'asc' | 'desc';

export default function AssignmentsListClient({ assignments, totalEnrolled, canManage }: { assignments: any[], totalEnrolled: number, canManage?: boolean }) {
  const router = useRouter();
  const [sortCol, setSortCol] = useState<SortColumn>('dueDate');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  const [editingAssignment, setEditingAssignment] = useState<any>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

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
    if (sortCol !== col) return <span className="opacity-30">↕</span>;
    return sortDir === 'asc' ? '↑' : '↓';
  };

  const getBadgeVariant = (type: string) => {
    switch(type) {
      case 'HOMEWORK': return 'info';
      case 'PROJECT': return 'warning';
      case 'EXAM': return 'danger';
      default: return 'default';
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
    <div className="flex flex-col gap-4 flex-1">
      {/* Mobile Sort UI */}
      <div className="lg:hidden flex items-center justify-end gap-2 mb-2">
        <label className="text-sm text-text-secondary">Sort by:</label>
        <select 
          className="bg-bg-surface border border-border-subtle text-text-primary px-3 py-1.5 rounded-md text-sm outline-none"
          value={`${sortCol}-${sortDir}`}
          onChange={(e) => {
            const [c, d] = e.target.value.split('-');
            setSortCol(c as SortColumn);
            setSortDir(d as SortDirection);
          }}
        >
          <option value="dueDate-asc">Due Date (Earliest)</option>
          <option value="dueDate-desc">Due Date (Latest)</option>
          <option value="title-asc">Title (A-Z)</option>
          <option value="submissions-desc">Submissions (High to Low)</option>
          <option value="type-asc">Type</option>
        </select>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-bg-surface border border-border-subtle rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-border-subtle bg-bg-surface-hover/30">
              <th className="py-4 px-6 font-semibold text-sm text-text-secondary cursor-pointer hover:text-text-primary select-none w-1/4" onClick={() => handleSort('title')}>
                Title <span className="ml-1">{getSortIcon('title')}</span>
              </th>
              <th className="py-4 px-6 font-semibold text-sm text-text-secondary cursor-pointer hover:text-text-primary select-none w-[15%]" onClick={() => handleSort('type')}>
                Type <span className="ml-1">{getSortIcon('type')}</span>
              </th>
              <th className="py-4 px-6 font-semibold text-sm text-text-secondary cursor-pointer hover:text-text-primary select-none w-1/5" onClick={() => handleSort('dueDate')}>
                Due Date <span className="ml-1">{getSortIcon('dueDate')}</span>
              </th>
              <th className="py-4 px-6 font-semibold text-sm text-text-secondary cursor-pointer hover:text-text-primary select-none w-1/4" onClick={() => handleSort('submissions')}>
                Submissions <span className="ml-1">{getSortIcon('submissions')}</span>
              </th>
              <th className="py-4 px-6 font-semibold text-sm text-text-secondary text-right w-[15%]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAssignments.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-text-muted">
                  No assignments found for this offering.
                </td>
              </tr>
            ) : (
              sortedAssignments.map((assignment) => (
                <tr key={assignment.id} className="border-b border-border-subtle hover:bg-bg-surface-hover/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="text-text-primary font-medium mb-1">{assignment.title}</div>
                    <div className="text-text-muted text-xs line-clamp-1">
                      {assignment.description || 'No description provided.'}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <Badge variant={getBadgeVariant(assignment.type) as any}>{assignment.type}</Badge>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${assignment.isPast ? 'text-danger' : 'text-text-primary'}`}>
                        {assignment.dueDate}
                      </span>
                      {assignment.isPast && (
                        <Badge variant="danger">Overdue</Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      {assignment.submissionsCount} / {totalEnrolled} submissions
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 relative">
                      <ViewAssignmentButton id={assignment.id} />
                      {canManage && (
                        <div className="relative">
                          <button 
                            className="btn-ghost p-1.5 text-text-muted hover:text-text-primary rounded-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(openDropdownId === assignment.id ? null : assignment.id);
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                          </button>
                          {openDropdownId === assignment.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setOpenDropdownId(null)} />
                              <div className="absolute right-0 top-full mt-1 w-32 bg-bg-surface border border-border-subtle rounded-md shadow-lg overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                                <button 
                                  className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-bg-surface-hover transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingAssignment(assignment);
                                    setOpenDropdownId(null);
                                  }}
                                >
                                  Edit
                                </button>
                                <button 
                                  className="w-full text-left px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(assignment.id);
                                    setOpenDropdownId(null);
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden flex flex-col gap-4">
        {sortedAssignments.length === 0 ? (
           <div className="text-center p-8 text-text-muted bg-bg-surface rounded-xl border border-border-subtle">No assignments found for this offering.</div>
        ) : (
           sortedAssignments.map(assignment => (
             <Card key={assignment.id} className="p-4 flex flex-col gap-3">
               <div className="flex justify-between items-start gap-4">
                 <div>
                   <div className="text-base font-semibold text-text-primary mb-1">{assignment.title}</div>
                   <div className="text-xs text-text-muted line-clamp-1">{assignment.description || 'No description provided.'}</div>
                 </div>
                 <Badge variant={getBadgeVariant(assignment.type) as any}>{assignment.type}</Badge>
               </div>
               
               <div className="flex flex-col gap-1.5 mt-2">
                 <div className="flex items-center gap-2">
                   <span className={`text-sm ${assignment.isPast ? 'text-danger font-medium' : 'text-text-primary'}`}>{assignment.dueDate}</span>
                   {assignment.isPast && <Badge variant="danger">Overdue</Badge>}
                 </div>
                 <div className="flex items-center gap-2 text-text-secondary text-xs">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                   {assignment.submissionsCount} / {totalEnrolled} submissions
                 </div>
               </div>

               <div className="mt-3 flex justify-end gap-2 items-center">
                 {canManage && (
                   <>
                     <button 
                       className="btn-ghost text-xs py-1 px-2"
                       onClick={() => setEditingAssignment(assignment)}
                     >
                       Edit
                     </button>
                     <button 
                       className="btn-ghost text-danger text-xs py-1 px-2 hover:bg-danger/10"
                       onClick={() => handleDelete(assignment.id)}
                     >
                       Delete
                     </button>
                   </>
                 )}
                 <ViewAssignmentButton id={assignment.id} />
               </div>
             </Card>
           ))
        )}
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
