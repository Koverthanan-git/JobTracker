// DataTools.tsx - Place in personal-ats-frontend/src/components/
import React from 'react';
import { Upload, Download } from 'lucide-react';
import { useToast } from '../lib/ToastContext';

export default function DataTools() {
  const toast = useToast();

  const handleExport = async () => {
    try {
      const response = await fetch('/api/export/json');
      if (!response.ok) {
        const text = await response.text();
        console.error('Export failed', response.status, text);
        toast.showToast(`Export failed: ${response.status}`, 'error');
        return;
      }

      const contentType = response.headers.get('content-type') || '';
      let data: any;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch (err) {
          console.error('Invalid export response', text);
          toast.showToast('Export failed: invalid response from server', 'error');
          return;
        }
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'ats_backup.json';
      link.click();
      URL.revokeObjectURL(url);
      toast.showToast('Export started', 'success');
    } catch (err) {
      console.error('Export error', err);
      toast.showToast('Export failed (network error)', 'error');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];

    // Validate headers before uploading
    try {
      const text = await file.text();
      const firstNonEmpty = text.split(/\r?\n/).find(line => line.trim().length > 0) || '';
      const rawHeaders = firstNonEmpty.split(/,|;|\t/).map(h => h.replace(/^\uFEFF/, '').trim().toLowerCase().replace(/\"|\'/g, ''));

      const expected = ['company', 'title', 'location', 'salary'];
      const aliases: Record<string, string[]> = {
        title: ['title', 'job title', 'job_title', 'position', 'role'],
        company: ['company', 'employer', 'organization'],
        location: ['location', 'city', 'place'],
        salary: ['salary', 'pay', 'compensation', 'annual salary']
      };

      const mapping: Record<string, number | null> = {};
      for (const key of expected) {
        const opts = aliases[key as keyof typeof aliases] || [key];
        const idx = rawHeaders.findIndex(h => opts.includes(h));
        mapping[key] = idx >= 0 ? idx : null;
      }

      // Accept if all expected headers are found OR at least 'company' and 'title' are present
      const allFound = expected.every(k => mapping[k] !== null);
      const minimalFound = mapping['company'] !== null && mapping['title'] !== null;

      if (!allFound && !minimalFound) {
        toast.showToast('CSV headers invalid. Expected headers: company, title, location, salary (or aliases).', 'error');
        return;
      }

      // If partial (minimal) found, inform user that optional headers missing
      if (!allFound && minimalFound) {
        toast.showToast('CSV missing some optional headers (location/salary). Import will continue.', 'info');
      }

      // Proceed to upload the original file as form data
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/import/csv', {
          method: 'POST',
          body: formData,
        });
        if (res.ok) toast.showToast('Import successful', 'success');
        else {
          const txt = await res.text().catch(() => 'server error');
          console.error('Import failed', res.status, txt);
          toast.showToast('Import failed on server', 'error');
        }
      } catch (err) {
        console.error('Import error', err);
        toast.showToast('Import failed (network)', 'error');
      }
    } catch (err) {
      console.error('Could not read file for header validation', err);
      toast.showToast('Could not read file', 'error');
    }
  };

  return (
    <div className="card mt-6">
      <h2 className="heading mb-4">Data Management</h2>
      <div className="flex gap-4">
        <button onClick={handleExport} className="btn btn-primary">
          <Download size={18} /> <span style={{marginLeft:8}}>Export JSON</span>
        </button>

        <label className="btn btn-secondary cursor-pointer">
          <Upload size={18} /> <span style={{marginLeft:8}}>Import CSV</span>
          <input type="file" className="hidden" accept=".csv" onChange={handleImport} />
        </label>
      </div>
      <p className="subtle mt-3">
        CSV should include headers: <b>company, title, location, salary</b>
      </p>
    </div>
  );
}