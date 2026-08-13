import type { PlannerInput, PlannerItem, PlannedSession } from './types'
import { scoreExam, scoreTask, sortByUrgency } from './scoring'

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const

function dateToString(date: Date): string {
    return date.toISOString().split('T')[0]
}

function addDays(date: Date, days: number): Date {
    const result = new Date(date)
    result.setUTCDate(result.getUTCDate() + days)
    return result
}

function getAvailableMinutes(dateStr: string, settings: PlannerInput['settings']): number {
    const dayKey = DAY_KEYS[new Date(dateStr + 'T12:00:00Z').getUTCDay()]
    return settings.available_time[dayKey] ?? 0
}

export type PlannerResult = {
    sessions: PlannedSession[]
    unplannedItems: PlannerItem[]
    warnings: string[]
}

export function runPlanner(input: PlannerInput): PlannerResult {
    const { exams, tasks, settings, today, lockedSessions = [] } = input
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

    // Stap 3b: bufferdag per exam-item — laatste dag vóór de toets wordt overgeslagen voor nieuwe stof
    const examBufferDates = new Map<string, string>()
    for (const item of items) {
        if (item.type === 'exam') {
            const bufferDate = addDays(new Date(item.deadline + 'T12:00:00Z'), -1)
            examBufferDates.set(item.id, dateToString(bufferDate))
        }
    }

    // Stap 3c: locked sessies verwerken
    const lockedMinutesByDate = new Map<string, number>()
    const lockedSubjectsByDate = new Map<string, Set<string>>()

    for (const locked of lockedSessions) {
        lockedMinutesByDate.set(
            locked.date,
            (lockedMinutesByDate.get(locked.date) ?? 0) + locked.planned_duration
        )
        const subjectSet = lockedSubjectsByDate.get(locked.date) ?? new Set<string>()
        subjectSet.add(locked.subject_id)
        lockedSubjectsByDate.set(locked.date, subjectSet)
    }

    // Stap 4: Bouw dag-voor-dag planning
    for (let dayOffset = 0; dayOffset < settings.planning_horizon; dayOffset++) {
        const currentDate = addDays(today, dayOffset)
        const dateStr = dateToString(currentDate)
        const lockedMinutes = lockedMinutesByDate.get(dateStr) ?? 0
        const availableRaw = getAvailableMinutes(dateStr, settings)
        let minutesLeft = availableRaw - lockedMinutes

        if (minutesLeft <= 0) continue

        const subjectsPlannedToday = new Set<string>(lockedSubjectsByDate.get(dateStr) ?? [])

        function isEligible(item: PlannerItem): boolean {
            const itemRemaining = remaining.get(item.id) ?? 0
            if (itemRemaining <= 0) return false
            if (dateStr < item.startDate) return false
            if (dateStr > item.deadline) return false
            if (item.type === 'exam' && examBufferDates.get(item.id) === dateStr) return false
            return true
        }

        function planSession(item: PlannerItem, isReview = false): boolean {
            const itemRemaining = remaining.get(item.id) ?? 0

            const sessionDuration = Math.min(
                settings.session_duration,
                isReview ? settings.session_duration : itemRemaining,
                minutesLeft
            )

            if (sessionDuration < 15) return false

            sessions.push({
                subject_id: item.subject.id,
                exam_id: item.type === 'exam' ? item.id : null,
                task_id: item.type === 'task' ? item.id : null,
                date: dateStr,
                planned_duration: sessionDuration,
                is_review: isReview
            })

            if (!isReview) {
                remaining.set(item.id, itemRemaining - sessionDuration)
            }
            minutesLeft -= sessionDuration
            subjectsPlannedToday.add(item.subject.id)
            return true
        }

        // Ronde 0: herhaal-sessie op bufferdag
        for (const item of items) {
            if (minutesLeft < 15) break
            if (item.type !== 'exam') continue
            if (examBufferDates.get(item.id) !== dateStr) continue
            if (subjectsPlannedToday.has(item.subject.id)) continue
            planSession(item, true)
        }

        // Ronde 1: één sessie per vak, urgentievolgorde
        for (const item of items) {
            if (minutesLeft < 15) break
            if (!isEligible(item)) continue
            if (subjectsPlannedToday.has(item.subject.id)) continue
            planSession(item)
        }

        // Ronde 2: opvullen als geen ander vak meer wacht
        while (minutesLeft >= 15) {
            const waitingForFirstSlot = items.some(
                item => isEligible(item) && !subjectsPlannedToday.has(item.subject.id)
            )
            if (waitingForFirstSlot) break
            const fillItem = items.find(item => isEligible(item))
            if (!fillItem) break
            const planned = planSession(fillItem)
            if (!planned) break
        }
    }

    // Stap 5: warnings voor niet-ingeplande items
    const unplannedItems = items.filter(item => (remaining.get(item.id) ?? 0) > 0)
    unplannedItems.forEach(item => {
        const leftover = remaining.get(item.id) ?? 0
        warnings.push(
            `"${item.type === 'exam' ? item.exam?.name : item.task?.title}" heeft nog ${leftover} minuten niet ingepland.`
        )
    })

    return { sessions, unplannedItems, warnings }
}