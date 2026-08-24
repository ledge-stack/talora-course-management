const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../apps/web/src/app/(dashboard)/page.tsx');
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  // Welcome Empty State
  [`style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}`, `className="flex flex-col gap-8 items-center justify-center h-[60vh] text-center"`],
  [`style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-primary-transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', marginBottom: '1rem' }}`, `className="w-16 h-16 rounded-full bg-primary-transparent flex items-center justify-center text-primary mb-4"`],
  [`style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-primary)' }}`, `className="text-2xl font-semibold text-text-primary"`],
  [`style={{ color: 'var(--color-text-secondary)', maxWidth: '400px' }}`, `className="text-text-secondary max-w-md"`],
  [`style={{ textDecoration: 'none' }}`, `className="btn-primary no-underline"`],
  
  // Dashboard container
  [`<div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>`, `<div className="flex flex-col gap-12">`],
  
  // Live synced badge
  [`style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-subtle)', padding: '0.4375rem 0.875rem', borderRadius: 'var(--radius-md)' }}`, `className="text-text-muted text-[0.8125rem] flex items-center gap-2 border border-border-subtle px-3.5 py-1.5 rounded-md"`],
  
  // Generic Section Header
  [`style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}`, `className="flex justify-between items-center mb-5"`],
  [`style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)' }}`, `className="text-[0.9375rem] font-semibold text-text-primary"`],
  [`style={{ color: 'var(--color-primary)', fontSize: '0.8125rem', fontWeight: 500 }}`, `className="text-primary text-[0.8125rem] font-medium"`],
  
  // Activity / Deadlines layout
  [`style={{ display: 'flex', flexDirection: 'column' }}`, `className="flex flex-col"`],
  [`style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}`, `className="flex flex-col gap-3.5"`],
  [`style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}`, `className="text-text-muted text-sm"`],
  [`style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary-transparent)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}`, `className="w-8 h-8 rounded-full bg-primary-transparent text-primary flex items-center justify-center shrink-0"`],
  [`style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)' }}`, `className="text-sm text-text-primary"`],
  [`style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}`, `className="text-xs text-text-muted mt-0.5"`],
  
  // Deadlines list
  [`style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}`, `className="flex justify-between items-center"`],
  [`style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}`, `className="flex items-center gap-2.5 text-sm text-text-secondary"`],
  
  // My Group
  [`style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}`, `className="flex items-center gap-3 mb-4"`],
  [`style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.125rem' }}`, `className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg"`],
  [`style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}`, `className="text-base font-semibold text-text-primary"`],
  [`style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}`, `className="text-[0.8125rem] text-text-secondary"`],
  [`style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}`, `className="flex flex-col gap-2"`],
  [`style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--color-bg-surface-hover)', borderRadius: '6px' }}`, `className="flex justify-between p-2 bg-bg-surface-hover rounded-md"`],
  [`style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}`, `className="ml-2 text-[0.65rem]"`],
  [`style={{ textAlign: 'center', padding: '2rem 1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px dashed var(--border-subtle)' }}`, `className="text-center py-8 px-4 bg-black/20 rounded-lg border border-dashed border-border-subtle"`],
  [`style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}`, `className="text-text-muted text-sm mb-4"`],
  
  // Class Overview
  [`style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}`, `className="flex justify-between items-center mb-6"`],
  [`style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-primary)' }}`, `className="text-xl font-semibold text-text-primary"`],
  [`style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}`, `className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5 mb-6"`],
  
  // Class Submissions
  [`style={{ padding: '1.5rem' }}`, `className="p-6"`],
  [`style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}`, `className="flex justify-between items-start mb-5"`],
  [`style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}`, `className="text-[0.9375rem] font-semibold text-text-primary mb-1"`],
  [`style={{ height: '8px', marginBottom: '1rem' }}`, `className="h-2 mb-4"`],
  [`style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}`, `className="flex justify-between items-center text-sm"`],
  [`style={{ display: 'flex', gap: '1.25rem' }}`, `className="flex gap-5"`],
  [`style={{ color: 'var(--color-text-secondary)' }}`, `className="text-text-secondary"`],
  [`style={{ color: 'var(--color-success)' }}`, `className="text-success"`],
  [`style={{ color: 'var(--color-text-primary)' }}`, `className="text-text-primary"`],
  [`style={{ color: 'var(--color-danger)' }}`, `className="text-danger"`],
  [`style={{ color: 'var(--color-text-muted)' }}`, `className="text-text-muted"`],
  [`style={{ fontWeight: 800, color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)', fontSize: '1rem' }}`, `className="font-extrabold text-text-primary font-display text-base"`]
];

for (const [search, replace] of replacements) {
  content = content.split(search).join(replace);
}

fs.writeFileSync(file, content);
console.log('Replaced inline styles with Tailwind utilities in page.tsx');
