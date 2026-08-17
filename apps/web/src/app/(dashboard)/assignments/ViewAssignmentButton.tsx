'use client';

import Link from 'next/link';

export default function ViewAssignmentButton({ id }: { id: string }) {
  return (
    <Link 
      href={`/assignments/${id}`}
      className="btn-secondary" 
      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', textDecoration: 'none' }}
    >
      View
    </Link>
  );
}
