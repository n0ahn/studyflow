import type { PlannerInput, PlannerItem, PlannedSession } from './types'
import { scoreExam, scoreTask, sortByUrgency } from './scoring'

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const

function dateToString(date: Date): string {
    return date.toISOString().split('T')[0]
}

function addDays(date: Date, days: number): Date {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
}

function getAvailableMinutes(date: Date, settings: PlannerInput['settings']): number {
    const dayKey = DAY_KEYS[date.getDay()]
    return settings.available_time[dayKey] ?? 0
}

export type PlannerResult = {
    sessions: PlannedSession[]
    unplannedItems: PlannerItem[]
    warnings: string[]
}

export function runPlanner(input: PlannerInput): PlannerResult {
    const { exams, tasks, settings, today } = input
    const sessions: PlannedSession[] = []
    const warnings: string[] = []

    // Stap 1: Score alle items
    const scoredExams = exams
        .filter(e => e.status !== 'completed')
        .map(e => scoreExam(e, today))

    const scoredTasks = tasks
        .filter(t => t.status !== 'completed')
        .map(t => scoreTask(t, today))

    // Stap 2: Sorteer op urgentie
    const items = sortByUrgency([...scoredExams, ...scoredTasks])

    // Stap 3: Maak mutable kopie van remaining minutes per item
    const remaining = new Map<string, number>()
    items.forEach(item => remaining.set(item.id, item.remainingMinutes))

    // Stap 4: Bouw dag-voor-dag planning
    for (let dayOffset = 0; dayOffset < settings.planning_horizon; dayOffset++) {
        const currentDate = addDays(today, dayOffset)
        const dateStr = dateToString(currentDate)
        let minutesLeft = getAvailableMinutes(currentDate, settings)

        if (minutesLeft === 0) continue

        // Loop door items op urgentievolgorde
        for (const item of items) {
            if (minutesLeft < 15) break

            const itemRemaining = remaining.get(item.id) ?? 0
            if (itemRemaining <= 0) continue

            // Niet plannen voor startDate
            if (dateStr < item.startDate) continue

            // Niet plannen na deadline
            if (dateStr > item.deadline) continue

            // Bereken sessieduur
            const sessionDuration = Math.min(
                settings.session_duration,
                itemRemaining,
                minutesLeft
            )

            if (sessionDuration < 15) continue

            sessions.push({
                subject_id: item.subject.id,
                exam_id: item.type === 'exam' ? item.id : null,
                task_id: item.type === 'task' ? item.id : null,
                date: dateStr,
                planned_duration: sessionDuration
            })

            remaining.set(item.id, itemRemaining - sessionDuration)
            minutesLeft -= sessionDuration
        }
    }

    // Stap 5: Controleer wat niet ingepland kon worden
    const unplannedItems = items.filter(item => (remaining.get(item.id) ?? 0) > 0)

    unplannedItems.forEach(item => {
        const leftover = remaining.get(item.id) ?? 0
        warnings.push(
            `"${item.type === 'exam' ? item.exam?.name : item.task?.title}" heeft nog ${leftover} minuten niet ingepland.`
        )
    })

    return { sessions, unplannedItems, warnings }
}