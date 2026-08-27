"use client";

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay
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

// --- Sortable Student Item ---
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


// --- Droppable Column ---
import { useDroppable } from '@dnd-kit/core';

function DroppableGroupColumn({ group, items }: { group: Group | { id: 'ungrouped', name: 'Ungrouped Students', capacity: 999, membersCount: 0 }; items: Student[] }) {
  const { setNodeRef, isOver } = useDroppable({
    id: group.id,
    data: { type: 'Column', group }
  });

  const isUngrouped = group.id === 'ungrouped';
  
  return (
    <div 
      ref={setNodeRef}
      className={`flex flex-col min-w-[280px] w-[280px] rounded-xl bg-bg-sidebar border p-4 ${isOver ? 'border-primary bg-primary-transparent' : 'border-border-subtle'} transition-colors`}
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-text-primary text-sm">{group.name}</h4>
        {!isUngrouped && (
          <span className="text-xs text-text-secondary px-2 py-1 bg-bg-base rounded-full">
            {group.membersCount + items.length} / {group.capacity}
          </span>
        )}
        {isUngrouped && (
          <span className="text-xs text-primary px-2 py-1 bg-primary-transparent rounded-full font-medium">
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
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);

  // We only track the students that were dragged into groups locally for visual feedback.
  // The actual saving happens immediately via onAssign.
  const [localGrouped, setLocalGrouped] = useState<Record<string, Student[]>>({});

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
    
    // In our setup, students can only be dragged from Ungrouped -> Group.
    // Over.id can be a Group ID or the 'ungrouped' column ID.
    // Active.id is the Student ID.
    
    const targetGroupId = over.id.toString();
    const studentId = active.id.toString();

    // Find the student
    const student = localUngrouped.find(s => s.id === studentId);
    
    if (student && targetGroupId !== 'ungrouped') {
      // Optimistically move the student to the group
      setLocalUngrouped(prev => prev.filter(s => s.id !== studentId));
      setLocalGrouped(prev => ({
        ...prev,
        [targetGroupId]: [...(prev[targetGroupId] || []), student]
      }));

      try {
        await onAssign(studentId, targetGroupId);
      } catch (err) {
        // Revert on failure
        setLocalGrouped(prev => ({
          ...prev,
          [targetGroupId]: prev[targetGroupId].filter(s => s.id !== studentId)
        }));
        setLocalUngrouped(prev => [...prev, student]);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm p-4 lg:p-8">
      <div className="bg-bg-base border border-border-strong rounded-2xl w-full h-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-[cmdkDialogSlideIn_0.2s_ease-out]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-subtle bg-bg-surface shrink-0">
          <div>
            <h2 className="text-xl font-display font-semibold text-text-primary">Assign Ungrouped Students</h2>
            <p className="text-sm text-text-secondary mt-1">Drag students into groups or use auto-assign.</p>
          </div>
          <div className="flex gap-3">
            {localUngrouped.length > 0 && (
              <button 
                onClick={onBulkAssign}
                disabled={loading}
                className="btn-primary"
              >
                Auto-Assign All
              </button>
            )}
            <button onClick={onClose} className="btn-secondary">Close</button>
          </div>
        </div>

        {/* DnD Board */}
        <div className="flex-1 overflow-x-auto p-6 flex gap-6 bg-bg-base">
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
            {groups.filter(g => g.membersCount < g.capacity).map(g => (
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
      </div>
    </div>
  );
}
