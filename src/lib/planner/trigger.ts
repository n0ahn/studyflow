import type { SupabaseClient } from '@supabase/supabase-js'
import { runPlanner } from './algorithm'
import { getSettings } from '$lib/services/settings'
import { deleteFuturePlannedSessions, createSessions } from '$lib/services/sessions'
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

export async function runPlannerTrigger(supabase: SupabaseClient): Promise<TriggerResult> {
    const [exams, tasks, settings] = await Promise.all([
        getExamsForPlanner(supabase),
        getTasksForPlanner(supabase),
        getSettings(supabase)
    ])

    console.log('[Planner] Exams gevonden:', exams.length, exams)
    console.log('[Planner] Tasks gevonden:', tasks.length, tasks)
    console.log('[Planner] Settings:', settings)

    const resolvedSettings = settings ?? {
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

    const { sessions, warnings } = runPlanner({
        exams,
        tasks,
        settings: resolvedSettings,
        today: new Date()
    })

    console.log('[Planner] Sessies gegenereerd:', sessions.length)
    console.log('[Planner] Sessies:', sessions)
    console.log('[Planner] Warnings:', warnings)
    console.log('[Planner] Today:', new Date())
    console.log('[Planner] Exam dates:', exams.map(e => e.exam_date))

    await deleteFuturePlannedSessions(supabase)
    await createSessions(supabase, sessions)

    console.log('[Planner] Klaar')

    return {
        sessionsCreated: sessions.length,
        warnings
    }
}