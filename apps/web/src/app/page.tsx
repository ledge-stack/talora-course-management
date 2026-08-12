import React from 'react';

export default function Home() {
  return (
    <main style={{ padding: '3rem', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ borderBottom: '1px solid #334155', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#38bdf8', margin: 0 }}>
          TALORA
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#94a3b8', marginTop: '0.5rem' }}>
          University Class Representative & Group Coordination Platform
        </p>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
          <h2 style={{ color: '#f1f5f9', marginTop: 0 }}>Class Representative Portal</h2>
          <p style={{ color: '#94a3b8' }}>
            Manage course offerings, roster imports with formula validation, group size policies, and final group export registers.
          </p>
        </div>

        <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
          <h2 style={{ color: '#f1f5f9', marginTop: 0 }}>Group Formation & Rules</h2>
          <p style={{ color: '#94a3b8' }}>
            Enforce one active group membership per student per course offering. Group size limits (min 5, max configurable) with atomic leadership transfer.
          </p>
        </div>

        <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
          <h2 style={{ color: '#f1f5f9', marginTop: 0 }}>API & Modular Architecture</h2>
          <p style={{ color: '#94a3b8' }}>
            Powered by Next.js API adapters, Flutter mobile app client, PostgreSQL transactions, Redis caching, and async background workers.
          </p>
        </div>
      </section>
    </main>
  );
}
