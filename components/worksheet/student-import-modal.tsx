'use client';

import { useState, useRef } from 'react';
import {
  parseCSV,
  parseExcel,
  generateSampleCSV,
  type ImportParseResult,
} from '@/lib/worksheet/import-parsers';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';


interface StudentImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}

export function StudentImportModal({ open, onOpenChange, onImported }: StudentImportModalProps) {
  const [parseResult, setParseResult] = useState<ImportParseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setParseResult(null);
    setLoading(true);

    try {
      const buffer = await file.arrayBuffer();
      const text = new TextDecoder().decode(buffer);

      let result: ImportParseResult;
      if (file.name.toLowerCase().endsWith('.csv')) {
        result = parseCSV(text);
      } else if (file.name.toLowerCase().match(/\.(xlsx|xls)$/)) {
        result = parseExcel(buffer);
      } else {
        toast.error('Please upload a .csv or .xlsx file');
        setLoading(false);
        return;
      }

      setParseResult(result);
      if (result.errors.length > 0) {
        result.errors.forEach((e) => toast.error(e));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to parse file');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!parseResult || parseResult.students.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch('/api/students/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: parseResult.students }),
      });

      const data = (await res.json()) as {
        success: boolean;
        imported: number;
        failed: number;
        errors?: string[];
        error?: string;
      };

      if (!data.success) {
        throw new Error(data.error || 'Import failed');
      }

      toast.success(
        `Imported ${data.imported} students${data.failed > 0 ? `, ${data.failed} failed` : ''}`,
      );
      onImported();
      onOpenChange(false);
      setParseResult(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import students');
    } finally {
      setLoading(false);
    }
  };

  const downloadSample = () => {
    const blob = new Blob([generateSampleCSV()], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students-sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Students from CSV / Excel</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="rounded-lg border bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-medium">Expected columns:</p>
            <p className="mt-1">
              name, grade, class, school, weakTopics, strongTopics, engagementLevel, attendanceRate,
              topic, accuracy, attempts, lastAttemptedAt
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Multiple rows with the same name/grade/class/school are grouped into one student with
              multiple topic records.
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={downloadSample}>
              <Download className="mr-1 h-4 w-4" />
              Download Sample CSV
            </Button>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer rounded-lg border-2 border-dashed border-slate-300 p-8 text-center transition-colors hover:border-slate-400 hover:bg-slate-50"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
                e.target.value = '';
              }}
            />
            <Upload className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 font-medium">Click to upload CSV or Excel file</p>
            <p className="text-sm text-slate-500">Supports .csv, .xlsx, .xls</p>
          </div>

          {loading && !parseResult && (
            <div className="text-center text-sm text-slate-500">Parsing file...</div>
          )}

          {parseResult && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                <CheckCircle2 className="h-4 w-4" />
                Found {parseResult.students.length} student(s) from {parseResult.rowCount} row(s)
              </div>

              {parseResult.errors.length > 0 && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                  <div className="flex items-center gap-2 font-medium">
                    <AlertCircle className="h-4 w-4" />
                    Warnings
                  </div>
                  <ul className="mt-1 list-inside list-disc">
                    {parseResult.errors.slice(0, 5).map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="max-h-[240px] overflow-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-3 py-2 text-left">Name</th>
                      <th className="px-3 py-2 text-left">Grade</th>
                      <th className="px-3 py-2 text-left">Weak Topics</th>
                      <th className="px-3 py-2 text-left">Records</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parseResult.students.map((s, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-2">{s.name}</td>
                        <td className="px-3 py-2">{s.grade || '-'}</td>
                        <td className="px-3 py-2">{(s.weakTopics || []).join(', ') || '-'}</td>
                        <td className="px-3 py-2">{s.pastPerformance?.length || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Button
                onClick={handleImport}
                disabled={loading || parseResult.students.length === 0}
                className="w-full"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                {loading ? 'Importing...' : `Import ${parseResult.students.length} Student(s)`}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
