'use client';

import { useState, useRef } from 'react';
import type { ImportParseResult } from '@/lib/worksheet/import-parsers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, ScanLine, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { StudentCreateInput } from '@/lib/types/worksheet';
import { getCurrentModelConfig } from '@/lib/utils/model-config';

interface MarksheetOCRModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}

export function MarksheetOCRModal({ open, onOpenChange, onImported }: MarksheetOCRModalProps) {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [grade, setGrade] = useState('');
  const [className, setClassName] = useState('');
  const [school, setSchool] = useState('');
  const [parseResult, setParseResult] = useState<ImportParseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPEG, PNG)');
      return;
    }
    setImage(file);
    setParseResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    if (!image) {
      toast.error('Please upload a marksheet image');
      return;
    }

    setLoading(true);
    setParseResult(null);

    try {
      const modelConfig = getCurrentModelConfig();
      const formData = new FormData();
      formData.append('image', image);
      if (grade) formData.append('grade', grade);
      if (className) formData.append('class', className);
      if (school) formData.append('school', school);

      const res = await fetch('/api/ocr-marksheet', {
        method: 'POST',
        headers: {
          'x-model': modelConfig.modelString,
          'x-api-key': modelConfig.apiKey,
          ...(modelConfig.baseUrl ? { 'x-base-url': modelConfig.baseUrl } : {}),
          ...(modelConfig.providerType ? { 'x-provider-type': modelConfig.providerType } : {}),
        },
        body: formData,
      });

      const data = (await res.json()) as {
        success: boolean;
        students?: StudentCreateInput[];
        errors?: string[];
        rows?: number;
        error?: string;
      };

      if (!data.success) {
        throw new Error(data.error || 'OCR failed');
      }

      const result: ImportParseResult = {
        students: (data.students || []) as StudentCreateInput[],
        rowCount: data.rows ?? (data.students || []).length,
        errors: data.errors || [],
      };

      setParseResult(result);

      if ((data.errors || []).length > 0) {
        data.errors?.forEach((e) => toast.error(e));
      }

      if (result.students.length === 0) {
        toast.warning('No students detected. Try a clearer image.');
      } else {
        toast.success(`Detected ${result.students.length} student(s) from marksheet`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to scan marksheet');
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
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import students');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setImagePreview(null);
    setParseResult(null);
    setGrade('');
    setClassName('');
    setSchool('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Scan Marksheet with OCR</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="rounded-lg border bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-medium">How it works:</p>
            <p className="mt-1">
              Upload a clear photo or scan of a marksheet. A vision AI will read the student names
              and marks, then create student profiles automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="ocr-grade">Default Grade</Label>
              <Input
                id="ocr-grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g. 5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ocr-class">Default Class</Label>
              <Input
                id="ocr-class"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g. 5B"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ocr-school">Default School</Label>
              <Input
                id="ocr-school"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="School name"
              />
            </div>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer rounded-lg border-2 border-dashed border-slate-300 p-6 text-center transition-colors hover:border-slate-400 hover:bg-slate-50"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = '';
              }}
            />
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Marksheet preview"
                className="mx-auto max-h-[200px] rounded-md object-contain"
              />
            ) : (
              <>
                <Camera className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-2 font-medium">Click to upload marksheet image</p>
                <p className="text-sm text-slate-500">Supports JPEG, PNG</p>
              </>
            )}
          </div>

          <Button onClick={handleScan} disabled={loading || !image} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning marksheet...
              </>
            ) : (
              <>
                <ScanLine className="mr-2 h-4 w-4" />
                Scan Marksheet
              </>
            )}
          </Button>

          {parseResult && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                <CheckCircle2 className="h-4 w-4" />
                Found {parseResult.students.length} student(s)
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
                {loading ? 'Importing...' : `Import ${parseResult.students.length} Student(s)`}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
