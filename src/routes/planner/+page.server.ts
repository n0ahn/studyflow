import { getSessions, markMissedSessions } from '$lib/services/sessions'
import { getExams } from '$lib/services/exams'
import { getTasks } from '$lib/services/tasks'
import { runCompressTrigger } from '$lib/planner/trigger'
import type { ServerLoad, Actions } from '@sveltejs/kit'

export const load: ServerLoad = async ({ locals }) => {
    const now = new Date()

    // Vandaag als YYYY-MM-DD
    const today = now.toISOString().split('T')[0]

    // Bereken maandag van deze week
    const day = now.getUTCDay()
    const daysSinceMonday = day === 0 ? 6 : day - 1

    const monday = new Date(now)
    monday.setUTCDate(now.getUTCDate() - daysSinceMonday)

    const from = monday.toISOString().split('T')[0]

    // 14 dagen vanaf maandag
    const end = new Date(monday)
    end.setUTCDate(monday.getUTCDate() + 13)

    const to = end.toISOString().split('T')[0]

    await markMissedSessions(locals.supabase)

    const [sessions, exams, tasks] = await Promise.all([
        getSessions(locals.supabase, from, to),
        getExams(locals.supabase),
        getTasks(locals.supabase)
    ])

    return {
        sessions,
        exams,
        tasks,
        from,
        to,
        today
    }
}

export const actions: Actions = {
    replan: async ({ locals }) => {
        const result = await runCompressTrigger(locals.supabase)

        return {
            compressResult: result
        }
    }
}