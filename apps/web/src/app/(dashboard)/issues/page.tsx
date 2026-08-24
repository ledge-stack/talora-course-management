import React from 'react';
import { cookies } from 'next/headers';
import { getActiveOfferingId } from '@/lib/getActiveOffering';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { db } from '@talora/database';
import { verifyJwt } from '@talora/auth';
import CreateIssueButton from './CreateIssueButton';
import IssueActionButtons from './IssueActionButtons';

export default async function IssuesPage() {
  const token = cookies().get('talora_token')?.value;
  let issues: any[] = [];
  let offeringName = 'No Offering Selected';
  let offeringId = '';
  let isRep = false;

  if (token) {
    try {
      await verifyJwt(token);
      
      const payload = await verifyJwt(token);
      isRep = payload.roles.some(r => r.role === 'CLASS_REPRESENTATIVE');

      const activeOfferingId = getActiveOfferingId();
      
      let offering = null;
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
        
        const whereClause: any = { offeringId: offering.id };
        if (!isRep) {
          whereClause.studentId = payload.userId;
        }

        const dbIssues = await db.issue.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          include: {
            student: { select: { fullName: true } }
          }
        });

        issues = dbIssues.map(i => ({
          id: i.id,
          title: i.title,
          description: i.description,
          category: i.category,
          status: i.status,
          author: i.student.fullName,
          date: new Date(i.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        }));
      }
    } catch (e) {
      console.error(e);
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'OPEN': return 'danger';
      case 'TRIAGED': return 'warning';
      case 'RESOLVED': return 'success';
      default: return 'default';
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <header className="page-header">
        <div>
          <h1 className="text-2xl font-display font-semibold text-text-primary mb-2">Issues Tracker</h1>
          <p className="text-text-secondary text-sm">{offeringName} — {isRep ? 'All Issues' : 'My Issues'}</p>
        </div>
        <div className="flex items-center gap-3">
          {offeringId && (
            <CreateIssueButton offeringId={offeringId} />
          )}
        </div>
      </header>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-bg-surface border border-border-subtle rounded-xl overflow-x-auto shadow-sm flex-1">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-border-subtle bg-bg-surface-hover/30">
              <th className="py-4 px-6 font-semibold text-sm text-text-secondary w-[15%]">Date</th>
              <th className="py-4 px-6 font-semibold text-sm text-text-secondary w-1/4">Title</th>
              <th className="py-4 px-6 font-semibold text-sm text-text-secondary w-1/4">Author</th>
              <th className="py-4 px-6 font-semibold text-sm text-text-secondary w-[15%]">Category</th>
              <th className="py-4 px-6 font-semibold text-sm text-text-secondary w-[10%]">Status</th>
              <th className="py-4 px-6 font-semibold text-sm text-text-secondary text-right w-[10%]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {issues.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-text-muted">
                  No issues found.
                </td>
              </tr>
            ) : (
              issues.map((issue) => (
                <tr key={issue.id} className="border-b border-border-subtle hover:bg-bg-surface-hover/50 transition-colors">
                  <td className="py-4 px-6 text-text-secondary text-xs">{issue.date}</td>
                  <td className="py-4 px-6">
                    <div className="text-text-primary font-medium mb-1">{issue.title}</div>
                    <div className="text-text-muted text-xs line-clamp-1">
                      {issue.description}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-text-secondary text-sm">{issue.author}</td>
                  <td className="py-4 px-6">
                    <Badge variant="default">{issue.category}</Badge>
                  </td>
                  <td className="py-4 px-6">
                    <Badge variant={getStatusBadgeVariant(issue.status) as any}>{issue.status}</Badge>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {isRep ? (
                      <IssueActionButtons issueId={issue.id} currentStatus={issue.status} />
                    ) : (
                      <span className="text-xs text-text-muted">
                        {issue.status === 'RESOLVED' ? 'Resolved' : 'Pending Review'}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden flex flex-col gap-4">
        {issues.length === 0 ? (
          <div className="text-center p-8 text-text-muted bg-bg-surface rounded-xl border border-border-subtle">
            No issues found.
          </div>
        ) : (
          issues.map((issue) => (
            <Card key={issue.id} className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="text-base font-semibold text-text-primary mb-1">{issue.title}</div>
                  <div className="text-xs text-text-muted line-clamp-2">{issue.description}</div>
                </div>
                <Badge variant={getStatusBadgeVariant(issue.status) as any}>{issue.status}</Badge>
              </div>
              
              <div className="flex items-center gap-3 text-xs text-text-secondary mt-1">
                <span>{issue.date}</span>
                <span>•</span>
                <span>{issue.author}</span>
                <span>•</span>
                <Badge variant="default">{issue.category}</Badge>
              </div>

              <div className="mt-2 flex justify-end">
                {isRep ? (
                  <IssueActionButtons issueId={issue.id} currentStatus={issue.status} />
                ) : (
                  <span className="text-xs text-text-muted">
                    {issue.status === 'RESOLVED' ? 'Resolved' : 'Pending Review'}
                  </span>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
