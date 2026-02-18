'use client'
import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Plus, Pencil, Trash2, ExternalLink, Building2, MapPin, DollarSign, Loader2 } from 'lucide-react'
import {
  useApplications, useCreateApplication, useUpdateApplication,
  useMoveApplication, useDeleteApplication, type Application
} from '../lib/api'
import { useToast } from '../lib/ToastContext'

const STAGES: { id: number; label: string; color: string; bg: string; border: string }[] = [
  { id: 1, label: 'Wishlist', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
  { id: 2, label: 'Applied', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 3, label: 'Interview', color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200' },
  { id: 4, label: 'Offer', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { id: 5, label: 'Rejected', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
]

const EMPTY_FORM = { job_title: '', company: '', location: '', salary_range: '', job_url: '', notes: '', stage_id: 2 }

export default function KanbanBoard({ search }: { search: string }) {
  const { data: apps = [], isLoading } = useApplications()
  const createApp = useCreateApplication()
  const updateApp = useUpdateApplication()
  const moveApp = useMoveApplication()
  const deleteApp = useDeleteApplication()
  const { showToast } = useToast()

  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Application | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const filtered = apps.filter(a =>
    !search || `${a.job_title} ${a.company}`.toLowerCase().includes(search.toLowerCase())
  )

  const byStage = (id: number) => filtered.filter(a => a.stage_id === id)

  const onDragEnd = (result: any) => {
    if (!result.destination) return
    const { draggableId, destination } = result
    const newStage = parseInt(destination.droppableId)
    const app = apps.find(a => a.id === draggableId)
    if (!app || app.stage_id === newStage) return
    moveApp.mutate({ app_id: draggableId, stage_id: newStage }, {
      onSuccess: () => showToast(`Moved to ${STAGES.find(s => s.id === newStage)?.label}`, 'success'),
      onError: () => showToast('Failed to move card', 'error'),
    })
  }

  const openAdd = (stageId = 2) => {
    setForm({ ...EMPTY_FORM, stage_id: stageId })
    setEditing(null)
    setModal('add')
  }

  const openEdit = (app: Application) => {
    setForm({
      job_title: app.job_title, company: app.company,
      location: app.location || '', salary_range: app.salary_range || '',
      job_url: app.job_url || '', notes: app.notes || '', stage_id: app.stage_id,
    })
    setEditing(app)
    setModal('edit')
  }

  const handleSave = () => {
    if (!form.job_title.trim() || !form.company.trim()) {
      showToast('Job title and company are required', 'error'); return
    }
    if (modal === 'add') {
      createApp.mutate(form as any, {
        onSuccess: () => { showToast('Application added!', 'success'); setModal(null) },
        onError: () => showToast('Failed to add application', 'error'),
      })
    } else if (editing) {
      updateApp.mutate({ id: editing.id, ...form } as any, {
        onSuccess: () => { showToast('Application updated!', 'success'); setModal(null) },
        onError: () => showToast('Failed to update application', 'error'),
      })
    }
  }

  const handleDelete = (id: string) => {
    if (!confirm('Delete this application?')) return
    deleteApp.mutate(id, {
      onSuccess: () => showToast('Application deleted', 'info'),
      onError: () => showToast('Failed to delete', 'error'),
    })
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  )

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pipeline</h2>
          <p className="text-gray-500 text-sm mt-0.5">{apps.length} applications tracked</p>
        </div>
        <button onClick={() => openAdd()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
          <Plus size={16} /> Add Application
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '70vh' }}>
          {STAGES.map(stage => {
            const cards = byStage(stage.id)
            return (
              <div key={stage.id} className="flex-shrink-0 w-72">
                {/* Column Header */}
                <div className={`flex items-center justify-between px-3 py-2 rounded-xl mb-3 ${stage.bg} ${stage.border} border`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${stage.color}`}>{stage.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${stage.bg} ${stage.color} border ${stage.border}`}>
                      {cards.length}
                    </span>
                  </div>
                  <button onClick={() => openAdd(stage.id)} className={`${stage.color} hover:opacity-70 transition`}>
                    <Plus size={16} />
                  </button>
                </div>

                {/* Droppable Column */}
                <Droppable droppableId={String(stage.id)}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[200px] rounded-xl transition-colors ${snapshot.isDraggingOver ? 'bg-indigo-50 border-2 border-dashed border-indigo-300' : 'bg-gray-50/50'} p-2 space-y-2`}
                    >
                      {cards.map((app, idx) => (
                        <Draggable key={app.id} draggableId={app.id} index={idx}>
                          {(prov, snap) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                              className={`bg-white rounded-xl border p-3 shadow-sm hover:shadow-md transition-all group ${snap.isDragging ? 'shadow-xl rotate-1 border-indigo-300' : 'border-gray-200'}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 text-sm truncate">{app.job_title}</p>
                                  <div className="flex items-center gap-1 mt-1">
                                    <Building2 size={12} className="text-gray-400 flex-shrink-0" />
                                    <p className="text-xs text-gray-500 truncate">{app.company}</p>
                                  </div>
                                  {app.location && (
                                    <div className="flex items-center gap-1 mt-0.5">
                                      <MapPin size={12} className="text-gray-400 flex-shrink-0" />
                                      <p className="text-xs text-gray-400 truncate">{app.location}</p>
                                    </div>
                                  )}
                                  {app.salary_range && (
                                    <div className="flex items-center gap-1 mt-0.5">
                                      <DollarSign size={12} className="text-gray-400 flex-shrink-0" />
                                      <p className="text-xs text-gray-400">{app.salary_range}</p>
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                  {app.job_url && (
                                    <a href={app.job_url} target="_blank" rel="noopener noreferrer"
                                      className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
                                      <ExternalLink size={13} />
                                    </a>
                                  )}
                                  <button onClick={() => openEdit(app)}
                                    className="p-1 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition">
                                    <Pencil size={13} />
                                  </button>
                                  <button onClick={() => handleDelete(app.id)}
                                    className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition">
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                              <p className="text-xs text-gray-400 mt-2">
                                {new Date(app.date_applied).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {cards.length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-xs">
                          Drop cards here
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {modal === 'add' ? 'Add Application' : 'Edit Application'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Job Title *', key: 'job_title', placeholder: 'Software Engineer' },
                { label: 'Company *', key: 'company', placeholder: 'Acme Corp' },
                { label: 'Location', key: 'location', placeholder: 'Remote / New York' },
                { label: 'Salary Range', key: 'salary_range', placeholder: '$80k - $120k' },
                { label: 'Job URL', key: 'job_url', placeholder: 'https://...' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                <select
                  value={form.stage_id}
                  onChange={e => setForm(f => ({ ...f, stage_id: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                >
                  {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  placeholder="Any notes about this application..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setModal(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleSave} disabled={createApp.isPending || updateApp.isPending}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold shadow hover:shadow-md transition flex items-center gap-2 disabled:opacity-60">
                {(createApp.isPending || updateApp.isPending) && <Loader2 size={14} className="animate-spin" />}
                {modal === 'add' ? 'Add Application' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
