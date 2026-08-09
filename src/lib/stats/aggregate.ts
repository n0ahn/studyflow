import type { StudySessionWithDetails, ExamWithSubject } from '$lib/types'
import type {
    WeekSummary,
    CoreStats,
    HeatmapDay,
    WeeklyTrendPoint,
    SubjectBreakdownEntry,
    PlannedVsActualPoint,
    ExamProgressEntry
} from './types'

function toDateKey(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toISOString().split('T')[0]
}

function startOfWeek(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const offset = day === 0 ? -6 : 1 - day // maandag als start
    d.setDate(d.getDate() + offset)
    d.setHours(0, 0, 0, 0)
    return d
}

function addDays(date: Date, days: number): Date {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    return d
}

/** Minuten van een sessie voor rapportagedoeleinden: werkelijke tijd als bekend, anders geplande tijd. */
function effectiveMinutes(session: StudySessionWithDetails): number {
    return session.actual_duration ?? session.planned_duration
}

function completedSessions(sessions: StudySessionWithDetails[]): StudySessionWithDetails[] {
    return sessions.filter(s => s.status === 'completed')
}

// --- Week-samenvatting (hero) ---

export function computeWeekSummary(sessions: StudySessionWithDetails[], today: Date): WeekSummary {
    const completed = completedSessions(sessions)

    const thisWeekStart = startOfWeek(today)
    const lastWeekStart = addDays(thisWeekStart, -7)

    const minutesThisWeek = completed
        .filter(s => new Date(s.date) >= thisWeekStart)
        .reduce((sum, s) => sum + effectiveMinutes(s), 0)

    const minutesLastWeek = completed
        .filter(s => new Date(s.date) >= lastWeekStart && new Date(s.date) < thisWeekStart)
        .reduce((sum, s) => sum + effectiveMinutes(s), 0)

    const trendPercent = minutesLastWeek === 0
        ? null
        : Math.round(((minutesThisWeek - minutesLastWeek) / minutesLastWeek) * 100)

    const { currentStreak, longestStreak } = computeStreaks(completed, today)

    // Consistentie: % dagen met activiteit over de laatste 30 dagen
    const windowStart = addDays(today, -29)
    const activeDays = new Set(
        completed
            .filter(s => new Date(s.date) >= windowStart && new Date(s.date) <= today)
            .map(s => toDateKey(s.date))
    )
    const consistencyPercent = Math.round((activeDays.size / 30) * 100)

    return { minutesThisWeek, minutesLastWeek, trendPercent, currentStreak, longestStreak, consistencyPercent }
}

/** Huidige streak (aaneengesloten dagen tot en met vandaag/gisteren) en langste streak ooit in de dataset. */
function computeStreaks(completed: StudySessionWithDetails[], today: Date): { currentStreak: number; longestStreak: number } {
    const activeDates = [...new Set(completed.map(s => toDateKey(s.date)))].sort()
    if (activeDates.length === 0) return { currentStreak: 0, longestStreak: 0 }

    const activeDateSet = new Set(activeDates)

    // Langste streak: loop chronologisch door alle actieve dagen
    let longestStreak = 1
    let running = 1
    for (let i = 1; i < activeDates.length; i++) {
        const prev = new Date(activeDates[i - 1])
        const curr = new Date(activeDates[i])
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))
        running = diffDays === 1 ? running + 1 : 1
        longestStreak = Math.max(longestStreak, running)
    }

    // Huidige streak: tel terug vanaf vandaag (of gisteren, als vandaag nog niet gestudeerd is)
    let currentStreak = 0
    let cursor = toDateKey(today)
    if (!activeDateSet.has(cursor)) {
        cursor = toDateKey(addDays(today, -1))
    }
    while (activeDateSet.has(cursor)) {
        currentStreak++
        cursor = toDateKey(addDays(new Date(cursor), -1))
    }

    return { currentStreak, longestStreak }
}

// --- Kernstatistieken ---

export function computeCoreStats(sessions: StudySessionWithDetails[]): CoreStats {
    const completed = completedSessions(sessions)

    const averageSessionMinutes = completed.length === 0
        ? 0
        : Math.round(completed.reduce((sum, s) => sum + effectiveMinutes(s), 0) / completed.length)

    const totalPlanned = sessions
        .filter(s => s.status === 'completed' || s.status === 'missed')
        .reduce((sum, s) => sum + s.planned_duration, 0)
    const totalActual = completed.reduce((sum, s) => sum + effectiveMinutes(s), 0)
    const planAdherencePercent = totalPlanned === 0 ? 0 : Math.round((totalActual / totalPlanned) * 100)

    const difficultyRatings = completed.map(s => s.difficulty_rating).filter((r): r is number => r !== null)
    const averageDifficulty = difficultyRatings.length === 0
        ? null
        : Math.round((difficultyRatings.reduce((a, b) => a + b, 0) / difficultyRatings.length) * 10) / 10

    const confidenceRatings = completed.map(s => s.confidence_rating).filter((r): r is number => r !== null)
    const averageConfidence = confidenceRatings.length === 0
        ? null
        : Math.round((confidenceRatings.reduce((a, b) => a + b, 0) / confidenceRatings.length) * 10) / 10

    return {
        averageSessionMinutes,
        completedSessionCount: completed.length,
        planAdherencePercent,
        averageDifficulty,
        averageConfidence
    }
}

// --- Heatmap ---

export function computeHeatmap(sessions: StudySessionWithDetails[], today: Date, days = 182): HeatmapDay[] {
    const completed = completedSessions(sessions)
    const minutesByDay = new Map<string, number>()

    for (const s of completed) {
        const key = toDateKey(s.date)
        minutesByDay.set(key, (minutesByDay.get(key) ?? 0) + effectiveMinutes(s))
    }

    const maxMinutes = Math.max(1, ...minutesByDay.values())

    const result: HeatmapDay[] = []
    for (let i = days - 1; i >= 0; i--) {
        const date = addDays(today, -i)
        const key = toDateKey(date)
        const minutes = minutesByDay.get(key) ?? 0
        result.push({ date: key, minutes, level: levelForMinutes(minutes, maxMinutes) })
    }
    return result
}

function levelForMinutes(minutes: number, maxMinutes: number): 0 | 1 | 2 | 3 | 4 {
    if (minutes === 0) return 0
    const fraction = minutes / maxMinutes
    if (fraction > 0.75) return 4
    if (fraction > 0.5) return 3
    if (fraction > 0.25) return 2
    return 1
}

// --- Trend over tijd (wekelijks) ---

export function computeWeeklyTrend(sessions: StudySessionWithDetails[], today: Date, weekCount = 12): WeeklyTrendPoint[] {
    const completed = completedSessions(sessions)
    const currentWeekStart = startOfWeek(today)

    const weeks: WeeklyTrendPoint[] = []
    for (let i = weekCount - 1; i >= 0; i--) {
        const weekStart = addDays(currentWeekStart, -7 * i)
        const weekEnd = addDays(weekStart, 7)
        const minutes = completed
            .filter(s => {
                const d = new Date(s.date)
                return d >= weekStart && d < weekEnd
            })
            .reduce((sum, s) => sum + effectiveMinutes(s), 0)
        weeks.push({ weekStart: toDateKey(weekStart), minutes })
    }
    return weeks
}

// --- Planning vs. werkelijkheid ---

export function computePlannedVsActual(sessions: StudySessionWithDetails[], today: Date, weekCount = 8): PlannedVsActualPoint[] {
    const relevant = sessions.filter(s => s.status === 'completed' || s.status === 'missed')
    const currentWeekStart = startOfWeek(today)

    const weeks: PlannedVsActualPoint[] = []
    for (let i = weekCount - 1; i >= 0; i--) {
        const weekStart = addDays(currentWeekStart, -7 * i)
        const weekEnd = addDays(weekStart, 7)
        const inWeek = relevant.filter(s => {
            const d = new Date(s.date)
            return d >= weekStart && d < weekEnd
        })
        const plannedMinutes = inWeek.reduce((sum, s) => sum + s.planned_duration, 0)
        const actualMinutes = inWeek
            .filter(s => s.status === 'completed')
            .reduce((sum, s) => sum + effectiveMinutes(s), 0)
        weeks.push({ weekStart: toDateKey(weekStart), plannedMinutes, actualMinutes })
    }
    return weeks
}

// --- Per vak ---

export function computeSubjectBreakdown(sessions: StudySessionWithDetails[]): SubjectBreakdownEntry[] {
    const completed = completedSessions(sessions)
    const bySubject = new Map<string, {
        subjectName: string
        subjectColor: string
        totalMinutes: number
        sessionCount: number
        difficultySum: number
        difficultyCount: number
    }>()

    for (const s of completed) {
        const key = s.subject_id
        const entry = bySubject.get(key) ?? {
            subjectName: s.subject.name,
            subjectColor: s.subject.color,
            totalMinutes: 0,
            sessionCount: 0,
            difficultySum: 0,
            difficultyCount: 0
        }
        entry.totalMinutes += effectiveMinutes(s)
        entry.sessionCount += 1
        if (s.difficulty_rating !== null) {
            entry.difficultySum += s.difficulty_rating
            entry.difficultyCount += 1
        }
        bySubject.set(key, entry)
    }

    const grandTotal = [...bySubject.values()].reduce((sum, e) => sum + e.totalMinutes, 0) || 1

    return [...bySubject.entries()]
        .map(([subjectId, e]) => ({
            subjectId,
            subjectName: e.subjectName,
            subjectColor: e.subjectColor,
            totalMinutes: e.totalMinutes,
            sessionCount: e.sessionCount,
            averageDifficulty: e.difficultyCount === 0
                ? null
                : Math.round((e.difficultySum / e.difficultyCount) * 10) / 10,
            shareOfTotal: e.totalMinutes / grandTotal
        }))
        .sort((a, b) => b.totalMinutes - a.totalMinutes)
}

// --- Voortgang per toets ---

export function computeExamProgress(sessions: StudySessionWithDetails[], upcomingExams: ExamWithSubject[]): ExamProgressEntry[] {
    return upcomingExams.map(exam => {
        const examSessions = sessions.filter(s => s.exam_id === exam.id)
        const plannedMinutes = examSessions.reduce((sum, s) => sum + s.planned_duration, 0)
        const completedMinutes = examSessions
            .filter(s => s.status === 'completed')
            .reduce((sum, s) => sum + effectiveMinutes(s), 0)

        return {
            examId: exam.id,
            examName: exam.name,
            subjectColor: exam.subject.color,
            examDate: exam.exam_date,
            estimatedMinutes: exam.estimated_study_time,
            plannedMinutes,
            completedMinutes,
            progressFraction: exam.estimated_study_time === 0
                ? 0
                : Math.min(1, completedMinutes / exam.estimated_study_time)
        }
    })
}