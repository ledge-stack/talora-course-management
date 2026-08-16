import React from 'react';
import { headers } from 'next/headers';
import { db } from '@talora/database';
import ProfileForm from './ProfileForm';

export default async function ProfilePage() {
  const scopeHeader = headers().get('x-user-scope');
  let user: any = null;

  if (scopeHeader) {
    try {
      const scope = JSON.parse(scopeHeader);
      user = await db.user.findUnique({
        where: { id: scope.userId },
        include: {
          roles: {
            include: { class: true }
          },
          enrollments: {
            include: { offering: { include: { unit: true, class: true, term: true } } }
          }
        }
      });
    } catch (e) {
      console.error('Failed to load profile:', e);
    }
  }

  if (!user) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Could not load user profile.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header className="page-header">
        <div>
          <h1>My Profile</h1>
          <p>Manage your account settings and view your active roles</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Personal Details */}
        <ProfileForm user={user} />

        {/* Roles and Permissions */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '1.25rem' }}>Active Roles</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {user.roles.map((role: any) => (
              <div key={role.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--color-bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)' }} />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                    {role.role.replace(/_/g, ' ')}
                  </div>
                  {role.class && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Class: {role.class.name}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2rem', marginBottom: '1.25rem' }}>Enrolled Courses</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {user.enrollments.map((enrollment: any) => (
              <div key={enrollment.id} style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', padding: '0.75rem', background: 'var(--color-bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <strong>{enrollment.offering.unit.code}</strong> — {enrollment.offering.unit.title}
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                  {enrollment.offering.term.name} • {enrollment.offering.class.name}
                </div>
              </div>
            ))}
            {user.enrollments.length === 0 && (
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Not enrolled in any courses.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
