import React from 'react';
import { cookies } from 'next/headers';
import { db } from '@talora/database';
import { headers } from 'next/headers';
import NotificationActionButtons from './NotificationActionButtons';

export default async function NotificationsPage() {
  const scopeHeader = headers().get('x-user-scope');
  let notifications: any[] = [];

  if (scopeHeader) {
    try {
      const payload = JSON.parse(scopeHeader);

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
          <div className="eyebrow" style={{ marginBottom: '0.375rem' }}>Notifications</div>
          <h1>Stay in the loop</h1>
          <p>Group changes, assignments, and announcements land here</p>
        </div>
      </header>

      {/* Main Content Card */}
      <div className="ledger-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
              You're all caught up — no notifications.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {notifications.map((notif) => (
                <div key={notif.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', borderRadius: '8px', background: notif.isRead ? 'transparent' : 'var(--color-bg-surface-hover)', boxShadow: notif.isRead ? 'none' : 'inset 3px 0 0 var(--color-primary)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 600, color: notif.isRead ? 'var(--color-text-secondary)' : 'var(--color-text-primary)' }}>
                        {notif.title}
                      </div>
                      <div className="reg-number">
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
