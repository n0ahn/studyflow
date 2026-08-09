import { getExams } from '$lib/services/exams'
import { getTasks } from '$lib/services/tasks'
import { getSessions, markMissedSessions } from '$lib/services/sessions'
import type { ServerLoad } from '@sveltejs/kit'

export const load: ServerLoad = async ({ locals }) => {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    await markMissedSessions(locals.supabase)

    const weekFrom = todayStr
    const weekTo = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0]

    const mondayOffset = today.getDay() === 0 ? -6 : 1 - today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() + mondayOffset)
    const weekStart = monday.toISOString().split('T')[0]

    const [exams, tasks, todaySessions, weekSessions] = await Promise.all([
        getExams(locals.supabase),
        getTasks(locals.supabase),
        getSessions(locals.supabase, todayStr, todayStr),
        getSessions(locals.supabase, weekStart, weekTo)
    ])

    const upcomingExams = exams
        .filter(e => e.exam_date >= todayStr && e.status !== 'completed')
        .slice(0, 5)

    const priorityTasks = tasks
        .filter(t => t.status !== 'completed')
        .sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 }
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority]
            }
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        })
        .slice(0, 5)

    const weekMinutes = weekSessions
        .filter(s => s.status === 'completed')
        .reduce((sum, s) => sum + (s.actual_duration ?? s.planned_duration), 0)

    return {
        todaySessions,
        upcomingExams,
        priorityTasks,
        weekMinutes,
        totalTasks: tasks.filter(t => t.status !== 'completed').length,
        completedToday: todaySessions.filter(s => s.status === 'completed').length
    }
}