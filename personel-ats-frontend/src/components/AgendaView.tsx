'use client'
import React, { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { format, isSameDay, parseISO } from 'date-fns'
import { useTasks, useCreateTask, useToggleTask } from '../lib/api'
import { useToast } from '../lib/ToastContext'
import { Plus, CheckCircle2, Circle, Loader2, Calendar as CalIcon } from 'lucide-react'

const PRIORITY_COLORS = {
  High: 'bg-rose-100 text-rose-700 border-rose-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

export default function CalendarView() {
  const { data: tasks = [], isLoading } = useTasks()
  const createTask = useCreateTask()
  const toggleTask = useToggleTask()
  const { showToast } = useToast()

  const [selected, setSelected] = useState<Date>(new Date())
  const [showAdd, setShowAdd] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', priority: 'Medium' as 'Low' | 'Medium' | 'High', due_date: format(new Date(), 'yyyy-MM-dd') })

  // Days that have tasks
  const taskDays = tasks
    .filter(t => t.due_date)
    .map(t => parseISO(t.due_date!))

  // Tasks for selected day
  const selectedDayTasks = tasks.filter(t =>
    t.due_date && isSameDay(parseISO(t.due_date), selected)
  )

  // All upcoming tasks (no date filter)
  const allTasks = tasks.filter(t => !t.is_completed)

  const handleAddTask = () => {
    if (!newTask.title.trim()) { showToast('Task title required', 'error'); return }
    createTask.mutate({
      title: newTask.title,
      priority: newTask.priority,
      due_date: newTask.due_date,
      is_completed: false,
    }, {
      onSuccess: () => { showToast('Task added!', 'success'); setShowAdd(false); setNewTask({ title: '', priority: 'Medium', due_date: format(selected, 'yyyy-MM-dd') }) },
      onError: () => showToast('Failed to add task', 'error'),
    })
  }

  const handleToggle = (id: string, is_completed: boolean) => {
    toggleTask.mutate({ id, is_completed: !is_completed }, {
      onSuccess: () => showToast(is_completed ? 'Marked incomplete' : 'Task completed! 🎉', 'success'),
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CalIcon size={18} className="text-indigo-500" /> Calendar
          </h3>
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={(d) => d && setSelected(d)}
            modifiers={{ hasTask: taskDays }}
            modifiersStyles={{
              hasTask: { fontWeight: 'bold', textDecoration: 'underline', color: '#6366f1' }
            }}
            className="!font-sans"
          />
          <div className="mt-3 text-xs text-gray-400 text-center">
            Underlined dates have tasks
          </div>
        </div>
      </div>

      {/* Tasks Panel */}
      <div className="lg:col-span-2 space-y-4">
        {/* Selected Day Tasks */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">
              {format(selected, 'MMMM d, yyyy')}
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({selectedDayTasks.length} task{selectedDayTasks.length !== 1 ? 's' : ''})
              </span>
            </h3>
            <button onClick={() => { setShowAdd(true); setNewTask(n => ({ ...n, due_date: format(selected, 'yyyy-MM-dd') })) }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-sm font-medium hover:bg-indigo-100 transition">
              <Plus size={14} /> Add Task
            </button>
          </div>

          {showAdd && (
            <div className="mb-4 p-4 rounded-xl bg-indigo-50 border border-indigo-100 space-y-3">
              <input
                value={newTask.title}
                onChange={e => setNewTask(n => ({ ...n, title: e.target.value }))}
                placeholder="Task title..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                autoFocus
              />
              <div className="flex gap-2">
                <select
                  value={newTask.priority}
                  onChange={e => setNewTask(n => ({ ...n, priority: e.target.value as any }))}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
                <input
                  type="date"
                  value={newTask.due_date}
                  onChange={e => setNewTask(n => ({ ...n, due_date: e.target.value }))}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddTask} disabled={createTask.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-60">
                  {createTask.isPending && <Loader2 size={12} className="animate-spin" />}
                  Save
                </button>
                <button onClick={() => setShowAdd(false)}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-indigo-400" /></div>
          ) : selectedDayTasks.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No tasks for this day. Click "Add Task" to create one.</p>
          ) : (
            <ul className="space-y-2">
              {selectedDayTasks.map(task => (
                <li key={task.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-200 transition group">
                  <button onClick={() => handleToggle(task.id, task.is_completed)} className="flex-shrink-0">
                    {task.is_completed
                      ? <CheckCircle2 size={20} className="text-emerald-500" />
                      : <Circle size={20} className="text-gray-300 group-hover:text-indigo-400 transition" />}
                  </button>
                  <span className={`flex-1 text-sm ${task.is_completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {task.title}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${PRIORITY_COLORS[task.priority]}`}>
                    {task.priority}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* All Upcoming Tasks */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-4">All Upcoming Tasks ({allTasks.length})</h3>
          {allTasks.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-4">All caught up! 🎉</p>
          ) : (
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {allTasks.map(task => (
                <li key={task.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-200 transition group">
                  <button onClick={() => handleToggle(task.id, task.is_completed)} className="flex-shrink-0">
                    <Circle size={18} className="text-gray-300 group-hover:text-indigo-400 transition" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">{task.title}</p>
                    {task.due_date && (
                      <p className="text-xs text-gray-400">{format(parseISO(task.due_date), 'MMM d')}</p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${PRIORITY_COLORS[task.priority]}`}>
                    {task.priority}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}