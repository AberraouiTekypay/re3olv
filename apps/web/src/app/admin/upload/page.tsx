'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Upload, FileSpreadsheet, Download, CheckCircle, AlertCircle, Loader2, ArrowLeft, Trash2, Activity, Sparkles } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api-client';
import { toast } from 'sonner';

interface PreviewRow {
  'Borrower Name': string;
  'Amount': string;
  'Penalty': string;
  [key: string]: string;
}

export default function BulkUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast.error('Please upload a CSV file');
        return;
      }
      setFile(selectedFile);
      parsePreview(selectedFile);
    }
  };

  const parsePreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      if (lines.length < 1) return;
      const headers = lines[0].split(',').map(h => h.trim());
      const rows = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, i) => {
          row[header] = values[i];
        });
        return row;
      });
      setPreview(rows.filter(r => r['Borrower Name']));
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setProgress(10);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/cases/upload`, {
        method: 'POST',
        headers: {
          'x-organization-id': 'default-org',
          'x-user-role': 'AGENT',
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      
      setProgress(100);
      toast.success('Bulk ingestion completed successfully');
      setTimeout(() => router.push('/agent/dashboard'), 1500);
    } catch (error) {
      toast.error('Upload failed: Check file format');
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "Borrower Name,Amount,Penalty,Phone\nJohn Doe,1500,150,+123456789\nJane Smith,2800,300,+987654321";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 're3olv_mfi_template.csv';
    a.click();
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2 mb-4">
          <ArrowLeft size={16} /> Back
        </Button>
        <h1 className="text-4xl font-black tracking-tight text-gray-900">Institutional Ingestion</h1>
        <p className="text-slate-500 font-medium">Bulk import your portfolio for automated resolution scaling.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <Upload className="text-indigo-600" size={24} /> Data Port
            </CardTitle>
            <CardDescription>Drag and drop your CSV portfolio data here.</CardDescription>
          </CardHeader>
          <CardContent className="p-12">
            {!file ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-4 border-dashed border-slate-200 rounded-[2rem] p-16 text-center hover:border-indigo-400 transition-all cursor-pointer bg-slate-50/50"
              >
                <div className="bg-indigo-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
                  <FileSpreadsheet size={40} />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2">Select Portfolio File</h3>
                <p className="text-slate-400 font-medium max-w-xs mx-auto">Upload .csv files with Borrower Name, Amount, and Penalty headers.</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".csv" 
                  className="hidden" 
                />
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center justify-between p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                  <div className="flex items-center gap-4">
                    <div className="bg-indigo-600 text-white p-3 rounded-2xl">
                      <FileSpreadsheet size={24} />
                    </div>
                    <div>
                      <p className="font-black text-slate-900">{file.name}</p>
                      <p className="text-xs text-slate-500 font-bold uppercase">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => { setFile(null); setPreview([]); }} className="text-slate-400 hover:text-red-500">
                    <Trash2 size={20} />
                  </Button>
                </div>

                {preview.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 px-2 flex items-center gap-2">
                      <Activity size={14} /> Structural Preview
                    </h4>
                    <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/50">
                            <TableHead className="font-bold text-[10px] uppercase">Borrower</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase">Principal</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase">Penalty</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {preview.map((row, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-bold text-slate-800">{row['Borrower Name']}</TableCell>
                              <TableCell className="text-slate-500 font-mono text-xs">${row['Amount']}</TableCell>
                              <TableCell className="text-slate-500 font-mono text-xs">${row['Penalty']}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-black uppercase text-indigo-600">
                      <span>Ingesting Data...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-slate-50 border-t border-slate-100 p-8 flex justify-between gap-4">
            <Button variant="outline" onClick={downloadTemplate} className="rounded-2xl h-12 px-6 font-bold gap-2">
              <Download size={18} /> Download Template
            </Button>
            <Button 
              disabled={!file || loading} 
              onClick={handleUpload}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-12 px-8 font-black uppercase tracking-tighter shadow-lg shadow-indigo-900/20 gap-2 min-w-[200px]"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
              {loading ? 'Processing...' : 'Confirm Ingestion'}
            </Button>
          </CardFooter>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-0 shadow-xl rounded-3xl bg-white border border-blue-50">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl">
                <AlertCircle size={24} />
              </div>
              <div>
                <h4 className="font-black text-slate-900 mb-1 uppercase text-sm">Regulatory Header Sync</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Ensure your headers exactly match: <span className="font-mono text-indigo-600">Borrower Name, Amount, Penalty</span>. Phone is optional but recommended.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-xl rounded-3xl bg-white border border-indigo-50">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="bg-indigo-100 text-indigo-600 p-3 rounded-2xl">
                <Sparkles size={24} />
              </div>
              <div>
                <h4 className="font-black text-slate-900 mb-1 uppercase text-sm">Automated Magic Links</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Upon confirmation, Nova will automatically generate unique tokens for every borrower in the portfolio.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
