'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function RosterImportWizard() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  
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
    const formData = new FormData();
    formData.append('file', file!);
    formData.append('offeringId', offeringId);
    formData.append('importType', importType!);
    formData.append('structureType', previewData.structureType);
    if (previewData.structureType === 'FLAT') {
       // Reverse mapping for backend (column index -> field name)
       const backendMapping: Record<string, string> = {};
       Object.entries(mapping).forEach(([colIndex, field]) => {
         backendMapping[colIndex] = field;
       });
       formData.append('mapping', JSON.stringify(backendMapping));
    }

    try {
      const res = await fetch('/api/v1/roster-import/execute', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Import failed');
      
      setResults(data.data);
      setStep(4);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsExecuting(false);
    }
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <header>
        <Link href="/roster" style={{ color: 'var(--color-primary)', fontSize: '0.875rem', display: 'inline-block', marginBottom: '1rem', textDecoration: 'none' }}>
          ← Back to Roster
        </Link>
        <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>Advanced Roster Import</h1>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.875rem' }}>
          Import your class lists. Handles retakers, partial data, and unstructured groupings automatically.
        </p>
      </header>

      {/* Stepper UI */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {[
          { num: 1, label: 'Upload' },
          { num: 2, label: 'Map Columns' },
          { num: 3, label: 'Review' },
          { num: 4, label: 'Complete' }
        ].map((s, i, arr) => (
          <React.Fragment key={s.num}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: step >= s.num ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: step >= s.num ? 'var(--color-primary)' : 'transparent', border: step >= s.num ? 'none' : '2px solid var(--border-strong)', color: step >= s.num ? 'white' : 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>{s.num}</div>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.label}</span>
            </div>
            {i < arr.length - 1 && <div style={{ flex: 1, height: '2px', background: step > s.num ? 'var(--color-primary)' : 'var(--border-strong)', margin: '0 1rem' }}></div>}
          </React.Fragment>
        ))}
      </div>

      {/* STEP 1: UPLOAD */}
      {step === 1 && (
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: 'var(--color-text-primary)' }}>1. What are you importing?</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div 
                onClick={() => setImportType('CLASS_ROSTER')}
                style={{ border: `2px solid ${importType === 'CLASS_ROSTER' ? 'var(--color-primary)' : 'var(--border-subtle)'}`, padding: '1.5rem', borderRadius: '12px', cursor: 'pointer', background: importType === 'CLASS_ROSTER' ? 'var(--color-primary-transparent)' : 'var(--color-bg-surface)' }}
              >
                <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>🏫 Class Roster</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>The definitive list of students in this cohort. Creates accounts and adds them to the ClassCohort record. Retakers will be flagged as errors.</div>
              </div>
              <div 
                onClick={() => setImportType('COURSE_ENROLLMENT')}
                style={{ border: `2px solid ${importType === 'COURSE_ENROLLMENT' ? 'var(--color-primary)' : 'var(--border-subtle)'}`, padding: '1.5rem', borderRadius: '12px', cursor: 'pointer', background: importType === 'COURSE_ENROLLMENT' ? 'var(--color-primary-transparent)' : 'var(--color-bg-surface)' }}
              >
                <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>📝 Course Enrollment List</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Registrar list for a specific course. Allows and flags retakers correctly. Only affects enrollment, not the core cohort record.</div>
              </div>
            </div>
          </div>

          <div>
             <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Select Course Offering</label>
              <select 
                value={offeringId} 
                onChange={e => setOfferingId(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--color-bg-surface)', color: 'var(--color-text-primary)' }}
              >
                {offerings.length === 0 && <option value="">Loading offerings...</option>}
                {offerings.map(o => (
                  <option key={o.id} value={o.id}>{o.class?.name || o.id} - {o.unit?.code || 'Course'}</option>
                ))}
              </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Spreadsheet File (.xlsx or .csv)</label>
            <input 
              type="file" 
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={(e) => {
                if (e.target.files) setFile(e.target.files[0]);
              }}
              style={{ display: 'block', width: '100%', padding: '1rem', border: '2px dashed var(--border-strong)', borderRadius: '8px', background: 'var(--color-bg-surface)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button className="btn-primary" disabled={!file || !importType || isParsing} onClick={handleUpload}>
              {isParsing ? 'Analyzing Structure...' : 'Next Step →'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: MAPPING (Only for FLAT structures) */}
      {step === 2 && previewData?.structureType === 'FLAT' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>Map Columns</h3>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', fontSize: '0.875rem' }}>
            We've auto-detected some columns based on your headers. Please verify and map the rest.
          </p>

          <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead style={{ background: 'var(--color-bg-surface)' }}>
                <tr>
                  {previewData.columns.map((col: string, i: number) => (
                    <th key={i} style={{ padding: '1rem', borderBottom: '1px solid var(--border-subtle)', borderRight: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>{col}</div>
                      <select 
                        value={mapping[i.toString()] || ''}
                        onChange={(e) => setMapping(prev => ({ ...prev, [i.toString()]: e.target.value }))}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-subtle)', background: 'var(--color-bg-base)', color: 'var(--color-text-primary)', fontSize: '0.8rem' }}
                      >
                        <option value="">-- Ignore --</option>
                        <option value="fullName">Full Name (Req)</option>
                        <option value="studentNumber">Student Number (Req)</option>
                        <option value="email">Email</option>
                        <option value="registrationNumber">Reg Number</option>
                        <option value="groupName">Group Name</option>
                      </select>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.sampleRows.map((row: string[], rIdx: number) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)', borderRight: '1px solid var(--border-subtle)', color: 'var(--color-text-secondary)' }}>
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
            <button className="btn-primary" onClick={() => setStep(3)}>Proceed to Review →</button>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW */}
      {step === 3 && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>Review Extracted Data</h3>
          
          {previewData.structureType === 'SECTION_BASED' && (
             <div style={{ background: 'var(--color-primary-transparent)', color: 'var(--color-primary)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', fontSize: '0.875rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
               <span style={{ fontSize: '1.5rem' }}>✨</span>
               <div>
                 <strong>AI Structure Detection Applied</strong><br/>
                 The system detected that your spreadsheet used section headers for groups rather than columns, and automatically restructured it.
               </div>
             </div>
          )}

          <div style={{ background: 'var(--color-bg-surface)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '2rem' }}>
             We are ready to import. The backend will validate retaker status and required fields on the fly during execution.
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <button className="btn-secondary" onClick={() => setStep(previewData.structureType === 'SECTION_BASED' ? 1 : 2)}>← Back</button>
            <button className="btn-primary" onClick={handleExecute} disabled={isExecuting}>
              {isExecuting ? 'Importing...' : 'Confirm & Execute Import'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: RESULTS */}
      {step === 4 && results && (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Import Complete</h3>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1.5rem', background: 'var(--color-bg-surface)', borderRadius: '12px', minWidth: '120px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-success)' }}>{results.enrolled}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>Enrolled</div>
            </div>
            <div style={{ padding: '1.5rem', background: 'var(--color-bg-surface)', borderRadius: '12px', minWidth: '120px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-warning)' }}>{results.skipped}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>Skipped (No Email)</div>
            </div>
            <div style={{ padding: '1.5rem', background: 'var(--color-bg-surface)', borderRadius: '12px', minWidth: '120px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-danger)' }}>{results.errors}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>Errors</div>
            </div>
            <div style={{ padding: '1.5rem', background: 'var(--color-bg-surface)', borderRadius: '12px', minWidth: '120px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8B5CF6' }}>{results.retakers}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>Retakers Detected</div>
            </div>
          </div>

          {results.details.length > 0 && (
            <div style={{ textAlign: 'left', marginTop: '2rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>Import Log</h4>
              <div style={{ maxHeight: '300px', overflowY: 'auto', background: 'var(--color-bg-surface)', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border-subtle)', fontSize: '0.875rem' }}>
                {results.details.map((d: any, i: number) => (
                  <div key={i} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: '1rem' }}>
                    <span style={{ color: d.error ? 'var(--color-danger)' : 'var(--color-warning)' }}>{d.error ? 'Error' : 'Warning'}</span>
                    <span style={{ color: 'var(--color-text-secondary)' }}>{d.row.fullName || d.row.studentNumber || 'Unknown Row'}</span>
                    <span style={{ color: 'var(--color-text-primary)' }}>{d.error || d.warning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: '3rem' }}>
            <Link href="/roster" className="btn-primary" style={{ textDecoration: 'none' }}>
              Return to Roster
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
