import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

// ─── Types ───────────────────────────────────────────────────────────────────
export interface Application {
    id: string
    job_title: string
    company: string
    location?: string
    salary_range?: string
    job_url?: string
    stage_id: number
    date_applied: string
    notes?: string
    resume_url?: string
}

export interface Task {
    id: string
    application_id?: string
    title: string
    description?: string
    due_date?: string
    is_completed: boolean
    priority: 'Low' | 'Medium' | 'High'
}

export interface AnalyticsSummary {
    total: number
    response_rate: string
    by_stage: { stage_id: number; count: number }[]
    weekly: { week: string; count: number }[]
}

// ─── Applications ─────────────────────────────────────────────────────────────
export function useApplications() {
    return useQuery<Application[]>({
        queryKey: ['applications'],
        queryFn: async () => {
            const res = await fetch(`${API}/applications`)
            if (!res.ok) throw new Error('Failed to fetch applications')
            return res.json()
        },
    })
}

export function useCreateApplication() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (data: Omit<Application, 'id' | 'date_applied'>) => {
            const res = await fetch(`${API}/applications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            if (!res.ok) throw new Error('Failed to create application')
            return res.json()
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
    })
}

export function useUpdateApplication() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, ...data }: Partial<Application> & { id: string }) => {
            const res = await fetch(`${API}/applications/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            if (!res.ok) throw new Error('Failed to update application')
            return res.json()
        },
        onMutate: async ({ id, ...data }) => {
            await qc.cancelQueries({ queryKey: ['applications'] })
            const prev = qc.getQueryData<Application[]>(['applications'])
            qc.setQueryData<Application[]>(['applications'], old =>
                old?.map(a => a.id === id ? { ...a, ...data } : a) ?? []
            )
            return { prev }
        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.prev) qc.setQueryData(['applications'], ctx.prev)
        },
        onSettled: () => qc.invalidateQueries({ queryKey: ['applications'] }),
    })
}

export function useMoveApplication() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async ({ app_id, stage_id }: { app_id: string; stage_id: number }) => {
            const res = await fetch(`${API}/applications/move?app_id=${app_id}&stage_id=${stage_id}`, { method: 'POST' })
            if (!res.ok) throw new Error('Failed to move application')
            return res.json()
        },
        onMutate: async ({ app_id, stage_id }) => {
            await qc.cancelQueries({ queryKey: ['applications'] })
            const prev = qc.getQueryData<Application[]>(['applications'])
            qc.setQueryData<Application[]>(['applications'], old =>
                old?.map(a => a.id === app_id ? { ...a, stage_id } : a) ?? []
            )
            return { prev }
        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.prev) qc.setQueryData(['applications'], ctx.prev)
        },
        onSettled: () => qc.invalidateQueries({ queryKey: ['applications'] }),
    })
}

export function useDeleteApplication() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`${API}/applications/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete application')
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
    })
}

// ─── Tasks ────────────────────────────────────────────────────────────────────
export function useTasks() {
    return useQuery<Task[]>({
        queryKey: ['tasks'],
        queryFn: async () => {
            const res = await fetch(`${API}/tasks/upcoming`)
            if (!res.ok) throw new Error('Failed to fetch tasks')
            return res.json()
        },
    })
}

export function useCreateTask() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (data: Omit<Task, 'id'>) => {
            const res = await fetch(`${API}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            if (!res.ok) throw new Error('Failed to create task')
            return res.json()
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
    })
}

export function useToggleTask() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, is_completed }: { id: string; is_completed: boolean }) => {
            const res = await fetch(`${API}/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_completed }),
            })
            if (!res.ok) throw new Error('Failed to update task')
            return res.json()
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
    })
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export function useAnalytics() {
    return useQuery<AnalyticsSummary>({
        queryKey: ['analytics'],
        queryFn: async () => {
            const res = await fetch(`${API}/analytics/summary`)
            if (!res.ok) throw new Error('Failed to fetch analytics')
            return res.json()
        },
    })
}
