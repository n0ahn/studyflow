import type { SupabaseClient } from '@supabase/supabase-js'
import { runPlanner } from './algorithm'
import { getSettings } from '$lib/services/settings'
import { deleteFuturePlannedSessions, createSessions, getLockedFutureSessions } from '$lib/services/sessions'
import type { ExamWithSubject, TaskWithSubject } from '$lib/types'

async function getExamsForPlanner(supabase: SupabaseClient): Promise<ExamWithSubject[]> {
    const { data, error } = await supabase
        .from('exams')
        .select('*, subject:subjects(*)')
        .not('status', 'eq', 'completed')

    if (error) throw error
    return data
}

async function getTasksForPlanner(supabase: SupabaseClient): Promise<TaskWithSubject[]> {
    const { data, error } = await supabase
        .from('tasks')
        .select('*, subject:subjects(*)')
        .not('status', 'eq', 'completed')

    if (error) throw error
    return data
}

export type TriggerResult = {
    sessionsCreated: number
    warnings: string[]
}

export type CompressResult = TriggerResult & {
    horizonUsed: number
}

const DEFAULT_SETTINGS = {
    id: '',
    user_id: '',
    available_time: {
        monday: 60,
        tuesday: 60,
        wednesday: 60,
        thursday: 60,
        friday: 60,
        saturday: 120,
        sunday: 120
    },
    session_duration: 50,
    break_duration: 10,
    planning_horizon: 14,
    created_at: '',
    updated_at: ''
}

async function runTrigger(
    supabase: SupabaseClient,
    horizonOverride?: number
): Promise<TriggerResult & { horizonUsed: number }> {
    const [exams, tasks, settings, lockedFutureSessions] = await Promise.all([
        getExamsForPlanner(supabase),
        getTasksForPlanner(supabase),
        getSettings(supabase),
        getLockedFutureSessions(supabase)
    ])

    console.log('[Planner] Exams gevonden:', exams.length, exams)
    console.log('[Planner] Tasks gevonden:', tasks.length, tasks)
    console.log('[Planner] Settings:', settings)

    const resolvedSettings = settings ?? DEFAULT_SETTINGS

    const effectiveSettings = horizonOverride
        ? { ...resolvedSettings, planning_horizon: Math.max(resolvedSettings.planning_horizon, horizonOverride) }
        : resolvedSettings

    const lockedSessions = lockedFutureSessions.map(s => ({
        subject_id: s.subject_id,
        exam_id: s.exam_id,
        task_id: s.task_id,
        date: s.date,
        planned_duration: s.planned_duration
    }))

    const todayStr = new Date().toISOString().split('T')[0]
    const today = new Date(todayStr + 'T00:00:00Z')

    console.log('[Planner] Today (raw):', new Date())
    console.log('[Planner] Today ISO:', new Date().toISOString())
    console.log('[Planner] Today dateStr:', todayStr)
    console.log('[Planner] Today getUTCDay:', today.getUTCDay())
    console.log('[Planner] available_time:', effectiveSettings.available_time)

    const { sessions, warnings } = runPlanner({
        exams,
        tasks,
        settings: effectiveSettings,
        today,
        lockedSessions
    })

    console.log('[Planner] Sessies gegenereerd:', sessions.length)
    console.log('[Planner] Sessies:', sessions)
    console.log('[Planner] Warnings:', warnings)
    console.log('[Planner] Today:', new Date())
    console.log('[Planner] Exam dates:', exams.map(e => e.exam_date))
    console.log('[Planner] Horizon gebruikt:', effectiveSettings.planning_horizon)

    await deleteFuturePlannedSessions(supabase)
    await createSessions(supabase, sessions)

    console.log('[Planner] Klaar')

    return {
        sessionsCreated: sessions.length,
        warnings,
        horizonUsed: effectiveSettings.planning_horizon
    }
}

export async function runPlannerTrigger(supabase: SupabaseClient): Promise<TriggerResult> {
    const { sessionsCreated, warnings } = await runTrigger(supabase)
    return { sessionsCreated, warnings }
}

/**
 * "Herplan achterstand": draait de planner opnieuw, maar verruimt de planning_horizon
 * tijdelijk tot de verste deadline onder alle actieve exams/tasks. Dit geeft achterstallige
 * items (waarvoor de normale horizon niet meer genoeg dagen overlaat) alsnog een kans om
 * volledig ingepland te worden. De opgeslagen planning_horizon in settings blijft ongewijzigd —
 * dit is een eenmalige, bredere run.
 */
export async function runCompressTrigger(supabase: SupabaseClient): Promise<CompressResult> {
    const [exams, tasks] = await Promise.all([
        getExamsForPlanner(supabase),
        getTasksForPlanner(supabase)
    ])

    const todayStr = new Date().toISOString().split('T')[0]
    const today = new Date(todayStr + 'T00:00:00Z')
    const allDeadlines = [
        ...exams.map(e => e.exam_date),
        ...tasks.map(t => t.deadline)
    ]

    let horizonOverride: number | undefined
    if (allDeadlines.length > 0) {
        const furthestDeadline = allDeadlines.reduce((max, d) => (d > max ? d : max))
        const diffMs = new Date(furthestDeadline).getTime() - today.getTime()
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1 // +1: dag van de deadline zelf meetellen
        horizonOverride = Math.max(diffDays, 1)
    }

    return runTrigger(supabase, horizonOverride)
}