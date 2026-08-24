import React from 'react';
import { cookies, headers } from 'next/headers';
import { db } from '@talora/database';
import CreateAnnouncementButton from './CreateAnnouncementButton';
import AnnouncementListClient from './AnnouncementListClient';
import { getCachedAnnouncements } from '@/lib/cached-queries';

export default async function AnnouncementsPage() {
  const scopeHeader = headers().get('x-user-scope');
  let announcements: any[] = [];
  let offeringName = 'No Offering Selected';
  let offeringId = '';
  let canCreate = false;

  if (scopeHeader) {
    try {
      const payload = JSON.parse(scopeHeader);
      canCreate = payload.roles.some((r: any) => r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN');

      let offering;
      const activeOfferingId = cookies().get('active_offering_id')?.value;
      if (activeOfferingId) {
        offering = await db.courseOffering.findUnique({
          where: { id: activeOfferingId },
          include: { unit: true, term: true, class: true },
        });
      }
      
      if (!offering) {
        offering = await db.courseOffering.findFirst({
          include: { unit: true, term: true, class: true },
        });
      }

      if (offering) {
        offeringId = offering.id;
        offeringName = `${offering.term.name} · ${offering.unit.title} · ${offering.class.name}`;
        
        const dbAnnouncements = await getCachedAnnouncements(offering.id);

        announcements = dbAnnouncements.map((a: any) => ({
          id: a.id,
          title: a.title,
          content: a.content,
          tag: a.tag,
          author: a.author.fullName,
          date: new Date(a.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        }));
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '100%' }}>
      {/* Header */}
      <header className="page-header">
        <div>
          <h1>Announcements</h1>
          <p>{offeringName}</p>
        </div>
        <div className="page-header-actions">
          {offeringId && (
            <CreateAnnouncementButton offeringId={offeringId} disabled={!canCreate} />
          )}
        </div>
      </header>

      {/* Main Content */}
      <AnnouncementListClient announcements={announcements} canEdit={canCreate} />
    </div>
  );
}
