import React from 'react';
import { cookies } from 'next/headers';
import { db } from '@talora/database';
import { verifyJwt } from '@talora/auth';
import CreateAnnouncementButton from './CreateAnnouncementButton';
import AnnouncementListClient from './AnnouncementListClient';

export default async function AnnouncementsPage() {
  const token = cookies().get('talora_token')?.value;
  let announcements: any[] = [];
  let offeringName = 'No Offering Selected';
  let offeringId = '';
  let canCreate = false;

  if (token) {
    try {
      await verifyJwt(token);
      
      const payload = await verifyJwt(token);
      canCreate = payload.roles.some(r => r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN');

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
        
        const dbAnnouncements = await db.announcement.findMany({
          where: { offeringId: offering.id },
          orderBy: { createdAt: 'desc' },
          include: {
            author: { select: { fullName: true } }
          }
        });

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
