import { getSessions } from '$lib/services/sessions'
import { getExams } from '$lib/services/exams'
import {
    computeWeekSummary,
    computeCoreStats,
    computeHeatmap,
    computeWeeklyTrend,
    computePlannedVsActual,
    computeSubjectBreakdown,
    computeExamProgress
} from '$lib/stats/aggregate'
import { generateInsights } from '$lib/stats/insights'
import type { ServerLoad } from '@sveltejs/kit'

const HISTORY_DAYS = 182 // ~6 maanden, voor de heatmap
const HEATMAP_DISPLAY_DAYS = 140 // ~20 weken, compacte heatmap-weergave
const FUTURE_DAYS = 90 // marge vooruit, voor voortgang-per-toets incl. nog geplande sessies

export const load: ServerLoad = async ({ locals }) => {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const historyFrom = new Date(today.getTime() - HISTORY_DAYS * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
    const futureTo = new Date(today.getTime() + FUTURE_DAYS * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]

    const [sessions, sessionsIncludingFuture, exams] = await Promise.all([
        getSessions(locals.supabase, historyFrom, todayStr),
        getSessions(locals.supabase, historyFrom, futureTo),
        getExams(locals.supabase)
    ])

    const upcomingExams = exams.filter(e => e.exam_date >= todayStr && e.status !== 'completed')

    const subjectBreakdown = computeSubjectBreakdown(sessions)

    return {
        weekSummary: computeWeekSummary(sessions, today),
        coreStats: computeCoreStats(sessions),
        heatmap: computeHeatmap(sessions, today, HEATMAP_DISPLAY_DAYS),
        weeklyTrend: computeWeeklyTrend(sessions, today),
        plannedVsActual: computePlannedVsActual(sessions, today),
        subjectBreakdown,
        examProgress: computeExamProgress(sessionsIncludingFuture, upcomingExams),
        insights: generateInsights(sessions, subjectBreakdown)
    }
}