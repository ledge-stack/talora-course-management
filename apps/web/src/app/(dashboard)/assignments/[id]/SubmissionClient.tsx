'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SubmissionClientProps {
  assignmentId: string;
  initialSubmission: { id: string; fileUrl: string; submittedAt: string; submittedBy?: string } | null;
  hasGroup?: boolean;
}

export default function SubmissionClient({ assignmentId, initialSubmission, hasGroup = true }: SubmissionClientProps) {
  const router = useRouter();
  const [fileUrl, setFileUrl] = useState(initialSubmission?.fileUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileUrl) {
      setError('Please provide a URL to your submission.');
      return;
    }
    
    // Basic URL validation
    try {
      new URL(fileUrl);
    } catch (_) {
      setError('Please enter a valid URL (e.g., https://github.com/...)');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/assignments/${assignmentId}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileUrl }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit assignment');
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hasGroup) {
    return (
      <div className="ledger-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' }}>
        <div className="eyebrow">Your group's work</div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: 0 }}>
          You need to be in a group for this course before you can submit — assignments are turned in once per group, by any member.
        </p>
        <a href="/groups" className="btn-primary">Find a group</a>
      </div>
    );
  }

  return (
    <div className="ledger-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-rule)', paddingBottom: '1rem', marginBottom: '0.5rem' }}>
        <div className="eyebrow">Your group's work</div>
        {initialSubmission && (
          <span className="badge badge-success">
            Submitted <span className="reg-number" style={{ color: 'inherit' }}>{initialSubmission.submittedAt}</span>
          </span>
        )}
      </div>

      {initialSubmission?.submittedBy && (
        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '-0.5rem' }}>
          Submitted by <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>{initialSubmission.submittedBy}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="submissionUrl" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Submission link (Google Drive, GitHub, Figma, etc.)</label>
          <input 
            type="url" 
            id="submissionUrl"
            className="input"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>

        {error && (
          <div style={{ padding: '0.75rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: '8px', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <button 
          type="submit" 
          className="btn-primary" 
          disabled={isSubmitting || (!initialSubmission && !fileUrl)}
          style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}
        >
          {isSubmitting ? 'Submitting…' : initialSubmission ? 'Update submission' : 'Turn in for your group'}
        </button>
      </form>
    </div>
  );
}
