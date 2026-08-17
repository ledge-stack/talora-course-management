'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import EditAnnouncementModal from './EditAnnouncementModal';

export default function AnnouncementListClient({ announcements, canEdit }: { announcements: any[], canEdit: boolean }) {
  const router = useRouter();
  const [editingAnnouncement, setEditingAnnouncement] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
      const res = await fetch(`/api/v1/announcements/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete announcement');
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredAnnouncements = announcements.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = tagFilter ? a.tag === tagFilter : true;
    return matchesSearch && matchesTag;
  });

  const uniqueTags = Array.from(new Set(announcements.map(a => a.tag).filter(Boolean)));

  const getTagBadgeClass = (tag: string) => {
    switch (tag) {
      case 'URGENT': return 'badge-danger';
      case 'ACADEMIC': return 'badge-primary';
      case 'EVENTS': return 'badge-warning';
      default: return 'badge-subtle';
    }
  };

  if (announcements.length === 0) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
        No announcements have been posted yet.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Filters */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <input 
          type="text" 
          className="input" 
          placeholder="Search announcements..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1 }}
        />
        <select 
          className="input" 
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          style={{ width: '200px' }}
        >
          <option value="">All Tags</option>
          {uniqueTags.map((tag: any) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      {filteredAnnouncements.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
          No announcements match your search criteria.
        </div>
      ) : (
        filteredAnnouncements.map((announcement) => (
          <div key={announcement.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h2 style={{ fontSize: '1.125rem', color: 'var(--color-text-primary)' }}>{announcement.title}</h2>
                {announcement.tag && (
                  <span className={`badge ${getTagBadgeClass(announcement.tag)}`}>{announcement.tag}</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{announcement.date}</div>
                {canEdit && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setEditingAnnouncement(announcement)} className="btn-ghost" style={{ padding: '0.25rem', color: 'var(--color-text-secondary)' }} title="Edit">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    </button>
                    <button onClick={() => handleDelete(announcement.id)} className="btn-ghost" style={{ padding: '0.25rem', color: 'var(--color-danger)' }} title="Delete">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {announcement.content}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--color-primary-transparent)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                {announcement.author.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                Posted by <span style={{ color: 'var(--color-text-primary)' }}>{announcement.author}</span>
              </div>
            </div>
          </div>
        ))
      )}

      {editingAnnouncement && (
        <EditAnnouncementModal 
          announcement={editingAnnouncement} 
          onClose={() => setEditingAnnouncement(null)} 
        />
      )}
    </div>
  );
}
