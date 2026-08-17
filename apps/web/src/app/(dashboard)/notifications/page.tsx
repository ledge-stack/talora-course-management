import React from 'react';
import { cookies } from 'next/headers';
import { db } from '@talora/database';
import { verifyJwt } from '@talora/auth';
import NotificationActionButtons from './NotificationActionButtons';

export default async function NotificationsPage() {
  const token = cookies().get('talora_token')?.value;
  let notifications: any[] = [];

  if (token) {
    try {
      const payload = await verifyJwt(token);

      const dbNotifications = await db.notification.findMany({
        where: { userId: payload.userId },
        orderBy: { createdAt: 'desc' }
      });

      notifications = dbNotifications.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        isRead: n.isRead,
        date: new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      }));
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '100%' }}>
      {/* Header */}
      <header className="page-header">
        <div>
          <h1>Notifications</h1>
          <p>Stay updated on group changes, assignments, and announcements</p>
        </div>
      </header>

      {/* Main Content Card */}
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
              You're all caught up! No notifications.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {notifications.map((notif) => (
                <div key={notif.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', borderRadius: '8px', background: notif.isRead ? 'transparent' : 'var(--color-bg-surface-hover)', border: '1px solid', borderColor: notif.isRead ? 'var(--border-subtle)' : 'var(--color-primary-transparent)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                      <div style={{ fontWeight: 600, color: notif.isRead ? 'var(--color-text-secondary)' : 'var(--color-text-primary)' }}>
                        {notif.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {notif.date}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: notif.isRead ? 'var(--color-text-muted)' : 'var(--color-text-secondary)' }}>
                      {notif.message}
                    </div>
                  </div>
                  {!notif.isRead && (
                    <NotificationActionButtons notificationId={notif.id} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
