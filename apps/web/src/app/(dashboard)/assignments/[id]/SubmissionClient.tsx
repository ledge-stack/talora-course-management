'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SubmissionClientProps {
  assignmentId: string;
  initialSubmission: { id: string; fileUrl: string; submittedAt: string } | null;
}

export default function SubmissionClient({ assignmentId, initialSubmission }: SubmissionClientProps) {
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

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '0.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Your Work</h2>
        {initialSubmission && (
          <span className="badge badge-success">
            Submitted {initialSubmission.submittedAt}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="submissionUrl" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Submission Link (Google Drive, GitHub, Figma, etc.)</label>
          <input 
            type="url" 
            id="submissionUrl"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="https://..."
            style={{ 
              padding: '0.75rem', 
              borderRadius: '8px', 
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-surface)',
              color: 'var(--color-text-primary)'
            }}
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
          {isSubmitting ? 'Submitting...' : initialSubmission ? 'Update Submission' : 'Turn In'}
        </button>
      </form>
    </div>
  );
}
