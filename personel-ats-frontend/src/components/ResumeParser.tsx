'use client'
import React, { useState, useRef } from 'react'
import { Upload, FileText, Lightbulb, CheckCircle2, Loader2, X } from 'lucide-react'
import { useToast } from '../lib/ToastContext'

interface ParseResult {
    wordCount: number
    suggestions: string[]
    preview: string
}

export default function ResumeParser() {
    const { showToast } = useToast()
    const fileRef = useRef<HTMLInputElement>(null)
    const [dragging, setDragging] = useState(false)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<ParseResult | null>(null)
    const [fileName, setFileName] = useState('')

    const parseFile = async (file: File) => {
        const allowed = ['pdf', 'txt', 'csv', 'doc', 'docx']
        const ext = file.name.split('.').pop()?.toLowerCase()
        if (!ext || !allowed.includes(ext)) {
            showToast('Please upload a PDF, TXT, CSV, or Word file', 'error'); return
        }
        if (file.size > 5 * 1024 * 1024) {
            showToast('File must be under 5MB', 'error'); return
        }

        setLoading(true)
        setFileName(file.name)
        setResult(null)

        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/parse-resume', { method: 'POST', body: formData })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setResult(data)
            showToast('Resume parsed successfully!', 'success')
        } catch (err: any) {
            showToast(err.message || 'Failed to parse resume', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) parseFile(file)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) parseFile(file)
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Resume Parser</h2>
                <p className="text-gray-500 text-sm mt-1">Upload your resume to get AI-powered task suggestions</p>
            </div>

            {/* Drop Zone */}
            <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${dragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                    }`}
            >
                <input ref={fileRef} type="file" accept=".pdf,.txt,.csv,.doc,.docx" className="hidden" onChange={handleFileChange} />
                {loading ? (
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                        <p className="text-gray-600 font-medium">Parsing {fileName}...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center">
                            <Upload className="w-7 h-7 text-indigo-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800">Drop your resume here</p>
                            <p className="text-gray-400 text-sm mt-1">or click to browse · PDF, TXT, CSV, Word · Max 5MB</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Results */}
            {result && (
                <div className="space-y-4 animate-slide-up">
                    {/* File Info */}
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={20} />
                        <div className="flex-1">
                            <p className="font-semibold text-emerald-800 text-sm">{fileName}</p>
                            <p className="text-emerald-600 text-xs">{result.wordCount} words extracted</p>
                        </div>
                        <button onClick={() => setResult(null)} className="text-emerald-400 hover:text-emerald-600 transition">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Preview */}
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <FileText size={16} className="text-gray-500" />
                            <p className="text-sm font-semibold text-gray-700">Content Preview</p>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed font-mono">{result.preview}</p>
                    </div>

                    {/* Suggestions */}
                    <div className="p-5 bg-white border border-indigo-100 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                <Lightbulb size={16} className="text-amber-600" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-sm">Suggested Next Tasks</p>
                                <p className="text-xs text-gray-400">Based on your resume content</p>
                            </div>
                        </div>
                        <ul className="space-y-2">
                            {result.suggestions.map((s, i) => (
                                <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
                                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                                        {i + 1}
                                    </span>
                                    <p className="text-sm text-gray-700">{s}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    )
}
