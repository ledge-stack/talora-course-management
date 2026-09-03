"use client";

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useDroppable
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Student = {
  id: string;
  fullName: string;
  studentNumber: string;
  phoneNumber?: string | null;
};

type Group = {
  id: string;
  name: string;
  capacity: number;
  membersCount: number;
};

// --- Sortable Student Item (Board View) ---
function SortableStudentCard({ student, isDragging }: { student: Student; isDragging?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: student.id, data: { type: 'Student', student } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-3 bg-bg-surface border ${isDragging ? 'border-primary' : 'border-border-subtle'} rounded-lg shadow-sm mb-2 cursor-grab active:cursor-grabbing hover:border-border-strong transition-colors`}
    >
      <div className="font-medium text-text-primary text-sm">{student.fullName}</div>
      <div className="text-xs text-text-secondary mt-1">
        <div>{student.studentNumber}</div>
        {student.phoneNumber && (
          <div className="mt-0.5 flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            {student.phoneNumber}
          </div>
        )}
      </div>
    </div>
  );
}

function StaticStudentCard({ student }: { student: Student }) {
  return (
    <div className="p-3 bg-bg-surface border border-primary rounded-lg shadow-lg mb-2 cursor-grabbing rotate-2 opacity-90 scale-105 transition-transform">
      <div className="font-medium text-text-primary text-sm">{student.fullName}</div>
      <div className="text-xs text-text-secondary mt-1">
        <div>{student.studentNumber}</div>
        {student.phoneNumber && (
          <div className="mt-0.5 flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            {student.phoneNumber}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Droppable Column (Board View) ---
function DroppableGroupColumn({ group, items }: { group: Group | { id: 'ungrouped', name: 'Ungrouped Students', capacity: 999, membersCount: 0 }; items: Student[] }) {
  const { setNodeRef, isOver } = useDroppable({
    id: group.id,
    data: { type: 'Column', group }
  });

  const isUngrouped = group.id === 'ungrouped';
  
  return (
    <div 
      ref={setNodeRef}
      className={`flex flex-col min-w-[260px] w-[260px] sm:min-w-[280px] sm:w-[280px] rounded-xl bg-bg-sidebar border p-4 ${isOver ? 'border-primary bg-primary-transparent' : 'border-border-subtle'} transition-colors shrink-0`}
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-text-primary text-sm truncate pr-2">{group.name}</h4>
        {!isUngrouped && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-mono shrink-0 flex items-center gap-1 ${
            (group.membersCount + items.length) > group.capacity 
              ? 'bg-danger-transparent text-danger font-semibold border border-danger/30' 
              : 'bg-bg-base text-text-secondary'
          }`}>
            {(group.membersCount + items.length) > group.capacity && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            )}
            {group.membersCount + items.length} / {group.capacity}
          </span>
        )}
        {isUngrouped && (
          <span className="text-xs text-primary px-2 py-0.5 bg-primary-transparent rounded-full font-mono font-medium shrink-0">
            {items.length}
          </span>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <SortableContext 
          items={items.map(i => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.length === 0 ? (
            <div className="h-24 flex items-center justify-center text-xs text-text-muted border-2 border-dashed border-border-subtle rounded-lg">
              {isUngrouped ? 'All clear!' : 'Drop here'}
            </div>
          ) : (
            items.map(student => (
              <SortableStudentCard key={student.id} student={student} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}

// --- Mobile / Touch-Conducive List View ---
function MobileListView({
  students,
  groups,
  onAssignStudent,
  assigningId,
}: {
  students: Student[];
  groups: Group[];
  onAssignStudent: (studentId: string, groupId: string) => Promise<void>;
  assigningId: string | null;
}) {
  const [selectedGroups, setSelectedGroups] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');

  const filtered = students.filter(s =>
    s.fullName.toLowerCase().includes(search.toLowerCase()) ||
    s.studentNumber.toLowerCase().includes(search.toLowerCase())
  );

  const availableGroups = groups.filter(g => g.membersCount < g.capacity);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-bg-base">
      {/* Search Bar */}
      <div className="p-3 sm:p-4 border-b border-border-subtle bg-bg-surface shrink-0">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name or number..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-bg-base border border-border-subtle rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Student List */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-text-muted">
            <div className="text-2xl mb-2">🎉</div>
            <p className="font-medium text-text-primary text-sm">
              {students.length === 0 ? "All students have been assigned!" : "No students match your search."}
            </p>
            {students.length === 0 && (
              <p className="text-xs text-text-secondary mt-1">There are no more ungrouped students in this course.</p>
            )}
          </div>
        ) : (
          filtered.map(student => {
            const currentSelected = selectedGroups[student.id] || (availableGroups[0]?.id ?? '');
            const isAssigning = assigningId === student.id;

            return (
              <div 
                key={student.id} 
                className="bg-bg-surface border border-border-subtle rounded-xl p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:border-border-strong"
              >
                <div>
                  <div className="font-medium text-text-primary text-sm">
                    {student.fullName}
                  </div>
                  <div className="text-xs text-text-secondary mt-1 flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-text-muted">{student.studentNumber}</span>
                    {student.phoneNumber && (
                      <span className="flex items-center gap-1 text-text-muted">
                        •
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        {student.phoneNumber}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border-rule">
                  <select
                    className="flex-1 sm:w-48 text-xs py-2 px-2.5 bg-bg-base border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-primary cursor-pointer"
                    value={currentSelected}
                    onChange={(e) => setSelectedGroups(prev => ({ ...prev, [student.id]: e.target.value }))}
                    disabled={isAssigning || availableGroups.length === 0}
                  >
                    {availableGroups.length === 0 ? (
                      <option value="">No open groups</option>
                    ) : (
                      availableGroups.map(g => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.membersCount}/{g.capacity})
                        </option>
                      ))
                    )}
                  </select>

                  <button
                    onClick={() => onAssignStudent(student.id, currentSelected)}
                    disabled={isAssigning || !currentSelected || availableGroups.length === 0}
                    className="btn-primary text-xs px-4 py-2 shrink-0 flex items-center justify-center min-w-[70px]"
                  >
                    {isAssigning ? (
                      <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                      'Assign'
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function AssignUngroupedDnD({
  ungroupedStudents,
  groups,
  onAssign,
  onBulkAssign,
  onClose,
  loading
}: {
  ungroupedStudents: Student[];
  groups: Group[];
  onAssign: (studentId: string, groupId: string) => Promise<void>;
  onBulkAssign: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [localUngrouped, setLocalUngrouped] = useState<Student[]>(ungroupedStudents);
  const [localGroups, setLocalGroups] = useState<Group[]>(groups);
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [localGrouped, setLocalGrouped] = useState<Record<string, Student[]>>({});
  const [assigningId, setAssigningId] = useState<string | null>(null);

  // Default to list view on mobile, board view on desktop
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setViewMode('board');
    } else {
      setViewMode('list');
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const student = localUngrouped.find(s => s.id === active.id) || 
                    Object.values(localGrouped).flat().find(s => s.id === active.id);
    if (student) {
      setActiveStudent(student);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveStudent(null);
    const { active, over } = event;

    if (!over) return;
    
    const targetGroupId = over.id.toString();
    const studentId = active.id.toString();

    const student = localUngrouped.find(s => s.id === studentId);
    
    if (student && targetGroupId !== 'ungrouped') {
      setLocalUngrouped(prev => prev.filter(s => s.id !== studentId));
      setLocalGrouped(prev => ({
        ...prev,
        [targetGroupId]: [...(prev[targetGroupId] || []), student]
      }));
      setLocalGroups(prev => prev.map(g => g.id === targetGroupId ? { ...g, membersCount: g.membersCount + 1 } : g));

      try {
        await onAssign(studentId, targetGroupId);
      } catch (err) {
        setLocalGrouped(prev => ({
          ...prev,
          [targetGroupId]: prev[targetGroupId].filter(s => s.id !== studentId)
        }));
        setLocalUngrouped(prev => [...prev, student]);
        setLocalGroups(prev => prev.map(g => g.id === targetGroupId ? { ...g, membersCount: Math.max(0, g.membersCount - 1) } : g));
      }
    }
  };

  const handleAssignOne = async (studentId: string, groupId: string) => {
    if (!groupId) return;
    const student = localUngrouped.find(s => s.id === studentId);
    if (!student) return;

    setAssigningId(studentId);
    setLocalUngrouped(prev => prev.filter(s => s.id !== studentId));
    setLocalGroups(prev => prev.map(g => g.id === groupId ? { ...g, membersCount: g.membersCount + 1 } : g));

    try {
      await onAssign(studentId, groupId);
    } catch (err) {
      setLocalUngrouped(prev => [student, ...prev]);
      setLocalGroups(prev => prev.map(g => g.id === groupId ? { ...g, membersCount: Math.max(0, g.membersCount - 1) } : g));
      alert('Failed to assign student');
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm p-2 sm:p-4 lg:p-8">
      <div className="bg-bg-base border border-border-strong rounded-2xl w-full h-full max-h-[96vh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-[fadeInUp_0.2s_ease-out]">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 border-b border-border-subtle bg-bg-surface gap-3 shrink-0">
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-display font-semibold text-text-primary">Assign Ungrouped</h2>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono font-medium bg-primary-transparent text-primary">
                  {localUngrouped.length} remaining
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                {viewMode === 'list' 
                  ? 'Assign students directly or use Auto-Assign All.' 
                  : 'Drag students into open groups or use auto-assign.'}
              </p>
            </div>

            {/* Mobile close button (top right) */}
            <button 
              onClick={onClose} 
              className="sm:hidden p-1.5 text-text-muted hover:text-text-primary rounded-lg"
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 justify-between sm:justify-end">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-bg-base p-0.5 rounded-lg border border-border-subtle">
              <button
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-bg-surface text-text-primary shadow-sm font-semibold' 
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('board')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  viewMode === 'board' 
                    ? 'bg-bg-surface text-text-primary shadow-sm font-semibold' 
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Board
              </button>
            </div>

            <div className="flex items-center gap-2">
              {localUngrouped.length > 0 && (
                <button 
                  onClick={onBulkAssign}
                  disabled={loading}
                  className="btn-primary text-xs sm:text-sm py-1.5 px-3 sm:py-2 sm:px-4"
                >
                  Auto-Assign All
                </button>
              )}
              <button 
                onClick={onClose} 
                className="hidden sm:inline-flex btn-secondary text-xs sm:text-sm py-1.5 px-3 sm:py-2 sm:px-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        {viewMode === 'list' ? (
          <MobileListView
            students={localUngrouped}
            groups={localGroups}
            onAssignStudent={handleAssignOne}
            assigningId={assigningId}
          />
        ) : (
          <div className="flex-1 overflow-x-auto p-4 sm:p-6 flex gap-4 sm:gap-6 bg-bg-base">
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              {/* Ungrouped Column */}
              <DroppableGroupColumn 
                group={{ id: 'ungrouped', name: 'Ungrouped Students', capacity: 999, membersCount: 0 }} 
                items={localUngrouped} 
              />

              {/* Separator */}
              <div className="w-px bg-border-subtle shrink-0"></div>

              {/* Group Columns */}
              {localGroups.filter(g => g.membersCount < g.capacity).map(g => (
                <DroppableGroupColumn 
                  key={g.id} 
                  group={g} 
                  items={localGrouped[g.id] || []} 
                />
              ))}

              <DragOverlay>
                {activeStudent ? <StaticStudentCard student={activeStudent} /> : null}
              </DragOverlay>
            </DndContext>
          </div>
        )}
      </div>
    </div>
  );
}
