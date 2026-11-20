'use client';

import { useState } from 'react';
import { Upload, Plus, Database, Search, Eye, Trash2, GitBranch, FileText } from 'lucide-react';
import { mockDatasets } from '@/lib/mock-data';

export default function DatasetsPage() {
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState<typeof mockDatasets[0] | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const filtered = mockDatasets.filter(d =>
    !search || d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Datasets</h1>
            <p className="text-slate-400 mt-1">Manage evaluation datasets and training data</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm border border-slate-700 transition-colors"
            >
              <Upload className="w-4 h-4" /> Upload Dataset
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
              <GitBranch className="w-4 h-4" /> Create from Traces
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            placeholder="Search datasets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Dataset cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(dataset => (
            <div key={dataset.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPreview(dataset)}
                    className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4 text-slate-400" />
                  </button>
                  <button className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-white mb-1">{dataset.name}</h3>
              <p className="text-xs text-slate-400 mb-3">{dataset.description}</p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-400 mb-3">
                <span className="bg-slate-800 px-2 py-0.5 rounded">{dataset.rowCount.toLocaleString()} rows</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded">{dataset.columns.length} columns</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded">{dataset.usedInEvals} evals</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {dataset.columns.slice(0, 3).map(col => (
                  <span key={col} className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded">{col}</span>
                ))}
                {dataset.columns.length > 3 && (
                  <span className="text-xs text-slate-500">+{dataset.columns.length - 3}</span>
                )}
              </div>
              <div className="text-xs text-slate-500">Created {dataset.created}</div>
            </div>
          ))}
        </div>

        {/* Preview panel */}
        {preview && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <h3 className="font-semibold text-white">{preview.name} — Preview</h3>
                <span className="text-xs text-slate-400">({preview.rowCount.toLocaleString()} rows)</span>
              </div>
              <button onClick={() => setPreview(null)} className="text-xs text-slate-400 hover:text-white px-2 py-1 hover:bg-slate-700 rounded transition-colors">Close</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    {preview.columns.map(col => (
                      <th key={col} className="text-left text-xs text-slate-400 font-medium px-4 py-3">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.previewRows.map((row, i) => (
                    <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                      {preview.columns.map(col => (
                        <td key={col} className="px-4 py-3 text-sm text-slate-300 max-w-xs truncate">
                          {String((row as Record<string, unknown>)[col] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Upload modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-white mb-4">Upload Dataset</h2>
            <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center mb-4 hover:border-indigo-500 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-300 mb-1">Drop your file here or click to browse</p>
              <p className="text-xs text-slate-500">Supports CSV, JSONL, Parquet</p>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Dataset Name</label>
              <input className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white mb-4 focus:outline-none focus:border-indigo-500" placeholder="My dataset" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowUpload(false)} className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors">Cancel</button>
              <button onClick={() => setShowUpload(false)} className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
