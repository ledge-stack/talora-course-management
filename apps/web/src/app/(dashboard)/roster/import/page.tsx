'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function RosterImportWizard() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  
  // Selections
  const [importType, setImportType] = useState<'CLASS_ROSTER' | 'COURSE_ENROLLMENT' | null>(null);
  const [offeringId, setOfferingId] = useState<string>('');
  const [offerings, setOfferings] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);

  // Preview Data
  const [isParsing, setIsParsing] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  
  // Mapping State
  const [mapping, setMapping] = useState<Record<string, string>>({});

  // Execute State
  const [isExecuting, setIsExecuting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [results, setResults] = useState<any>(null);

  // Fetch Offerings (Simulating Class Rep context)
  useEffect(() => {
    fetch('/api/v1/offerings')
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setOfferings(data.data);
          if (data.data.length > 0) setOfferingId(data.data[0].id);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleUpload = async () => {
    if (!file || !importType || !offeringId) {
      toast.error('Please complete all fields in Step 1');
      return;
    }

    setIsParsing(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('/api/v1/roster-import/preview', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to parse file');
      
      setPreviewData(data.data);
      if (data.data.suggestedMapping) {
        setMapping(data.data.suggestedMapping);
      }
      
      // If section-based and AI worked, skip straight to review
      if (data.data.structureType === 'SECTION_BASED' && data.data.extractedSample) {
        setStep(3);
      } else {
        setStep(2); // Normal mapping step
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsParsing(false);
    }
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setImportProgress(0);
    
    // Smooth simulated progress that slows down as it gets closer to 95%
    const progressInterval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 95) return prev;
        return prev + Math.max(0.5, (95 - prev) * 0.05);
      });
    }, 200);

    const formData = new FormData();
    formData.append('file', file!);
    formData.append('offeringId', offeringId);
    formData.append('importType', importType!);
    formData.append('structureType', previewData.structureType);
    if (previewData.structureType === 'FLAT') {
       const backendMapping: Record<string, string> = {};
       Object.entries(mapping).forEach(([colIndex, field]) => {
         backendMapping[colIndex] = field;
       });
       formData.append('mapping', JSON.stringify(backendMapping));
    }
    formData.append('dryRun', 'true');

    try {
      const res = await fetch('/api/v1/roster-import/execute', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      clearInterval(progressInterval);
      setImportProgress(100);
      
      // Wait for progress bar to hit 100% visually before switching steps
      setTimeout(() => {
        setResults(data.data);
        setStep(4);
      }, 400);
    } catch (err: any) {
      clearInterval(progressInterval);
      toast.error(err.message);
    } finally {
      setTimeout(() => setIsExecuting(false), 400);
    }
  };

  const handleApplyChanges = async () => {
    setIsExecuting(true);
    setImportProgress(0);
    
    const progressInterval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 95) return prev;
        return prev + Math.max(0.5, (95 - prev) * 0.05);
      });
    }, 200);

    const formData = new FormData();
    formData.append('file', file!);
    formData.append('offeringId', offeringId);
    formData.append('importType', importType!);
    formData.append('structureType', previewData.structureType);
    if (previewData.structureType === 'FLAT') {
       const backendMapping: Record<string, string> = {};
       Object.entries(mapping).forEach(([colIndex, field]) => {
         backendMapping[colIndex] = field;
       });
       formData.append('mapping', JSON.stringify(backendMapping));
    }
    formData.append('dryRun', 'false');

    try {
      const res = await fetch('/api/v1/roster-import/execute', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      clearInterval(progressInterval);
      setImportProgress(100);
      
      setTimeout(() => {
        setResults(data.data);
        setStep(5);
      }, 400);
    } catch (err: any) {
      clearInterval(progressInterval);
      toast.error(err.message);
    } finally {
      setTimeout(() => setIsExecuting(false), 400);
    }
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <header className="page-header">
        <div>
          <Link href="/roster" style={{ color: 'var(--color-primary)', fontSize: '0.875rem', display: 'inline-block', marginBottom: '1rem', textDecoration: 'none' }}>
            ← Back to roster
          </Link>
          <div className="eyebrow" style={{ marginBottom: '0.375rem' }}>Bulk import</div>
          <h1>Import wizard</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.875rem' }}>
            Import your class lists. Handles retakers, partial data, and unstructured groupings automatically.
          </p>
        </div>
      </header>

      {/* Stepper UI */}
      <div className="ledger-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {[
          { num: 1, label: 'Upload' },
          { num: 2, label: 'Map columns' },
          { num: 3, label: 'Review' },
          { num: 4, label: 'Simulate' },
          { num: 5, label: 'Complete' }
        ].map((s, i, arr) => (
          <React.Fragment key={s.num}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: step >= s.num ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: step >= s.num ? 'var(--color-primary)' : 'transparent', border: step >= s.num ? 'none' : '2px solid var(--border-strong)', color: step >= s.num ? 'white' : 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{s.num}</div>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.label}</span>
            </div>
            {i < arr.length - 1 && <div style={{ flex: 1, height: '2px', background: step > s.num ? 'var(--color-primary)' : 'var(--border-strong)', margin: '0 1rem' }}></div>}
          </React.Fragment>
        ))}
      </div>

      {/* STEP 1: UPLOAD */}
      {step === 1 && (
        <div className="ledger-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div>
            <div className="eyebrow" style={{ marginBottom: '1rem' }}>1. What are you importing?</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div 
                onClick={() => setImportType('CLASS_ROSTER')}
                style={{ border: `2px solid ${importType === 'CLASS_ROSTER' ? 'var(--color-primary)' : 'var(--border-subtle)'}`, padding: '1.5rem', borderRadius: '12px', cursor: 'pointer', background: importType === 'CLASS_ROSTER' ? 'var(--color-primary-transparent)' : 'var(--color-bg-surface)' }}
              >
                <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>🏫 Class roster</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>The definitive list of students in this cohort. Creates accounts and adds them to the class record. Retakers will be flagged as errors.</div>
              </div>
              <div 
                onClick={() => setImportType('COURSE_ENROLLMENT')}
                style={{ border: `2px solid ${importType === 'COURSE_ENROLLMENT' ? 'var(--color-primary)' : 'var(--border-subtle)'}`, padding: '1.5rem', borderRadius: '12px', cursor: 'pointer', background: importType === 'COURSE_ENROLLMENT' ? 'var(--color-primary-transparent)' : 'var(--color-bg-surface)' }}
              >
                <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>📝 Course enrollment list</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Registrar list for a specific course. Allows and flags retakers correctly. Only affects enrollment, not the core cohort record.</div>
              </div>
            </div>
          </div>

          <div>
             <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Course offering</label>
              <select 
                value={offeringId} 
                onChange={e => setOfferingId(e.target.value)}
                className="select"
                style={{ width: '100%' }}
              >
                {offerings.length === 0 && <option value="">Loading offerings…</option>}
                {offerings.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.class?.name || o.id} - {o.unit?.code || 'Course'} {o.unit?.title ? `(${o.unit.title})` : ''}
                  </option>
                ))}
              </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Spreadsheet file (.xlsx or .csv)</label>
            <input 
              type="file" 
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={(e) => {
                if (e.target.files) setFile(e.target.files[0]);
              }}
              style={{ display: 'block', width: '100%', padding: '1rem', border: '2px dashed var(--border-strong)', borderRadius: '8px', background: 'var(--color-bg-surface)', color: 'var(--color-text-secondary)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button className="btn-primary" disabled={!file || !importType || isParsing} onClick={handleUpload}>
              {isParsing ? 'Analyzing structure…' : 'Next step →'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: MAPPING (Only for FLAT structures) */}
      {step === 2 && previewData?.structureType === 'FLAT' && (
        <div className="ledger-panel" style={{ padding: '2rem' }}>
          <div className="eyebrow" style={{ marginBottom: '0.5rem' }}>Step 2</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>Map columns</h3>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', fontSize: '0.875rem' }}>
            We've auto-detected some columns based on your headers. Verify and map the rest.
          </p>

          <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead style={{ background: 'var(--color-bg-surface)' }}>
                <tr>
                  {previewData.columns.map((col: string, i: number) => (
                    <th key={i} style={{ padding: '1rem', borderBottom: '1px solid var(--border-subtle)', borderRight: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{col}</div>
                      <select 
                        value={mapping[i.toString()] || ''}
                        onChange={(e) => setMapping(prev => ({ ...prev, [i.toString()]: e.target.value }))}
                        className="select"
                        style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem' }}
                      >
                        <option value="">— Ignore —</option>
                        <option value="fullName">Full name (req)</option>
                        <option value="studentNumber">Student number (req)</option>
                        <option value="email">Email</option>
                        <option value="registrationNumber">Registration number</option>
                        <option value="groupName">Group name</option>
                      </select>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.sampleRows.map((row: string[], rIdx: number) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="reg-number" style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)', borderRight: '1px solid var(--border-subtle)' }}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <button className="btn-secondary" onClick={() => setStep(1)}>← Back</button>
            <button className="btn-primary" onClick={() => setStep(3)}>Proceed to review →</button>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW */}
      {step === 3 && (
        <div className="ledger-panel" style={{ padding: '2rem' }}>
          <div className="eyebrow" style={{ marginBottom: '0.5rem' }}>Step 3</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>Review extracted data</h3>
          
          {previewData.structureType === 'SECTION_BASED' && (
             <div style={{ background: 'var(--color-primary-transparent)', color: 'var(--color-primary)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', fontSize: '0.875rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
               <span style={{ fontSize: '1.5rem' }}>✨</span>
               <div>
                 <strong>AI structure detection applied</strong><br/>
                 We detected that your spreadsheet used section headers for groups rather than columns, and restructured it automatically.
               </div>
             </div>
          )}

          <div style={{ background: 'var(--color-bg-surface)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '2rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
             We're ready to import. The background worker will validate retaker status and required fields on the fly during execution.
          </div>

          {isExecuting ? (
            <div style={{ marginTop: '2rem', padding: '2rem', background: 'var(--color-bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ marginBottom: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Importing roster — please wait
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${importProgress}%`, 
                  background: 'var(--color-primary)', 
                  transition: 'width 0.2s ease-out' 
                }} />
              </div>
              <div className="reg-number" style={{ marginTop: '0.75rem' }}>
                {Math.round(importProgress)}% complete
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
              <button className="btn-secondary" onClick={() => setStep(previewData.structureType === 'SECTION_BASED' ? 1 : 2)}>← Back</button>
              <button className="btn-primary" onClick={handleExecute} disabled={isExecuting}>
                Simulate import
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: SIMULATION RESULTS */}
      {step === 4 && results && (
        <div className="ledger-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="eyebrow" style={{ marginBottom: '0.5rem' }}>Step 4</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>Simulation complete</h3>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>Review the proposed changes below — nothing has been written to the database yet.</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <div className="ledger-panel kpi-card" style={{ minWidth: '120px', borderColor: 'var(--color-success)' }}>
              <div className="kpi-value" style={{ color: 'var(--color-success)' }}>{results.enrolled}</div>
              <div className="kpi-label">Will enroll</div>
            </div>
            <div className="ledger-panel kpi-card" style={{ minWidth: '120px', borderColor: 'var(--color-info)' }}>
              <div className="kpi-value" style={{ color: 'var(--color-info)' }}>{results.updated}</div>
              <div className="kpi-label">Groups will update</div>
            </div>
            <div className="ledger-panel kpi-card" style={{ minWidth: '120px' }}>
              <div className="kpi-value" style={{ color: 'var(--color-text-muted)' }}>{results.unchanged}</div>
              <div className="kpi-label">Unchanged</div>
            </div>
            <div className="ledger-panel kpi-card" style={{ minWidth: '120px', borderColor: results.errors > 0 ? 'var(--color-danger)' : undefined }}>
              <div className="kpi-value" style={{ color: 'var(--color-danger)' }}>{results.errors}</div>
              <div className="kpi-label">Errors</div>
            </div>
          </div>

          {results.details.length > 0 && (
            <div style={{ textAlign: 'left', marginTop: '2rem' }}>
              <div className="eyebrow" style={{ marginBottom: '1rem' }}>Simulation log</div>
              <div style={{ maxHeight: '300px', overflowY: 'auto', background: 'var(--color-bg-surface)', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border-subtle)', fontSize: '0.875rem' }}>
                {results.details.map((d: any, i: number) => (
                  <div key={i} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: '1rem' }}>
                    <span style={{ color: d.error ? 'var(--color-danger)' : 'var(--color-warning)' }}>{d.error ? 'Error' : 'Warning'}</span>
                    <span className="reg-number">{d.row.fullName || d.row.studentNumber || 'Unknown row'}</span>
                    <span style={{ color: 'var(--color-text-primary)' }}>{d.error || d.warning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isExecuting ? (
            <div style={{ marginTop: '2rem', padding: '2rem', background: 'var(--color-bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ marginBottom: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Applying changes — please wait
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${importProgress}%`, 
                  background: 'var(--color-primary)', 
                  transition: 'width 0.2s ease-out' 
                }} />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem' }}>
              <button className="btn-secondary" onClick={() => setStep(3)}>← Discard and go back</button>
              <button className="btn-primary" onClick={handleApplyChanges} disabled={isExecuting}>
                Confirm and apply changes
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 5: FINAL RESULTS */}
      {step === 5 && results && (
        <div className="ledger-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Import complete</h3>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>Changes have been applied to the database.</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div className="ledger-panel kpi-card" style={{ minWidth: '120px' }}>
              <div className="kpi-value" style={{ color: 'var(--color-success)' }}>{results.enrolled}</div>
              <div className="kpi-label">Enrolled</div>
            </div>
            <div className="ledger-panel kpi-card" style={{ minWidth: '120px' }}>
              <div className="kpi-value" style={{ color: 'var(--color-info)' }}>{results.updated}</div>
              <div className="kpi-label">Groups updated</div>
            </div>
          </div>

          <div style={{ marginTop: '3rem' }}>
            <Link href="/roster" className="btn-primary" style={{ textDecoration: 'none' }}>
              Return to roster
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
